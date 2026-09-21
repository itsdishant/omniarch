/**
 * Convert JSON/AI escaped newlines into real line breaks.
 * Drive-letter paths (`C:\new-service`) and `\root`-style path segments stay intact.
 */
function isDriveLetterPrefix(value: string, backslashIndex: number) {
  return (
    backslashIndex >= 2 &&
    value[backslashIndex - 1] === ":" &&
    /[A-Za-z]/.test(value[backslashIndex - 2] ?? "")
  );
}

export function decodeSerializedNewlines(value: string): string {
  if (!value.includes("\\")) {
    return value;
  }

  let result = "";
  for (let i = 0; i < value.length; i++) {
    if (value[i] !== "\\") {
      result += value[i];
      continue;
    }

    if (isDriveLetterPrefix(value, i)) {
      result += "\\";
      continue;
    }

    const next = value[i + 1];
    const afterEscape = value[i + 2];
    const looksLikePathSegment =
      typeof afterEscape === "string" && /[a-z]/.test(afterEscape);

    if (next === "r" && value[i + 2] === "\\" && value[i + 3] === "n") {
      result += "\n";
      i += 3;
      continue;
    }
    if (next === "n") {
      result += "\n";
      i += 1;
      continue;
    }
    if (next === "r" && !looksLikePathSegment) {
      result += "\n";
      i += 1;
      continue;
    }

    result += "\\";
  }

  return result;
}

export const decodeEscapedNewlines = decodeSerializedNewlines;

export function normalizeNodeLabel(value: string): string {
  return decodeSerializedNewlines(value);
}

export function commitNodeLabel(value: string): string {
  return value.trim() === "" ? "" : value;
}

export function displayNodeLabel(label: string, fallback: string): string {
  const text = decodeSerializedNewlines(label);
  return text.trim() === "" ? fallback : text;
}

export function commitEdgeLabel(value: string): string {
  return value
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeEdgeLabel(value: string): string {
  return commitEdgeLabel(decodeSerializedNewlines(value));
}
