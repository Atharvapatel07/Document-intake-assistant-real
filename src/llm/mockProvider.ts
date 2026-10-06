import { getNextQuestion } from "../domain/state.js";
import { IntakePatch } from "../shared/schema.js";
import { LLMExtractionInput, LLMProvider } from "./types.js";

const relationshipWords = [
  "brother",
  "sister",
  "father",
  "mother",
  "parent",
  "spouse",
  "husband",
  "wife",
  "partner",
  "friend",
  "cousin",
  "uncle",
  "aunt",
  "son",
  "daughter",
  "colleague"
];

export class MockLLMProvider implements LLMProvider {
  async extract(input: LLMExtractionInput): Promise<unknown> {
    const patch = extractPatch(input);
    const hasPatch = Object.keys(patch).length > 0;
    const nextQuestion = getNextQuestionAfterPatch(input, patch);

    return {
      state_patch: patch,
      assistant_message: hasPatch
        ? "Thanks, I have updated the structured intake."
        : "I could not confidently map that answer to the intake fields.",
      needs_clarification: !hasPatch || nextQuestion !== null,
      warnings: hasPatch ? [] : ["No structured fields were extracted."]
    };
  }
}

function extractPatch(input: LLMExtractionInput): IntakePatch {
  const text = input.message.trim();
  const lower = text.toLowerCase();
  const patch: IntakePatch = {};
  const nextQuestion = getNextQuestion(input.state);

const name = matchFirst(text, [
  /\bfull name is\s+([^.;]+)/i,
  /\bmy name is\s+([^.;]+)/i,
  /\bi am\s+([^.;]+)/i,
  /\bi'm\s+([^.;]+)/i
]);

if (name && !looksLikeAddress(name)) {
  patch.full_name = cleanValue(name);
} else if (
  !name &&
  looksLikeNameAnswer(text) &&
  nextQuestion?.toLowerCase().includes("full name")
) {
  patch.full_name = cleanValue(text);
}

  const address = matchFirst(text, [
  /\bhome address is\s+([^.;]+)/i,
  /\baddress is\s+([^.;]+)/i,
  /\bi live at\s+([^.;]+)/i,
  /\blive at\s+([^.;]+)/i
]);

if (address) {
  patch.home_address = cleanValue(address);
} else if (
  nextQuestion?.toLowerCase().includes("home address") &&
  looksLikeAddress(text)
) {
  patch.home_address = cleanValue(text);
}

  if (mentionsWorldwideYes(lower)) {
  patch.covers_worldwide_assets = true;
} else if (mentionsWorldwideNo(lower)) {
  patch.covers_worldwide_assets = false;
} else if (nextQuestion?.toLowerCase().includes("worldwide assets")) {
  if (/^(yes|yeah|yep|yup|true)$/i.test(text)) {
    patch.covers_worldwide_assets = true;
  } else if (/^(no|nope|false)$/i.test(text)) {
    patch.covers_worldwide_assets = false;
  }
}

  if (mentionsNoChildren(lower)) {
  patch.has_children = false;
  patch.children = [];
} else if (
  nextQuestion?.toLowerCase().includes("do you have children") &&
  /^(no|nope|nah|false)$/i.test(text)
) {
  patch.has_children = false;
  patch.children = [];
} else if (
  nextQuestion?.toLowerCase().includes("do you have children") &&
  /^(yes|yeah|yep|yup|true)$/i.test(text)
) {
  patch.has_children = true;
} else {
  const children = extractChildren(text);
  if (children.length > 0) {
    patch.has_children = true;
    patch.children = children.map((child) => ({ name: child }));
  }
}

  const executor = extractExecutor(text, nextQuestion);
  if (executor.name || executor.relationship) {
    patch.executor = executor;
  }

  const specificGifts = extractSpecificGifts(text, nextQuestion);
  if (specificGifts !== undefined) {
    patch.specific_gifts = specificGifts;
  }

  const additionalWishes = extractAdditionalWishes(text, nextQuestion);
  if (additionalWishes !== undefined) {
    patch.additional_wishes = additionalWishes;
  }

  return patch;
}

function getNextQuestionAfterPatch(
  input: LLMExtractionInput,
  patch: IntakePatch
): string | null {
  try {
    const nextState = {
      ...input.state,
      ...patch,
      executor: {
        ...input.state.executor,
        ...(patch.executor ?? {})
      }
    };
    return getNextQuestion(nextState);
  } catch {
    return getNextQuestion(input.state);
  }
}

function matchFirst(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function cleanValue(value: string): string {
  return value
    .replace(/\b(and|also)\b$/i, "")
    .replace(/\s+/g, " ")
    .replace(/[,.]\s*$/g, "")
    .trim();
}

function looksLikeAddress(value: string): boolean {
  return /\d/.test(value) || /\b(street|road|lane|avenue|flat|apartment)\b/i.test(value);
}
function looksLikeNameAnswer(value: string) {
  const words = value.trim().split(/\s+/);

  return (
    words.length >= 2 &&
    words.length <= 4 &&
    /^[a-zA-Z][a-zA-Z.'-]*(\s+[a-zA-Z][a-zA-Z.'-]*)+$/.test(value.trim())
  );
}
function mentionsWorldwideYes(lower: string): boolean {
  return (
    /\b(worldwide|all my assets|all assets|global)\b/.test(lower) &&
    !mentionsWorldwideNo(lower)
  );
}

