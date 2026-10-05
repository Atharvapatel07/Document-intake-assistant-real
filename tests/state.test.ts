import { describe, expect, it } from "vitest";
import {
  applyIntakePatch,
  createInitialState,
  getNextQuestion
} from "../src/domain/state.js";

describe("intake state", () => {
  it("merges validated patches without using chat history as truth", () => {
    const state = applyIntakePatch(createInitialState(), {
      full_name: "Jane Smith",
      executor: {
        name: "James Smith",
        relationship: "brother"
      }
    });

    expect(state.full_name).toBe("Jane Smith");
    expect(state.executor).toEqual({
      name: "James Smith",
      relationship: "brother"
    });
  });

  it("does not ask again for information already captured", () => {
    const state = applyIntakePatch(createInitialState(), {
      full_name: "Jane Smith"
    });

    expect(getNextQuestion(state)).toBe("What is your home address?");
  });

  it("rejects contradictory children state", () => {
    expect(() =>
      applyIntakePatch(createInitialState(), {
        has_children: false,
        children: [{ name: "Alice" }]
      })
    ).toThrow(/contradictory/i);
  });
});
