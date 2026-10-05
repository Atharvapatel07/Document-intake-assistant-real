import { IntakeState } from "../shared/schema.js";

function valueOrUnknown(value: string | null): string {
  return value ?? "Unknown";
}

function booleanOrUnknown(value: boolean | null): string {
  if (value === null) return "Unknown";
  return value ? "Yes" : "No";
}

function listOrUnknown(values: string[] | null): string {
  if (values === null) return "Unknown";
  if (values.length === 0) return "None stated";
  return values.map((item) => `- ${item}`).join("\n");
}

function labelledList(label: string, values: string[] | null): string {
  const rendered = listOrUnknown(values);
  return rendered.includes("\n")
    ? `${label}:\n${rendered}`
    : `${label}: ${rendered}`;
}

export function generatePersonalWishesDraft(state: IntakeState): string {
  const children =
    state.children === null
      ? null
      : state.children.map((child) => child.name);

  return [
    "FICTIONAL PERSONAL WISHES DOCUMENT",
    "",
    "This draft is fictional, created for a technical assessment, and is not legal advice.",
    "",
    "1. Person making these wishes",
    `Full name: ${valueOrUnknown(state.full_name)}`,
    `Home address: ${valueOrUnknown(state.home_address)}`,
    "",
    "2. Assets covered",
    `Covers worldwide assets: ${booleanOrUnknown(state.covers_worldwide_assets)}`,
    "",
    "3. Children",
    `Has children: ${booleanOrUnknown(state.has_children)}`,
    labelledList("Children", children),
    "",
    "4. Executor",
    `Executor name: ${valueOrUnknown(state.executor.name)}`,
    `Relationship to person: ${valueOrUnknown(state.executor.relationship)}`,
    "",
    "5. Specific gifts",
    listOrUnknown(state.specific_gifts),
    "",
    "6. Additional wishes",
    valueOrUnknown(state.additional_wishes),
    "",
    "Unconfirmed or missing values are shown as Unknown and should be confirmed before relying on this draft."
  ].join("\n");
}
