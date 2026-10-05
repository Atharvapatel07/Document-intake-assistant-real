import { describe, expect, it } from "vitest";
import { generatePersonalWishesDraft } from "../src/domain/document.js";
import { createInitialState } from "../src/domain/state.js";

describe("draft document generation", () => {
  it("clearly marks the draft as fictional and not legal advice", () => {
    const draft = generatePersonalWishesDraft(createInitialState());

    expect(draft).toContain("FICTIONAL PERSONAL WISHES DOCUMENT");
    expect(draft).toContain("not legal advice");
  });

  it("represents missing facts explicitly", () => {
    const draft = generatePersonalWishesDraft(createInitialState());

    expect(draft).toContain("Full name: Unknown");
    expect(draft).toContain("Covers worldwide assets: Unknown");
  });
});
