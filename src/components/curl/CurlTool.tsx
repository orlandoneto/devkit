"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Eraser, Play, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form";
import { ToolShell } from "@/components/tools/ToolShell";
import {
  buildCurlCommand,
  CURL_METHODS,
  DEFAULT_CURL,
  parseCurlCommand,
  runCurlRequest,
  type CurlHeader,
  type CurlMethod,
  type CurlRunResult,
} from "@/lib/curl";
import { copyToClipboard } from "@/lib/utils";

type PanelTab = "builder" | "raw";
type ResponseTab = "body" | "headers";

export function CurlTool() {
  const t = useTranslations("Curl");
  const [panel, setPanel] = useState<PanelTab>("raw");
  const [responseTab, setResponseTab] = useState<ResponseTab>("body");

  const [raw, setRaw] = useState(DEFAULT_CURL);
  const [method, setMethod] = useState<CurlMethod>("GET");
  const [url, setUrl] = useState("https://httpbin.org/get");
  const [headers, setHeaders] = useState<CurlHeader[]>([
    { key: "Accept", value: "application/json" },
  ]);
  const [body, setBody] = useState("");
  const [followRedirects, setFollowRedirects] = useState(true);
  const [insecure, setInsecure] = useState(false);

  const [busy, setBusy] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<CurlRunResult | null>(null);

  const commandFromBuilder = useMemo(
    () =>
      buildCurlCommand({
        method,
        url,
        headers,
        body,
        followRedirects,
        insecure,
      }),
    [method, url, headers, body, followRedirects, insecure],
  );

  function applyParsedFromRaw() {
    const parsed = parseCurlCommand(raw);
    if (!parsed.ok) {
      setParseError(
        parsed.error === "EMPTY"
          ? t("errorEmpty")
          : parsed.error === "NO_URL"
            ? t("errorUrl")
            : t("errorParse"),
      );
      return false;
    }
    setParseError(null);
    setMethod(parsed.value.method);
    setUrl(parsed.value.url);
    setHeaders(
      parsed.value.headers.length > 0
        ? parsed.value.headers
        : [{ key: "", value: "" }],
    );
    setBody(parsed.value.body);
    setFollowRedirects(parsed.value.followRedirects);
    setInsecure(parsed.value.insecure);
    return true;
  }

  function switchPanel(next: PanelTab) {
    if (next === "builder") {
      applyParsedFromRaw();
    } else if (commandFromBuilder) {
      setRaw(commandFromBuilder);
    }
    setPanel(next);
  }

  async function run() {
    const source =
      panel === "raw"
        ? parseCurlCommand(raw)
        : {
            ok: true as const,
            value: {
              method,
              url,
              headers,
              body,
              followRedirects,
              insecure,
            },
          };

    if (!source.ok) {
      setParseError(
        source.error === "EMPTY"
          ? t("errorEmpty")
          : source.error === "NO_URL"
            ? t("errorUrl")
            : t("errorParse"),
      );
      return;
    }

    setParseError(null);
    setBusy(true);
    setResult(null);
    try {
      if (panel === "raw") {
        setMethod(source.value.method);
        setUrl(source.value.url);
        setHeaders(source.value.headers);
        setBody(source.value.body);
        setFollowRedirects(source.value.followRedirects);
        setInsecure(source.value.insecure);
        setRaw(buildCurlCommand(source.value));
      } else {
        setRaw(buildCurlCommand(source.value));
      }
      const response = await runCurlRequest(source.value);
      setResult(response);
      setResponseTab("body");
      if (response.error === "CORS") toast.message(t("corsHint"));
      else if (response.error) toast.error(t("errorRequest"));
      else toast.success(t("ran"));
    } finally {
      setBusy(false);
    }
  }

  function clearAll() {
    setRaw(DEFAULT_CURL);
    setMethod("GET");
    setUrl("https://httpbin.org/get");
    setHeaders([{ key: "Accept", value: "application/json" }]);
    setBody("");
    setFollowRedirects(true);
    setInsecure(false);
    setResult(null);
    setParseError(null);
  }

  async function copyRaw() {
    await copyToClipboard(raw);
    toast.success(t("copied"));
  }

  return (
    <ToolShell title={t("title")} description={t("description")} notice={t("notice")}>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" disabled={busy} onClick={() => void run()}>
          <Play className="h-3.5 w-3.5" />
          {busy ? t("running") : t("run")}
        </Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={clearAll}>
          <Eraser className="h-3.5 w-3.5" />
          {t("clear")}
        </Button>
        <Button size="sm" variant="outline" onClick={() => void copyRaw()}>
          <Copy className="h-3.5 w-3.5" />
          {t("copy")}
        </Button>
        <div className="ml-auto flex gap-1 rounded-lg border border-stone-200 p-0.5 dark:border-stone-700">
          <button
            type="button"
            onClick={() => switchPanel("raw")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              panel === "raw"
                ? "bg-slate-900 text-white dark:bg-amber-600 dark:text-slate-950"
                : "text-slate-600 hover:bg-stone-50 dark:text-slate-300"
            }`}
          >
            {t("tabRaw")}
          </button>
          <button
            type="button"
            onClick={() => switchPanel("builder")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              panel === "builder"
                ? "bg-slate-900 text-white dark:bg-amber-600 dark:text-slate-950"
                : "text-slate-600 hover:bg-stone-50 dark:text-slate-300"
            }`}
          >
            {t("tabBuilder")}
          </button>
        </div>
      </div>

      {panel === "raw" ? (
        <div className="mt-3">
          <Label htmlFor="curl-raw" className="sr-only">
            {t("command")}
          </Label>
          <textarea
            id="curl-raw"
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value);
              setParseError(null);
            }}
            spellCheck={false}
            rows={10}
            className="w-full resize-y rounded-xl border border-stone-700 bg-slate-950 px-3 py-3 font-mono text-sm leading-relaxed text-emerald-300 outline-none focus:border-amber-500"
            placeholder={DEFAULT_CURL}
          />
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="grid gap-2 sm:grid-cols-[110px_minmax(0,1fr)]">
            <Select
              value={method}
              onChange={(e) => setMethod(e.target.value as CurlMethod)}
              aria-label={t("method")}
            >
              {CURL_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
            <Input
              className="font-mono text-sm"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
              aria-label={t("url")}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t("headers")}</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setHeaders((prev) => [...prev, { key: "", value: "" }])
                }
              >
                <Plus className="h-3.5 w-3.5" />
                {t("addHeader")}
              </Button>
            </div>
            {headers.map((header, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  className="font-mono text-sm"
                  placeholder={t("headerKey")}
                  value={header.key}
                  onChange={(e) =>
                    setHeaders((prev) =>
                      prev.map((h, i) =>
                        i === index ? { ...h, key: e.target.value } : h,
                      ),
                    )
                  }
                />
                <Input
                  className="font-mono text-sm"
                  placeholder={t("headerValue")}
                  value={header.value}
                  onChange={(e) =>
                    setHeaders((prev) =>
                      prev.map((h, i) =>
                        i === index ? { ...h, value: e.target.value } : h,
                      ),
                    )
                  }
                />
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={t("removeHeader")}
                  onClick={() =>
                    setHeaders((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {method !== "GET" && method !== "HEAD" && (
            <div className="space-y-1">
              <Label htmlFor="curl-body">{t("body")}</Label>
              <textarea
                id="curl-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                spellCheck={false}
                className="w-full resize-y rounded-lg border border-stone-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-blue-500 dark:border-stone-700 dark:bg-slate-950"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={followRedirects}
                onChange={(e) => setFollowRedirects(e.target.checked)}
                className="h-4 w-4 accent-slate-900"
              />
              {t("followRedirects")}
            </label>
            <label className="inline-flex items-center gap-2 opacity-60">
              <input
                type="checkbox"
                checked={insecure}
                onChange={(e) => setInsecure(e.target.checked)}
                className="h-4 w-4 accent-slate-900"
              />
              {t("insecure")}
            </label>
          </div>
          <p className="text-[11px] text-slate-500">{t("insecureHint")}</p>
        </div>
      )}

      {parseError && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {parseError}
        </p>
      )}

      {result && (
        <section className="mt-4 overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800">
          <div className="flex flex-wrap items-center gap-3 border-b border-stone-200 bg-stone-50 px-3 py-2 text-xs dark:border-stone-800 dark:bg-stone-900/50">
            <span
              className={`rounded-md px-2 py-0.5 font-semibold ${
                result.error
                  ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                  : result.status && result.status < 400
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
              }`}
            >
              {result.error
                ? result.error === "CORS"
                  ? t("statusCors")
                  : t("statusError")
                : `${result.status} ${result.statusText}`}
            </span>
            <span className="text-slate-600 dark:text-slate-300">
              {t("timeMs", { ms: result.timeMs })}
            </span>
            <span className="text-slate-600 dark:text-slate-300">
              {t("sizeBytes", { size: result.sizeBytes })}
            </span>
            <div className="ml-auto flex gap-1">
              <button
                type="button"
                onClick={() => setResponseTab("body")}
                className={`rounded px-2 py-1 font-medium ${
                  responseTab === "body"
                    ? "bg-white shadow-sm dark:bg-slate-950"
                    : "text-slate-500"
                }`}
              >
                {t("responseBody")}
              </button>
              <button
                type="button"
                onClick={() => setResponseTab("headers")}
                className={`rounded px-2 py-1 font-medium ${
                  responseTab === "headers"
                    ? "bg-white shadow-sm dark:bg-slate-950"
                    : "text-slate-500"
                }`}
              >
                {t("responseHeaders")}
              </button>
            </div>
          </div>

          {result.error === "CORS" && (
            <p className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100">
              {t("corsDetail")}
            </p>
          )}

          {responseTab === "body" ? (
            <pre className="max-h-80 overflow-auto bg-slate-950 p-3 font-mono text-xs leading-relaxed text-stone-100">
              {result.error && result.error !== "CORS"
                ? result.error
                : result.body || t("emptyBody")}
            </pre>
          ) : (
            <div className="max-h-80 overflow-auto bg-white p-3 dark:bg-slate-950">
              {result.headers.length === 0 ? (
                <p className="text-xs text-slate-500">{t("emptyHeaders")}</p>
              ) : (
                <dl className="space-y-1.5 font-mono text-xs">
                  {result.headers.map((h) => (
                    <div key={`${h.key}-${h.value}`} className="grid gap-0.5 sm:grid-cols-[160px_minmax(0,1fr)]">
                      <dt className="font-semibold text-slate-600 dark:text-slate-400">
                        {h.key}
                      </dt>
                      <dd className="break-all text-slate-800 dark:text-slate-200">
                        {h.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}
        </section>
      )}
    </ToolShell>
  );
}
