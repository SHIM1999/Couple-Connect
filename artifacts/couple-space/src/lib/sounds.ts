let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!_ctx || _ctx.state === "closed") {
      _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (_ctx.state === "suspended") void _ctx.resume();
    return _ctx;
  } catch {
    return null;
  }
}

function playNote(ctx: AudioContext, freq: number, startAt: number, duration: number, gain: number) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.connect(env);
  env.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.value = freq;
  env.gain.setValueAtTime(0, startAt);
  env.gain.linearRampToValueAtTime(gain, startAt + 0.02);
  env.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
  osc.start(startAt);
  osc.stop(startAt + duration);
}

// Lovely ascending love chime — C5 E5 G5 C6
export function playHeartSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, i) => playNote(ctx, freq, ctx.currentTime + i * 0.09, 0.35, 0.25));
}

// Soft pixel tap for nav buttons
export function playNavTapSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.connect(env);
  env.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(720, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(360, ctx.currentTime + 0.08);
  env.gain.setValueAtTime(0.12, ctx.currentTime);
  env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.08);
}
