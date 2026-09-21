/**
 * Turn escaped newline sequences from models/JSON into real line breaks.
 * Leaves already-decoded newlines unchanged.
 */
export function decodeEscapedNewlines(value: string): string {
  if (!value.includes("\\")) {
    return value;
  }

  return value
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n");
}

export function normalizeNodeLabel(value: string): string {
  return decodeEscapedNewlines(value);
}

export function normalizeEdgeLabel(value: string): string {
  return decodeEscapedNewlines(value)
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
