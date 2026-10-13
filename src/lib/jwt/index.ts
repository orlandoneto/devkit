import { fromBase64, toBase64 } from "@/lib/base64";

export type JwtAlgorithm = "HS256" | "none";

export type JwtDecodeResult =
  | {
      ok: true;
      header: Record<string, unknown>;
      payload: Record<string, unknown>;
      signature: string;
      headerRaw: string;
      payloadRaw: string;
      warnings: string[];
    }
  | { ok: false; error: string };

function base64UrlEncode(bytes: Uint8Array) {
  return toBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  return fromBase64(value);
}

function utf8ToBytes(value: string) {
  return new TextEncoder().encode(value);
}

function bytesToUtf8(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes);
}

function parseJsonPart(part: string): Record<string, unknown> {
  const json = bytesToUtf8(base64UrlDecode(part));
  const parsed: unknown = JSON.parse(json);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("NOT_OBJECT");
  }
  return parsed as Record<string, unknown>;
}

function collectWarnings(payload: Record<string, unknown>, now = Date.now()) {
  const warnings: string[] = [];
  const exp = payload.exp;
  const nbf = payload.nbf;
  if (typeof exp === "number") {
    if (exp * 1000 < now) warnings.push("EXPIRED");
  }
  if (typeof nbf === "number") {
    if (nbf * 1000 > now) warnings.push("NOT_BEFORE");
  }
  return warnings;
}

export function decodeJwt(token: string): JwtDecodeResult {
  const trimmed = token.trim();
  if (!trimmed) return { ok: false, error: "EMPTY" };

  const parts = trimmed.split(".");
  if (parts.length < 2 || parts.length > 3) {
    return { ok: false, error: "PARTS" };
  }

  try {
    const [headerPart, payloadPart, signature = ""] = parts;
    const header = parseJsonPart(headerPart!);
    const payload = parseJsonPart(payloadPart!);
    return {
      ok: true,
      header,
      payload,
      signature,
      headerRaw: bytesToUtf8(base64UrlDecode(headerPart!)),
      payloadRaw: bytesToUtf8(base64UrlDecode(payloadPart!)),
      warnings: collectWarnings(payload),
    };
  } catch {
    return { ok: false, error: "INVALID" };
  }
}

async function hmacSign(data: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    utf8ToBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, utf8ToBytes(data));
  return base64UrlEncode(new Uint8Array(signature));
}

async function hmacVerify(data: string, signature: string, secret: string) {
  try {
    const expected = await hmacSign(data, secret);
    return expected === signature;
  } catch {
    return false;
  }
}

export type JwtEncodeInput = {
  header: string;
  payload: string;
  secret: string;
  algorithm: JwtAlgorithm;
};

export type JwtEncodeResult =
  | { ok: true; token: string }
  | { ok: false; error: string };

export async function encodeJwt(input: JwtEncodeInput): Promise<JwtEncodeResult> {
  try {
    const headerObj = JSON.parse(input.header) as Record<string, unknown>;
    const payloadObj = JSON.parse(input.payload) as Record<string, unknown>;

    const header = {
      ...headerObj,
      alg: input.algorithm === "none" ? "none" : "HS256",
      typ: headerObj.typ ?? "JWT",
    };

    const headerPart = base64UrlEncode(utf8ToBytes(JSON.stringify(header)));
    const payloadPart = base64UrlEncode(utf8ToBytes(JSON.stringify(payloadObj)));
    const data = `${headerPart}.${payloadPart}`;

    if (input.algorithm === "none") {
      return { ok: true, token: `${data}.` };
    }

    if (!input.secret) return { ok: false, error: "SECRET" };
    const signature = await hmacSign(data, input.secret);
    return { ok: true, token: `${data}.${signature}` };
  } catch {
    return { ok: false, error: "INVALID_JSON" };
  }
}

export type JwtValidateResult =
  | {
      ok: true;
      signatureValid: boolean | null;
      warnings: string[];
      header: Record<string, unknown>;
      payload: Record<string, unknown>;
    }
  | { ok: false; error: string };

export async function validateJwt(
  token: string,
  secret = "",
): Promise<JwtValidateResult> {
  const decoded = decodeJwt(token);
  if (!decoded.ok) return decoded;

  const parts = token.trim().split(".");
  const alg = String(decoded.header.alg ?? "");
  let signatureValid: boolean | null = null;

  if (alg === "none" || !decoded.signature) {
    signatureValid = alg === "none" ? true : false;
  } else if (alg === "HS256") {
    if (!secret) {
      signatureValid = null;
    } else {
      const data = `${parts[0]}.${parts[1]}`;
      signatureValid = await hmacVerify(data, decoded.signature, secret);
    }
  } else {
    signatureValid = null;
  }

  return {
    ok: true,
    signatureValid,
    warnings: decoded.warnings,
    header: decoded.header,
    payload: decoded.payload,
  };
}

export function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}
