import { describe, expect, it } from "vitest";

import { startOfWeek } from "@/lib/date-utils";

describe("startOfWeek", () => {
  it("returns Monday for a Wednesday date", () => {
    const date = new Date("2024-01-31T12:00:00Z"); // Wednesday
    const monday = startOfWeek(date);
    expect(monday.getUTCDay()).toBe(1);
    expect(monday.toISOString().startsWith("2024-01-29")).toBe(true);
  });

  it("handles Sunday by going back to Monday", () => {
    const date = new Date("2024-02-04T00:00:00Z"); // Sunday
    const monday = startOfWeek(date);
    expect(monday.toISOString().startsWith("2024-01-29")).toBe(true);
  });
});
