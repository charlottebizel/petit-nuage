// Logique pure du minuteur : aucune dépendance au DOM, testable avec `node --test`.
// Chaque fonction reçoit un état et renvoie un NOUVEL état (pas de mutation).
(function (root) {
  const DEFAULTS = { work: 25, short: 5, long: 15, longEvery: 4 };
  const LIMITS = { work: [1, 120], short: [1, 60], long: [1, 60], longEvery: [2, 10] };
  // Partir moins longtemps que ça pendant le travail est pardonné.
  const AWAY_GRACE_MS = 5000;

  function clampInt(value, [min, max], fallback) {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function sanitizeSettings(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const out = {};
    for (const key of Object.keys(DEFAULTS)) {
      out[key] = clampInt(src[key], LIMITS[key], DEFAULTS[key]);
    }
    return out;
  }

  function durationMs(phase, settings, unitMs) {
    return settings[phase] * unitMs;
  }

  function createState(settings, unitMs = 60000) {
    const s = sanitizeSettings(settings);
    return {
      settings: s,
      unitMs,
      phase: 'work',
      remaining: durationMs('work', s, unitMs),
      running: false,
      endAt: null,
      cycleCount: 0, // sessions de travail terminées depuis le chargement
      mood: 'happy', // happy | worried | sad : l'humeur du nuage
    };
  }

  function remainingMs(state, now) {
    return state.running ? Math.max(0, state.endAt - now) : state.remaining;
  }

  function isWorking(state) {
    return state.phase === 'work' && state.running;
  }

  // Reprendre rassure un nuage inquiet ; un nuage triste le reste jusqu'à une session complète.
  function start(state, now) {
    if (state.running) return state;
    const mood = state.mood === 'worried' ? 'happy' : state.mood;
    return { ...state, mood, running: true, endAt: now + state.remaining };
  }

  // Une pause pendant le travail inquiète le nuage, sans le rendre triste.
  function pause(state, now) {
    if (!state.running) return state;
    const mood = state.phase === 'work' && state.mood === 'happy' ? 'worried' : state.mood;
    return { ...state, mood, running: false, remaining: remainingMs(state, now), endAt: null };
  }

  // Abandonner une session de travail commencée rend le nuage triste.
  function reset(state) {
    const started =
      state.running || state.remaining < durationMs(state.phase, state.settings, state.unitMs);
    const mood = state.phase === 'work' && started ? 'sad' : state.mood;
    return {
      ...state,
      mood,
      running: false,
      endAt: null,
      remaining: durationMs(state.phase, state.settings, state.unitMs),
    };
  }

  function nextPhase(finishedPhase, cycleCount, settings) {
    if (finishedPhase !== 'work') return 'work';
    return cycleCount % settings.longEvery === 0 ? 'long' : 'short';
  }

  // Si la phase en cours est terminée, passe à la suivante (en attente : l'utilisateur relance).
  function tick(state, now) {
    if (!state.running || now < state.endAt) return { state, finished: null };
    const finished = state.phase;
    const cycleCount = finished === 'work' ? state.cycleCount + 1 : state.cycleCount;
    const phase = nextPhase(finished, cycleCount, state.settings);
    return {
      finished,
      state: {
        ...state,
        phase,
        cycleCount,
        mood: finished === 'work' ? 'happy' : state.mood, // session complète : tout est pardonné
        running: false,
        endAt: null,
        remaining: durationMs(phase, state.settings, state.unitMs),
      },
    };
  }

  // Retour sur la page après une absence de `awayMs` millisecondes.
  function markAway(state, awayMs) {
    if (!isWorking(state) || awayMs < AWAY_GRACE_MS) return state;
    return { ...state, mood: 'sad' };
  }

  // 0 au début de la phase, 1 à la fin.
  function progress(state, now) {
    const total = durationMs(state.phase, state.settings, state.unitMs);
    return Math.min(1, Math.max(0, 1 - remainingMs(state, now) / total));
  }

  // Nouveaux réglages : appliqués tout de suite si la phase n'a pas commencé, sinon à la phase suivante.
  function updateSettings(state, rawSettings) {
    const settings = sanitizeSettings(rawSettings);
    const untouched =
      !state.running && state.remaining === durationMs(state.phase, state.settings, state.unitMs);
    return {
      ...state,
      settings,
      remaining: untouched ? durationMs(state.phase, settings, state.unitMs) : state.remaining,
    };
  }

  // Combien de sessions de travail sont déjà faites dans le cycle courant (avant la grande pause).
  function cyclePosition(state) {
    const done = state.cycleCount % state.settings.longEvery;
    if (state.phase === 'long') return state.settings.longEvery;
    return done;
  }

  function formatTime(ms) {
    const total = Math.ceil(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function todayKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Compteur du jour : remis à zéro automatiquement quand la date change.
  function todayCounter(stored, key) {
    if (stored && stored.date === key && Number.isInteger(stored.count) && stored.count >= 0) {
      return { date: key, count: stored.count };
    }
    return { date: key, count: 0 };
  }

  function addSession(counter, key) {
    const current = todayCounter(counter, key);
    return { date: key, count: current.count + 1 };
  }

  const api = {
    DEFAULTS, LIMITS, AWAY_GRACE_MS, sanitizeSettings, isWorking, markAway, durationMs, createState, remainingMs, start, pause,
    reset, nextPhase, tick, progress, updateSettings, cyclePosition, formatTime, todayKey,
    todayCounter, addSession,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FocusTimer = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
