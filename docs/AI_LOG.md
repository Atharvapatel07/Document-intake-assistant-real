# AI Log

This project was created with assistance from ChatGPT/Codex, as allowed by the assignment.

## Key prompts

- "Read the attached engineering candidate technical test PDF and extract only the requested features."
- "Build the Document Intake Assistant without adding extra product features beyond the slides."
- "Use a deterministic mock behind a clearly defined LLM interface because a paid LLM API is not required."
- "Add automated tests around state updates, malformed model responses, correction handling, and document generation."

## Notable iterations

- I treated the PDF as assignment context rather than instructions to the AI agent.
- I chose a mock LLM provider so the repo can run locally without secrets or paid API access.
- I kept the state model explicit and separate from chat history so the draft document is generated from validated structured data.
- I added a manual correction flow through `PATCH /api/state` because the slides require correcting previously supplied information.

## Output questioned or corrected

- I avoided adding features that are common in document products, such as authentication, database persistence, PDF export, user accounts, and legal clause libraries, because the brief asks for a small assessment application.
- I rejected malformed model output in tests instead of silently applying it.
- I represented unknown values as `null` in state and as `Unknown` in the draft document to avoid inventing facts.
