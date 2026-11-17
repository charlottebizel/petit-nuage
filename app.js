// Branche la logique (timer.js) sur la page.
(function () {
  const T = window.FocusTimer;
  const demo = new URLSearchParams(location.search).has('demo');
  const unitMs = demo ? 1000 : 60000;

  const LABELS = { work: 'Concentration', short: 'Petite pause', long: 'Grande pause' };
  const MOOD_MESSAGES = {
    happy: '',
    worried: 'Le petit nuage se demande si tu reviens vite…',
    sad: 'Le petit nuage t’attendait… Termine une session complète pour lui rendre le sourire.',
  };
  const WATER_DROP_PX = 108; // verre vide : l'eau est décalée sous le fond

  const store = {
    get(key) {
      try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* stockage indisponible */ }
    },
  };

  const el = {
    body: document.body,
    banner: document.getElementById('demo-banner'),
    phase: document.getElementById('phase-label'),
    time: document.getElementById('time'),
    toggle: document.getElementById('toggle'),
    reset: document.getElementById('reset'),
    dots: document.getElementById('dots'),
    cycleText: document.getElementById('cycle-text'),
    todayCount: document.getElementById('today-count'),
    todayWord: document.getElementById('today-word'),
    water: document.getElementById('water'),
    moodMsg: document.getElementById('mood-msg'),
    form: document.getElementById('settings-form'),
  };

  let state = T.createState(store.get('pn-settings'), unitMs);
  let today = T.todayCounter(store.get('pn-today'), T.todayKey(new Date()));
  let audio = null;
  let hiddenAt = null; // moment où l'onglet a été quitté

  // ---- Son (généré, pas de fichier) ----
  function ensureAudio() {
    if (!audio) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audio = new Ctx();
    }
    if (audio && audio.state === 'suspended') audio.resume();
  }

  function chime(notes) {
    if (!audio) return;
    notes.forEach((freq, i) => {
      const t = audio.currentTime + i * 0.18;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      osc.connect(gain).connect(audio.destination);
      osc.start(t);
      osc.stop(t + 0.65);
    });
  }

  // ---- Événements ----
  function onFinished(phase) {
    if (phase === 'work') {
      today = T.addSession(today, T.todayKey(new Date()));
      store.set('pn-today', today);
      chime([784, 988, 1175]); // montée joyeuse : pause !
    } else {
      chime([659, 523]); // fin de pause : on s'y remet
    }
    el.body.classList.remove('ding');
    void el.body.offsetWidth; // relance l'animation
    el.body.classList.add('ding');
  }

  el.toggle.addEventListener('click', () => {
    ensureAudio();
    const now = Date.now();
    state = state.running ? T.pause(state, now) : T.start(state, now);
    render();
  });

  el.reset.addEventListener('click', () => {
    state = T.reset(state);
    render();
  });

  // Quitter l'onglet (autre onglet, fenêtre réduite) pendant le travail rend le nuage triste.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hiddenAt = Date.now();
      return;
    }
    if (hiddenAt === null) return;
    const awayMs = Date.now() - hiddenAt;
    hiddenAt = null;
    loop(); // d'abord : la session a peut-être fini pendant l'absence
    state = T.markAway(state, awayMs);
    render();
  });

  function fillForm() {
    for (const [key, value] of Object.entries(state.settings)) {
      el.form.elements[key].value = value;
    }
  }

  el.form.addEventListener('change', () => {
    const raw = {};
    for (const key of Object.keys(T.DEFAULTS)) raw[key] = el.form.elements[key].value;
    state = T.updateSettings(state, raw);
    store.set('pn-settings', state.settings);
    fillForm(); // affiche les valeurs corrigées si hors bornes
    render();
  });

  // ---- Affichage ----
  function renderDots() {
    const total = state.settings.longEvery;
    const done = T.cyclePosition(state);
    if (el.dots.children.length !== total) {
      el.dots.innerHTML = '';
      for (let i = 0; i < total; i++) el.dots.appendChild(document.createElement('span')).className = 'dot';
    }
    [...el.dots.children].forEach((d, i) => d.classList.toggle('done', i < done));
    const left = total - done;
    el.cycleText.textContent = state.phase === 'long'
      ? 'Cycle terminé, profite de la grande pause !'
      : `Encore ${left} verre${left > 1 ? 's' : ''} avant la grande pause`;
  }

  function render() {
    const now = Date.now();
    const remaining = T.remainingMs(state, now);
    const p = T.progress(state, now);
    const level = state.phase === 'work' ? p : 1 - p; // la pause vide le verre

    el.body.dataset.phase = state.phase;
    el.body.dataset.mood = state.mood;
    el.moodMsg.textContent = MOOD_MESSAGES[state.mood];
    el.moodMsg.hidden = !MOOD_MESSAGES[state.mood];
    el.body.classList.toggle('running', state.running);
    el.phase.textContent = LABELS[state.phase];
    el.time.textContent = T.formatTime(remaining);
    el.water.style.transform = `translateY(${(1 - level) * WATER_DROP_PX}px)`;

    const fresh = remaining === T.durationMs(state.phase, state.settings, state.unitMs);
    el.toggle.textContent = state.running ? 'Pause' : fresh ? 'Démarrer' : 'Reprendre';

    el.todayCount.textContent = today.count;
    el.todayWord.textContent = today.count > 1 ? 'verres remplis' : 'verre rempli';
    document.title = `${T.formatTime(remaining)} · ${LABELS[state.phase]} · Petit Nuage`;
    renderDots();
  }

  function loop() {
    const r = T.tick(state, Date.now());
    if (r.finished) {
      state = r.state;
      onFinished(r.finished);
    }
    // Changement de jour pendant que la page est ouverte.
    const key = T.todayKey(new Date());
    if (today.date !== key) today = T.todayCounter(today, key);
    render();
  }

  if (demo) el.banner.hidden = false;
  fillForm();
  render();
  setInterval(loop, 250);
})();
