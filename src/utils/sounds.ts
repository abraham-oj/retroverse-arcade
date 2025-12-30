// Sistema de sonidos retro usando Web Audio API
class SoundSystem {
  private audioContext: AudioContext | null = null;
  private masterVolume = 0.3;
  private enabled = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'square', volume: number = 0.3) {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = volume * this.masterVolume;

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  private playSequence(notes: { freq: number; duration: number; type?: OscillatorType }[]) {
    if (!this.enabled || !this.audioContext) return;

    let time = this.audioContext.currentTime;
    notes.forEach(note => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);

      oscillator.frequency.value = note.freq;
      oscillator.type = note.type || 'square';
      gainNode.gain.value = 0.2 * this.masterVolume;

      oscillator.start(time);
      oscillator.stop(time + note.duration);

      time += note.duration;
    });
  }

  // Sonidos de juegos
  eat() {
    this.playTone(800, 0.05, 'sine', 0.2);
  }

  shoot() {
    this.playTone(440, 0.1, 'square', 0.15);
    setTimeout(() => this.playTone(220, 0.1, 'square', 0.1), 50);
  }

  hit() {
    this.playTone(150, 0.15, 'sawtooth', 0.3);
  }

  gameOver() {
    this.playSequence([
      { freq: 523, duration: 0.2 },
      { freq: 392, duration: 0.2 },
      { freq: 330, duration: 0.2 },
      { freq: 262, duration: 0.4 }
    ]);
  }

  victory() {
    this.playSequence([
      { freq: 523, duration: 0.15 },
      { freq: 659, duration: 0.15 },
      { freq: 784, duration: 0.15 },
      { freq: 1047, duration: 0.3, type: 'sine' }
    ]);
  }

  move() {
    this.playTone(200, 0.03, 'triangle', 0.1);
  }

  start() {
    this.playSequence([
      { freq: 523, duration: 0.1 },
      { freq: 659, duration: 0.1 },
      { freq: 784, duration: 0.2 }
    ]);
  }

  brick() {
    this.playTone(600, 0.08, 'square', 0.2);
  }

  bounce() {
    this.playTone(350, 0.05, 'sine', 0.15);
  }

  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

export const sounds = new SoundSystem();