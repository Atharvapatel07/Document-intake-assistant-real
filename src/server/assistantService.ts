import { generatePersonalWishesDraft } from "../domain/document.js";
import {
  applyIntakePatch,
  completionSummary,
  getNextQuestion
} from "../domain/state.js";
import { validateModelExtraction } from "../llm/responseValidator.js";
import { LLMProvider } from "../llm/types.js";
import { IntakePatch } from "../shared/schema.js";
import { IntakeSession } from "./sessionStore.js";

export type AssistantTurnResult = {
  assistant_message: string;
  state: IntakeSession["state"];
  history: IntakeSession["history"];
  draft_document: string;
  warnings: string[];
};

export async function handleUserMessage(
  session: IntakeSession,
  message: string,
  provider: LLMProvider
): Promise<AssistantTurnResult> {
  addMessage(session, "user", message);

  try {
    const rawOutput = await provider.extract({
      message,
      state: session.state,
      history: session.history
    });
    const extraction = validateModelExtraction(rawOutput);
    session.state = applyIntakePatch(session.state, extraction.state_patch);

    const nextQuestion = getNextQuestion(session.state);
    const assistantMessage = buildAssistantMessage(
      extraction.assistant_message,
      nextQuestion
    );
    addMessage(session, "assistant", assistantMessage);

    return response(session, assistantMessage, extraction.warnings);
  } catch (error) {
    const assistantMessage =
      "I could not safely update the structured intake from that response. Please rephrase or use the preview fields to correct it.";
    addMessage(session, "assistant", assistantMessage);
    return response(session, assistantMessage, [
      error instanceof Error ? error.message : "Unknown model error"
    ]);
  }
}

export function applyManualCorrection(
  session: IntakeSession,
  patch: IntakePatch
): AssistantTurnResult {
  session.state = applyIntakePatch(session.state, patch);
  const nextQuestion = getNextQuestion(session.state);
  const summary = completionSummary(session.state);
  const assistantMessage = nextQuestion
    ? `Correction saved. ${nextQuestion}`
    : `Correction saved. All ${summary.total} intake areas have a confirmed value.`;
  addMessage(session, "assistant", assistantMessage);
  return response(session, assistantMessage, []);
}

function buildAssistantMessage(
  modelMessage: string,
  nextQuestion: string | null
): string {
  if (!nextQuestion) {
    return `${modelMessage} I have enough information to prepare the current draft.`;
  }
  return `${modelMessage} ${nextQuestion}`;
}

function addMessage(
  session: IntakeSession,
  role: "assistant" | "user",
  content: string
) {
  session.history.push({
    role,
    content,
    created_at: new Date().toISOString()
  });
}

function response(
  session: IntakeSession,
  assistantMessage: string,
  warnings: string[]
): AssistantTurnResult {
  return {
    assistant_message: assistantMessage,
    state: session.state,
    history: session.history,
    draft_document: generatePersonalWishesDraft(session.state),
    warnings
  };
}
