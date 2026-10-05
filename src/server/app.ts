import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { MockLLMProvider } from "../llm/mockProvider.js";
import {
  ChatRequestSchema,
  CorrectionRequestSchema
} from "../shared/schema.js";
import {
  applyManualCorrection,
  handleUserMessage
} from "./assistantService.js";
import {
  getSession,
  resetSession,
  toSessionResponse
} from "./sessionStore.js";

export function createApp() {
  const app = express();
  const provider = new MockLLMProvider();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true, llm_provider: "mock" });
  });

  app.get("/api/session", (_request, response) => {
    response.json(toSessionResponse(getSession()));
  });

  app.post("/api/chat", async (request, response) => {
    const parsed = ChatRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Message is required." });
      return;
    }

    const result = await handleUserMessage(
      getSession(),
      parsed.data.message,
      provider
    );
    response.json(result);
  });

  app.patch("/api/state", (request, response) => {
    const parsed = CorrectionRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Invalid state correction." });
      return;
    }

    try {
      response.json(applyManualCorrection(getSession(), parsed.data));
    } catch (error) {
      response.status(422).json({
        error:
          error instanceof Error
            ? error.message
            : "Correction could not be applied."
      });
    }
  });

  app.post("/api/reset", (_request, response) => {
    response.json(toSessionResponse(resetSession()));
  });

  const clientDist = path.resolve(process.cwd(), "dist/client");
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get(/.*/, (_request, response) => {
      response.sendFile(path.join(clientDist, "index.html"));
    });
  }

  return app;
}
