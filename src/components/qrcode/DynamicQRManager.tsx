"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { useTranslations } from "next-intl";
import {
  Copy,
  ImageDown,
  Pause,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form";
import { ToolShell } from "@/components/tools/ToolShell";
import { InfoTip } from "@/components/ui/tooltip";
import {
  buildDynamicQRTarget,
  resolveDynamicQRStatus,
  type DynamicQRItem,
  type DynamicQRStatus,
} from "@/lib/qrcode/dynamic";
import { useDynamicQRStore } from "@/store/dynamic-qr-store";
import { copyToClipboard } from "@/lib/utils";

export function DynamicQRManager() {
  const t = useTranslations("QrDinamico");
  const items = useDynamicQRStore((s) => s.items);
  const upsert = useDynamicQRStore((s) => s.upsert);
  const remove = useDynamicQRStore((s) => s.remove);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState(() => t("defaultName"));
  const [destination, setDestination] = useState("https://example.com");
  const [status, setStatus] = useState<"ativo" | "pausado">("ativo");
  const [expiresAt, setExpiresAt] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pngUrl, setPngUrl] = useState("");

  const selected = useMemo(
    () => items.find((item) => item.id === (selectedId ?? items[0]?.id)) ?? null,
    [items, selectedId],
  );

  function statusLabel(value: DynamicQRStatus) {
    if (value === "pausado") return t("statusPausado");
    if (value === "expirado") return t("statusExpirado");
    return t("statusAtivo");
  }

  useEffect(() => {
    let active = true;
    const frame = requestAnimationFrame(() => {
      if (!selected) {
        if (active) setPngUrl("");
        return;
      }

      const target = buildDynamicQRTarget(selected);
      QRCode.toDataURL(target, {
        width: 240,
        margin: 2,
        errorCorrectionLevel: "M",
        color: { dark: "#0f172aff", light: "#ffffffff" },
      })
        .then((url) => {
          if (active) setPngUrl(url);
        })
        .catch(() => {
          if (active) setPngUrl("");
        });
    });

    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [selected]);

  function resetForm() {
    setEditingId(null);
    setName(t("defaultName"));
    setDestination("https://example.com");
    setStatus("ativo");
    setExpiresAt("");
  }

  function loadItem(item: DynamicQRItem) {
    setEditingId(item.id);
    setSelectedId(item.id);
    setName(item.name);
    setDestination(item.destination);
    setStatus(item.status);
    setExpiresAt(item.expiresAt ? item.expiresAt.slice(0, 16) : "");
  }

  function save() {
    if (!destination.trim()) {
      toast.error(t("errorDestination"));
      return;
    }

    const item = upsert({
      id: editingId ?? undefined,
      name: name || t("defaultName"),
      destination,
      status,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    });
    setSelectedId(item.id);
    setEditingId(item.id);
    toast.success(editingId ? t("toastUpdated") : t("toastCreated"));
  }

  async function copyLink(item: DynamicQRItem) {
    await copyToClipboard(buildDynamicQRTarget(item));
    toast.success(t("toastCopied"));
  }

  function downloadPng(item: DynamicQRItem) {
    if (!pngUrl || selected?.id !== item.id) return;
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `qr-dinamico-${item.id}.png`;
    link.click();
    toast.success(t("toastPng"));
  }

  return (
    <ToolShell
      title={t("title")}
      description={t("description")}
      notice={t("notice")}
    >
      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="space-y-2.5">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="dyn-name">{t("name")}</Label>
              <Input
                id="dyn-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dyn-status" className="inline-flex items-center gap-1">
                {t("status")}
                <InfoTip text={t("statusTip")} />
              </Label>
              <Select
                id="dyn-status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "ativo" | "pausado")
                }
              >
                <option value="ativo">{t("statusAtivo")}</option>
                <option value="pausado">{t("statusPausado")}</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="dyn-dest">{t("destination")}</Label>
            <Input
              id="dyn-dest"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="https://seusite.com/landing"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="dyn-exp" className="inline-flex items-center gap-1">
              {t("expiresAt")}
              <InfoTip text={t("expiresTip")} />
            </Label>
            <Input
              id="dyn-exp"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={save}>
              <Plus className="h-3.5 w-3.5" />
              {editingId ? t("save") : t("create")}
            </Button>
            {editingId && (
              <Button size="sm" variant="ghost" onClick={resetForm}>
                {t("new")}
              </Button>
            )}
          </div>
        </div>

        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-900/40">
          {selected && pngUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pngUrl}
                alt={t("alt", { name: selected.name })}
                className="h-auto max-h-[200px] max-w-full rounded bg-white"
              />
              <p className="mt-2 text-center text-xs text-slate-500">
                {statusLabel(resolveDynamicQRStatus(selected))}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500">{t("previewEmpty")}</p>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <p className="text-xs font-medium text-slate-500">
          {t("listTitle", { count: items.length })}
        </p>
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-stone-300 px-3 py-4 text-sm text-slate-500 dark:border-stone-700">
            {t("listEmpty")}
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const effective = resolveDynamicQRStatus(item);
              const active = selected?.id === item.id;
              return (
                <li
                  key={item.id}
                  className={`rounded-lg border px-3 py-2.5 dark:border-stone-800 ${
                    active
                      ? "border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20"
                      : "border-stone-200 bg-white dark:bg-slate-950"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => loadItem(item)}
                    >
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {item.destination}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {t("scansLocal", {
                          status: statusLabel(effective),
                          scans: item.scans,
                          id: item.id,
                        })}
                      </p>
                    </button>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          upsert({
                            id: item.id,
                            name: item.name,
                            destination: item.destination,
                            status: item.status === "ativo" ? "pausado" : "ativo",
                            expiresAt: item.expiresAt,
                          })
                        }
                      >
                        {item.status === "ativo" ? (
                          <Pause className="h-3.5 w-3.5" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyLink(item)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={!pngUrl || selected?.id !== item.id}
                        onClick={() => downloadPng(item)}
                      >
                        <ImageDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          remove(item.id);
                          if (editingId === item.id) resetForm();
                          toast.success(t("toastRemoved"));
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </ToolShell>
  );
}
