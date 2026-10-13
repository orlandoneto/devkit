export type PomodoroMode = "focus" | "shortBreak" | "longBreak";

export type PomodoroToneId =
  | "chime"
  | "bell"
  | "ping"
  | "wood"
  | "digital";

export const POMODORO_DEFAULTS = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLong: 4,
  toneId: "chime" as PomodoroToneId,
} as const;

/** Toques do devKit — arquivo WAV + síntese distinta por id. */
export const POMODORO_TONES: {
  id: PomodoroToneId;
  src: string;
  labelKey: string;
}[] = [
  { id: "chime", src: "/sounds/pomodoro/chime.wav", labelKey: "tones.chime" },
  { id: "bell", src: "/sounds/pomodoro/bell.wav", labelKey: "tones.bell" },
  { id: "ping", src: "/sounds/pomodoro/ping.wav", labelKey: "tones.ping" },
  { id: "wood", src: "/sounds/pomodoro/wood.wav", labelKey: "tones.wood" },
  { id: "digital", src: "/sounds/pomodoro/digital.wav", labelKey: "tones.digital" },
];

export function minutesToSeconds(minutes: number) {
  return Math.max(1, Math.round(minutes)) * 60;
}

export function formatMmSs(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function durationForMode(
  mode: PomodoroMode,
  settings: {
    focusMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
  },
) {
  if (mode === "focus") return minutesToSeconds(settings.focusMinutes);
  if (mode === "shortBreak") return minutesToSeconds(settings.shortBreakMinutes);
  return minutesToSeconds(settings.longBreakMinutes);
}

export function toneSrc(toneId: PomodoroToneId) {
  return (
    POMODORO_TONES.find((tone) => tone.id === toneId)?.src ??
    POMODORO_TONES[0].src
  );
}

let sharedCtx: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AudioCtx();
  }
  return sharedCtx;
}

function tone(
  ctx: AudioContext,
  start: number,
  freq: number,
  duration: number,
  type: OscillatorType,
  gainPeak: number,
  decay: number,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainPeak * 1.35, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration * decay);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration);
}

/** Síntese distinta por toque (garante sons diferentes mesmo se o WAV falhar). */
function playSynthesizedTone(toneId: PomodoroToneId) {
  const ctx = getAudioContext();
  if (!ctx) return;
  void ctx.resume();
  const now = ctx.currentTime;

  switch (toneId) {
    case "bell":
      tone(ctx, now, 523.25, 1.1, "sine", 0.22, 0.95);
      tone(ctx, now, 1046.5, 0.9, "sine", 0.14, 0.9);
      tone(ctx, now, 1568, 0.6, "triangle", 0.08, 0.85);
      break;
    case "ping":
      tone(ctx, now, 1568, 0.35, "sine", 0.28, 0.7);
      break;
    case "wood": {
      const bufferSize = Math.floor(ctx.sampleRate * 0.12);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i += 1) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.08));
      }
      const noise = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      noise.buffer = buffer;
      filter.type = "bandpass";
      filter.frequency.value = 420;
      filter.Q.value = 1.2;
      gain.gain.setValueAtTime(0.62, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.12);
      tone(ctx, now, 180, 0.1, "triangle", 0.18, 0.6);
      break;
    }
    case "digital":
      tone(ctx, now, 880, 0.12, "square", 0.12, 0.55);
      tone(ctx, now + 0.16, 1175, 0.14, "square", 0.12, 0.55);
      break;
    case "chime":
    default:
      tone(ctx, now, 784, 0.7, "sine", 0.2, 0.9);
      tone(ctx, now + 0.14, 1175, 0.65, "sine", 0.16, 0.88);
      break;
  }
}

/** Toca o toque uma vez (síntese + WAV). */
function playToneOnce(toneId: PomodoroToneId) {
  if (typeof window === "undefined") return;

  playSynthesizedTone(toneId);

  try {
    const audio = new Audio(`${toneSrc(toneId)}?v=2`);
    audio.volume = 0.75;
    void audio.play().catch(() => {
      /* ignore — síntese já tocou */
    });
  } catch {
    /* ignore */
  }
}

const ALERT_REPEAT_DEFAULT = 10;
const ALERT_GAP_MS = 750;

/** Toca o toque selecionado. Em alerta de fim de ciclo, repete algumas vezes. */
export function playTone(
  toneId: PomodoroToneId = POMODORO_DEFAULTS.toneId,
  options?: { times?: number; gapMs?: number },
) {
  if (typeof window === "undefined") return;

  const times = Math.max(1, options?.times ?? 1);
  const gapMs = options?.gapMs ?? ALERT_GAP_MS;

  playToneOnce(toneId);
  for (let i = 1; i < times; i += 1) {
    window.setTimeout(() => playToneOnce(toneId), i * gapMs);
  }
}

/** Alerta de fim de ciclo — toca várias vezes para não passar despercebido. */
export function playAlertTone(
  toneId: PomodoroToneId = POMODORO_DEFAULTS.toneId,
) {
  playTone(toneId, { times: ALERT_REPEAT_DEFAULT, gapMs: ALERT_GAP_MS });
}

/** @deprecated use playTone */
export function playChime() {
  playTone("chime");
}
