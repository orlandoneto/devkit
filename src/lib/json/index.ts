export type JsonFormatResult =
  | { ok: true; output: string; mode: "pretty" | "minify" }
  | { ok: false; error: string };

export function formatJson(
  input: string,
  mode: "pretty" | "minify",
  indent = 2,
): JsonFormatResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "EMPTY" };
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);
    const output =
      mode === "minify"
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, Math.min(Math.max(indent, 0), 8));
    return { ok: true, output, mode };
  } catch (err) {
    const message = err instanceof Error ? err.message : "INVALID";
    return { ok: false, error: message };
  }
}

export function validateJson(input: string): JsonFormatResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "EMPTY" };
  try {
    JSON.parse(trimmed);
    return { ok: true, output: trimmed, mode: "pretty" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "INVALID";
    return { ok: false, error: message };
  }
}
