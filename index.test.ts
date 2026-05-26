import { describe, it, expect } from "vitest";
import { hexToOklch } from "./index.js";

describe("hexToOklch", () => {
  describe("achromatic colors (hue should be 0)", () => {
    it("white", () => expect(hexToOklch("#ffffff")).toBe("oklch(1 0 0)"));
    it("black", () => expect(hexToOklch("#000000")).toBe("oklch(0 0 0)"));
    it("gray", () => {
      const r = hexToOklch("#808080", 4, { raw: true });
      expect(r.h).toBe(0);
      expect(r.c).toBeLessThan(0.001);
    });
  });

  describe("known sRGB primaries", () => {
    it("red", () => {
      const r = hexToOklch("#ff0000", 4, { raw: true });
      expect(r.l).toBeCloseTo(0.6279, 3);
      expect(r.c).toBeCloseTo(0.2577, 3);
      expect(r.h).toBeCloseTo(29.23, 1);
    });
    it("green", () => {
      const r = hexToOklch("#00ff00", 4, { raw: true });
      expect(r.l).toBeCloseTo(0.8664, 3);
      expect(r.c).toBeCloseTo(0.2948, 3);
      expect(r.h).toBeCloseTo(142.5, 1);
    });
    it("blue", () => {
      const r = hexToOklch("#0000ff", 4, { raw: true });
      expect(r.l).toBeCloseTo(0.4520, 3);
      expect(r.c).toBeCloseTo(0.3132, 3);
      expect(r.h).toBeCloseTo(264.05, 1);
    });
  });

  describe("Tailwind palette spot checks", () => {
    it("blue-500 (#3b82f6)", () => {
      const r = hexToOklch("#3b82f6", 4, { raw: true });
      expect(r.l).toBeCloseTo(0.6231, 2);
      expect(r.h).toBeCloseTo(259.81, 1);
    });
    it("rose-600 (#e11d48)", () => {
      const r = hexToOklch("#e11d48", 4, { raw: true });
      expect(r.l).toBeCloseTo(0.5858, 2);
      expect(r.h).toBeCloseTo(17.58, 1);
    });
  });

  describe("input forms", () => {
    it("accepts 3-digit hex", () => expect(hexToOklch("#fff")).toBe("oklch(1 0 0)"));
    it("accepts hex without #", () => expect(hexToOklch("ffffff")).toBe("oklch(1 0 0)"));
    it("handles uppercase", () => expect(hexToOklch("#FF0000")).toEqual(hexToOklch("#ff0000")));
    it("trims whitespace", () => expect(hexToOklch("  #fff  ")).toBe("oklch(1 0 0)"));
  });

  describe("API options", () => {
    it("respects precision", () => {
      const out = hexToOklch("#3b82f6", 2);
      expect(out).toMatch(/^oklch\(0\.\d{1,2} 0\.\d{1,2} \d+(\.\d{1,2})?\)$/);
    });
    it("returns object when raw: true", () => {
      const r = hexToOklch("#ffffff", 4, { raw: true });
      expect(r).toEqual({ l: 1, c: 0, h: 0 });
    });
  });

  describe("validation", () => {
    it("throws on empty string", () => expect(() => hexToOklch("")).toThrow());
    it("throws on garbage input", () => expect(() => hexToOklch("not-a-color")).toThrow());
    it("throws on wrong length", () => expect(() => hexToOklch("#ff")).toThrow());
    it("throws on non-hex chars", () => expect(() => hexToOklch("#zzzzzz")).toThrow());
  });
});
