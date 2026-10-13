"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, ShieldCheck, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form";
import { ToolShell } from "@/components/tools/ToolShell";
import {
  decodeJwt,
  encodeJwt,
  prettyJson,
  validateJwt,
  type JwtAlgorithm,
} from "@/lib/jwt";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImRldktpdCIsImlhdCI6MTUxNjIzOTAyMn0.placeholder";

const DEFAULT_HEADER = `{
  "alg": "HS256",
  "typ": "JWT"
}`;

const DEFAULT_PAYLOAD = `{
  "sub": "1234567890",
  "name": "devKit",
  "iat": 1516239022
}`;

type Tab = "decode" | "encode";

export function JwtTool() {
  const t = useTranslations("Jwt");
  const [tab, setTab] = useState<Tab>("decode");

  const [token, setToken] = useState(
    "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImRldktpdCIsImlhdCI6MTUxNjIzOTAyMn0.",
  );
  const [secret, setSecret] = useState("devkit-secret");
  const [headerText, setHeaderText] = useState("");
  const [payloadText, setPayloadText] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [signatureValid, setSignatureValid] = useState<boolean | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);

  const [encHeader, setEncHeader] = useState(DEFAULT_HEADER);
  const [encPayload, setEncPayload] = useState(DEFAULT_PAYLOAD);
  const [encSecret, setEncSecret] = useState("devkit-secret");
  const [algorithm, setAlgorithm] = useState<JwtAlgorithm>("HS256");
  const [encToken, setEncToken] = useState("");
  const [encError, setEncError] = useState<string | null>(null);

  const warningLabels = useMemo(
    () => ({
      EXPIRED: t("warnExpired"),
      NOT_BEFORE: t("warnNotBefore"),
    }),
    [t],
  );

  async function runDecode() {
    const decoded = decodeJwt(token);
    if (!decoded.ok) {
      setDecodeError(
        decoded.error === "EMPTY"
          ? t("errorEmpty")
          : decoded.error === "PARTS"
            ? t("errorParts")
            : t("errorInvalid"),
      );
      setHeaderText("");
      setPayloadText("");
      setWarnings([]);
      setSignatureValid(null);
      return;
    }

    setDecodeError(null);
    setHeaderText(prettyJson(decoded.header));
    setPayloadText(prettyJson(decoded.payload));
    setWarnings(decoded.warnings);

    const validated = await validateJwt(token, secret);
    if (validated.ok) {
      setSignatureValid(validated.signatureValid);
      setWarnings(validated.warnings);
    }
    toast.success(t("decoded"));
  }

  async function runEncode() {
    const result = await encodeJwt({
      header: encHeader,
      payload: encPayload,
      secret: encSecret,
      algorithm,
    });
    if (!result.ok) {
      setEncError(
        result.error === "SECRET" ? t("errorSecret") : t("errorJson"),
      );
      setEncToken("");
      return;
    }
    setEncError(null);
    setEncToken(result.token);
    toast.success(t("encoded"));
  }

  async function copyValue(value: string) {
    if (!value) return;
    await copyToClipboard(value);
    toast.success(t("copied"));
  }

  return (
    <ToolShell title={t("title")} description={t("description")} notice={t("notice")}>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          variant={tab === "decode" ? "default" : "outline"}
          onClick={() => setTab("decode")}
        >
          {t("tabDecode")}
        </Button>
        <Button
          size="sm"
          variant={tab === "encode" ? "default" : "outline"}
          onClick={() => setTab("encode")}
        >
          {t("tabEncode")}
        </Button>
      </div>

      {tab === "decode" ? (
        <div className="mt-3 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="jwt-token">{t("token")}</Label>
            <textarea
              id="jwt-token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              rows={4}
              spellCheck={false}
              className="w-full resize-y rounded-lg border border-stone-200 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-blue-500 dark:border-stone-700 dark:bg-slate-950"
              placeholder={SAMPLE_TOKEN}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="jwt-secret">{t("secret")}</Label>
            <Input
              id="jwt-secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder={t("secretOptional")}
            />
            <p className="text-[11px] text-slate-500">{t("secretHint")}</p>
          </div>
          <Button size="sm" onClick={() => void runDecode()}>
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("decodeValidate")}
          </Button>

          {decodeError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              {decodeError}
            </p>
          )}

          {signatureValid !== null && (
            <p
              className={`rounded-lg border px-3 py-2 text-sm ${
                signatureValid
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
              }`}
            >
              {signatureValid ? t("sigValid") : t("sigInvalid")}
            </p>
          )}
          {signatureValid === null && headerText && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
              {t("sigSkipped")}
            </p>
          )}

          {warnings.length > 0 && (
            <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
              {warnings.map((w) => (
                <li key={w}>
                  {warningLabels[w as keyof typeof warningLabels] ?? w}
                </li>
              ))}
            </ul>
          )}

          <JsonBlock
            id="jwt-header"
            label={t("header")}
            value={headerText}
            onCopy={() => void copyValue(headerText)}
            copyLabel={t("copy")}
          />
          <JsonBlock
            id="jwt-payload"
            label={t("payload")}
            value={payloadText}
            onCopy={() => void copyValue(payloadText)}
            copyLabel={t("copy")}
          />
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="jwt-alg">{t("algorithm")}</Label>
              <Select
                id="jwt-alg"
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as JwtAlgorithm)}
              >
                <option value="HS256">HS256</option>
                <option value="none">none</option>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="jwt-enc-secret">{t("secret")}</Label>
              <Input
                id="jwt-enc-secret"
                type="password"
                value={encSecret}
                onChange={(e) => setEncSecret(e.target.value)}
                disabled={algorithm === "none"}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="jwt-enc-header">{t("header")}</Label>
            <textarea
              id="jwt-enc-header"
              value={encHeader}
              onChange={(e) => setEncHeader(e.target.value)}
              rows={4}
              spellCheck={false}
              className="w-full resize-y rounded-lg border border-stone-200 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-blue-500 dark:border-stone-700 dark:bg-slate-950"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="jwt-enc-payload">{t("payload")}</Label>
            <textarea
              id="jwt-enc-payload"
              value={encPayload}
              onChange={(e) => setEncPayload(e.target.value)}
              rows={6}
              spellCheck={false}
              className="w-full resize-y rounded-lg border border-stone-200 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-blue-500 dark:border-stone-700 dark:bg-slate-950"
            />
          </div>
          <Button size="sm" onClick={() => void runEncode()}>
            <Wand2 className="h-3.5 w-3.5" />
            {t("encode")}
          </Button>
          {encError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              {encError}
            </p>
          )}
          <JsonBlock
            id="jwt-enc-out"
            label={t("token")}
            value={encToken}
            onCopy={() => void copyValue(encToken)}
            copyLabel={t("copy")}
          />
        </div>
      )}
    </ToolShell>
  );
}

function JsonBlock({
  id,
  label,
  value,
  onCopy,
  copyLabel,
}: {
  id: string;
  label: string;
  value: string;
  onCopy: () => void;
  copyLabel: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <Button size="sm" variant="ghost" disabled={!value} onClick={onCopy}>
          <Copy className="h-3.5 w-3.5" />
          {copyLabel}
        </Button>
      </div>
      <textarea
        id={id}
        readOnly
        value={value}
        rows={6}
        className="w-full resize-y rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 font-mono text-xs outline-none dark:border-stone-700 dark:bg-stone-900"
      />
    </div>
  );
}
