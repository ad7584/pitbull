// Tiny synthesized sound design via Web Audio — no asset files. Every effect
// is gated by the global sound toggle (off by default; the caller checks).

let ctx: AudioContext | null = null;
function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, gain: number) {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime + start);
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + start);
  o.stop(c.currentTime + start + dur + 0.02);
}

function noise(start: number, dur: number, gain: number) {
  const c = ac();
  if (!c) return;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, c.currentTime + start);
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1200;
  src.connect(filter).connect(g).connect(c.destination);
  src.start(c.currentTime + start);
}

export const sfx = {
  coin() {
    tone(880, 0, 0.08, "square", 0.08);
    tone(1320, 0.05, 0.12, "square", 0.06);
  },
  click() {
    tone(520, 0, 0.05, "triangle", 0.05);
  },
  growl() {
    tone(90, 0, 0.35, "sawtooth", 0.09);
    tone(70, 0.08, 0.4, "sawtooth", 0.07);
  },
  charge() {
    const c = ac();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(120, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(900, c.currentTime + 1.6);
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.06, c.currentTime + 1.5);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 1.9);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 2);
  },
  smash() {
    noise(0, 0.5, 0.28);
    tone(180, 0, 0.25, "square", 0.12);
    tone(90, 0.02, 0.4, "sawtooth", 0.1);
  },
  cheer() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.05 * i, 0.5, "triangle", 0.06));
  },
};
