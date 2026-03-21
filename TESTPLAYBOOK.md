# Fluently Test Playbook

Two paths to interact with the Fluently 4D knowledge base:

| Path | When to use |
|---|---|
| **Custom MCP server** | Private knowledge, isolation, offline, automated contributions |
| **GitHub MCP** | Community knowledge, no server, agent reads repo directly |

---

## Path A — Custom MCP Server

### Prerequisites

```bash
# From source (dev)
npm ci
npm run build -w packages/scorer
npm run build -w packages/mcp-server

# Or globally from npm
npm install -g fluently-mcp-server
```

### Run the server

```bash
# Default: github-public connector (live knowledge, no auth)
node packages/mcp-server/dist/bin.js

# Local connector (offline / private knowledge)
FLUENTLY_CONNECTOR=local \
FLUENTLY_LOCAL_PATH=./knowledge \
node packages/mcp-server/dist/bin.js

# Private GitHub repo
FLUENTLY_CONNECTOR=github-private \
FLUENTLY_GITHUB_REPO=your-org/your-knowledge-repo \
FLUENTLY_GITHUB_TOKEN=ghp_xxx \
node packages/mcp-server/dist/bin.js
```

### Tool tests (copy-paste each line)

```bash
# 1. List all tools
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' \
  | node packages/mcp-server/dist/bin.js 2>/dev/null \
  | python3 -c "import sys,json; print([t['name'] for t in json.load(sys.stdin)['result']['tools']])"

# Expected: ['list_domains', 'find_relevant_cycles', 'get_cycle_detail',
#            'get_dimension_guidance', 'refresh_knowledge', 'contribute_cycle']


# 2. List domains and cycle counts
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_domains","arguments":{}}}' \
  | node packages/mcp-server/dist/bin.js 2>/dev/null \
  | python3 -c "
import sys,json
c = json.loads(json.load(sys.stdin)['result']['content'][0]['text'])
print(c['source'], '|', c['total'], 'cycles'); print(c['summary'])
"
# Expected: source=github-public | 16 cycles, breakdown by domain


# 3. Find relevant cycles for a task
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"find_relevant_cycles","arguments":{"task_description":"AI reviews pull requests for code quality","domain":"coding","limit":3}}}' \
  | node packages/mcp-server/dist/bin.js 2>/dev/null \
  | python3 -c "
import sys,json
c = json.loads(json.load(sys.stdin)['result']['content'][0]['text'])
for x in c['cycles']: print(x['id'], '-', x['title'])
"
# Expected: ranked list of coding cycles (e.g. code-review-triage first)


# 4. Get full cycle detail
echo '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"get_cycle_detail","arguments":{"id":"code-review-triage"}}}' \
  | node packages/mcp-server/dist/bin.js 2>/dev/null \
  | python3 -c "
import sys,json
c = json.loads(json.load(sys.stdin)['result']['content'][0]['text'])['cycle']
print(c['title'], '|', c['domain'])
for d in ['delegation','description','discernment','diligence']:
  print(f'  {d}: {c[\"dimensions\"][d][\"antipattern\"]}')
"
# Expected: title + 4 antipattern lines


# 5. Get dimension guidance (antipatterns + examples across a domain)
echo '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"get_dimension_guidance","arguments":{"dimension":"discernment","domain":"coding"}}}' \
  | node packages/mcp-server/dist/bin.js 2>/dev/null \
  | python3 -c "
import sys,json
c = json.loads(json.load(sys.stdin)['result']['content'][0]['text'])
print(c['dimension'], 'in', c['domain'])
for g in c['guidance']: print(' -', g['cycle'], '|', g['antipattern'])
"
# Expected: discernment antipatterns for all 4 coding cycles


# 6. Contribute a cycle — validation error (missing fields)
echo '{"jsonrpc":"2.0","id":6,"method":"tools/call","params":{"name":"contribute_cycle","arguments":{"cycle":{"id":"bad","title":"Incomplete"}}}}' \
  | node packages/mcp-server/dist/bin.js 2>/dev/null \
  | python3 -c "
import sys,json
c = json.loads(json.load(sys.stdin)['result']['content'][0]['text'])
print('success:', c['success']); print('message:', c['message'])
"
# Expected: success=False, validation errors listing missing required fields


# 7. Force refresh knowledge from connector
echo '{"jsonrpc":"2.0","id":7,"method":"tools/call","params":{"name":"refresh_knowledge","arguments":{}}}' \
  | node packages/mcp-server/dist/bin.js 2>/dev/null \
  | python3 -c "
import sys,json
c = json.loads(json.load(sys.stdin)['result']['content'][0]['text'])
print(c['message'])
"
# Expected: "Knowledge base refreshed from github-public. 16 cycles now available."
```

