import { describe, expect, it } from "vitest";
import { shouldIssueCertificate } from "@/lib/certificates";

describe("lib/certificates shouldIssueCertificate", () => {
  it("does not issue when course has zero lessons (nothing to complete)", () => {
    expect(shouldIssueCertificate(0, 0)).toBe(false);
  });

  it("does not issue when only some lessons are completed", () => {
    expect(shouldIssueCertificate(5, 4)).toBe(false);
  });

  it("issues when all lessons are completed", () => {
    expect(shouldIssueCertificate(5, 5)).toBe(true);
  });

  it("issues even if completed somehow exceeds total (defensive >=)", () => {
    expect(shouldIssueCertificate(5, 6)).toBe(true);
  });
});
