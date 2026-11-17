const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('./timer.js');

const MIN = 60000;

test('réglages : valeurs par défaut et bornes', () => {
  assert.deepEqual(T.sanitizeSettings(undefined), { work: 25, short: 5, long: 15, longEvery: 4 });
  assert.deepEqual(
    T.sanitizeSettings({ work: 999, short: 0, long: 'abc', longEvery: 3.6 }),
    { work: 120, short: 1, long: 15, longEvery: 4 },
  );
});

test('démarrer, mettre en pause, reprendre', () => {
  let s = T.createState({ work: 25 });
  assert.equal(T.remainingMs(s, 0), 25 * MIN);
  s = T.start(s, 0);
  assert.equal(T.remainingMs(s, 60_000), 24 * MIN);
  s = T.pause(s, 60_000);
  assert.equal(T.remainingMs(s, 999_999), 24 * MIN, 'le temps ne bouge plus en pause');
  s = T.start(s, 100_000);
  assert.equal(T.remainingMs(s, 160_000), 23 * MIN);
});

test('réinitialiser remet la phase en cours à sa durée complète', () => {
  let s = T.start(T.createState({ work: 10 }), 0);
  s = T.reset(s);
  assert.equal(s.running, false);
  assert.equal(s.remaining, 10 * MIN);
});

test('fin du travail -> petite pause, en attente', () => {
  let s = T.start(T.createState({ work: 1, short: 2 }), 0);
  const early = T.tick(s, 59_999);
  assert.equal(early.finished, null);
  const r = T.tick(s, 60_000);
  assert.equal(r.finished, 'work');
  assert.equal(r.state.phase, 'short');
  assert.equal(r.state.running, false);
  assert.equal(r.state.remaining, 2 * MIN);
  assert.equal(r.state.cycleCount, 1);
});

test('grande pause toutes les 4 sessions, puis on recommence', () => {
  let s = T.createState({ work: 1, short: 1, long: 1, longEvery: 4 });
  let now = 0;
  const phases = [];
  for (let i = 0; i < 10; i++) {
    s = T.start(s, now);
    now += MIN;
    s = T.tick(s, now).state;
    phases.push(s.phase);
  }
  assert.deepEqual(phases, [
    'short', 'work', 'short', 'work', 'short', 'work', 'long', 'work', 'short', 'work',
  ]);
});

test('progression de 0 à 1', () => {
  let s = T.start(T.createState({ work: 10 }), 0);
  assert.equal(T.progress(s, 0), 0);
  assert.equal(T.progress(s, 5 * MIN), 0.5);
  assert.equal(T.progress(s, 99 * MIN), 1);
});

test('changer les réglages : immédiat si non commencé, sinon à la phase suivante', () => {
  let s = T.createState({ work: 25 });
  s = T.updateSettings(s, { work: 50 });
  assert.equal(s.remaining, 50 * MIN);

  s = T.pause(T.start(s, 0), MIN);
  s = T.updateSettings(s, { work: 10 });
  assert.equal(s.remaining, 49 * MIN, 'la session commencée garde son temps');
  assert.equal(T.reset(s).remaining, 10 * MIN);
});

test('mode démo : 1 minute = 1 seconde', () => {
  const s = T.createState({ work: 25 }, 1000);
  assert.equal(s.remaining, 25_000);
});

test('position dans le cycle', () => {
  let s = T.createState({ work: 1, short: 1, long: 1, longEvery: 4 });
  assert.equal(T.cyclePosition(s), 0);
  let now = 0;
  for (let i = 0; i < 7; i++) {
    s = T.tick(T.start(s, now), (now += MIN)).state;
  }
  assert.equal(s.phase, 'long');
  assert.equal(T.cyclePosition(s), 4);
});

test('formatage du temps', () => {
  assert.equal(T.formatTime(25 * MIN), '25:00');
  assert.equal(T.formatTime(61_000), '01:01');
  assert.equal(T.formatTime(500), '00:01');
  assert.equal(T.formatTime(0), '00:00');
});

test('compteur du jour : garde la valeur le même jour, repart à 0 le lendemain', () => {
  const key = T.todayKey(new Date(2026, 10, 17));
  assert.equal(key, '2026-11-17');
  let c = T.todayCounter(null, key);
  c = T.addSession(c, key);
  c = T.addSession(c, key);
  assert.deepEqual(T.todayCounter(c, key), { date: key, count: 2 });
  assert.deepEqual(T.todayCounter(c, '2026-11-18'), { date: '2026-11-18', count: 0 });
  assert.deepEqual(T.todayCounter({ date: key, count: -3 }, key), { date: key, count: 0 });
});
