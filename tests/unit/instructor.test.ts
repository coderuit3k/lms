import { describe, expect, it } from "vitest";
import { canManageCourses } from "@/lib/instructor";

describe("lib/instructor canManageCourses", () => {
  it("allows instructor role", () => {
    expect(canManageCourses({ role: "instructor" })).toBe(true);
  });

  it("allows admin role", () => {
    expect(canManageCourses({ role: "admin" })).toBe(true);
  });

  it("denies student role", () => {
    expect(canManageCourses({ role: "student" })).toBe(false);
  });

  it("denies unknown/empty role", () => {
    expect(canManageCourses({ role: "" })).toBe(false);
  });
});
