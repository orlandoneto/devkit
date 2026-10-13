"use client";

import { useState } from "react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";

export function useCopyFeedback() {
  const [copied, setCopied] = useState(false);

  async function copy(text: string) {
    await copyToClipboard(text);
    setCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setCopied(false), 1200);
  }

  return { copied, copy };
}
