// Every sound here is synthesized from physics instead of recorded, and
// nothing plays until the visitor turns sound on.

const STORAGE_KEY = "margin-sound";
const CHANGE_EVENT = "margin-sound-change";
const PENTATONIC = [0, 3, 5, 7, 10];

let context: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = false;
const strings = new Map<number, AudioBuffer>();

export function soundEnabled() {
  return enabled;
}

export function readSoundPreference() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

function ensureContext() {
  if (context) return context;
  context = new AudioContext();
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.ratio.value = 6;
  master = context.createGain();
  master.gain.value = 0.55;
  master.connect(compressor).connect(context.destination);
  return context;
}

// Browsers only allow audio to start from a click or key press, so this is
// called from the toggle itself.
export function setSound(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {}
  if (on) ensureContext().resume();
  else context?.suspend();
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: on }));
}

export function onSoundChange(callback: (on: boolean) => void) {
  const listener = (event: Event) => callback((event as CustomEvent<boolean>).detail);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => window.removeEventListener(CHANGE_EVENT, listener);
}

// A remembered "on" still needs one gesture before the browser lets it play.
export function restoreSound() {
  if (!readSoundPreference()) return () => {};
  enabled = true;
  const forget = () => {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  const unlock = () => {
    if (enabled) ensureContext().resume();
    forget();
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
  return forget;
}

function output(pan: number) {
  const ctx = context!;
  const panner = ctx.createStereoPanner();
  panner.pan.value = pan;
  panner.connect(master!);
  return panner;
}

// The left margin plays on the left speaker and the right one on the right.
export function panFor(canvas: HTMLCanvasElement) {
  if (canvas.classList.contains("margin-left")) return -0.6;
  if (canvas.classList.contains("margin-right")) return 0.6;
  return 0;
}

function ready() {
  return enabled && context !== null && context.state === "running";
}

// Notes on a pentatonic scale, so any sweep across the strings sounds musical.
export function noteFor(step: number) {
  const octave = Math.floor(step / PENTATONIC.length);
  const degree = PENTATONIC[((step % PENTATONIC.length) + PENTATONIC.length) % PENTATONIC.length];
  return 146.83 * 2 ** (octave + degree / 12);
}

// Karplus-Strong: a burst of noise fed through a delay line one period long,
// averaged a little on every pass. The averaging is the string losing its
// high harmonics, which is why the result sounds plucked.
function stringBuffer(frequency: number) {
  const key = Math.round(frequency);
  const cached = strings.get(key);
  if (cached) return cached;

  const ctx = context!;
  const length = Math.floor(ctx.sampleRate * 2.4);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  const period = Math.max(2, Math.round(ctx.sampleRate / frequency));
  for (let i = 0; i < period; i++) data[i] = Math.random() * 2 - 1;
  for (let i = period; i < length; i++) {
    const a = data[i - period];
    const b = data[i - period + 1] ?? a;
    // Weighting toward the newer sample keeps more brightness, like steel.
    data[i] = (0.62 * a + 0.38 * b) * 0.9965;
  }
  // Low strings are still ringing when the buffer ends, so fade them out.
  const tail = Math.floor(ctx.sampleRate * 0.4);
  for (let i = 0; i < tail; i++) data[length - 1 - i] *= i / tail;
  strings.set(key, buffer);
  return buffer;
}

export function pluck(frequency: number, strength: number, pan: number) {
  if (!ready()) return;
  const ctx = context!;
  const source = ctx.createBufferSource();
  source.buffer = stringBuffer(frequency);
  const gain = ctx.createGain();
  gain.gain.value = Math.min(0.5, 0.12 + strength * 0.08);
  source.connect(gain).connect(output(pan));
  source.start();
}

// A drop traps a small bubble that rings with a pitch that rises as it
// settles (the Minnaert resonance). Bigger drops ring lower and louder.
export function drop(size: number, pan: number) {
  if (!ready()) return;
  const ctx = context!;
  const now = ctx.currentTime;
  const base = (520 / Math.max(0.4, size)) * (0.85 + Math.random() * 0.3);

  const tone = ctx.createOscillator();
  tone.type = "sine";
  tone.frequency.setValueAtTime(base, now);
  tone.frequency.exponentialRampToValueAtTime(base * 2.6, now + 0.09);
  const toneGain = ctx.createGain();
  toneGain.gain.setValueAtTime(0.0001, now);
  toneGain.gain.exponentialRampToValueAtTime(Math.min(0.55, 0.2 * size), now + 0.004);
  toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  tone.connect(toneGain).connect(output(pan));
  tone.start(now);
  tone.stop(now + 0.25);

  const splash = ctx.createBufferSource();
  splash.buffer = noise(ctx, 0.12);
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 2400;
  band.Q.value = 0.8;
  const splashGain = ctx.createGain();
  splashGain.gain.setValueAtTime(0.12 * size, now);
  splashGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  splash.connect(band).connect(splashGain).connect(output(pan));
  splash.start(now);
}

let lastTrickle = 0;

// Tiny bubbles for a finger trailing through water, more of them the faster
// it moves.
export function trickle(speed: number, pan: number) {
  if (!ready()) return;
  const now = performance.now();
  if (now - lastTrickle < 45 || Math.random() > Math.min(0.7, speed * 0.4)) return;
  lastTrickle = now;
  drop(0.22 + Math.random() * 0.2, pan + (Math.random() - 0.5) * 0.2);
}

const swirls = new Map<number, { gain: GainNode; filter: BiquadFilterNode }>();

// A soft, low rush of moving liquid that follows how fast the ink is stirred.
export function stir(intensity: number, pan: number) {
  if (!ready()) return;
  const ctx = context!;
  let swirl = swirls.get(pan);
  if (!swirl) {
    const source = ctx.createBufferSource();
    source.buffer = noise(ctx, 2);
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;
    filter.Q.value = 2;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    source.connect(filter).connect(gain).connect(output(pan));
    source.start();
    swirl = { gain, filter };
    swirls.set(pan, swirl);
  }
  const now = ctx.currentTime;
  const level = Math.min(0.35, intensity * 0.05);
  swirl.gain.gain.cancelScheduledValues(now);
  swirl.gain.gain.setTargetAtTime(level, now, 0.05);
  swirl.gain.gain.setTargetAtTime(0, now + 0.15, 0.4);
  swirl.filter.frequency.setTargetAtTime(300 + intensity * 120, now, 0.1);
}

function noise(ctx: AudioContext, seconds: number) {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}
