"use client";

import { Copy, History, Star, Trash2 } from "lucide-react";
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
  type CPFHistoryItem,
  displayCPF,
  formatHistoryDateTime,
  groupByLocalDate,
  headingForDateKey,
  usedFromHistory,
} from "@/lib/cpf";
import { useCPFStore } from "@/store/cpf-store";

type Props = {
  mask: boolean;
  onCopy: (item: CPFHistoryItem) => void;
};

function DateGroups({
  items,
  getIso,
  mask,
  onCopy,
  favorites,
  onFavorite,
}: {
  items: CPFHistoryItem[];
  getIso: (item: CPFHistoryItem) => string;
  mask: boolean;
  onCopy: (item: CPFHistoryItem) => void;
  favorites?: CPFHistoryItem[];
  onFavorite?: (item: CPFHistoryItem) => void;
}) {
  const t = useTranslations("Cpf");
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
                key={`${item.cpf}-${getIso(item)}`}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2 dark:border-slate-900"
              >
                <div className="flex min-w-0 flex-1 items-baseline gap-3">
                  <p className="font-mono text-sm">
                    {displayCPF(item, mask)}
                  </p>
                  <p className="shrink-0 text-[11px] text-slate-500 tabular-nums">
                    {formatHistoryDateTime(getIso(item), locale)}
                    {item.usedAt && getIso(item) === item.createdAt
                      ? ` · ${t("historyUsedBadge")}`
                      : null}
                    {item.usedAt && getIso(item) === item.usedAt
                      ? ` · ${item.uf}`
                      : null}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {onFavorite && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onFavorite(item)}
                      aria-label={t("favoriteAria")}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          favorites?.some((f) => f.cpf === item.cpf)
                            ? "fill-amber-400 text-amber-500"
                            : ""
                        }`}
                      />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onCopy(item)}
                    aria-label={t("copyAria")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function CpfHistoryTab({ mask, onCopy }: Props) {
  const t = useTranslations("Cpf");
  const { history, used, favorites, clearHistory, toggleFavorite } =
    useCPFStore();
  const usedItems = usedFromHistory(used);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-4 w-4" />
              {t("historyTitle")}
            </CardTitle>
            <CardDescription>{t("historyDesc")}</CardDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearHistory}
            aria-label={t("historyClear")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="max-h-[28rem] overflow-auto">
          {!history.length ? (
            <p className="text-sm text-slate-500">{t("historyEmpty")}</p>
          ) : (
            <DateGroups
              items={history}
              getIso={(item) => item.createdAt}
              mask={mask}
              onCopy={onCopy}
              favorites={favorites}
              onFavorite={toggleFavorite}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("usedTitle")}</CardTitle>
          <CardDescription>{t("usedDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[28rem] overflow-auto">
          {!usedItems.length ? (
            <p className="text-sm text-slate-500">{t("usedEmpty")}</p>
          ) : (
            <DateGroups
              items={usedItems}
              getIso={(item) => item.usedAt ?? item.createdAt}
              mask={mask}
              onCopy={onCopy}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