### Wire to Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "fluently": { "command": "4d-mcp-server" }
  }
}
```

With private knowledge:
```json
{
  "mcpServers": {
    "fluently": {
      "command": "4d-mcp-server",
      "env": {
        "FLUENTLY_CONNECTOR": "github-private",
        "FLUENTLY_GITHUB_REPO": "your-org/your-knowledge-repo",
        "FLUENTLY_GITHUB_TOKEN": "ghp_xxx"
      }
    }
  }
}
```

### Wire to Claude Code

In `.claude/settings.json` (project) or `~/.claude/settings.json` (global):

```json
{
  "mcpServers": {
    "fluently": { "command": "4d-mcp-server" }
  }
}
```

---

## Path B — GitHub MCP (no custom server)

Uses the [GitHub MCP server](https://github.com/github/github-mcp-server) to read the Fluently knowledge base directly from the public repo. No auth required for read access.

### Wire GitHub MCP

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxx" }
    }
  }
}
```

> Token is optional for public repo reads. Required only to open contribution PRs.

### Agent workflow (prompts to give Claude)

```
# Step 1 — Orient
Read the file KNOWLEDGE.md in the repo faical-yannick-congo/fluently (main branch).
Tell me the domains available and how to find cycles.

# Step 2 — Discover
Read knowledge/index.json in faical-yannick-congo/fluently.
List all cycles in the "coding" domain with their IDs and tags.

# Step 3 — Deep-read a cycle
Read the file knowledge/coding-code-review-triage.yaml.
Summarize the 4D guidance and identify which antipattern is most relevant
when an LLM is used without human sign-off.

# Step 4 — Find fit for your task
I want to use AI to summarize daily standup notes and flag blockers.
Read knowledge/index.json and then the YAML files for the 2 most likely
matching cycles. Reason over them and tell me which one fits best and why.
No numeric scores — just your assessment.

# Step 5 — Contribute (requires GitHub token)
I want to contribute a new cycle. Read KNOWLEDGE.md to understand the schema,
then help me fill in all 4D dimensions for this task:
"AI drafts customer support responses, human reviews before sending."
When done, open a PR to faical-yannick-congo/fluently adding the YAML file.
```

### Manual spot-checks

```bash
# Check index.json is valid and lists all cycles
python3 -c "
import json
d = json.load(open('knowledge/index.json'))
print('total:', d['total'])
print('domains:', list(d['byDomain'].keys()))
print('entries:', [e['id'] for e in d['entries']])
"

# Validate all YAML files against the schema
node -e "
const {knowledgeEntrySchema} = require('./packages/scorer/dist/schema.js');
const yaml = require('js-yaml');
const fs = require('fs');
const files = fs.readdirSync('knowledge').filter(f => f.endsWith('.yaml'));
let ok = 0, fail = 0;
for (const f of files) {
  try {
    knowledgeEntrySchema.parse(yaml.load(fs.readFileSync('knowledge/'+f,'utf8')));
    ok++;
  } catch(e) {
    console.error('FAIL', f, e.errors.map(x=>x.path+': '+x.message).join(', '));
    fail++;
  }
}
console.log(ok + ' valid, ' + fail + ' failed');
"

# Verify github-public connector can fetch live index
curl -s "https://raw.githubusercontent.com/faical-yannick-congo/fluently/main/knowledge/index.json" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('live total:', d['total'])"
```

---

## Quick comparison

| | Custom MCP server | GitHub MCP |
|---|---|---|
| **Setup** | `npm install -g fluently-mcp-server` | Add GitHub MCP server config |
| **Auth** | None for community, token for private | Optional for reads, required for PR |
| **Knowledge source** | Live GitHub fetch + 1h cache + offline fallback | Direct repo file reads |
| **Private knowledge** | Yes — private repo, fork, local, SQL/NoSQL | Only if repo is private |
| **Contribution** | `contribute_cycle` tool (automated or instructions) | Agent opens PR via GitHub MCP |
| **Offline** | Yes — bundled fallback | No |
| **Scoring** | None — agent reasons over ranked candidates | None — agent reasons over raw YAML |
