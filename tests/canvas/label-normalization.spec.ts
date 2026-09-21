import { expect, test } from "@playwright/test";

import {
  commitEdgeLabel,
  commitNodeLabel,
  decodeSerializedNewlines,
  displayNodeLabel,
  normalizeEdgeLabel,
  normalizeNodeLabel,
} from "../../lib/visible-text";

test.describe("Canvas label text normalization", () => {
  test("decodes escaped newlines from serialized AI text", () => {
    expect(decodeSerializedNewlines("Auth\\nService")).toBe("Auth\nService");
    expect(decodeSerializedNewlines("Auth\\r\\nService")).toBe("Auth\nService");
    expect(normalizeNodeLabel("Orders\\nAPI")).toBe("Orders\nAPI");
    expect(decodeSerializedNewlines("foo\\nbar")).toBe("foo\\nbar");
  });

  test("preserves literal backslashes in Windows-style paths", () => {
    expect(decodeSerializedNewlines("C:\\new-service")).toBe("C:\\new-service");
    expect(decodeSerializedNewlines("D:\\root\\registry")).toBe(
      "D:\\root\\registry",
    );
    expect(normalizeNodeLabel("C:\\new-service")).toBe("C:\\new-service");
    expect(normalizeEdgeLabel("C:\\new-service")).toBe("C:\\new-service");
  });

  test("collapses decoded newlines in edge labels without breaking paths", () => {
    expect(normalizeEdgeLabel("HTTP\\nREST")).toBe("HTTP REST");
    expect(commitEdgeLabel("HTTP\nREST")).toBe("HTTP REST");
    expect(commitEdgeLabel("C:\\new-service")).toBe("C:\\new-service");
  });

  test("treats whitespace-only labels as empty", () => {
    expect(commitNodeLabel("\n")).toBe("");
    expect(commitNodeLabel("  \n  ")).toBe("");
    expect(displayNodeLabel("\n", "Rectangle")).toBe("Rectangle");
    expect(displayNodeLabel("   ", "Pill")).toBe("Pill");
    expect(displayNodeLabel("Auth\\nService", "Rectangle")).toBe(
      "Auth\nService",
    );
  });

  test("keeps real newlines from user input on commit", () => {
    expect(commitNodeLabel("Auth\nService")).toBe("Auth\nService");
    expect(commitNodeLabel("C:\\new-service")).toBe("C:\\new-service");
  });
});
