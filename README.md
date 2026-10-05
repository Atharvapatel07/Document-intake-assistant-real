# Document Intake Assistant

A small web application for the assignment. It conducts a conversational intake, maintains structured state, and generates a draft fictional Personal Wishes Document from confirmed information.

Author: Atharva Patel - [GitHub](https://github.com/Atharvapatel07)

I kept this implementation intentionally small. The brief is about reliable LLM application design, so I focused on state handling, validation, correction flow, document generation, and clear local setup rather than adding product features that were not requested.

The app uses a deterministic mock behind an LLM interface. That keeps setup simple, avoids committing secrets, and follows the assignment guidance for candidates without access to a paid LLM API.

## Features implemented from the brief
- Backend API and simple web UI.
- Multi-turn conversation with the assistant.
- Live structured information preview.
- Live draft Personal Wishes Document preview.
- Correction flow through the structured preview form.
- Explicit schema for collected information.
- Validation before model-style output is applied to state.
- Unknown values represented explicitly.
- Graceful handling of malformed model output.
- Automated tests around core behavior.
- AI log and production improvement notes.

No extra product features such as authentication, persistence, PDF export, or legal clause libraries are included.

## Tech stack

- TypeScript
- Express
- Vite
- Zod
- Vitest

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://127.0.0.1:5173`.

The API runs on `http://127.0.0.1:3001`.

## Scripts

```bash
npm run dev
npm test
npm run build
npm start
```

## API contract

See `docs/API.md`.

## Design decisions

See `docs/DESIGN_NOTES.md`.

## AI usage

See `docs/AI_LOG.md`.

The AI log is intentionally included because the brief encourages AI tools and asks for concise, candid notes about how they were used.

## Production notes

See `docs/PRODUCTION_NOTES.md`.

## GitHub submission

Create a public empty GitHub repository, then run:

```bash
git remote add origin https://github.com/Atharvapatel07/document-intake-assistant.git
git push -u origin main
```

## Project structure

```text
src/client       Browser UI
src/server       Express API and session handling
src/domain       State logic and document generation
src/llm          LLM provider interface, mock provider, response validation
src/shared       Shared schemas and types
tests            Automated tests
docs             API contract, AI log, production notes
```
