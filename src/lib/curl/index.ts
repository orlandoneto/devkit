export type CurlMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

export type CurlHeader = { key: string; value: string };

export type CurlInput = {
  method: CurlMethod;
  url: string;
  headers: CurlHeader[];
  body: string;
  followRedirects: boolean;
  insecure: boolean;
};

export type CurlParseResult =
  | { ok: true; value: CurlInput }
  | { ok: false; error: string };

export type CurlRunResult = {
  ok: boolean;
  status: number | null;
  statusText: string;
  timeMs: number;
  sizeBytes: number;
  headers: CurlHeader[];
  body: string;
  error: string | null;
};

export const CURL_METHODS: CurlMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
];

function shellQuote(value: string) {
  if (/^[A-Za-z0-9_./:@%+=,-]+$/.test(value)) return value;
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

export function buildCurlCommand(input: CurlInput): string {
  const url = input.url.trim();
  if (!url) return "";

  const lines: string[] = [`curl --request ${input.method}`];

  if (input.followRedirects) lines.push("  --location");
  if (input.insecure) lines.push("  --insecure");

  for (const header of input.headers) {
    const key = header.key.trim();
    if (!key) continue;
    lines.push(`  --header ${shellQuote(`${key}: ${header.value}`)}`);
  }

  const body = input.body.trim();
  if (body && input.method !== "GET" && input.method !== "HEAD") {
    lines.push(`  --data-raw ${shellQuote(body)}`);
  }

  lines.push(`  --url ${shellQuote(url)}`);
  return lines.join(" \\\n");
}

/** Tokenize a curl command respecting quotes and line continuations. */
export function tokenizeCurl(command: string): string[] {
  const normalized = command
    .replace(/\\\r?\n/g, " ")
    .replace(/\r?\n/g, " ")
    .trim();

  const tokens: string[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;

  for (let i = 0; i < normalized.length; i += 1) {
    const ch = normalized[i]!;
    if (quote) {
      if (ch === quote) {
        quote = null;
      } else if (ch === "\\" && quote === '"' && i + 1 < normalized.length) {
        current += normalized[++i];
      } else {
        current += ch;
      }
      continue;
    }

    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (/\s/.test(ch)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);
  return tokens;
}

function isMethod(value: string): value is CurlMethod {
  return (CURL_METHODS as string[]).includes(value.toUpperCase());
}

export function parseCurlCommand(command: string): CurlParseResult {
  const trimmed = command.trim();
  if (!trimmed) return { ok: false, error: "EMPTY" };

  const tokens = tokenizeCurl(trimmed);
  if (tokens.length === 0) return { ok: false, error: "EMPTY" };

  let start = 0;
  if (/^curl(\.exe)?$/i.test(tokens[0] ?? "")) start = 1;

  let method: CurlMethod = "GET";
  let url = "";
  const headers: CurlHeader[] = [];
  let body = "";
  let followRedirects = false;
  let insecure = false;
  let methodFromData = false;

  for (let i = start; i < tokens.length; i += 1) {
    const token = tokens[i]!;
    const next = tokens[i + 1];

    if (token === "-X" || token === "--request") {
      if (next && isMethod(next)) {
        method = next.toUpperCase() as CurlMethod;
        i += 1;
      }
      continue;
    }
    if (token.startsWith("-X") && token.length > 2) {
      const m = token.slice(2);
      if (isMethod(m)) method = m.toUpperCase() as CurlMethod;
      continue;
    }
    if (token === "-H" || token === "--header") {
      if (!next) continue;
      const idx = next.indexOf(":");
      if (idx > 0) {
        headers.push({
          key: next.slice(0, idx).trim(),
          value: next.slice(idx + 1).trim(),
        });
      }
      i += 1;
      continue;
    }
    if (
      token === "-d" ||
      token === "--data" ||
      token === "--data-raw" ||
      token === "--data-binary" ||
      token === "--data-ascii"
    ) {
      if (!next) continue;
      body = next;
      if (!methodFromData && method === "GET") method = "POST";
      methodFromData = true;
      i += 1;
      continue;
    }
    if (token.startsWith("--data-raw=") || token.startsWith("--data=")) {
      body = token.slice(token.indexOf("=") + 1);
      if (!methodFromData && method === "GET") method = "POST";
      methodFromData = true;
      continue;
    }
    if (token === "-L" || token === "--location") {
      followRedirects = true;
      continue;
    }
    if (token === "-k" || token === "--insecure") {
      insecure = true;
      continue;
    }
    if (token === "--url" && next) {
      url = next;
      i += 1;
      continue;
    }
    if (token === "-u" || token === "--user") {
      if (!next) continue;
      headers.push({
        key: "Authorization",
        value: `Basic ${btoa(next)}`,
      });
      i += 1;
      continue;
    }
    if (token === "-A" || token === "--user-agent") {
      if (!next) continue;
      headers.push({ key: "User-Agent", value: next });
      i += 1;
      continue;
    }
    if (token.startsWith("-") || token.startsWith("--")) {
      // skip unknown flags (and their args when they look like flags)
      if (next && !next.startsWith("-") && !/^https?:\/\//i.test(next)) {
        // consume possible value for unknown option carefully — only if not URL
        const knownValueFlags = new Set([
          "-o",
          "--output",
          "-w",
          "--write-out",
          "-e",
          "--referer",
        ]);
        if (knownValueFlags.has(token)) i += 1;
      }
      continue;
    }
    if (!url && (/^https?:\/\//i.test(token) || token.includes("."))) {
      url = token;
    }
  }

  if (!url) return { ok: false, error: "NO_URL" };

  return {
    ok: true,
    value: { method, url, headers, body, followRedirects, insecure },
  };
}

export async function runCurlRequest(
  input: CurlInput,
): Promise<CurlRunResult> {
  const url = input.url.trim();
  if (!url) {
    return {
      ok: false,
      status: null,
      statusText: "",
      timeMs: 0,
      sizeBytes: 0,
      headers: [],
      body: "",
      error: "NO_URL",
    };
  }

  const headers = new Headers();
  for (const header of input.headers) {
    if (!header.key.trim()) continue;
    try {
      headers.set(header.key.trim(), header.value);
    } catch {
      // ignore invalid header names
    }
  }

  const init: RequestInit = {
    method: input.method,
    headers,
    redirect: input.followRedirects ? "follow" : "manual",
  };

  if (
    input.body.trim() &&
    input.method !== "GET" &&
    input.method !== "HEAD"
  ) {
    init.body = input.body;
  }

  const started = performance.now();
  try {
    const response = await fetch(url, init);
    const timeMs = Math.round(performance.now() - started);
    const buffer = await response.arrayBuffer();
    const sizeBytes = buffer.byteLength;
    let body = "";
    try {
      body = new TextDecoder().decode(buffer);
    } catch {
      body = `[binary ${sizeBytes} bytes]`;
    }

    // Pretty-print JSON when possible
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json") || /^\s*[{[]/.test(body)) {
      try {
        body = JSON.stringify(JSON.parse(body), null, 2);
      } catch {
        // keep raw
      }
    }

    const responseHeaders: CurlHeader[] = [];
    response.headers.forEach((value, key) => {
      responseHeaders.push({ key, value });
    });

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      timeMs,
      sizeBytes,
      headers: responseHeaders,
      body,
      error: null,
    };
  } catch (err) {
    const timeMs = Math.round(performance.now() - started);
    const message = err instanceof Error ? err.message : "REQUEST_FAILED";
    const isCors =
      message.includes("Failed to fetch") ||
      message.toLowerCase().includes("network") ||
      message.toLowerCase().includes("cors");
    return {
      ok: false,
      status: null,
      statusText: "",
      timeMs,
      sizeBytes: 0,
      headers: [],
      body: "",
      error: isCors ? "CORS" : message,
    };
  }
}

export const DEFAULT_CURL = `curl --request GET \\
  --url https://httpbin.org/get \\
  --header 'Accept: application/json'`;
