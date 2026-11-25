/**
 * Real-time synthesized aircraft audio (Web Audio API).
 * Brown-noise "airflow" through a lowpass filter + low turbine drone, driven by
 * flight phase and scroll velocity. Cabin chime + optional voice announcement.
 */
export class FlightSound {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private noiseGain!: GainNode;
  private filter!: BiquadFilterNode;
  private droneGain!: GainNode;
  private drone1!: OscillatorNode;
  private drone2!: OscillatorNode;
  private noise!: AudioBufferSourceNode;
  private muted = false;

  get active() {
    return !!this.ctx;
  }

  async start() {
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      this.ctx = ctx;

      this.master = ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(ctx.destination);

      // brown noise buffer
      const len = ctx.sampleRate * 3;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }
      this.noise = ctx.createBufferSource();
      this.noise.buffer = buf;
      this.noise.loop = true;

      this.filter = ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.value = 400;
      this.filter.Q.value = 0.8;

      this.noiseGain = ctx.createGain();
      this.noiseGain.gain.value = 0.3;
      this.noise.connect(this.filter).connect(this.noiseGain).connect(this.master);

      // turbine drone
      this.droneGain = ctx.createGain();
      this.droneGain.gain.value = 0.04;
      const dFilter = ctx.createBiquadFilter();
      dFilter.type = "lowpass";
      dFilter.frequency.value = 220;
      this.drone1 = ctx.createOscillator();
      this.drone1.type = "sawtooth";
      this.drone1.frequency.value = 62;
      this.drone2 = ctx.createOscillator();
      this.drone2.type = "triangle";
      this.drone2.frequency.value = 93;
      this.drone1.connect(dFilter);
      this.drone2.connect(dFilter);
      dFilter.connect(this.droneGain).connect(this.master);

      this.noise.start();
      this.drone1.start();
      this.drone2.start();
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.muted = false;
    this.master.gain.setTargetAtTime(0.7, this.ctx.currentTime, 0.4);
    this.chime();
  }

  /** intensity 0..1 */
  update(intensity: number) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const i = Math.max(0, Math.min(1, intensity));
    this.filter.frequency.setTargetAtTime(220 + 1100 * i, t, 0.15);
    this.noiseGain.gain.setTargetAtTime(0.18 + 0.75 * i, t, 0.15);
    this.drone1.frequency.setTargetAtTime(58 + 50 * i, t, 0.3);
    this.drone2.frequency.setTargetAtTime(87 + 70 * i, t, 0.3);
    this.droneGain.gain.setTargetAtTime(0.03 + 0.07 * i, t, 0.2);
  }

  /** pause output (e.g. section off-screen) without tearing down */
  setMuted(m: boolean) {
    if (!this.ctx) return;
    this.muted = m;
    this.master.gain.setTargetAtTime(m ? 0 : 0.7, this.ctx.currentTime, 0.25);
  }

  chime() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    [
      [880, 0],
      [660, 0.38],
    ].forEach(([freq, delay]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, now + delay);
      g.gain.exponentialRampToValueAtTime(0.35, now + delay + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.3);
      o.connect(g).connect(ctx.destination);
      o.start(now + delay);
      o.stop(now + delay + 1.4);
    });
  }

  say(text: string) {
    try {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      u.volume = 0.85;
      window.speechSynthesis.speak(u);
    } catch {
      /* ignore */
    }
  }

  stop() {
    try {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
    if (!this.ctx) return;
    const ctx = this.ctx;
    this.master.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
    this.ctx = null;
    window.setTimeout(() => {
      try {
        this.noise.stop();
        this.drone1.stop();
        this.drone2.stop();
        ctx.close();
      } catch {
        /* ignore */
      }
    }, 400);
  }
}
