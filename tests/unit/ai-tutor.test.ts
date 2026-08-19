import { describe, expect, it } from "vitest";
import { checkRateLimit, isChatMessage, RATE_LIMIT_PER_HOUR } from "@/lib/ai-tutor";

describe("lib/ai-tutor isChatMessage", () => {
  it("accepts a valid user message", () => {
    expect(isChatMessage({ role: "user", content: "hi" })).toBe(true);
  });

  it("accepts a valid assistant message", () => {
    expect(isChatMessage({ role: "assistant", content: "hi" })).toBe(true);
  });

  it("rejects an invalid role", () => {
    expect(isChatMessage({ role: "system", content: "hi" })).toBe(false);
  });

  it("rejects non-string content", () => {
    expect(isChatMessage({ role: "user", content: 123 })).toBe(false);
  });

  it("rejects null/primitives", () => {
    expect(isChatMessage(null)).toBe(false);
    expect(isChatMessage("hello")).toBe(false);
    expect(isChatMessage(42)).toBe(false);
  });
});

describe("lib/ai-tutor checkRateLimit", () => {
  it("allows requests under the per-hour limit", () => {
    const key = `test-key-${Math.random()}`;
    for (let i = 0; i < RATE_LIMIT_PER_HOUR; i++) {
      expect(checkRateLimit(key)).toBe(true);
    }
  });

  it("blocks once the per-hour limit is exceeded", () => {
    const key = `test-key-${Math.random()}`;
    for (let i = 0; i < RATE_LIMIT_PER_HOUR; i++) checkRateLimit(key);
    expect(checkRateLimit(key)).toBe(false);
  });

  it("tracks separate keys independently (per user+lesson)", () => {
    const keyA = `test-key-a-${Math.random()}`;
    const keyB = `test-key-b-${Math.random()}`;
    for (let i = 0; i < RATE_LIMIT_PER_HOUR; i++) checkRateLimit(keyA);
    expect(checkRateLimit(keyA)).toBe(false);
    expect(checkRateLimit(keyB)).toBe(true);
  });
});
