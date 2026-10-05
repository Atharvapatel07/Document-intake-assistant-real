# Document Intake Assistant

A small web application for the Wenup engineering technical test. It conducts a conversational intake, maintains structured state, and generates a draft fictional Personal Wishes Document from confirmed information.

The app intentionally uses a deterministic mock behind an LLM interface. This keeps setup simple, avoids committing secrets, and follows the assignment guidance for candidates without access to a paid LLM API.

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

## AI usage

See `docs/AI_LOG.md`.

The AI log is intentionally included because the brief encourages AI tools and asks for concise, candid notes about how they were used.

## Production notes

See `docs/PRODUCTION_NOTES.md`.

## GitHub submission

Create a public empty GitHub repository, then run:

```bash
git remote add origin https://github.com/<your-user>/document-intake-assistant.git
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
