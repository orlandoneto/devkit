"use client";

import { useEffect } from "react";
import {
  applyThemeClass,
  useThemeStore,
} from "@/store/theme-store";

/** Mantém a classe .dark sincronizada com a preferência e o SO. */
export function ThemeSync() {
  const preference = useThemeStore((s) => s.preference);

  useEffect(() => {
    applyThemeClass(preference);

    if (preference !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyThemeClass("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  return null;
}
