"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePreference = "light" | "dark" | "system";

type ThemeStore = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  cyclePreference: () => void;
};

const ORDER: ThemePreference[] = ["system", "light", "dark"];

export function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyThemeClass(preference: ThemePreference) {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(preference);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = resolved;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      preference: "system",
      setPreference: (preference) => {
        set({ preference });
        applyThemeClass(preference);
      },
      cyclePreference: () => {
        const current = get().preference;
        const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]!;
        get().setPreference(next);
      },
    }),
    {
      name: "devkit-theme",
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeClass(state.preference);
      },
    },
  ),
);
