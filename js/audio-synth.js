/**
 * ============================================================================
 * AUDIO SYSTEM & SYNTHESIZER (audio-synth.js)
 * ============================================================================
 * Modul pemutar suara yang cerdas:
 * 1. Memutar file audio lokal (.wav / .mp3) jika tersedia.
 * 2. Menyediakan Synthesizer Web Audio API bawaan (Prosedural Sound Generator)
 *    sebagai cadangan otomatis jika file suara belum diisi oleh pengguna.
 * 3. Menangani permission audio dan audio-context unlock di browser mobile.
 * ============================================================================
 */

class DinoAudioSystem {
  constructor() {
    this.audioCtx = null;
    this.currentAudioElement = null;
    this.isPlaying = false;
  }

  // Inisialisasi AudioContext setelah interaksi pengguna
  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Putar suara dinosaurus (file audio atau synthesizer bawaan)
   * @param {Object} soundConfig - { url: string, synthType: string }
   * @param {Function} onStart - Callback saat suara mulai
   * @param {Function} onEnd - Callback saat suara selesai
   */
  async playRoar(soundConfig, onStart, onEnd) {
    this.stop(); // Hentikan suara yang sedang aktif
    this.isPlaying = true;
    if (onStart) onStart();

    const handleFinished = () => {
      this.isPlaying = false;
      if (onEnd) onEnd();
    };

    // 1. Coba putar dari file audio (WAV / MP3)
    if (soundConfig && soundConfig.url) {
      try {
        const audio = new Audio(soundConfig.url);
        this.currentAudioElement = audio;

        audio.onended = () => {
          this.currentAudioElement = null;
          handleFinished();
        };

        audio.onerror = (e) => {
          console.warn(`File audio '${soundConfig.url}' gagal dimuat. Mengalihkan ke synthesizer Web Audio API...`, e);
          this.currentAudioElement = null;
          this.synthesizeRoar(soundConfig.synthType || 'trex', handleFinished);
        };

        await audio.play();
        return;
      } catch (err) {
        console.warn("Autoplay audio dicegah atau file tidak ditemukan, fallback ke synth...", err);
      }
    }

    // 2. Fallback ke Web Audio API Synthesizer bawaan
    this.synthesizeRoar(soundConfig ? soundConfig.synthType : 'trex', handleFinished);
  }

  /**
   * Hentikan suara yang sedang berjalan
   */
  stop() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    this.isPlaying = false;
  }

  /**
   * Procedural Audio Synthesizer via Web Audio API
   * Menghasilkan raungan dinosaurus yang realistis tanpa file eksternal
   */
  synthesizeRoar(type = 'trex', onFinished) {
    const ctx = this.getAudioContext();
    if (!ctx) {
      if (onFinished) onFinished();
      return;
    }

    const duration = type === 'raptor' ? 1.8 : (type === 'brachio' ? 3.0 : 2.5);
    const now = ctx.currentTime;

    // Parameter berdasarkan jenis dinosaurus
    let baseFreq = 70;
    if (type === 'spino') baseFreq = 85;
    else if (type === 'raptor') baseFreq = 160;
    else if (type === 'brachio') baseFreq = 48;

    // Master Gain (Volume Envelope)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(0.8, now + 0.25);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Filter Lowpass Resonan
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(baseFreq * 8, now);
    filter.frequency.exponentialRampToValueAtTime(baseFreq * 2, now + duration * 0.8);
    filter.Q.setValueAtTime(4, now);

    // Oscillator 1 (Growl/Roar Tone)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(baseFreq * 1.5, now);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + duration);

    // Oscillator 2 (Sub Bass Rumble)
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 0.8, now);
    osc2.frequency.linearRampToValueAtTime(baseFreq * 0.4, now + duration);

    // LFO untuk efek geraman bergetar (Tremolo / Throat Modulation)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(18, now); // 18 Hz getaran tenggorokan
    lfoGain.gain.setValueAtTime(30, now);
    lfo.connect(osc1.frequency);

    // Noise Generator (Udara / desis raungan liar)
    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(baseFreq * 4, now);
    noiseFilter.Q.setValueAtTime(2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    // Routing Graph
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(masterGain);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    masterGain.connect(ctx.destination);

    // Start nodes
    osc1.start(now);
    osc2.start(now);
    lfo.start(now);
    whiteNoise.start(now);

    // Stop nodes
    osc1.stop(now + duration);
    osc2.stop(now + duration);
    lfo.stop(now + duration);
    whiteNoise.stop(now + duration);

    setTimeout(() => {
      if (onFinished) onFinished();
    }, duration * 1000);
  }
}

window.DinoAudio = new DinoAudioSystem();

