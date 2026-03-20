# @fluently/mcp-server

MCP (Model Context Protocol) server for the Fluently AI Fluency 4D Framework. Exposes tools for scoring human-AI collaboration quality across the four dimensions: Delegation, Description, Discernment, and Diligence.

## Installation

Install as a workspace dependency:

```bash
npm install
```

## Building

```bash
npm run build
# or in watch mode
npm run dev
```

## Running the Server

### Stdio Transport (Local Use)

The server runs on stdio by default, suitable for local IDE/editor integration:

```bash
npm start
# or directly
node dist/bin.js
```

The server will write logs to stderr and protocol messages to stdout.

### HTTP Transport (Optional Deployment)

To run the server over HTTP (for remote use, though not yet enabled by default), you would modify `src/index.ts` to use `HTTPServerTransport` instead:

```typescript
import { HTTPServerTransport } from "@modelcontextprotocol/sdk/server/http.js";

const transport = new HTTPServerTransport({
  host: "localhost",
  port: 3000,
});
```

Then rebuild and run.

## Configuration

### .mcp.json

The root `.mcp.json` file enables this server in compatible MCP clients:

```json
{
  "mcpServers": {
    "fluently": {
      "command": "node",
      "args": ["./packages/mcp-server/dist/bin.js"]
    }
  }
}
```

## Tools

### 1. compare_problem_space

Finds the top 3 similar past 4D plays from the knowledge base.

**Inputs:**
- `task_description` (string, required): Description of the problem or task
- `domain` (string, optional): Filter by domain (coding, writing, research, etc.)

**Output:** Array of similar knowledge entries with similarity scores

### 2. score_delegation

Scores the Delegation and Description dimensions with improvement advice.

**Inputs:**
- `task` (string, required): The task to evaluate
- `delegation_intent` (string, required): How you intend to delegate (automated, augmented, agentic)

**Output:** Delegation + Description scores with specific improvement recommendations

### 3. evaluate_discernment

Evaluates discernment for an AI output: hallucination risk, confidence calibration, and human review requirements.

**Inputs:**
- `ai_output` (string, required): The AI-generated output to evaluate
- `original_task` (string, required): The original task given to the AI

**Output:** Discernment score, hallucination risk percentage, confidence calibration, and human review guidance

### 4. check_diligence

Returns a diligence checklist: transparency requirements, accountability steps, and disclosure needs.

**Inputs:**
- `task` (string, required): The task to evaluate
- `domain` (string, required): The domain context

**Output:** Structured checklist for maintaining accountability and transparency

### 5. get_4d_score

Master tool returning a complete 4D Score (0-100 per dimension plus overall) with one-sentence improvement tips.

**Inputs:**
- `description` (string, required): Task description
- `delegation` (string, required): How the task is being delegated
- `output` (string, optional): AI output to evaluate for discernment

**Output:** Complete 4D profile with scores and improvement guidance

## Knowledge Base

The server loads knowledge entries from the `knowledge/` directory at the workspace root. Knowledge files are YAML and must follow the schema defined in `@fluently/scorer`.

Each entry defines best practices and antipatterns for all four dimensions across different domains.

## Architecture

- **Transport**: Stdio (primary) for local editor integration
- **Schema Validation**: via Zod in `@fluently/scorer`
- **Similarity Matching**: cosine similarity on keyword sets
- **Knowledge Loading**: dynamic from `knowledge/` directory at startup

## Development

To add new tools, edit `src/index.ts` and:

1. Define the Tool schema in a `*ToolDef` constant
2. Register it in the `tools/list` handler
3. Add the handler logic in the `tools/call` switch statement
4. Rebuild and test

## License

CC BY-NC-SA (inherited from fluently project)
