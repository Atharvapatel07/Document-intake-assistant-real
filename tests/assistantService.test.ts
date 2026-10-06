import { describe, expect, it } from "vitest";

import { handleUserMessage } from "../src/server/assistantService.js";
import { createSession } from "../src/server/sessionStore.js";
import { MockLLMProvider } from "../src/llm/mockProvider.js";
import { LLMProvider } from "../src/llm/types.js";

describe("assistant service", () => {
  it("handles one answer that provides several fields", async () => {
    const session = createSession();

    const result = await handleUserMessage(
      session,
      "My name is Jane Smith. I live at 10 Garden Road. Cover worldwide assets. I have children named Alice and Bob.",
      new MockLLMProvider()
    );

    expect(result.state.full_name).toBe("Jane Smith");
    expect(result.state.home_address).toBe("10 Garden Road");
    expect(result.state.covers_worldwide_assets).toBe(true);
    expect(result.state.children?.map((child) => child.name)).toEqual([
      "Alice",
      "Bob"
    ]);
    expect(result.assistant_message).toContain("executor");
  });

  it("handles a full intake supplied in one message", async () => {
    const session = createSession();

    const result = await handleUserMessage(
      session,
      "My name is Jane Smith. I live at 10 Garden Road. Cover worldwide assets. I have children named Alice and Bob. My executor is my brother James. No specific gifts. No additional wishes.",
      new MockLLMProvider()
    );

    expect(result.state.full_name).toBe("Jane Smith");
    expect(result.state.executor).toEqual({
      name: "James",
      relationship: "brother"
    });
    expect(result.state.specific_gifts).toEqual([]);
    expect(result.state.additional_wishes).toBe("No additional wishes stated.");
    expect(result.assistant_message).toContain("current draft");
  });

  it("keeps the previous state when the model response is malformed", async () => {
    const session = createSession();

    const badProvider: LLMProvider = {
      async extract() {
        return { malformed: true };
      }
    };

    const result = await handleUserMessage(
      session,
      "My name is Jane Smith",
      badProvider
    );

    expect(result.state.full_name).toBeNull();
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("captures a plain full-name answer", async () => {
    const session = createSession();

    const result = await handleUserMessage(
      session,
      "Alex Johnson",
      new MockLLMProvider()
    );

    expect(result.state.full_name).toBe("Alex Johnson");
  });

  it("captures a plain home-address answer", async () => {
    const session = createSession();

    await handleUserMessage(
      session,
      "Alex Johnson",
      new MockLLMProvider()
    );

    const result = await handleUserMessage(
      session,
      "123 Green Street, Pune, Maharashtra",
      new MockLLMProvider()
    );

    expect(result.state.home_address).toBe(
      "123 Green Street, Pune, Maharashtra"
    );
  });
});