function mentionsWorldwideNo(lower: string): boolean {
  return /\b(not worldwide|do not cover worldwide|don't cover worldwide|only local|only uk|only india)\b/.test(
    lower
  );
}

function mentionsNoChildren(lower: string): boolean {
  return /\b(no children|do not have children|don't have children|without children)\b/.test(
    lower
  );
}

function extractChildren(text: string): string[] {
  const childrenSegment = matchFirst(text, [
    /\bchildren are\s+([^.;]+)/i,
    /\bchildren named\s+([^.;]+)/i,
    /\bchildren called\s+([^.;]+)/i,
    /\bhave\s+(?:\w+\s+)?children[:,]?\s+([^.;]+)/i
  ]);
  if (!childrenSegment) return [];

  return splitNames(childrenSegment)
    .map((name) => cleanValue(name.replace(/\bnamed\b/i, "")))
    .filter(Boolean);
}

function extractExecutor(
  text: string,
  nextQuestion: string | null
): { name?: string | null; relationship?: string | null } {
  const explicit = matchFirst(text, [
    /\bexecutor is\s+([^.;]+)/i,
    /\bexecutor should be\s+([^.;]+)/i,
    /\bappoint\s+([^.;]+?)\s+as executor/i,
    /\bname\s+([^.;]+?)\s+as executor/i
  ]);

  const segment =
    explicit ??
    (nextQuestion === "Who would you like to appoint as executor?"
      ? text
      : null);

  if (!segment) {
    return extractRelationshipOnly(text, nextQuestion);
  }

  return parsePersonRelationship(segment);
}

function extractRelationshipOnly(
  text: string,
  nextQuestion: string | null
): { name?: string | null; relationship?: string | null } {
  if (nextQuestion !== "What is the executor's relationship to you?") {
    return {};
  }
  const relationship = relationshipWords.find((word) =>
    new RegExp(`\\b${word}\\b`, "i").test(text)
  );
  return relationship ? { relationship } : {};
}

function parsePersonRelationship(segment: string): {
  name?: string | null;
  relationship?: string | null;
} {
  const lower = segment.toLowerCase();
  const relationship = relationshipWords.find((word) =>
    new RegExp(`\\b${word}\\b`, "i").test(lower)
  );

  let name = cleanValue(segment)
    .replace(/\bmy\b/gi, "")
    .replace(/\bas executor\b/gi, "")
    .replace(/\bexecutor\b/gi, "")
    .trim();

  if (relationship) {
    name = name.replace(new RegExp(`\\b${relationship}\\b`, "gi"), "");
  }

  name = cleanValue(name.replace(/\s+/g, " "));

  return {
    ...(name ? { name } : {}),
    ...(relationship ? { relationship } : {})
  };
}

function extractSpecificGifts(
  text: string,
  nextQuestion: string | null
): string[] | undefined {
  const lower = text.toLowerCase();
  if (
    /\b(no specific gifts|no gifts|none for gifts|nothing specific)\b/.test(
      lower
    ) &&
    (nextQuestion === "Do you want to include any specific gifts?" ||
      lower.includes("gift"))
  ) {
    return [];
  }

  const gifts = matchFirst(text, [
    /\bspecific gifts?[:\s]+([^.;]+)/i,
    /\bgifts?[:\s]+([^.;]+)/i
  ]);

  if (gifts) {
    return splitList(gifts);
  }

  const giveMatch = text.match(/\bgive\s+([^.;]+)/i);
  if (giveMatch?.[1]) {
    return [cleanValue(`Give ${giveMatch[1]}`)];
  }

  return undefined;
}

function extractAdditionalWishes(
  text: string,
  nextQuestion: string | null
): string | undefined {
  const lower = text.toLowerCase();
  if (
    /\b(no additional wishes|nothing else|no other wishes)\b/.test(lower)
  ) {
    return "No additional wishes stated.";
  }

  const wishes = matchFirst(text, [
    /\badditional wishes?[:\s]+([^;]+)/i,
    /\bother wishes?[:\s]+([^;]+)/i
  ]);

  if (wishes) return cleanValue(wishes);

  if (nextQuestion === "Do you have any additional wishes to include?") {
    return cleanValue(text);
  }

  return undefined;
}

function splitNames(value: string): string[] {
  return value
    .replace(/\band\b/gi, ",")
    .split(",")
    .map(cleanValue)
    .filter(Boolean);
}

function splitList(value: string): string[] {
  return value
    .replace(/\band\b/gi, ",")
    .split(",")
    .map(cleanValue)
    .filter(Boolean);
}
