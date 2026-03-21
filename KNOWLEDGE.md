# Fluently Knowledge Base

This document is a navigation guide for agents and humans interacting with the Fluently 4D knowledge base — either directly via GitHub MCP or through a configured Fluently MCP server.

## What is a 4D cycle?

A **Fluently 4D cycle** is a validated pattern for a specific AI-assisted workflow. It describes four dimensions of good human-AI collaboration:

| Dimension | Question it answers |
|---|---|
| **Delegation** | Who owns the decision — human, AI, or both? What level of autonomy is appropriate? |
| **Description** | How should the task be framed so AI understands context fully? |
| **Discernment** | How do you evaluate whether the AI output is trustworthy? When do you push back? |
| **Diligence** | What human accountability is required after AI is involved? Who signs off? |

Each dimension includes:
- `description` — what good looks like
- `example` — a concrete, real-world instance
- `antipattern` — what to avoid

## Knowledge base structure

```
knowledge/
├── index.json                          ← pre-built index of all cycles (fetch this first)
├── coding-code-review-triage.yaml      ← individual cycle files
├── coding-test-case-generation.yaml
├── writing-content-development.yaml
└── ...
```

File naming: `{domain}-{id}.yaml`

## index.json format

```json
{
  "entries": [
    {
      "id": "code-review-triage",
      "title": "Code Review Triage",
      "domain": "coding",
      "tags": ["code-review", "triage", "automation"],
      "contributor": "Dakan & Feller",
      "version": "1.0.0",
      "summary": "...",
      "dimensions": {
        "delegation":  { "description": "...", "example": "...", "antipattern": "..." },
        "description": { "description": "...", "example": "...", "antipattern": "..." },
        "discernment": { "description": "...", "example": "...", "antipattern": "..." },
        "diligence":   { "description": "...", "example": "...", "antipattern": "..." }
      },
      "score_hints": { "delegation": 0.2, "description": 0.3, "discernment": 0.3, "diligence": 0.2 }
    }
  ]
}
```

## Available domains

coding · writing · research · education · legal · healthcare · general

## How to find a relevant cycle (GitHub MCP path)

1. Fetch `knowledge/index.json` — this gives you all cycles in one read
2. Reason over the entries to find the best match for the task at hand
3. Fetch the specific YAML file for full dimension detail if needed

Raw URL (no auth required — public repo):
```
https://raw.githubusercontent.com/faical-yannick-congo/fluently/main/knowledge/index.json
```

## How to contribute a new cycle (GitHub MCP path)

Contributions require a GitHub token. The cycle must:
1. Follow the YAML schema (all 4 dimensions, each with description + example + antipattern)
2. Have a unique `id` (kebab-case slug)
3. Belong to one of the supported domains
4. Include `score_hints` that sum to 1.0

Steps:
1. Fork https://github.com/faical-yannick-congo/fluently
2. Add your YAML to `knowledge/{domain}-{id}.yaml`
3. Open a pull request — CI will validate the schema automatically

## How to use the Fluently MCP server instead

Install and run:
```bash
npm install -g fluently-mcp-server
4d-mcp-server
```

Configure in your MCP client:
```json
{
  "mcpServers": {
    "fluently": { "command": "4d-mcp-server" }
  }
}
```

Default connector: `github-public` (fetches live from this repo, no auth needed).
For private knowledge, see `packages/mcp-server/README.md`.
