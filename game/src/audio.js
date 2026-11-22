// Tiny WebAudio sound effects, created lazily on the first user gesture
// (browsers refuse an AudioContext before one). No files, no network:
// every blip is an oscillator envelope.

let ctx = null;

function ensure() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type, gain, slideTo) {
  const c = ensure();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function sfx(name) {
  switch (name) {
    case 'gold': tone(880, 0.12, 'triangle', 0.12, 1320); break;
    case 'ledger': tone(523, 0.16, 'triangle', 0.14); setTimeout(() => tone(784, 0.22, 'triangle', 0.14), 90); break;
    case 'coin': tone(1560, 0.09, 'square', 0.05, 1180); break;
    case 'smoke': tone(220, 0.3, 'sine', 0.1, 90); break;
    case 'alert': tone(660, 0.14, 'square', 0.07, 660); break;
    case 'alarm': tone(440, 0.5, 'sawtooth', 0.12, 440); setTimeout(() => tone(440, 0.5, 'sawtooth', 0.12, 440), 220); break;
    case 'locked': tone(180, 0.16, 'square', 0.09, 140); break;
    case 'clear': tone(659, 0.14, 'triangle', 0.12); setTimeout(() => tone(988, 0.2, 'triangle', 0.12), 100); break;
    case 'win': tone(523, 0.16, 'triangle', 0.13); setTimeout(() => tone(659, 0.16, 'triangle', 0.13), 120); setTimeout(() => tone(784, 0.3, 'triangle', 0.13), 240); break;
    default: break;
  }
}
