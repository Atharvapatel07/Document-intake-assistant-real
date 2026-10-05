import {
  emptyIntakeState,
  IntakePatch,
  IntakeState,
  IntakeStateSchema
} from "../shared/schema.js";

export type MissingField =
  | "full_name"
  | "home_address"
  | "covers_worldwide_assets"
  | "has_children"
  | "children"
  | "executor.name"
  | "executor.relationship"
  | "specific_gifts"
  | "additional_wishes";

const questions: Record<MissingField, string> = {
  full_name: "What is your full name?",
  home_address: "What is your home address?",
  covers_worldwide_assets:
    "Should this fictional document cover worldwide assets?",
  has_children: "Do you have children?",
  children: "What are the names of your children?",
  "executor.name": "Who would you like to appoint as executor?",
  "executor.relationship": "What is the executor's relationship to you?",
  specific_gifts: "Do you want to include any specific gifts?",
  additional_wishes: "Do you have any additional wishes to include?"
};

export function createInitialState(): IntakeState {
  return structuredClone(emptyIntakeState);
}

export function applyIntakePatch(
  current: IntakeState,
  patch: IntakePatch
): IntakeState {
  const merged: IntakeState = {
    ...current,
    ...patch,
    executor: {
      ...current.executor,
      ...(patch.executor ?? {})
    }
  };

  if (patch.has_children === false && patch.children === undefined) {
    merged.children = [];
  }

  if (patch.has_children === true && merged.children === null) {
    merged.children = null;
  }

  const parsed = IntakeStateSchema.parse(merged);
  ensureConsistentState(parsed);
  return parsed;
}

export function ensureConsistentState(state: IntakeState): void {
  if (
    state.has_children === false &&
    state.children !== null &&
    state.children.length > 0
  ) {
    throw new Error(
      "State is contradictory: has_children is false but children were provided."
    );
  }
}

export function getMissingFields(state: IntakeState): MissingField[] {
  const missing: MissingField[] = [];

  if (!state.full_name) missing.push("full_name");
  if (!state.home_address) missing.push("home_address");
  if (state.covers_worldwide_assets === null) {
    missing.push("covers_worldwide_assets");
  }
  if (state.has_children === null) missing.push("has_children");
  if (
    state.has_children === true &&
    (!state.children || state.children.length === 0)
  ) {
    missing.push("children");
  }
  if (!state.executor.name) missing.push("executor.name");
  if (!state.executor.relationship) missing.push("executor.relationship");
  if (state.specific_gifts === null) missing.push("specific_gifts");
  if (!state.additional_wishes) missing.push("additional_wishes");

  return missing;
}

export function getNextQuestion(state: IntakeState): string | null {
  const next = getMissingFields(state)[0];
  return next ? questions[next] : null;
}

export function completionSummary(state: IntakeState): {
  captured: number;
  total: number;
} {
  const total = 9;
  return {
    captured: total - getMissingFields(state).length,
    total
  };
}
