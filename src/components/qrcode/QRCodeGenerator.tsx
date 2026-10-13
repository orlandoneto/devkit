"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { useTranslations } from "next-intl";
import { Copy, Download, ImageDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form";
import { ToolShell } from "@/components/tools/ToolShell";
import { InfoTip } from "@/components/ui/tooltip";
import {
  buildQRPayload,
  QR_CONTENT_TYPES,
  QR_ERROR_LEVELS,
  sanitizeQRFilename,
  type QRContentType,
  type QRErrorCorrection,
} from "@/lib/qrcode";
import { copyToClipboard, downloadBlob } from "@/lib/utils";

const fieldClassName =
  "h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950";

const TYPE_LABEL_KEYS = {
  text: "typeText",
  url: "typeUrl",
  wifi: "typeWifi",
  email: "typeEmail",
  phone: "typePhone",
  whatsapp: "typeWhatsapp",
} as const;

const TYPE_DESC_KEYS = {
  text: "typeTextDesc",
  url: "typeUrlDesc",
  wifi: "typeWifiDesc",
  email: "typeEmailDesc",
  phone: "typePhoneDesc",
  whatsapp: "typeWhatsappDesc",
} as const;

const ERROR_LABEL_KEYS = {
  L: "errorL",
  M: "errorM",
  Q: "errorQ",
  H: "errorH",
} as const;

export function QRCodeGenerator() {
  const t = useTranslations("QrCode");
  const [type, setType] = useState<QRContentType>("text");
  const [text, setText] = useState(() => t("sampleText"));
  const [url, setUrl] = useState("https://example.com");
  const [ssid, setSsid] = useState(() => t("sampleSsid"));
  const [wifiPassword, setWifiPassword] = useState(() => t("sampleWifiPassword"));
  const [wifiEncryption, setWifiEncryption] = useState<
    "WPA" | "WEP" | "nopass"
  >("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);
  const [email, setEmail] = useState("contato@example.com");
  const [emailSubject, setEmailSubject] = useState(() => t("sampleEmailSubject"));
  const [emailBody, setEmailBody] = useState("");
  const [phone, setPhone] = useState("+55 11 99999-9999");
  const [whatsappNumber, setWhatsappNumber] = useState("5511999999999");
  const [whatsappMessage, setWhatsappMessage] = useState(() => t("sampleWhatsapp"));

  const [size, setSize] = useState(240);
  const [margin, setMargin] = useState(2);
  const [errorCorrection, setErrorCorrection] =
    useState<QRErrorCorrection>("M");
  const [darkColor, setDarkColor] = useState("#0f172a");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [pngUrl, setPngUrl] = useState("");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(
    () =>
      buildQRPayload({
        type,
        text,
        url,
        ssid,
        wifiPassword,
        wifiEncryption,
        wifiHidden,
        email,
        emailSubject,
        emailBody,
        phone,
        whatsappNumber,
        whatsappMessage,
      }),
    [
      type,
      text,
      url,
      ssid,
      wifiPassword,
      wifiEncryption,
      wifiHidden,
      email,
      emailSubject,
      emailBody,
      phone,
      whatsappNumber,
      whatsappMessage,
    ],
  );

  useEffect(() => {
    let active = true;
    const frame = requestAnimationFrame(() => {
      if (!payload.trim()) {
        setError(t("errorEmpty"));
        setPngUrl("");
        setSvg("");
        return;
      }

      const options = {
        width: size,
        margin,
        errorCorrectionLevel: errorCorrection,
        color: {
          dark: `${darkColor}ff`,
          light: `${lightColor}ff`,
        },
      } as const;

      Promise.all([
        QRCode.toDataURL(payload, options),
        QRCode.toString(payload, { ...options, type: "svg" }),
      ])
        .then(([nextPng, nextSvg]) => {
          if (!active) return;
          setPngUrl(nextPng);
          setSvg(nextSvg);
          setError(null);
        })
        .catch(() => {
          if (!active) return;
          setError(t("errorTooLarge"));
          setPngUrl("");
          setSvg("");
        });
    });

    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [payload, size, margin, errorCorrection, darkColor, lightColor, t]);

  function downloadPng() {
    if (!pngUrl) return;
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `${sanitizeQRFilename(type)}.png`;
    link.click();
    toast.success(t("pngDownloaded"));
  }

  function downloadSvg() {
    if (!svg) return;
    downloadBlob(
      `${sanitizeQRFilename(type)}.svg`,
      svg,
      "image/svg+xml;charset=utf-8",
    );
    toast.success(t("svgDownloaded"));
  }

  async function copyPayload() {
    await copyToClipboard(payload);
    toast.success(t("contentCopied"));
  }

  const typeLabel = t(TYPE_LABEL_KEYS[type]);
  const typeDesc = t(TYPE_DESC_KEYS[type]);

  return (
    <ToolShell
      title={t("title")}
      description={t("description")}
      notice={t("notice")}
    >
      <div className="mt-2.5 grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)]">
        <div className="space-y-1">
          <Label htmlFor="qr-type" className="inline-flex items-center gap-1">
            {t("type")}
            <InfoTip text={typeDesc} />
          </Label>
          <Select
            id="qr-type"
            value={type}
            onChange={(event) =>
              setType(event.target.value as QRContentType)
            }
          >
            {QR_CONTENT_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {t(TYPE_LABEL_KEYS[item.value])}
              </option>
            ))}
          </Select>
        </div>

        <div className="min-w-0">{renderContentFields()}</div>
      </div>

      <details className="mt-2.5 rounded-lg border border-stone-200 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-900/40">
        <summary className="cursor-pointer px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("customize")}
        </summary>
        <div className="grid gap-2 border-t border-stone-200 p-2.5 sm:grid-cols-2 lg:grid-cols-4 dark:border-stone-800">
          <div className="space-y-1">
            <Label htmlFor="qr-size">{t("size")}</Label>
            <Select
              id="qr-size"
              value={String(size)}
              onChange={(event) => setSize(Number(event.target.value))}
            >
              {[160, 200, 240, 320, 480, 640].map((value) => (
                <option key={value} value={value}>
                  {value} px
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="qr-margin">{t("margin")}</Label>
            <Select
              id="qr-margin"
              value={String(margin)}
              onChange={(event) => setMargin(Number(event.target.value))}
            >
              {[0, 1, 2, 3, 4, 6, 8].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="qr-error"
              className="inline-flex items-center gap-1"
            >
              {t("correction")}
              <InfoTip text={t("correctionTip")} />
            </Label>
            <Select
              id="qr-error"
              value={errorCorrection}
              onChange={(event) =>
                setErrorCorrection(event.target.value as QRErrorCorrection)
              }
            >
              {QR_ERROR_LEVELS.map((item) => (
                <option key={item.value} value={item.value}>
                  {t(ERROR_LABEL_KEYS[item.value])}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <ColorField
              id="qr-dark"
              label={t("foreground")}
              value={darkColor}
              onChange={setDarkColor}
            />
            <ColorField
              id="qr-light"
              label={t("background")}
              value={lightColor}
              onChange={setLightColor}
            />
          </div>
        </div>
      </details>

      <div className="mt-2.5 grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px] sm:items-center">
        <div className="flex min-h-[150px] items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50 p-2 dark:border-stone-700 dark:bg-stone-900/40">
          {error ? (
            <p className="max-w-sm text-center text-sm text-rose-600 dark:text-rose-400">
              {error}
            </p>
          ) : pngUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pngUrl}
              alt={t("alt", { type: typeLabel })}
              className="h-auto max-h-[150px] max-w-full rounded bg-white"
            />
          ) : (
            <p className="text-sm text-slate-500">{t("generating")}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 sm:w-[120px] sm:flex-col">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!pngUrl}
            onClick={downloadPng}
            className="sm:w-full"
          >
            <ImageDown className="h-3.5 w-3.5" />
            {t("png")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!svg}
            onClick={downloadSvg}
            className="sm:w-full"
          >
            <Download className="h-3.5 w-3.5" />
            {t("svg")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={!payload}
            onClick={copyPayload}
            className="sm:w-full"
          >
            <Copy className="h-3.5 w-3.5" />
            {t("content")}
          </Button>
        </div>
      </div>
    </ToolShell>
  );

  function renderContentFields() {
    switch (type) {
      case "text":
        return (
          <Field label={t("fieldText")} htmlFor="qr-text">
            <textarea
              id="qr-text"
              rows={3}
              value={text}
              onChange={(event) => setText(event.target.value)}
              className={`${fieldClassName} h-20 resize-y`}
              placeholder={t("textPlaceholder")}
            />
          </Field>
        );

      case "wifi":
        return (
          <div className="grid grid-cols-2 gap-2">
            <Field label={t("fieldSsid")} htmlFor="qr-ssid">
              <Input
                id="qr-ssid"
                value={ssid}
                onChange={(event) => setSsid(event.target.value)}
                placeholder="SSID"
              />
            </Field>
            <Field label={t("fieldSecurity")} htmlFor="qr-wifi-security">
              <Select
                id="qr-wifi-security"
                value={wifiEncryption}
                onChange={(event) =>
                  setWifiEncryption(
                    event.target.value as "WPA" | "WEP" | "nopass",
                  )
                }
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">{t("securityNopass")}</option>
              </Select>
            </Field>
            <Field label={t("fieldPassword")} htmlFor="qr-wifi-password">
              <Input
                id="qr-wifi-password"
                value={wifiPassword}
                onChange={(event) => setWifiPassword(event.target.value)}
                disabled={wifiEncryption === "nopass"}
                placeholder={t("passwordPlaceholder")}
              />
            </Field>
            <label className="flex min-h-10 cursor-pointer items-end gap-2 pb-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={wifiHidden}
                onChange={(event) => setWifiHidden(event.target.checked)}
                className="h-4 w-4 rounded accent-slate-900"
              />
              {t("hiddenNetwork")}
            </label>
          </div>
        );

      case "email":
        return (
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label={t("fieldEmail")} htmlFor="qr-email">
              <Input
                id="qr-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="contato@example.com"
              />
            </Field>
            <Field label={t("fieldSubject")} htmlFor="qr-email-subject">
              <Input
                id="qr-email-subject"
                value={emailSubject}
                onChange={(event) => setEmailSubject(event.target.value)}
                placeholder={t("subjectPlaceholder")}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label={t("fieldMessage")} htmlFor="qr-email-body">
                <Input
                  id="qr-email-body"
                  value={emailBody}
                  onChange={(event) => setEmailBody(event.target.value)}
                  placeholder={t("messageOptional")}
                />
              </Field>
            </div>
          </div>
        );

      case "phone":
        return (
          <Field label={t("fieldPhone")} htmlFor="qr-phone">
            <Input
              id="qr-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+55 11 99999-9999"
            />
          </Field>
        );

      case "whatsapp":
        return (
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label={t("fieldWhatsappNumber")} htmlFor="qr-whatsapp-number">
              <Input
                id="qr-whatsapp-number"
                type="tel"
                value={whatsappNumber}
                onChange={(event) => setWhatsappNumber(event.target.value)}
                placeholder="5511999999999"
              />
            </Field>
            <Field label={t("fieldMessage")} htmlFor="qr-whatsapp-message">
              <Input
                id="qr-whatsapp-message"
                value={whatsappMessage}
                onChange={(event) => setWhatsappMessage(event.target.value)}
                placeholder={t("messageOptional")}
              />
            </Field>
          </div>
        );

      case "url":
      default:
        return (
          <Field label={t("fieldUrl")} htmlFor="qr-url">
            <Input
              id="qr-url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com"
            />
          </Field>
        );
    }
  }
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full cursor-pointer rounded-lg border border-stone-200 bg-white p-1 dark:border-stone-700 dark:bg-slate-950"
      />
    </div>
  );
}
