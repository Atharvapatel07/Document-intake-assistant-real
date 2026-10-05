# Design Notes

These are the main decisions I would explain in a code walkthrough.

## State is separate from chat

The chat history is useful context, but it is not the source of truth. The source of truth is the structured `IntakeState` schema in `src/shared/schema.ts`. This makes the document preview predictable and prevents the app from relying on a long conversation transcript to recover important fields.

## The model boundary is explicit

The LLM-like behavior sits behind the `LLMProvider` interface. For this submission I used `MockLLMProvider`, because it runs locally and needs no API key. A real provider can replace it by returning the same structured extraction contract.

## Model output is validated before use

The app does not apply raw model output directly. `validateModelExtraction` checks the response shape first, then the domain layer merges and validates the patch. This is the main reliability guard in the project.

## Corrections use the same state path

Manual corrections from the preview form go through `applyIntakePatch`, the same function used after chat extraction. That keeps correction behavior consistent with normal conversation updates.

## Known tradeoffs

- The mock parser is intentionally narrow. It demonstrates the model contract and edge-case handling, but it is not trying to be a full natural-language parser.
- Sessions are in memory because persistence was not part of the brief.
- The generated document is plain text because the brief asks for a draft preview, not export tooling.
