import confetti from "canvas-confetti";

const COLORS = ["#FF4D8D", "#B6FF3C", "#FFD069", "#8E67FF", "#FF77A8"];

/** The crack-open celebration: a center burst + dual-edge fireworks. */
export function celebrate() {
  const base = { colors: COLORS, disableForReducedMotion: true, zIndex: 200 };
  confetti({ ...base, particleCount: 130, spread: 100, startVelocity: 48, origin: { y: 0.5 } });
  setTimeout(() => confetti({ ...base, particleCount: 70, angle: 55, spread: 75, origin: { x: 0, y: 0.62 } }), 140);
  setTimeout(() => confetti({ ...base, particleCount: 70, angle: 125, spread: 75, origin: { x: 1, y: 0.62 } }), 140);
  setTimeout(() => confetti({ ...base, particleCount: 50, spread: 120, scalar: 0.9, origin: { y: 0.45 } }), 320);
}
