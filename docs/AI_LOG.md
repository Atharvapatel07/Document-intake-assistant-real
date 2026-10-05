# AI Log

This project was created with assistance from ChatGPT/Codex, as allowed by the assignment. I used AI mainly as a coding pair for scaffolding, test ideas, and catching edge cases, then kept the implementation limited to the brief.

## Key prompts

- "Read the attached technical test PDF and list only the requested features."
- "Build a small Document Intake Assistant with backend, UI, state schema, draft preview, corrections, tests, and docs."
- "Use a deterministic mock behind an LLM interface, because the brief says paid LLM access is not required."
- "Add tests for state updates, malformed model responses, corrections, and document generation."

## Notable iterations

- I first separated the brief into product requirements and engineering expectations so I would not add unrelated features.
- I chose a mock LLM provider so the repo can run locally without secrets or paid API access.
- I kept the state model explicit and separate from chat history so the draft document is generated from validated structured data.
- I added a manual correction flow through `PATCH /api/state` because the slides require correcting previously supplied information.
- I added a separate design notes file after the first pass, because I wanted the code walkthrough to show my reasoning rather than only the finished files.

## Output questioned or corrected

- I avoided adding features that are common in document products, such as authentication, database persistence, PDF export, user accounts, and legal clause libraries, because the brief asks for a small assessment application.
- The mock initially parsed one all-in-one answer too broadly. I tightened the extraction and added a test for that case.
- I rejected malformed model output in tests instead of silently applying it.
- I represented unknown values as `null` in state and as `Unknown` in the draft document to avoid inventing facts.
