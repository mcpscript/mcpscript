# MCP Script Examples

This directory contains example `.mcps` files demonstrating the capabilities of MCP Script.

## Prerequisites

Before running examples, ensure you have:

- Node.js (v20 or higher)
- npm
- Built the project: `npm install && npm run build`
- **Ollama** (optional, for agent examples like `agent-system.mcps`)
  - Install from [ollama.ai](https://ollama.ai)
  - Pull the test model: `ollama pull gpt-oss:20b`

## Running Examples

Run any example from the project root:

```bash
npm run mcps -- run examples/hello.mcps
```
