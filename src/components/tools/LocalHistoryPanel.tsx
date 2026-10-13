"use client";

import { Copy, History, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type LocalHistoryItem,
  formatHistoryDateTime,
  groupByLocalDate,
  headingForDateKey,
  usedFromLocalHistory,
} from "@/lib/local-history";

type Props = {
  history: LocalHistoryItem[];
  used: LocalHistoryItem[];
  onCopy: (item: LocalHistoryItem) => void;
  onClear: () => void;
};

function DateGroups({
  items,
  getIso,
  onCopy,
  showUsedBadge,
}: {
  items: LocalHistoryItem[];
  getIso: (item: LocalHistoryItem) => string;
  onCopy: (item: LocalHistoryItem) => void;
  showUsedBadge?: boolean;
}) {
  const t = useTranslations("Common");
  const locale = useLocale();
  const groups = groupByLocalDate(items, getIso);

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section key={group.dateKey}>
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {headingForDateKey(group.dateKey, locale, {
              today: t("historyToday"),
              yesterday: t("historyYesterday"),
            })}
          </h3>
          <div className="space-y-2">
            {group.items.map((item) => (
              <div
                key={`${item.id}-${getIso(item)}`}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2 dark:border-slate-900"
              >
                <div className="flex min-w-0 flex-1 items-baseline gap-3">
                  <p className="break-all font-mono text-sm">{item.display}</p>
                  <p className="shrink-0 text-[11px] text-slate-500 tabular-nums">
                    {formatHistoryDateTime(getIso(item), locale)}
                    {showUsedBadge && item.usedAt
                      ? ` · ${t("historyUsedBadge")}`
                      : null}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0"
                  onClick={() => onCopy(item)}
                  aria-label={t("copy")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function LocalHistoryPanel({ history, used, onCopy, onClear }: Props) {
  const t = useTranslations("Common");
  const usedItems = usedFromLocalHistory(used);

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4" />
              {t("historyTitle")}
            </CardTitle>
            <CardDescription>{t("historyDesc")}</CardDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClear}
            aria-label={t("historyClear")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="max-h-[22rem] overflow-auto">
          {!history.length ? (
            <p className="text-sm text-slate-500">{t("historyEmpty")}</p>
          ) : (
            <DateGroups
              items={history}
              getIso={(item) => item.createdAt}
              onCopy={onCopy}
              showUsedBadge
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("usedTitle")}</CardTitle>
          <CardDescription>{t("usedDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[22rem] overflow-auto">
          {!usedItems.length ? (
            <p className="text-sm text-slate-500">{t("usedEmpty")}</p>
          ) : (
            <DateGroups
              items={usedItems}
              getIso={(item) => item.usedAt ?? item.createdAt}
              onCopy={onCopy}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
