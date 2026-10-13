"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { parseDynamicQRParams } from "@/lib/qrcode/dynamic";
import { useDynamicQRStore } from "@/store/dynamic-qr-store";

export function DynamicQRRedirectClient() {
  const t = useTranslations("QrDinamico");
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const bumpScan = useDynamicQRStore((s) => s.bumpScan);

  const parsed = useMemo(
    () => parseDynamicQRParams(searchParams),
    [searchParams],
  );

  const message = !parsed.destination
    ? t("redirectInvalid")
    : parsed.status === "pausado"
      ? t("redirectPaused")
      : parsed.status === "expirado"
        ? t("redirectExpired")
        : t("redirecting");

  const blocked = parsed.status !== "ativo" || !parsed.destination;

  useEffect(() => {
    const id = params.id;
    const frame = requestAnimationFrame(() => {
      if (id) bumpScan(id);
    });

    if (blocked) {
      return () => cancelAnimationFrame(frame);
    }

    const timer = window.setTimeout(() => {
      window.location.replace(parsed.destination);
    }, 400);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [blocked, bumpScan, params.id, parsed.destination]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-4 py-10 text-center">
      <p className="font-[family-name:var(--font-display)] text-[11px] font-semibold tracking-[0.18em] text-amber-700 uppercase dark:text-amber-400">
        {t("redirectBrand")}
      </p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
        {message}
      </h1>
      {blocked && (
        <p className="mt-2 text-sm text-slate-500">
          {t("redirectId", { id: params.id })}
          {parsed.expiresAt
            ? t("redirectExpires", { date: parsed.expiresAt })
            : ""}
        </p>
      )}
      <Link
        href="/qr-code/dinamico"
        className="mt-6 text-sm font-medium text-amber-700 underline-offset-2 hover:underline dark:text-amber-400"
      >
        {t("redirectManage")}
      </Link>
    </main>
  );
}
