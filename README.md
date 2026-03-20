# 🎯 Fluently

> **Operationalize the AI Fluency 4D Framework** — Score, evaluate, and improve human-AI collaboration using a community-driven knowledge base and integrated developer tools.

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/) [![Node.js 20+](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue)](https://www.typescriptlang.org/)

---

## 🌟 What is Fluently?

**Fluently** brings the **AI Fluency 4D Framework** — developed by Dakan & Feller at Anthropic — into practice. It provides:

- 🧠 **4D Scoring**: Evaluate human-AI collaboration across four dimensions
  - **Delegation** — Role clarity and task distribution
  - **Description** — Context and framing quality
  - **Discernment** — Evaluation and verification practices
  - **Diligence** — Accountability and transparency

- 📚 **Community Knowledge Base**: YAML-defined best practices, patterns, and anti-patterns across domains (coding, writing, research, healthcare, legal, customer support, education)

- 🛠️ **Developer Tools**: CLI + MCP server for integration into IDEs, agents, and AI workflows

- 🔄 **Composable**: Mix and match tools for custom scoring workflows

---

## 🚀 Get Started

### Quick Install

```bash
git clone https://github.com/yourusername/fluently.git
cd fluently
npm install
npm run build
```

### Use the CLI

```bash
# Install the 4d CLI command globally
npm install -g ./packages/cli

# Score a delegation scenario
4d --task "Review user feedback for product roadmap" \
   --delegation "augmented" \
   --domain "product-management"

# Get a full 4D profile
4d score --description "Automated bug triage" \
         --along-with "check if output is correct"
```

### Use the MCP Server

Perfect for IDE integration and AI assistants:

```bash
# Start the server
npm run -w fluently-mcp-server start

# Available tools in your editor/agent:
# - compare_problem_space(task_description, domain?)
# - score_delegation(task, delegation_intent)
# - evaluate_discernment(ai_output, original_task)
# - check_diligence(task, domain)
# - get_4d_score(description, delegation, output?)
```

Or configure in `.mcp.json`:

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

---

## 📦 What's Included

### [`/packages/cli`](./packages/cli) — Command-line Interface
Interactive CLI using `commander.js` and the Anthropic SDK.

```bash
4d compare --task "Build a code review assistant"
# → Returns top 3 similar knowledge entries with scores
```

### [`/packages/mcp-server`](./packages/mcp-server) — Model Context Protocol Server
Exposes 4D tools for use in Claude, Claude for VS Code, and other MCP clients.

- **Transport**: Stdio (default) + HTTP (optional)
- **5 Tools**: Full 4D scoring + dimension-specific evaluation
- **Metadata**: Integrated server discovery

### [`/packages/scorer`](./packages/scorer) — Scoring Engine
Shared scoring logic used by both CLI and MCP server.

- Keyword-based similarity matching
- Dimension weighting
- Score normalization
- Zod schema validation

### [`/knowledge`](./knowledge) — Community Knowledge Base
YAML files defining 4D plays across domains. Each entry includes:

```yaml
id: bug-fix-prioritization
title: Bug Fix Prioritization
domain: coding
dimensions:
  delegation:
    description: Should this be automated, augmented, or agentic?
    example: AI suggests priorities; human PM approves final order
    antipattern: AI fully decides without human input
  # ... description, discernment, diligence
score_hints:
  delegation: 0.2
  description: 0.3
  discernment: 0.3
  diligence: 0.2
tags: [bug-fix, prioritization, coding]
contributor: Dakan & Feller
version: 1.0.0
```

---

## 🎓 The 4D Framework in Practice

### Dimension: Delegation
*Who decides? How should the task be split between human and AI?*

- **Automated**: AI makes the decision independently
- **Augmented**: AI generates options, human decides
- **Agentic**: AI acts with human oversight and accountability

### Dimension: Description  
*What context does the AI need to be effective?*

- Task requirements and constraints
- Domain-specific knowledge
- Success criteria
- Historical examples

### Dimension: Discernment
*How do you verify the AI output is trustworthy?*

- Hallucination detection
- Confidence calibration
- Cross-checking procedures
- Human review protocols

### Dimension: Diligence
*What accountability is required?*

- Transparency to stakeholders
- Audit trails and documentation
- Human approval sign-off
- Escalation procedures

---

## 📊 Tools & Capabilities

| Tool | Purpose | Use Case |
|------|---------|----------|
| **compare_problem_space** | Find similar past plays | Discover best practices for your scenario |
| **score_delegation** | Evaluate role clarity | Improve task distribution |
| **evaluate_discernment** | Assess trustworthiness | Determine review rigor needed |
| **check_diligence** | Accountability checklist | Ensure transparency and auditability |
| **get_4d_score** | Complete profile (0-100) | Holistic collaboration quality assessment |

---

## 🏗️ Architecture

```
fluently/
├── packages/
│   ├── cli/              → Command-line interface
│   ├── mcp-server/       → Model Context Protocol server
│   └── scorer/           → Shared scoring engine
├── knowledge/            → Community 4D plays (YAML)
├── site/                 → Documentation & explorer (TODO)
└── .mcp.json            → MCP server configuration
```

**Data Flow:**
1. **User Input** → CLI or MCP tool call
2. **Scoring Engine** → Loads knowledge, computes similarity, returns scores
3. **Output** → JSON with dimension scores + improvement tips

---

## 🔧 Development

### Prerequisites
- **Node.js 20+**
- **npm 10+** (or yarn, pnpm)

### Workspace Setup
```bash
npm install
npm run build
npm run dev        # Watch mode for all packages
npm test          # Run all tests
```

### Add a New Knowledge Entry
1. Create `knowledge/your-entry.yaml`
2. Follow the schema in [`packages/scorer/src/schema.ts`](packages/scorer/src/schema.ts)
3. Run validation: `npm run validate:schema`
4. Submit a PR 🎉

### Extend the Scoring Engine
Edit [`packages/scorer/src/engine.ts`](packages/scorer/src/engine.ts):
- Add similarity metrics
- Refine dimension weighting
- Implement new scoring modes

---

## 📋 API Reference

### CLI
```bash
4d compare --task "..." [--domain "..."]
4d score --description "..." --delegation "..." [--output "..."]
4d evaluate --ai-output "..." --original-task "..."
4d diligence --task "..." --domain "..."
```

### MCP Tools

All tools accept standard MCP request format. Example:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_4d_score",
    "arguments": {
      "description": "Automated customer support categorization",
      "delegation": "augmented",
      "output": "Suggested 5 categories; human reviews and adds custom ones"
    }
  }
}
```

---

## 📖 Examples

### Example 1: Code Review Triage
```bash
4d compare --task "Classify which reviews need priority" --domain coding
# Returns: code-review-triage entry with dimension details
```

### Example 2: Test Case Generation
Use the MCP server in Claude:
- **Input**: "Generate test cases for this function, but I want to verify each one"
- **Tool**: `score_delegation(task, "augmented")`
- **Output**: Guidance on how to set up the augmented workflow

### Example 3: Discernment Check
```
evaluate_discernment(
  ai_output: "5 critical bugs in the codebase",
  original_task: "Analyze this legacy module"
)
# Response: hallucination_risk_percent, confidence_calibration, human_review_needed
```

---

## 🤝 Contributing

We welcome contributions! Add knowledge, improve scoring, or extend tools.

### Guidelines
- **Knowledge**: Add YAML files to `/knowledge/` following the schema
- **Code**: TypeScript, Zod validation, tests in `__tests__` folders
- **License**: CC BY-NC-SA (non-commercial, share-alike)

### To Contribute
1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Add/update knowledge or code
4. Run tests and validation: `npm test && npm run validate:schema`
5. Submit a pull request

---

## 📄 License

**Fluently** is licensed under **CC BY-NC-SA 4.0** (Creative Commons Attribution-NonCommercial-ShareAlike).

- ✅ **Use freely** for non-commercial purposes
- ✅ **Share and adapt** with attribution
- ❌ **Commercial use** requires permission
- ℹ️ **Details**: [Full License](./LICENSE)

---

## 🙋‍♀️ FAQ

**Q: Can I use this commercially?**  
A: Contact the maintainers for a commercial license.

**Q: How do I add my own knowledge?**  
A: Submit a YAML file to the `knowledge/` directory following the schema.

**Q: Does Fluently work offline?**  
A: Yes! After building locally, all tools work without external APIs.

**Q: Can I integrate with my own AI model?**  
A: Yes. The MCP server is transport-agnostic. Replace the Anthropic SDK usage with your own model client.

---

## 🔗 Resources

- **Framework Paper**: [AI Fluency 4D Framework](https://anthropic.com/) (Dakan & Feller, Anthropic)
- **MCP Docs**: [Model Context Protocol](https://modelcontextprotocol.io/)
- **Knowledge Base**: See [`/knowledge`](./knowledge) for all entries
- **Issues & Discussions**: [GitHub Discussions](https://github.com/yourusername/fluently/discussions)

---

## 💡 Vision

Fluently aims to become the **standard reference implementation** of the AI Fluency 4D Framework—helping teams:

- Operationalize human-AI collaboration best practices
- Share learned patterns across organizations
- Improve AI output quality through structured evaluation
- Build accountable, transparent AI systems

**Join us in making AI collaboration fluent! 🚀**
