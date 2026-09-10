/**
 * ==========================================================================
 * SHENAARAAAAA - 3D CAKE & POPUP BIRTHDAY CARD EXPERIENCE
 * Pure Vanilla JavaScript - Audio Synthesizer, Happy Birthday Song,
 * Individual Candle Blow Physics, Confetti & Fireworks FX Engine
 * ==========================================================================
 */

(function () {
  'use strict';

  // --- STATE ---
  const state = {
    currentStage: 'cake',
    soundEnabled: true,
    songPlaying: false,
    candlesLitStatus: [true, true, true, true, true],
    audioCtx: null,
    songTimeoutIds: [],
    fireworksInterval: null
  };

  // --- AUDIO SYNTHESIZER (Web Audio API) ---
  function getAudioContext() {
    if (!state.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        state.audioCtx = new AudioCtx();
      }
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
    return state.audioCtx;
  }

  const Sound = {
    playTone(freq, type = 'sine', duration = 0.4, gainLevel = 0.15) {
      if (!state.soundEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {}
    },

    blowPuff() {
      if (!state.soundEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const bufferSize = ctx.sampleRate * 0.25;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.3;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.25);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } catch (e) {}
    },

    firework() {
      if (!state.soundEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.28);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.28);

        setTimeout(() => {
          Sound.playTone(85, 'triangle', 0.35, 0.14);
        }, 280);
      } catch (e) {}
    }
  };

  // --- BACKGROUND MUSIC & SYNTHESIZER FALLBACK ---
  const happyBirthdaySongNotes = [
    { note: 261.63, dur: 0.35, delay: 0 },
    { note: 261.63, dur: 0.25, delay: 400 },
    { note: 293.66, dur: 0.55, delay: 700 },
    { note: 261.63, dur: 0.55, delay: 1300 },
    { note: 349.23, dur: 0.55, delay: 1900 },
    { note: 329.63, dur: 1.00, delay: 2500 },

    { note: 261.63, dur: 0.35, delay: 3700 },
    { note: 261.63, dur: 0.25, delay: 4100 },
    { note: 293.66, dur: 0.55, delay: 4400 },
    { note: 261.63, dur: 0.55, delay: 5000 },
    { note: 392.00, dur: 0.55, delay: 5600 },
    { note: 349.23, dur: 1.00, delay: 6200 },

    { note: 261.63, dur: 0.35, delay: 7400 },
    { note: 261.63, dur: 0.25, delay: 7800 },
    { note: 523.25, dur: 0.65, delay: 8100 },
    { note: 440.00, dur: 0.65, delay: 8800 },
    { note: 349.23, dur: 0.65, delay: 9500 },
    { note: 329.63, dur: 0.65, delay: 10200 },
    { note: 293.66, dur: 0.85, delay: 10900 },

    { note: 466.16, dur: 0.35, delay: 12000 },
    { note: 466.16, dur: 0.25, delay: 12400 },
    { note: 440.00, dur: 0.65, delay: 12700 },
    { note: 349.23, dur: 0.65, delay: 13400 },
    { note: 392.00, dur: 0.65, delay: 14100 },
    { note: 349.23, dur: 1.30, delay: 14800 }
  ];

  function playFallbackSynthSong() {
    happyBirthdaySongNotes.forEach(item => {
      const tid = setTimeout(() => {
        if (!state.songPlaying || !state.soundEnabled) return;
        Sound.playTone(item.note, 'triangle', item.dur, 0.18);
        Sound.playTone(item.note * 0.5, 'sine', item.dur, 0.08);
      }, item.delay);
      state.songTimeoutIds.push(tid);
    });

    const loopTid = setTimeout(() => {
      if (state.songPlaying) {
        playFallbackSynthSong();
      }
    }, 17500);
    state.songTimeoutIds.push(loopTid);
  }

  function playHappyBirthdaySong(forceRestart = false) {
    if (!state.soundEnabled) return;
    state.songPlaying = true;
    updateMusicButtonUI();

    const audioEl = document.getElementById('bg-audio');
    if (audioEl) {
      audioEl.volume = 0.85;
      if (forceRestart) {
        audioEl.currentTime = 0;
      }
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          state.songPlaying = true;
          updateMusicButtonUI();
        }).catch(() => {
          // If browser prevented auto-play prior to gesture, wait for gesture unlock
        });
      }
    } else {
      playFallbackSynthSong();
    }
  }

  function stopHappyBirthdaySong() {
    state.songPlaying = false;
    const audioEl = document.getElementById('bg-audio');
    if (audioEl) {
      audioEl.pause();
    }
    state.songTimeoutIds.forEach(id => clearTimeout(id));
    state.songTimeoutIds = [];
    updateMusicButtonUI();
  }

  function toggleHappyBirthdaySong() {
    getAudioContext();
    if (state.songPlaying) {
      stopHappyBirthdaySong();
    } else {
      playHappyBirthdaySong();
    }
  }

  function updateMusicButtonUI() {
    const btn = document.getElementById('music-btn');
    const icon = document.getElementById('music-icon');
    if (btn && icon) {
      if (state.songPlaying) {
        btn.classList.add('pulse-glow');
        icon.textContent = '🎵';
      } else {
        btn.classList.remove('pulse-glow');
        icon.textContent = '🔇';
      }
    }
  }

  // --- AMBIENT CANVAS & FX CANVAS ---
  const starsCanvas = document.getElementById('stars-canvas');
  const fxCanvas = document.getElementById('fx-canvas');
  const starsCtx = starsCanvas.getContext('2d');
  const fxCtx = fxCanvas.getContext('2d');

  let width = (starsCanvas.width = fxCanvas.width = window.innerWidth);
  let height = (starsCanvas.height = fxCanvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = starsCanvas.width = fxCanvas.width = window.innerWidth;
    height = starsCanvas.height = fxCanvas.height = window.innerHeight;
    initStars();
  });

  const stars = [];
  const STAR_COLORS = ['#ffffff', '#ffd166', '#c084fc', '#38bdf8', '#ff758c'];

  function initStars() {
    stars.length = 0;
    const count = Math.min(Math.floor((width * height) / 8500), 100);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.2 + 0.05,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]
      });
    }
  }
  initStars();

  let mouseX = width / 2;
  let mouseY = height / 2;
  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function renderStars() {
    starsCtx.clearRect(0, 0, width, height);

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.y -= s.speed;
      if (s.y < 0) s.y = height;

      s.alpha += s.twinkleSpeed;
      if (s.alpha > 0.95 || s.alpha < 0.15) {
        s.twinkleSpeed = -s.twinkleSpeed;
      }

      const dx = (mouseX - width / 2) * 0.01;
      const dy = (mouseY - height / 2) * 0.01;

      starsCtx.beginPath();
      starsCtx.arc(s.x + dx, s.y + dy, s.radius, 0, Math.PI * 2);
      starsCtx.fillStyle = s.color;
      starsCtx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
      starsCtx.shadowBlur = 4;
      starsCtx.shadowColor = s.color;
      starsCtx.fill();
    }

    starsCtx.globalAlpha = 1;
    starsCtx.shadowBlur = 0;
    requestAnimationFrame(renderStars);
  }
  renderStars();

  // --- FX CANVAS (Confetti & Fireworks) ---
  const confettiParticles = [];
  const fireworks = [];
  const fireworkParticles = [];
  const CONFETTI_COLORS = ['#ffd166', '#9d4edd', '#ec4899', '#38bdf8', '#52b788', '#ffffff', '#ff9f1c'];

  function spawnConfetti(count = 120, originX = width / 2, originY = height / 2) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 11 + 3.5;
      confettiParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 4,
        w: Math.random() * 9 + 5,
        h: Math.random() * 5 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 14,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        gravity: 0.16,
        drag: 0.98,
        alpha: 1,
        decay: Math.random() * 0.008 + 0.004,
        shape: Math.random() > 0.3 ? 'rect' : 'circle'
      });
    }
  }

  function launchFirework(targetX = Math.random() * width * 0.8 + width * 0.1, targetY = Math.random() * height * 0.35 + height * 0.1) {
    Sound.firework();
    fireworks.push({
      x: Math.random() * (width * 0.6) + width * 0.2,
      y: height,
      targetX,
      targetY,
      vx: (targetX - (width / 2)) * 0.015,
      vy: -(Math.random() * 3.5 + 12),
      trail: [],
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
    });
  }

  function explodeFirework(x, y, color) {
    const particleCount = 70;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 1.5;
      fireworkParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: Math.random() * 0.014 + 0.01,
        gravity: 0.07,
        color,
        sparkle: Math.random() > 0.4
      });
    }
  }

  function renderFX() {
    fxCtx.clearRect(0, 0, width, height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y > height + 50) {
        confettiParticles.splice(i, 1);
        continue;
      }

      fxCtx.save();
      fxCtx.translate(p.x, p.y);
      fxCtx.rotate((p.rotation * Math.PI) / 180);
      fxCtx.globalAlpha = p.alpha;
      fxCtx.fillStyle = p.color;

      if (p.shape === 'rect') {
        fxCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        fxCtx.beginPath();
        fxCtx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        fxCtx.fill();
      }
      fxCtx.restore();
    }

    for (let i = fireworks.length - 1; i >= 0; i--) {
      const fw = fireworks[i];
      fw.x += fw.vx;
      fw.y += fw.vy;
      fw.vy += 0.12;

      fw.trail.push({ x: fw.x, y: fw.y, alpha: 1 });
      if (fw.trail.length > 7) fw.trail.shift();

      for (let t = 0; t < fw.trail.length; t++) {
        const pt = fw.trail[t];
        pt.alpha -= 0.12;
        fxCtx.beginPath();
        fxCtx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
        fxCtx.fillStyle = fw.color;
        fxCtx.globalAlpha = Math.max(0, pt.alpha);
        fxCtx.fill();
      }

      if (fw.vy >= -1 || fw.y <= fw.targetY) {
        explodeFirework(fw.x, fw.y, fw.color);
        fireworks.splice(i, 1);
      }
    }

    for (let i = fireworkParticles.length - 1; i >= 0; i--) {
      const fp = fireworkParticles[i];
      fp.x += fp.vx;
      fp.y += fp.vy;
      fp.vy += fp.gravity;
      fp.alpha -= fp.decay;

      if (fp.alpha <= 0) {
        fireworkParticles.splice(i, 1);
        continue;
      }

      fxCtx.save();
      fxCtx.beginPath();
      fxCtx.arc(fp.x, fp.y, fp.sparkle ? Math.random() * 2.2 + 1 : 2, 0, Math.PI * 2);
      fxCtx.fillStyle = fp.color;
      fxCtx.globalAlpha = fp.alpha;
      fxCtx.shadowBlur = 6;
      fxCtx.shadowColor = fp.color;
      fxCtx.fill();
      fxCtx.restore();
    }

    requestAnimationFrame(renderFX);
  }
  renderFX();

  // --- INDIVIDUAL CANDLE BLOWING ---
  function blowSingleCandle(candleIdx) {
    if (!state.candlesLitStatus[candleIdx]) return; // Already blown
    state.candlesLitStatus[candleIdx] = false;
    getAudioContext();

    Sound.blowPuff();
    const candleNum = candleIdx + 1;
    const flame = document.getElementById(`flame-${candleNum}`);
    const smoke = document.getElementById(`smoke-${candleNum}`);

    if (flame) flame.classList.remove('lit');
    if (smoke) smoke.classList.add('rise');

    // Check if all 5 candles have been blown
    const allBlown = state.candlesLitStatus.every(status => status === false);
    if (allBlown) {
      setTimeout(() => {
        triggerCelebrationAndCardPopup();
      }, 500);
    }
  }

  // --- CELEBRATION & POPUP CARD TRIGGER ---
  function triggerCelebrationAndCardPopup() {
    playHappyBirthdaySong();
    spawnConfetti(220, width / 2, height / 2);
    launchFirework(width * 0.25, height * 0.2);
    launchFirework(width * 0.75, height * 0.2);

    if (state.fireworksInterval) clearInterval(state.fireworksInterval);
    state.fireworksInterval = setInterval(() => {
      if (state.currentStage === 'card') {
        launchFirework();
        spawnConfetti(25, Math.random() * width, 0);
      }
    }, 2000);

    const stageCake = document.getElementById('stage-cake');
    const stageCard = document.getElementById('stage-card');

    if (stageCake) {
      stageCake.classList.remove('active');
      stageCake.classList.add('hidden');
    }
    if (stageCard) {
      stageCard.classList.remove('hidden');
      void stageCard.offsetWidth;
      stageCard.classList.add('active');
      state.currentStage = 'card';
    }
  }

  // --- EVENT LISTENERS ---
  document.addEventListener('DOMContentLoaded', () => {
    // Sound Button
    const soundBtn = document.getElementById('sound-btn');
    const soundIcon = document.getElementById('sound-icon');
    if (soundBtn && soundIcon) {
      soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.soundEnabled = !state.soundEnabled;
        const audioEl = document.getElementById('bg-audio');
        if (state.soundEnabled) {
          soundIcon.textContent = '🔊';
          if (audioEl) audioEl.muted = false;
          getAudioContext();
        } else {
          soundIcon.textContent = '🔇';
          if (audioEl) audioEl.muted = true;
          stopHappyBirthdaySong();
        }
      });
    }

    // Music Song Button
    const musicBtn = document.getElementById('music-btn');
    if (musicBtn) {
      musicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleHappyBirthdaySong();
      });
    }

    // Individual Candle Click Handlers
    for (let i = 1; i <= 5; i++) {
      const candleEl = document.getElementById(`candle-${i}`);
      if (candleEl) {
        const handler = (e) => {
          e.stopPropagation();
          blowSingleCandle(i - 1);
        };
        candleEl.addEventListener('click', handler);
        candleEl.addEventListener('touchstart', handler, { passive: true });
      }
    }

    // Replay Button
    const btnReplay = document.getElementById('btn-replay');
    if (btnReplay) {
      btnReplay.addEventListener('click', () => {
        state.candlesLitStatus = [true, true, true, true, true];
        state.currentStage = 'cake';
        stopHappyBirthdaySong();
        if (state.fireworksInterval) clearInterval(state.fireworksInterval);

        // Reset Candles
        for (let i = 1; i <= 5; i++) {
          const flame = document.getElementById(`flame-${i}`);
          const smoke = document.getElementById(`smoke-${i}`);
          if (flame) flame.classList.add('lit');
          if (smoke) smoke.classList.remove('rise');
        }

        // Show Stage Cake
        const stageCard = document.getElementById('stage-card');
        const stageCake = document.getElementById('stage-cake');
        if (stageCard) {
          stageCard.classList.remove('active');
          stageCard.classList.add('hidden');
        }
        if (stageCake) {
          stageCake.classList.remove('hidden');
          void stageCake.offsetWidth;
          stageCake.classList.add('active');
        }
      });
    }

    // Auto-start birthday song right from the beginning
    playHappyBirthdaySong();

    // Unlock audio & ensure playback on any user gesture (click/touch)
    const unlockAudioAndPlay = () => {
      getAudioContext();
      if (state.soundEnabled) {
        const audioEl = document.getElementById('bg-audio');
        if (audioEl && audioEl.paused) {
          audioEl.play().then(() => {
            state.songPlaying = true;
            updateMusicButtonUI();
          }).catch(() => {});
        }
      }
    };

    ['click', 'touchstart', 'pointerdown', 'keydown'].forEach(evt => {
      window.addEventListener(evt, unlockAudioAndPlay, { once: true, passive: true });
    });
  });
})();
