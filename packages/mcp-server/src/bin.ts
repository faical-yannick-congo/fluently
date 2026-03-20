#!/usr/bin/env node

import { start } from "./index.js";

start().catch((error) => {
  console.error("Failed to start Fluently MCP server:", error);
  process.exit(1);
});
