/**
 * lib/audio/spiritualAudio.js
 *
 * Web Audio API Acoustic Engine for Gurukul Chakra Studio & Guided Practice
 *
 * Synthesizes pure harmonic frequencies, Tibetan singing bowl chimes,
 * and soothing meditative drones directly in the browser.
 *
 * Zero external audio files required:
 * - 100% reliable across all modern browsers and mobile devices.
 * - Instantaneous playback with zero network latency or 404 asset failures.
 * - Scientifically tuned frequencies grounded in classical Indian music (Tanpura Sa-Pa)
 *   and contemplative acoustic resonance.
 */

// Bija Mantra Resonant Frequencies (Solfeggio & Traditional Cosmic Tuning)
export const CHAKRA_FREQUENCIES = {
  muladhara: { freq: 396, label: "LAM (लम्) • 396 Hz Root Grounding" },
  svadhisthana: { freq: 417, label: "VAM (वम्) • 417 Hz Sacral Flow" },
  manipura: { freq: 528, label: "RAM (रम्) • 528 Hz Solar Fire" },
  anahata: { freq: 639, label: "YAM (यम्) • 639 Hz Heart Radiance" },
  vishuddha: { freq: 741, label: "HAM (हम्) • 741 Hz Etheric Truth" },
  ajna: { freq: 852, label: "OM (ॐ) • 852 Hz Intuitive Vision" },
  sahasrara: { freq: 963, label: "AUM (ॐ) • 963 Hz Pure Consciousness" },
};

// Meditative Ambient Sound Frequencies
export const AMBIENT_FREQUENCIES = {
  cosmic_om: { fundamental: 136.1, harmonics: [136.1, 204.15, 272.2], label: "Cosmic Om (136.1 Hz)" },
  tanpura: { sa: 138.59, pa: 207.65, label: "Classical Indian Tanpura (Sa-Pa)" },
  tibetan_bowl: { fundamental: 216, overtone: 432, label: "Singing Bowl Warm Drone (216 Hz)" },
};

let audioCtx = null;
let currentDrone = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a resonant Bija Mantra acoustic bell tone with warm harmonic overtones.
 *
 * @param {string} chakraId - muladhara, svadhisthana, manipura, anahata, vishuddha, ajna, sahasrara
 * @param {number} [duration=2.5] - Duration of tone in seconds
 */
export function playBijaMantraTone(chakraId = "muladhara", duration = 2.5) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const target = CHAKRA_FREQUENCIES[chakraId] || CHAKRA_FREQUENCIES.muladhara;
  const baseFreq = target.freq;

  const now = ctx.currentTime;

  // Master Gain with gentle exponential decay envelope
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.001, now);
  masterGain.gain.linearRampToValueAtTime(0.28, now + 0.08);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  masterGain.connect(ctx.destination);

  // Fundamental Sine Tone
  const osc1 = ctx.createOscillator();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(baseFreq, now);

  // Second Harmonic (Warm Octave / Fifth)
  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(baseFreq * 1.5, now);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.12, now);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.7);

  // Sub-harmonic for grounding (1 octave down)
  const osc3 = ctx.createOscillator();
  osc3.type = "triangle";
  osc3.frequency.setValueAtTime(baseFreq * 0.5, now);

  const gain3 = ctx.createGain();
  gain3.gain.setValueAtTime(0.08, now);
  gain3.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.85);

  osc1.connect(masterGain);
  osc2.connect(gain2);
  gain2.connect(masterGain);
  osc3.connect(gain3);
  gain3.connect(masterGain);

  osc1.start(now);
  osc2.start(now);
  osc3.start(now);

  osc1.stop(now + duration);
  osc2.stop(now + duration);
  osc3.stop(now + duration);
}

/**
 * Plays a soft Tibetan singing bowl chime (ideal for breath phase transition or meditation interval).
 */
export function playChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 2.0;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  gain.connect(ctx.destination);

  // Tibetan Bell partials: 432Hz fundamental + 864Hz octave + 1296Hz overtone
  [432, 864, 1296].forEach((f, idx) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(f, now);

    const partialGain = ctx.createGain();
    partialGain.gain.setValueAtTime(idx === 0 ? 0.7 : 0.25 / (idx + 1), now);
    partialGain.connect(gain);

    osc.connect(partialGain);
    osc.start(now);
    osc.stop(now + duration);
  });
}

/**
 * Starts an ambient meditative drone (Tanpura, Cosmic Om, Tibetan Bowl, or None).
 *
 * @param {string} type - "tanpura_drone" | "cosmic_om" | "tibetan_bowl" | "silent"
 */
export function startAmbientDrone(type = "cosmic_om") {
  stopAmbientDrone();
  if (!type || type === "silent" || typeof window === "undefined") return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.001, now);
  masterGain.gain.linearRampToValueAtTime(0.08, now + 2.5); // Smooth 2.5s fade in
  masterGain.connect(ctx.destination);

  const oscillators = [];

  if (type === "cosmic_om") {
    // Hans Cousto cosmic octave frequency for OM: 136.1 Hz + gentle 272.2 Hz octave
    const freqs = [136.1, 136.1 * 1.5, 272.2];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now);

      // Add gentle LFO detune for natural beating
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.15 + i * 0.05, now);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.8, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      oscillators.push(lfo);

      osc.connect(masterGain);
      osc.start(now);
      oscillators.push(osc);
    });
  } else if (type === "tanpura_drone") {
    // Classical Indian Tanpura (Sa - Pa tuning): C# (138.59 Hz) and G# (207.65 Hz)
    const baseSa = 138.59;
    const notes = [baseSa, baseSa * 1.5, baseSa * 2, baseSa * 0.5];
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 3 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(f, now);
      osc.connect(masterGain);
      osc.start(now);
      oscillators.push(osc);
    });
  } else if (type === "tibetan_bowl") {
    // Singing Bowl deep drone: 216 Hz + 432 Hz + 648 Hz
    [216, 432, 648].forEach((f) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now);
      osc.connect(masterGain);
      osc.start(now);
      oscillators.push(osc);
    });
  }

  currentDrone = {
    masterGain,
    oscillators,
    ctx,
  };
}

/**
 * Stops any active ambient meditation drone with a smooth fade-out.
 */
export function stopAmbientDrone() {
  if (!currentDrone) return;

  try {
    const { masterGain, oscillators, ctx } = currentDrone;
    const now = ctx.currentTime;
    masterGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
    setTimeout(() => {
      oscillators.forEach((o) => {
        try {
          o.stop();
        } catch {
          // already stopped
        }
      });
    }, 1300);
  } catch (err) {
    console.warn("Drone stop non-blocking error:", err.message);
  } finally {
    currentDrone = null;
  }
}
