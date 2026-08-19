import { describe, expect, it } from "vitest";
import { formatPrice } from "@/components/site/course-card";

describe("components/site/course-card formatPrice", () => {
  it("shows 'Miễn phí' for null price", () => {
    expect(formatPrice(null)).toBe("Miễn phí");
  });

  it("shows 'Miễn phí' for zero price", () => {
    expect(formatPrice("0")).toBe("Miễn phí");
  });

  it("formats a positive price with Vietnamese thousands separators + đ suffix", () => {
    expect(formatPrice("199000")).toBe("199.000đ");
  });

  it("handles decimal-string prices from numeric DB column", () => {
    expect(formatPrice("199000.00")).toBe("199.000đ");
  });
});
