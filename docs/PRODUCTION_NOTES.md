# Production Improvement Notes

This assessment build focuses on the features requested in the brief. For production, I would improve:

- Add a real LLM provider implementation behind the existing `LLMProvider` interface, with schema-constrained responses and retry handling.
- Replace the in-memory session with authenticated user sessions and durable storage.
- Add stronger audit logging for state changes, including which model response or user correction caused each update.
- Expand ambiguity handling with more fixtures from real intake conversations.
- Add end-to-end browser tests for the chat, correction form, and preview panes.
- Review all document language with qualified legal counsel before any real-world use.
