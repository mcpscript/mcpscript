<p align="center">
  <img src="assets/logo-256.png" alt="MCP Script Logo">
</p>
<p align="center">An Agent-Oriented Programming Language</p>
<p align="center">
  <a href="https://discord.gg/Wsy2NpnZDu"><img alt="discord" src="https://img.shields.io/discord/1439901831038763092?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/@mcpscript/cli"><img alt="npm" src="https://img.shields.io/npm/v/@mcpscript/cli?style=flat-square" /></a>
  <a href="https://github.com/sst/opencode/actions/workflows/publish.yml"><img alt="build status" src="https://img.shields.io/github/actions/workflow/status/mcpscript/mcpscript/release.yml?style=flat-square&branch=main" /></a>
</p>

<p align="center">
  <a href="https://atlassian.com/rovo-dev" target="_blank">Built with Atlassian Rovo Dev - #1 SWE-Bench Agent</a>
  <br/>
  <a href="https://github.com/run-llama/LlamaIndexTS" target="_blank">Based on LlamaIndex.TS</a> •
  <a href="https://github.com/tree-sitter/tree-sitter" target="_blank">Parsed with Tree-Sitter</a> •
  <a href="https://modelcontextprotocol.io" target="_blank">Designed around Model Context Protocol</a>
</p>

---

## The Problem Space

Most agentic applications require orchestrating both deterministic steps and intelligent agents.
Developers currently piece together these applications using general-purpose programming languages with external orchestration frameworks, often leading to:

- Verbose boilerplate for agent configuration, workflow orchestration and tool integration
- Difficulty expressing agentic workflows that seamlessly blend both deterministic and agentic logic
- Easy to introduce antipatterns that lead to brittle, unmaintainable codebases

## Introducing MCP Script

MCP Script is the first agent-oriented programming language specifically designed to express agentic applications.

Here's an example - a code review assistant that combines deterministic file operations with intelligent AI analysis:

```typescript
// 1. Declare a model to use
model gptoss {
  provider: "openai",
  apiKey: "ollama",
  baseURL: "http://localhost:11434/v1",
  model: "gpt-oss:20b",
  temperature: 0.3
}

// 2. Use an MCP server
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", "/workspace"]
}

// 3. You can make deterministic tool calls
code = filesystem.read_file({ path: "/workspace/src/api.ts" })
print(code)

// 4. Write tools like how you write functions
tool checkComplexity(filepath) {
  // Tools can call other tools
  code = filesystem.read_file({ path: filepath })
  lines = code.split("\n")
  if (lines.length > 200) {
    return "High complexity: " + lines.length + " lines"
  }
  return "Acceptable complexity"
}

// 5. Declare an agent with a mix of MCP and custom tools
agent CodeReviewer {
  model: gptoss,
  systemPrompt: "You are a senior software engineer conducting code reviews. Focus on security, performance, and maintainability. Use the provided tools to analyze code and save your findings.",
  tools: [
    filesystem,         // Import all tools from the MCP server
    checkComplexity,    // Custom tool
  ]
}

// 6. Let the agent analyze and create a report
conv = `Review the code at /workspace/src/api.ts and save a detailed report to /workspace/review.md.` -> CodeReviewer

// 7. Agent execution results in a conversation
print(conv.result())

// 8. Read and print the generated report
report = filesystem.read_file({ path: "/workspace/review.md" })
print(report)
```

## Getting Started

> **⚠️ Early Development Warning:** MCP Script is in early development and the language syntax, features, and APIs are subject to change. Use at your own risk in production environments.

### Installation

You can run MCP Script files directly using npx:

```bash
npx @mcpscript/cli run path/to/your-script.mcps
```

Or install the CLI globally for easier access:

```bash
npm install -g @mcpscript/cli
mcps run path/to/your-script.mcps
```

### CLI Commands

#### `mcps run <file>`

Executes an MCP Script file.

```bash
mcps run my-script.mcps
```

**Options:**

- `--timeout <ms>` - Set execution timeout in milliseconds (default: no timeout)

**Environment Variables:**

The CLI automatically loads environment variables from a `.env` file in the current working directory before running your script. This makes it easy to manage configuration and secrets:

```bash
# .env file
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://...
```

```typescript
// my-script.mcps
model gpt4 {
  provider: "openai",
  apiKey: env.OPENAI_API_KEY,
  model: "gpt-4"
}

print("Using database:", env.DATABASE_URL)
```

#### `mcps compile <file>`

Transpiles an MCP Script file to JavaScript without executing it.

```bash
mcps compile my-script.mcps
```

This outputs the generated JavaScript code to stdout, which can be useful for:

- Debugging transpilation issues
- Understanding how MCP Script code translates to JavaScript
- Integrating with custom build pipelines

## Language Specification

For detailed information about the MCP Script language syntax and features, see the [Language Specification](spec/mcp-script-spec.md).

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) to understand the expectations for all participants in our community.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a history of changes to this project.
