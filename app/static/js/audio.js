export class Bgm {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.vol = 1;
    this.master.connect(this.ctx.destination);
    this.ch = [0, 1].map(() => {
      const el = new Audio();
      el.loop = true;
      const g = this.ctx.createGain();
      g.gain.value = 0;
      this.ctx.createMediaElementSource(el).connect(g).connect(this.master);
      return { el, g };
    });
    this.i = 0;
    this.cur = null;
    this.muted = false;
  }

  start() { return this.ctx.resume(); }
  // Al minimizar o cambiar de pestaña la música se calla (suspender el contexto para también los <audio>)
  suspend() { return this.ctx.suspend(); }
  resume() { return this.ctx.resume(); }

  play(src, fade = 0.8) {
    if (!src || src === this.cur) return;   // misma canción: no reinicia
    this.cur = src;
    const t = this.ctx.currentTime;
    const out = this.ch[this.i];
    const inn = this.ch[this.i ^ 1];
    this.i ^= 1;

    inn.el.src = src;
    inn.el.currentTime = 0;
    inn.el.play().catch(() => {});
    inn.g.gain.cancelScheduledValues(t);
    inn.g.gain.setValueAtTime(0, t);
    inn.g.gain.linearRampToValueAtTime(1, t + fade);

    out.g.gain.cancelScheduledValues(t);
    out.g.gain.setValueAtTime(out.g.gain.value, t);
    out.g.gain.linearRampToValueAtTime(0, t + fade);
    setTimeout(() => { if (this.ch[this.i] !== out) out.el.pause(); }, (fade + 0.1) * 1000);
  }

  // Volumen 0–1 (curva cuadrática: el oído lo nota más natural). Subirlo con la música silenciada la reactiva.
  apply() { this.master.gain.setTargetAtTime(this.muted ? 0 : this.vol ** 2, this.ctx.currentTime, 0.05); }
  setVolume(v) {
    this.vol = Math.min(1, Math.max(0, v));
    if (this.vol > 0) this.muted = false;
    this.apply();
  }
  toggleMute() {
    this.muted = !this.muted;
    if (!this.muted && this.vol === 0) this.vol = 0.5;
    this.apply();
    return this.muted;
  }
}
