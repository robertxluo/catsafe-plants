import { describe, it, expect } from "vitest";
import {
  getPlantById,
  getStatusLabel,
  getDisplaySafetyStatus,
  hasCitationEvidence,
  plants,
} from "@/src/lib/plants";

describe("plants data", () => {
  it("exports a non-empty plant list", () => {
    expect(plants.length).toBeGreaterThan(0);
  });

  it("every plant has required fields", () => {
    for (const plant of plants) {
      expect(plant.id).toBeTruthy();
      expect(plant.common_name).toBeTruthy();
      expect(plant.scientific_name).toBeTruthy();
      expect(plant.safety_status).toBeTruthy();
    }
  });
});

describe("getPlantById", () => {
  it("returns the correct plant for a known id", () => {
    const plant = getPlantById("lilium");
    expect(plant).toBeDefined();
    expect(plant!.common_name).toBe("Lily");
  });

  it("returns undefined for an unknown id", () => {
    expect(getPlantById("does-not-exist")).toBeUndefined();
  });
});

describe("getStatusLabel", () => {
  it.each([
    ["non_toxic", "Safe for Cats"],
    ["mildly_toxic", "Mildly Toxic"],
    ["highly_toxic", "Highly Toxic"],
    ["unknown", "Unknown"],
  ] as const)("maps %s → %s", (status, label) => {
    expect(getStatusLabel(status)).toBe(label);
  });
});

describe("getDisplaySafetyStatus", () => {
  it("returns unknown when citations are empty", () => {
    const result = getDisplaySafetyStatus({
      safety_status: "highly_toxic",
      citations: [],
    });
    expect(result).toBe("unknown");
  });

  it("returns real status when citations exist", () => {
    const result = getDisplaySafetyStatus({
      safety_status: "highly_toxic",
      citations: [{ source_name: "ASPCA", source_url: "https://aspca.org" }],
    });
    expect(result).toBe("highly_toxic");
  });
});

describe("hasCitationEvidence", () => {
  it("returns false for empty citations", () => {
    expect(hasCitationEvidence({ citations: [] })).toBe(false);
  });

  it("returns true for non-empty citations", () => {
    expect(
      hasCitationEvidence({
        citations: [{ source_name: "src", source_url: "https://example.com" }],
      })
    ).toBe(true);
  });
});
