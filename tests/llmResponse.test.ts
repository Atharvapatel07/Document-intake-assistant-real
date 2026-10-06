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
  it("handles an ambiguous model response", () => {
  const parsed = validateModelExtraction({
    state_patch: {
      full_name: "Jane Smith",
      covers_worldwide_assets: null
    },
    assistant_message: "Can you clarify whether the document should cover worldwide assets?",
    needs_clarification: true,
    warnings: ["Worldwide asset coverage is unclear."]
  });

  expect(parsed.needs_clarification).toBe(true);
  expect(parsed.assistant_message).toContain("clarify");
  expect(parsed.warnings).toContain("Worldwide asset coverage is unclear.");
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
