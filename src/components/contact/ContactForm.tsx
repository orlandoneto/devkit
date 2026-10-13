"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const WEB3FORMS_ACCESS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim() || "";

const fieldClass =
  "mt-1 w-full rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-stone-100";

export function ContactForm() {
  const t = useTranslations("Contact");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (name.length < 2 || !email.includes("@") || !message) {
      toast.error(t("invalid"));
      return;
    }

    if (formData.get("botcheck")) {
      setSent(true);
      return;
    }

    formData.delete("botcheck");
    formData.set("subject", `${t("title")} — ${name}`);
    formData.set("from_name", "devKit");

    setSending(true);
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        form.action = "https://api.web3forms.com/submit";
        form.method = "POST";
        form.submit();
        return;
      }
      const payload = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
        body?: { message?: string };
      };
      if (!res.ok || !payload.success) {
        const detail =
          payload.message || payload.body?.message || t("error");
        console.error("[contato]", res.status, payload);
        toast.error(detail);
        return;
      }
      form.reset();
      setSent(true);
      toast.success(t("success"));
    } catch (error) {
      console.error("[contato]", error);
      toast.error(t("error"));
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <p className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
        {t("success")}
      </p>
    );
  }

  return (
    <form className="relative mt-8 max-w-xl space-y-4" onSubmit={onSubmit}>
      <input type="hidden" name="access_key" value={WEB3FORMS_ACCESS_KEY} />
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />

      <div>
        <label htmlFor="contact-name" className="text-sm font-medium text-slate-800 dark:text-stone-200">
          {t("name")}
        </label>
        <input
          id="contact-name"
          name="name"
          required
          minLength={2}
          maxLength={120}
          autoComplete="name"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="text-sm font-medium text-slate-800 dark:text-stone-200">
          {t("email")}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="text-sm font-medium text-slate-800 dark:text-stone-200">
          {t("message")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          maxLength={5000}
          rows={7}
          className={cn(fieldClass, "min-h-[9rem] resize-y")}
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="inline-flex h-10 min-w-[7rem] items-center justify-center rounded-md bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
      >
        {sending ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
