export type Base64Result =
  | { ok: true; output: string }
  | { ok: false; error: "EMPTY" | "INVALID" };

export type Base64DecodeKind =
  | {
      ok: true;
      kind: "text";
      output: string;
    }
  | {
      ok: true;
      kind: "binary";
      bytes: Uint8Array;
      mime: string;
      extension: string;
      label: string;
      size: number;
    }
  | { ok: false; error: "EMPTY" | "INVALID" };

type MimeHint = { mime: string; extension: string; label: string };

const CHUNK = 0x8000;

function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const slice = bytes.subarray(i, i + CHUNK);
    for (let j = 0; j < slice.length; j += 1) {
      binary += String.fromCharCode(slice[j]!);
    }
  }
  return btoa(binary);
}

function fromBase64(value: string) {
  const normalized = value
    .replace(/\s+/g, "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function matchesMagic(bytes: Uint8Array, signature: number[], offset = 0) {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((b, i) => bytes[offset + i] === b);
}

/** Scan ZIP local headers for known Office / OpenDocument paths. */
function detectZipContainer(bytes: Uint8Array): MimeHint | null {
  const limit = Math.min(bytes.length, 256 * 1024);
  const ascii = new TextDecoder("latin1").decode(bytes.subarray(0, limit));

  if (ascii.includes("word/") || ascii.includes("word\\")) {
    return {
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      extension: "docx",
      label: "DOCX",
    };
  }
  if (ascii.includes("xl/") || ascii.includes("xl\\")) {
    return {
      mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      extension: "xlsx",
      label: "XLSX",
    };
  }
  if (ascii.includes("ppt/") || ascii.includes("ppt\\")) {
    return {
      mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      extension: "pptx",
      label: "PPTX",
    };
  }
  if (ascii.includes("mimetypeapplication/vnd.oasis.opendocument.text")) {
    return {
      mime: "application/vnd.oasis.opendocument.text",
      extension: "odt",
      label: "ODT",
    };
  }
  if (ascii.includes("mimetypeapplication/vnd.oasis.opendocument.spreadsheet")) {
    return {
      mime: "application/vnd.oasis.opendocument.spreadsheet",
      extension: "ods",
      label: "ODS",
    };
  }
  if (
    ascii.includes("mimetypeapplication/vnd.oasis.opendocument.presentation")
  ) {
    return {
      mime: "application/vnd.oasis.opendocument.presentation",
      extension: "odp",
      label: "ODP",
    };
  }

  if (ascii.includes("AndroidManifest.xml")) {
    return {
      mime: "application/vnd.android.package-archive",
      extension: "apk",
      label: "APK",
    };
  }
  if (ascii.includes("META-INF/MANIFEST.MF")) {
    return { mime: "application/java-archive", extension: "jar", label: "JAR" };
  }
  if (ascii.includes("mimetypeapplication/epub+zip")) {
    return { mime: "application/epub+zip", extension: "epub", label: "EPUB" };
  }

  return {
    mime: "application/zip",
    extension: "zip",
    label: "ZIP",
  };
}

export function detectMimeFromBytes(bytes: Uint8Array): MimeHint | null {
  if (matchesMagic(bytes, [0x25, 0x50, 0x44, 0x46])) {
    return { mime: "application/pdf", extension: "pdf", label: "PDF" };
  }
  if (matchesMagic(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mime: "image/png", extension: "png", label: "PNG" };
  }
  if (matchesMagic(bytes, [0xff, 0xd8, 0xff])) {
    return { mime: "image/jpeg", extension: "jpg", label: "JPEG" };
  }
  if (
    matchesMagic(bytes, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
    matchesMagic(bytes, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  ) {
    return { mime: "image/gif", extension: "gif", label: "GIF" };
  }
  if (
    matchesMagic(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    matchesMagic(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return { mime: "image/webp", extension: "webp", label: "WebP" };
  }
  if (matchesMagic(bytes, [0x42, 0x4d])) {
    return { mime: "image/bmp", extension: "bmp", label: "BMP" };
  }
  if (
    matchesMagic(bytes, [0x49, 0x49, 0x2a, 0x00]) ||
    matchesMagic(bytes, [0x4d, 0x4d, 0x00, 0x2a])
  ) {
    return { mime: "image/tiff", extension: "tiff", label: "TIFF" };
  }
  if (
    matchesMagic(bytes, [0x00, 0x00, 0x01, 0x00]) ||
    matchesMagic(bytes, [0x00, 0x00, 0x02, 0x00])
  ) {
    return { mime: "image/x-icon", extension: "ico", label: "ICO" };
  }
  // ISO BMFF: ftyp…. — AVIF / HEIC / MP4
  if (matchesMagic(bytes, [0x66, 0x74, 0x79, 0x70], 4)) {
    const brand = new TextDecoder("latin1").decode(bytes.subarray(8, 12));
    if (brand.startsWith("avif") || brand.startsWith("avis")) {
      return { mime: "image/avif", extension: "avif", label: "AVIF" };
    }
    if (
      brand.startsWith("heic") ||
      brand.startsWith("heix") ||
      brand.startsWith("mif1") ||
      brand.startsWith("msf1")
    ) {
      return { mime: "image/heic", extension: "heic", label: "HEIC" };
    }
    return { mime: "video/mp4", extension: "mp4", label: "MP4" };
  }
  // ID3 or MPEG frame sync → MP3
  if (
    matchesMagic(bytes, [0x49, 0x44, 0x33]) ||
    matchesMagic(bytes, [0xff, 0xfb]) ||
    matchesMagic(bytes, [0xff, 0xfa]) ||
    matchesMagic(bytes, [0xff, 0xf3]) ||
    matchesMagic(bytes, [0xff, 0xf2])
  ) {
    return { mime: "audio/mpeg", extension: "mp3", label: "MP3" };
  }
  // RAR
  if (
    matchesMagic(bytes, [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07]) ||
    matchesMagic(bytes, [0x52, 0x61, 0x72, 0x21])
  ) {
    return { mime: "application/vnd.rar", extension: "rar", label: "RAR" };
  }
  // 7z
  if (matchesMagic(bytes, [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c])) {
    return { mime: "application/x-7z-compressed", extension: "7z", label: "7Z" };
  }
  // tar ustar
  if (bytes.length > 262) {
    const ustar = new TextDecoder("latin1").decode(bytes.subarray(257, 262));
    if (ustar === "ustar") {
      return { mime: "application/x-tar", extension: "tar", label: "TAR" };
    }
  }
  // Windows PE (EXE/DLL/MSI often Compound File — PE starts MZ)
  if (matchesMagic(bytes, [0x4d, 0x5a])) {
    return {
      mime: "application/vnd.microsoft.portable-executable",
      extension: "exe",
      label: "EXE",
    };
  }
  // OLE Compound Document (DOC/XLS/PPT/MSI legacy)
  if (matchesMagic(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) {
    return {
      mime: "application/x-ole-storage",
      extension: "bin",
      label: "OLE",
    };
  }
  // SVG / XML text sniff
  {
    const head = new TextDecoder("utf-8", { fatal: false })
      .decode(bytes.subarray(0, Math.min(bytes.length, 256)))
      .trimStart()
      .toLowerCase();
    if (head.startsWith("<svg") || head.includes("<svg")) {
      return { mime: "image/svg+xml", extension: "svg", label: "SVG" };
    }
    if (head.startsWith("<?xml") || head.startsWith("<!doctype html") || head.startsWith("<html")) {
      if (head.includes("<html") || head.includes("<!doctype html")) {
        return { mime: "text/html", extension: "html", label: "HTML" };
      }
      return { mime: "application/xml", extension: "xml", label: "XML" };
    }
  }
  // DOCX/XLSX/PPTX/ODT/APK/JAR/EPUB are ZIP containers
  if (
    matchesMagic(bytes, [0x50, 0x4b, 0x03, 0x04]) ||
    matchesMagic(bytes, [0x50, 0x4b, 0x05, 0x06]) ||
    matchesMagic(bytes, [0x50, 0x4b, 0x07, 0x08])
  ) {
    return detectZipContainer(bytes);
  }
  if (
    matchesMagic(bytes, [0x1f, 0x8b]) ||
    matchesMagic(bytes, [0x1f, 0x8b, 0x08])
  ) {
    return { mime: "application/gzip", extension: "gz", label: "GZIP" };
  }
  return null;
}

function looksLikeUtf8Text(bytes: Uint8Array) {
  if (bytes.length === 0) return true;
  // Reject if many NUL bytes (typical of binary)
  let nuls = 0;
  const sample = Math.min(bytes.length, 4096);
  for (let i = 0; i < sample; i += 1) {
    if (bytes[i] === 0) nuls += 1;
  }
  if (nuls > 2) return false;

  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (text.includes("\uFFFD")) return false;
    return true;
  } catch {
    return false;
  }
}

/** Strip data-URI prefix, quotes and whitespace before decode. */
export function normalizeBase64Input(input: string) {
  let value = input.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  const marker = ";base64,";
  const markerIdx = value.toLowerCase().indexOf(marker);
  if (markerIdx !== -1) {
    value = value.slice(markerIdx + marker.length);
  } else if (/^data:[^,]+,/i.test(value)) {
    value = value.slice(value.indexOf(",") + 1);
  }

  return value.replace(/\s+/g, "");
}

/** Fast check that avoids catastrophic regex on huge pastes. */
export function isLikelyBase64(input: string) {
  const compact = normalizeBase64Input(input);
  if (compact.length < 4) return false;
  if (compact.length % 4 === 1) return false;
  if (/[^A-Za-z0-9+/=_-]/.test(compact)) return false;
  return true;
}

export function encodeBase64(input: string): Base64Result {
  if (!input) return { ok: false, error: "EMPTY" };
  try {
    const bytes = new TextEncoder().encode(input);
    return { ok: true, output: toBase64(bytes) };
  } catch {
    return { ok: false, error: "INVALID" };
  }
}

export function encodeBytesToBase64(bytes: Uint8Array): Base64Result {
  if (bytes.length === 0) return { ok: false, error: "EMPTY" };
  try {
    return { ok: true, output: toBase64(bytes) };
  } catch {
    return { ok: false, error: "INVALID" };
  }
}

/** Text-only decode (keeps JWT / existing callers working). */
export function decodeBase64(input: string): Base64Result {
  const compact = normalizeBase64Input(input);
  if (!compact) return { ok: false, error: "EMPTY" };
  if (!isLikelyBase64(compact)) return { ok: false, error: "INVALID" };

  try {
    const bytes = fromBase64(compact);
    const output = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (output.includes("\uFFFD")) return { ok: false, error: "INVALID" };
    return { ok: true, output };
  } catch {
    return { ok: false, error: "INVALID" };
  }
}

/** Decode Base64 to text or binary (PDF, images, zip, …). */
export function decodeBase64Smart(input: string): Base64DecodeKind {
  const compact = normalizeBase64Input(input);
  if (!compact) return { ok: false, error: "EMPTY" };

  // Prefer attempting decode even if the heuristic is unsure (huge pastes, odd padding).
  try {
    const bytes = fromBase64(compact);
    const magic = detectMimeFromBytes(bytes);

    if (magic) {
      return {
        ok: true,
        kind: "binary",
        bytes,
        mime: magic.mime,
        extension: magic.extension,
        label: magic.label,
        size: bytes.length,
      };
    }

    if (looksLikeUtf8Text(bytes)) {
      return {
        ok: true,
        kind: "text",
        output: new TextDecoder("utf-8").decode(bytes),
      };
    }

    return {
      ok: true,
      kind: "binary",
      bytes,
      mime: "application/octet-stream",
      extension: "bin",
      label: "Binary",
      size: bytes.length,
    };
  } catch {
    return { ok: false, error: "INVALID" };
  }
}

export function formatByteSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

/** Limite do arquivo de entrada no navegador (encode ou .txt Base64). */
export const BASE64_FILE_MAX_BYTES = 50 * 1024 * 1024;

/** Extensões típicas para «Base64 → arquivo» (texto com a string). */
export const DECODE_FILE_EXTENSIONS = ["txt", "b64", "base64"] as const;

export const DECODE_FILE_ACCEPT = [
  ...DECODE_FILE_EXTENSIONS.map((ext) => `.${ext}`),
  "text/plain",
].join(",");

function fileExtension(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".tar.gz")) return "tar.gz";
  const dot = name.lastIndexOf(".");
  if (dot < 0) return "";
  return name.slice(dot + 1).toLowerCase();
}

export type Base64FileValidationError = "FORMAT" | "TOO_LARGE";

export function validateBase64Upload(
  file: File,
  mode: "encode" | "decode",
): { ok: true } | { ok: false; error: Base64FileValidationError } {
  const max =
    mode === "decode"
      ? Math.ceil(BASE64_FILE_MAX_BYTES * 1.4) // Base64 ~33% maior
      : BASE64_FILE_MAX_BYTES;
  if (file.size > max) return { ok: false, error: "TOO_LARGE" };

  // Encode: qualquer tipo. Decode: precisa ser texto Base64 (.txt / .b64 / …).
  if (mode === "decode") {
    const ext = fileExtension(file.name);
    if (!(DECODE_FILE_EXTENSIONS as readonly string[]).includes(ext)) {
      return { ok: false, error: "FORMAT" };
    }
  }
  return { ok: true };
}

/** Prefere a extensão do nome; completa com magic bytes se faltar. */
export function resolveFileMeta(
  bytes: Uint8Array,
  fileName: string,
  fileMime?: string,
): MimeHint {
  const ext = fileExtension(fileName);
  const magic = detectMimeFromBytes(bytes);
  const mime =
    (fileMime && fileMime.length > 0 ? fileMime : undefined) ||
    magic?.mime ||
    "application/octet-stream";

  if (ext) {
    const normalized = ext === "jpeg" ? "jpg" : ext;
    return {
      mime,
      extension: normalized,
      label: normalized === "tar.gz" ? "TAR.GZ" : normalized.toUpperCase(),
    };
  }

  if (magic) return magic;

  return { mime, extension: "bin", label: "Binary" };
}

export { toBase64, fromBase64 };
