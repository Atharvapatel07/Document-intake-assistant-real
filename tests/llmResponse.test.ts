import { describe, expect, it } from "vitest";
import { validateModelExtraction } from "../src/llm/responseValidator.js";

describe("LLM response validation", () => {
  it("accepts a valid structured extraction", () => {
    const parsed = validateModelExtraction({
      state_patch: {
        full_name: "Jane Smith"
      },
      assistant_message: "Updated.",
      needs_clarification: true,
      warnings: []
    });

    expect(parsed.state_patch.full_name).toBe("Jane Smith");
  });

  it("rejects malformed model output before state updates", () => {
    expect(() =>
      validateModelExtraction({
        state_patch: "Jane Smith",
        assistant_message: "",
        warnings: "none"
      })
    ).toThrow();
  });
});
