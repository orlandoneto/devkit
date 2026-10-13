"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Pause, Play, RotateCcw, SkipForward, Volume2, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Switch } from "@/components/ui/form";
import { ToolShell } from "@/components/tools/ToolShell";
import {
  durationForMode,
  formatMmSs,
  playAlertTone,
  playTone,
  POMODORO_DEFAULTS,
  POMODORO_TONES,
  toneSrc,
  type PomodoroMode,
  type PomodoroToneId,
} from "@/lib/pomodoro";
import { cn } from "@/lib/utils";

export function PomodoroTimer() {
  const t = useTranslations("Pomodoro");
  const [focusMinutes, setFocusMinutes] = useState<number>(
    POMODORO_DEFAULTS.focusMinutes,
  );
  const [shortBreakMinutes, setShortBreakMinutes] = useState<number>(
    POMODORO_DEFAULTS.shortBreakMinutes,
  );
  const [longBreakMinutes, setLongBreakMinutes] = useState<number>(
    POMODORO_DEFAULTS.longBreakMinutes,
  );
  const [cyclesBeforeLong, setCyclesBeforeLong] = useState<number>(
    POMODORO_DEFAULTS.cyclesBeforeLong,
  );
  const [soundOn, setSoundOn] = useState(true);
  const [toneId, setToneId] = useState<PomodoroToneId>(POMODORO_DEFAULTS.toneId);
  const [mode, setMode] = useState<PomodoroMode>("focus");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(
    durationForMode("focus", POMODORO_DEFAULTS),
  );
  const [completedFocus, setCompletedFocus] = useState(0);
  const endAtRef = useRef<number | null>(null);
  const handledEndRef = useRef(false);
  const toneIdRef = useRef(toneId);
  const soundOnRef = useRef(soundOn);

  toneIdRef.current = toneId;
  soundOnRef.current = soundOn;

  const settings = { focusMinutes, shortBreakMinutes, longBreakMinutes };
  const totalSeconds = durationForMode(mode, settings);
  const progress =
    totalSeconds > 0 ? Math.min(1, (totalSeconds - secondsLeft) / totalSeconds) : 0;

  function applyMode(next: PomodoroMode, focusDone = completedFocus) {
    setMode(next);
    setRunning(false);
    endAtRef.current = null;
    handledEndRef.current = false;
    setSecondsLeft(durationForMode(next, settings));
    setCompletedFocus(focusDone);
  }

  function start() {
    if (secondsLeft <= 0) return;
    endAtRef.current = Date.now() + secondsLeft * 1000;
    handledEndRef.current = false;
    setRunning(true);
  }

  function pause() {
    if (endAtRef.current) {
      const left = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setSecondsLeft(left);
    }
    endAtRef.current = null;
    setRunning(false);
  }

  function reset() {
    applyMode(mode, completedFocus);
  }

  function skip() {
    advanceFrom(mode, completedFocus);
  }

  function advanceFrom(current: PomodoroMode, focusCount: number) {
    if (soundOnRef.current) playAlertTone(toneIdRef.current);

    if (current === "focus") {
      const nextCount = focusCount + 1;
      const longBreak = nextCount % cyclesBeforeLong === 0;
      toast.success(longBreak ? t("toastLongBreak") : t("toastShortBreak"));
      applyMode(longBreak ? "longBreak" : "shortBreak", nextCount);
      return;
    }

    toast.success(t("toastFocus"));
    applyMode("focus", focusCount);
  }

  useEffect(() => {
    if (!running) return;

    const tick = () => {
      if (!endAtRef.current) return;
      const left = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0 && !handledEndRef.current) {
        handledEndRef.current = true;
        setRunning(false);
        endAtRef.current = null;
        advanceFrom(mode, completedFocus);
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode, completedFocus, cyclesBeforeLong]);

  useEffect(() => {
    if (running) return;
    setSecondsLeft(durationForMode(mode, settings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusMinutes, shortBreakMinutes, longBreakMinutes, mode, running]);

  useEffect(() => {
    if (!running) return;
    document.title = `${formatMmSs(secondsLeft)} · ${t(`mode.${mode}`)} | devKit`;
  }, [running, secondsLeft, mode, t]);

  const modeLabel = t(`mode.${mode}`);

  return (
    <ToolShell title={t("title")} description={t("description")} notice={t("notice")}>
      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ["focus", t("mode.focus")],
            ["shortBreak", t("mode.shortBreak")],
            ["longBreak", t("mode.longBreak")],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            disabled={running}
            onClick={() => applyMode(id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
              mode === id
                ? "bg-slate-900 text-white dark:bg-amber-600 dark:text-slate-950"
                : "bg-stone-100 text-slate-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700",
              running && mode !== id && "opacity-50",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col items-center gap-3">
        <div className="relative flex h-44 w-44 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120" aria-hidden>
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-stone-200 dark:text-stone-800"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 54}
              strokeDashoffset={2 * Math.PI * 54 * (1 - progress)}
              className={cn(
                mode === "focus"
                  ? "text-amber-600"
                  : mode === "shortBreak"
                    ? "text-emerald-500"
                    : "text-sky-500",
              )}
            />
          </svg>
          <div className="text-center">
            <p className="font-mono text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatMmSs(secondsLeft)}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">{modeLabel}</p>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          {t("cyclesDone", { count: completedFocus })}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          {running ? (
            <Button size="sm" onClick={pause}>
              <Pause className="h-3.5 w-3.5" />
              {t("pause")}
            </Button>
          ) : (
            <Button size="sm" onClick={start}>
              <Play className="h-3.5 w-3.5" />
              {t("start")}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={reset} disabled={running && secondsLeft === totalSeconds}>
            <RotateCcw className="h-3.5 w-3.5" />
            {t("reset")}
          </Button>
          <Button size="sm" variant="secondary" onClick={skip}>
            <SkipForward className="h-3.5 w-3.5" />
            {t("skip")}
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field
          id="focus"
          label={t("focusMinutes")}
          value={focusMinutes}
          disabled={running}
          onChange={setFocusMinutes}
        />
        <Field
          id="short"
          label={t("shortBreakMinutes")}
          value={shortBreakMinutes}
          disabled={running}
          onChange={setShortBreakMinutes}
        />
        <Field
          id="long"
          label={t("longBreakMinutes")}
          value={longBreakMinutes}
          disabled={running}
          onChange={setLongBreakMinutes}
        />
        <Field
          id="cycles"
          label={t("cyclesBeforeLong")}
          value={cyclesBeforeLong}
          min={1}
          max={12}
          disabled={running}
          onChange={setCyclesBeforeLong}
        />
      </div>

      <div className="mt-3 space-y-2 rounded-lg border border-stone-200 px-3 py-3 dark:border-stone-800">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="sound" className="text-sm">
            {t("sound")}
          </Label>
          <Switch id="sound" checked={soundOn} onCheckedChange={setSoundOn} />
        </div>

        <div className="space-y-1.5">
          <Label>{t("tone")}</Label>
          <div className="flex flex-wrap gap-1.5">
            {POMODORO_TONES.map((tone) => (
              <button
                key={tone.id}
                type="button"
                disabled={!soundOn}
                onClick={() => {
                  setToneId(tone.id);
                  playTone(tone.id);
                }}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
                  toneId === tone.id
                    ? "bg-slate-900 text-white dark:bg-amber-600 dark:text-slate-950"
                    : "bg-stone-100 text-slate-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700",
                  !soundOn && "opacity-50",
                )}
              >
                {t(tone.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!soundOn}
            onClick={() => playTone(toneId)}
          >
            <Volume2 className="h-3.5 w-3.5" />
            {t("previewTone")}
          </Button>
          <Button type="button" size="sm" variant="secondary" asChild>
            <a href={toneSrc(toneId)} download={`pomodoro-${toneId}.wav`}>
              <Download className="h-3.5 w-3.5" />
              {t("downloadTone")}
            </a>
          </Button>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          {t("tonesHint")}
        </p>
      </div>
    </ToolShell>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  disabled,
  min = 1,
  max = 120,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)));
        }}
      />
    </div>
  );
}
