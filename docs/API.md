# API Contract

The backend keeps a single in-memory intake session for this assessment build.

## GET /api/session

Returns the current session.

```json
{
  "state": {
    "full_name": null,
    "home_address": null,
    "covers_worldwide_assets": null,
    "has_children": null,
    "children": null,
    "executor": {
      "name": null,
      "relationship": null
    },
    "specific_gifts": null,
    "additional_wishes": null
  },
  "history": [],
  "draft_document": "..."
}
```

## POST /api/chat

Accepts a user message, validates the model-style extraction, updates structured state, and returns the updated preview data.

```json
{
  "message": "My executor is my brother James."
}
```

## PATCH /api/state

Accepts a partial state patch from the preview form for corrections.

```json
{
  "executor": {
    "name": "James Smith",
    "relationship": "brother"
  }
}
```

## POST /api/reset

Starts over with an empty intake state and a fresh assistant greeting.
