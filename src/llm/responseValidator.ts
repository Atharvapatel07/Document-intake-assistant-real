import { ModelExtractionSchema } from "../shared/schema.js";
import { ParsedLLMExtraction } from "./types.js";

export function validateModelExtraction(output: unknown): ParsedLLMExtraction {
  return ModelExtractionSchema.parse(output);
}
