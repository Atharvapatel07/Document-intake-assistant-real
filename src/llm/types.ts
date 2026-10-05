import {
  ChatMessage,
  IntakeState,
  ModelExtraction
} from "../shared/schema.js";

export type LLMExtractionInput = {
  message: string;
  state: IntakeState;
  history: ChatMessage[];
};

export interface LLMProvider {
  extract(input: LLMExtractionInput): Promise<unknown>;
}

export type ParsedLLMExtraction = ModelExtraction;
