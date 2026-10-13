import { z } from "zod";
import { PUBLIC_CONTACT_EMAIL } from "@/lib/site";
import { sendSmtpMail, smtpConfig } from "@/lib/smtp";

export const CONTACT_TO_EMAIL =
  process.env.CONTACT_TO_EMAIL?.trim() || PUBLIC_CONTACT_EMAIL;

const CONTACT_FROM_EMAIL =
  process.env.CONTACT_FROM_EMAIL?.trim() || "devKit <no-reply@example.com>";

/** Web3Forms — chave pública do painel (pode ir no client; aqui fica no server). */
const WEB3FORMS_ACCESS_KEY =
  process.env.WEB3FORMS_ACCESS_KEY?.trim() || "";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const contactBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z
    .string()
    .trim()
    .min(3)
    .max(254)
    .refine((value) => EMAIL_RE.test(value), "invalid_email"),
  message: z.string().trim().min(1).max(5000),
  website: z.string().max(200).optional().default(""),
  locale: z.enum(["pt", "en", "es"]).optional().default("pt"),
});

export type ContactBody = z.infer<typeof contactBodySchema>;

export function isContactConfigured() {
  return Boolean(
    WEB3FORMS_ACCESS_KEY ||
      smtpConfig() ||
      process.env.RESEND_API_KEY?.trim(),
  );
}

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

export function allowContactRequest(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

const MAIL_COPY = {
  pt: { subject: "Contato devKit", name: "Nome", email: "E-mail" },
  en: { subject: "devKit contact", name: "Name", email: "Email" },
  es: { subject: "Contacto devKit", name: "Nombre", email: "Correo" },
} as const;

export async function sendContactMessage(input: {
  name: string;
  email: string;
  message: string;
  locale?: "pt" | "en" | "es";
}) {
  const copy = MAIL_COPY[input.locale ?? "pt"];
  const subject = `${copy.subject} — ${input.name}`;
  const text = [
    `${copy.name}: ${input.name}`,
    `${copy.email}: ${input.email}`,
    "",
    input.message,
  ].join("\n");

  if (WEB3FORMS_ACCESS_KEY) {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        name: input.name,
        email: input.email,
        message: input.message,
        subject,
        from_name: "devKit",
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`web3forms_${res.status}:${detail.slice(0, 300)}`);
    }
    const payload = (await res.json()) as { success?: boolean };
    if (!payload.success) {
      throw new Error("web3forms_rejected");
    }
    return;
  }

  const smtp = smtpConfig();
  if (smtp) {
    await sendSmtpMail({
      fromName: "devKit",
      fromEmail: smtp.user,
      to: CONTACT_TO_EMAIL,
      replyTo: input.email,
      subject,
      text,
    });
    return;
  }

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: [CONTACT_TO_EMAIL],
        reply_to: input.email,
        subject,
        text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`resend_${res.status}:${detail.slice(0, 300)}`);
    }
    return;
  }

  throw new Error("not_configured");
}
