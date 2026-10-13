"use client";

import { useTranslations } from "next-intl";
import { Base64FilePanel } from "@/components/base64/Base64FileTool";
import { ToolShell } from "@/components/tools/ToolShell";

export function Base64Tool() {
  const t = useTranslations("Base64");

  return (
    <ToolShell title={t("title")} description={t("description")} notice={t("notice")}>
      <Base64FilePanel />
    </ToolShell>
  );
}
