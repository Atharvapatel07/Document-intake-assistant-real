import { generatePersonalWishesDraft } from "../domain/document.js";
import { createInitialState } from "../domain/state.js";
import { ChatMessage, IntakeState } from "../shared/schema.js";

export type IntakeSession = {
  state: IntakeState;
  history: ChatMessage[];
};

export function createSession(): IntakeSession {
  const now = new Date().toISOString();
  return {
    state: createInitialState(),
    history: [
      {
        role: "assistant",
        content: "What is your full name?",
        created_at: now
      }
    ]
  };
}

let currentSession = createSession();

export function getSession(): IntakeSession {
  return currentSession;
}

export function resetSession(): IntakeSession {
  currentSession = createSession();
  return currentSession;
}

export function toSessionResponse(session: IntakeSession) {
  return {
    state: session.state,
    history: session.history,
    draft_document: generatePersonalWishesDraft(session.state)
  };
}
