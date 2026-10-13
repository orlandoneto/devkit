"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-w-xs rounded-lg border border-stone-200 bg-slate-900 px-3 py-2 text-xs leading-relaxed text-stone-100 shadow-lg dark:border-stone-700 dark:bg-stone-100 dark:text-slate-900",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

/** Ícone (?) com tooltip informativo ao lado de labels/controles. */
export function InfoTip({
  text,
  label = "Mais informações",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40",
            className,
          )}
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{text}</TooltipContent>
    </Tooltip>
  );
}

export function WithInfo({
  label,
  tip,
  htmlFor,
  children,
  className,
}: {
  label: string;
  tip: string;
  htmlFor?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          {label}
        </label>
        <InfoTip text={tip} />
      </div>
      {children}
    </div>
  );
}
