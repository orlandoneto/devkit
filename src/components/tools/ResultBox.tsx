"use client";

import { Check, Copy, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ResultBoxProps = {
  label?: string;
  value: string;
  badges?: string[];
  copied?: boolean;
  favorited?: boolean;
  onCopy?: () => void;
  onFavorite?: () => void;
  className?: string;
  copyTip?: string;
  favoriteTip?: string;
};

export function ResultBox({
  label,
  value,
  badges = [],
  copied,
  favorited,
  onCopy,
  onFavorite,
  className,
  copyTip,
  favoriteTip,
}: ResultBoxProps) {
  const t = useTranslations("Common");
  const resolvedLabel = label ?? t("result");
  const resolvedCopyTip = copyTip ?? t("copyTip");
  const resolvedFavoriteTip = favoriteTip ?? t("favoriteTip");

  return (
    <div className={cn("mt-3 min-w-0", className)}>
      <p className="mb-1 text-xs font-medium text-slate-500">{resolvedLabel}</p>
      <div className="rounded-lg border border-amber-200/80 bg-amber-50/70 px-2.5 py-2.5 sm:px-3 dark:border-amber-900/40 dark:bg-amber-950/20">
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 break-all font-mono text-lg font-bold tracking-tight text-slate-900 sm:text-xl dark:text-white">
            {value}
          </p>
          {onCopy && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={t("copy")}
                  onClick={onCopy}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-white text-slate-600 transition hover:bg-stone-50 hover:text-slate-900 dark:border-stone-700 dark:bg-slate-950 dark:hover:bg-stone-900"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{resolvedCopyTip}</TooltipContent>
            </Tooltip>
          )}
          {onFavorite && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={t("favorite")}
                  onClick={onFavorite}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-white text-slate-600 transition hover:bg-stone-50 dark:border-stone-700 dark:bg-slate-950 dark:hover:bg-stone-900"
                >
                  <Star
                    className={`h-4 w-4 ${favorited ? "fill-amber-400 text-amber-500" : ""}`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>{resolvedFavoriteTip}</TooltipContent>
            </Tooltip>
          )}
        </div>
        {badges.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white dark:bg-amber-600 [&:nth-child(n+2)]:bg-white/90 [&:nth-child(n+2)]:text-slate-700 dark:[&:nth-child(n+2)]:bg-slate-900 dark:[&:nth-child(n+2)]:text-slate-200"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
