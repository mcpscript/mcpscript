# MCP Script

## Technical Proposal: Language Specification

**Version:** 0.1.0
**Author:** [Kun Chen]
**Date:** October 2025
**Status:** Draft for Technical Review

---

## 1. Introduction & Motivation

### The Problem Space

Modern agentic workflows require orchestrating both deterministic computational steps and agent-driven intelligent decision-making. Developers currently piece together these workflows using general-purpose languages with external orchestration frameworks, leading to:

- Verbose boilerplate for agent configuration and tool provisioning
- Unclear boundaries between deterministic and agent-delegated execution
- Poor integration with tool ecosystems like the Model Context Protocol (MCP)
- Difficulty expressing hybrid workflows that seamlessly blend both paradigms

### Why MCP Script?

MCP Script is a scripting language designed specifically for building agentic workflows with native support for MCP servers. MCP Script treats agents and tools as first-class language constructs, making it natural to express complex logic where some steps execute deterministically while others are delegated to intelligent agents.

### Design Goals

1. **MCP-Native**: Treat MCP servers and tools as first-class citizens
2. **Composability**: Enable easy composition of workflows, tools, and agents
3. **Type Safety**: Provide strong typing with inference for compile-time safety while maintaining concise syntax
4. **Familiarity**: Follow TypeScript conventions for most non-MCP features

**⚠️ Important Compatibility Notes:**

MCP Script syntax is **inspired by TypeScript** but is **NOT a TypeScript superset or extension**.

- ✅ Uses familiar TypeScript-like syntax for types, control flow, and collections
- ❌ **NOT compatible with TypeScript code** - different execution semantics
- ❌ **NOT guaranteed to work with arbitrary npm packages**
- ❌ **NOT a drop-in replacement for JavaScript/TypeScript**

### Implementation Strategy

MCP Script is implemented as a **VM-based interpreter**:

- **Source language**: `.mcps` files with MCP-specific extensions
- **Execution model**: In-memory transpilation to JavaScript executed in Node.js VM sandbox
- **Transpiler**: Written in TypeScript
- **Runtime**: TypeScript-based runtime library with dependency injection
- **Distribution**: Single CLI interpreter (`mcps run`) - no build step required
- **Security**: Sandboxed execution with controlled access to system resources

### Quick Example

Here's a simple MCP Script script that demonstrates the language's simplicity:

```mcps
// hello.mcps
mcp filesystem {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem"]
}

// Top-level code runs immediately
message = "Hello from MCP Script!"
print(message)

// Write to a file
filesystem.writeFile("greeting.txt", message)
print("Greeting saved!")
```

Run with: `mcps run hello.mcps`

---

## 2. Fundamental Syntax Elements

### Basic Types

MCP Script uses **TypeScript-like type syntax**:

```mcps
name: string = "Alice"
age: number = 30
score: number = 98.6
isActive: boolean = true
data: any = {"key": "value"}  // For JSON-like dynamic data
```

The type syntax is familiar to TypeScript developers, using similar primitives, union types, and type annotations.

### Collections

MCP Script uses **TypeScript-like collection syntax**:

```mcps
// Arrays - literal syntax with square brackets
items: string[] = ["apple", "banana", "orange"]
numbers = [1, 2, 3, 4, 5]

// Sets - runtime function syntax
uniqueIds = Set([1, 2, 3, 4, 5])
tags = Set(["javascript", "typescript", "go"])
emptySet = Set()

// Maps - runtime function syntax with array of tuples
userAges = Map([
    ["alice", 25],
    ["bob", 30],
    ["carol", 28]
])
emptyMap = Map()

// Objects - literal syntax for structured data (like JSON)
config = {
    host: "localhost",
    port: 8080,
    enabled: true
}
user = {name: "Alice", email: "alice@example.com"}
emptyObject = {}
```

### Variable Declarations

Variables are declared using assignment syntax and are always mutable:

```mcps
name = "Alice"     // type inferred as string
count = 0          // type inferred as number
count = count + 1  // reassignment (all variables are mutable)

// Explicit type annotation (optional)
port: number = 8080
```

**Type System Philosophy:**

MCP Script uses **runtime type validation** with optional type annotations:

- Type annotations are **optional** - use them where validation is needed
- When provided, types are **validated at runtime** using Zod (not during transpilation)
- **No static type checking** - keeps the transpiler simple and fast
- Validation happens when tools are called, providing clear error messages
- All tools are implicitly async behind the scenes

See Section 5 for complete details on tool syntax and type annotations.

### Control Flow

MCP Script uses **TypeScript-like control flow syntax**:

```mcps
// Conditionals (TypeScript-style, parentheses required)
if (condition) {
    // execute
} else if (otherCondition) {
    // execute
} else {
    // execute
}

// Loops (TypeScript-style)
for (item of collection) {
    // process item
}

// Iterating over Maps
userData = Map([["alice", 25], ["bob", 30]])

for ([key, value] of userData) {
    print(`${key} is ${value} years old`)
}

while (condition) {
    // execute
}
```

All control flow is familiar to JavaScript/TypeScript developers.

### Tool Declarations

Tools are declared using the `tool` keyword with optional type annotations:

```mcps
tool processData(input) {
    content = filesystem.readFile(input)
    return JSON.parse(content)
}
```

Tools support optional type annotations for runtime validation. See Section 5 for complete details on tool syntax, type annotations, and async execution.

### Trailing Commas

MCP Script supports optional trailing commas in all comma-separated contexts (objects, arrays, tool parameters, etc.). This improves developer experience by:

- Producing cleaner git diffs when adding items
- Preventing syntax errors when reordering or commenting out items
- Following modern language conventions

```mcps
// Both styles are valid
config = {
  host: "localhost",
  port: 8080,      // trailing comma optional
}

items = [
  "first",
  "second",
  "third",         // trailing comma optional
]

mcp github {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],  // trailing comma optional
}
```

### String Literals

MCP Script supports single and double-quoted strings with escape sequences:

```mcps
message = "Hello, world!"
path = '/home/user/file.txt'

// Multi-line strings use escape sequences
longText = "This is a long string\nthat spans multiple lines\nusing escape sequences"

// String interpolation (template literals) - see Phase 15
greeting = `Hello, ${name}!`
```

**Triple-Quoted Strings for Prompts:**

For writing multi-line prompts (especially agent system prompts), MCP Script supports triple-quoted strings with automatic indentation adjustment:

```mcps
systemPrompt = """
    You are a data analyst. Analyze the provided data
    and generate insights using the available tools.

    Always provide clear explanations for your analysis.
    """
```

The parser automatically removes common leading whitespace from triple-quoted strings, making them ideal for readable prompt definitions.

---

## 3. MCP Server Integration Syntax

### Server Declaration

MCP servers are declared using the `mcp` keyword following standard MCP configuration conventions. Servers can be configured to run as local processes or connect to remote HTTP/SSE endpoints:

```mcps
// Local process-based MCP server
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/project"],
  env: {
    HOME: env.HOME
  }
}

// Local process with environment variables
mcp github {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
  env: {
    GITHUB_TOKEN: env.GITHUB_TOKEN
  }
}

// Remote HTTP/SSE server
mcp database {
  url: "http://localhost:3000/mcp",
  headers: {
    AUTHORIZATION: "Bearer $DB_API_KEY"
  }
}
```

### Environment Variables

Environment variables are accessed through the globally available `env` object:

```mcps
// Environment variables accessed via env object (no import needed)
token = env.GITHUB_TOKEN
port = env.PORT ?? 3000  // Default if not set

// In string interpolation (TypeScript template literals)
message = `Token is: ${env.GITHUB_TOKEN}`
path = `/home/${env.USER}_backup`

// In MCP configurations
mcp github {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
  env: {
    GITHUB_TOKEN: env.GITHUB_TOKEN,
    API_KEY: env.API_KEY
  }
}

// Can also use in computations
baseUrl = `https://api.example.com/${env.REGION}/v1`
timeout = env.REQUEST_TIMEOUT
```

### Tool Invocation (Deterministic)

Tools from MCP servers can be invoked directly as deterministic steps:

```mcps
// Direct tool call with error handling
fileContent = filesystem.readFile("/path/to/file.txt")

// Tool call with explicit error handling
try {
    issue = github.createIssue(title, body)
    // Use issue...
} catch (e) {
    throw e  // Re-throw or handle
}
```

---

## 4. Model Configuration Syntax

### Model Declaration

Models are declared as top-level constructs with their endpoints, parameters, and capabilities:

```mcps
// Anthropic model via API
model claude {
    provider: "anthropic"
    url: "https://api.anthropic.com/v1/messages"
    model: "claude-3-opus-20240229"
    apiKey: env.ANTHROPIC_API_KEY
    temperature: 0.7
    maxTokens: 4000
}

// OpenAI model
model gpt4 {
    provider: "openai"
    url: "https://api.openai.com/v1/chat/completions"
    model: "gpt-4-turbo-preview"
    apiKey: env.OPENAI_API_KEY
    temperature: 0.5
    maxTokens: 8000
    topP: 0.9
}

// Local model via Ollama
model localLlama {
    provider: "ollama"
    url: "http://localhost:11434/api/generate"
    model: "llama2:70b"
    temperature: 0.3
}

// Custom endpoint with headers
model customModel {
    provider: "custom"
    url: "https://my-llm-gateway.com/v1/completions"
    model: "internal-model-v2"
    headers: {
        Authorization: "Bearer $CUSTOM_API_KEY",
        "X-Organization-Id": "org-123"
    }
    temperature: 0.8
    maxTokens: 2000
    timeout: 30s
}
```

### Model Parameters

Models support various configuration parameters depending on the provider:

- **Common parameters:**
  - `provider`: The model provider type ("anthropic", "openai", "ollama", "custom")
  - `url`: API endpoint URL
  - `model`: Model identifier
  - `temperature`: Sampling temperature (0.0 to 1.0)
  - `maxTokens`: Maximum response tokens
  - `timeout`: Request timeout

- **Provider-specific parameters:**
  - OpenAI: `topP`, `frequencyPenalty`, `presencePenalty`, `stop`
  - Anthropic: `topK`, `topP`
  - Custom providers can define any additional parameters

---

## 5. Tools and Async Execution

### Overview

In MCP Script, tools are the fundamental unit of composition. Tools can:

- Perform computations
- Call MCP tools (async by default)
- Delegate tasks to agents
- Call other tools (async by default)

Tools have explicit type signatures at their boundaries and use type inference within their bodies.

### Basic Tool Syntax

```mcps
// Simple tool
tool calculateScore(points, multiplier) {
    return points * multiplier
}

// Tool with logic
tool processFile(path) {
    content = filesystem.readFile(path)
    parsed = JSON.parse(content)
    return parsed
}

// Tool calling other tools
tool analyzeData(inputPath) {
    data = processFile(inputPath)
    score = calculateScore(data["points"], data["multiplier"])
    return score
}
```

### Tool Type Signatures

Tools support optional type annotations for runtime validation:

```mcps
// With type annotations (validated at runtime with Zod)
tool myWorkflow(param1: string, param2: number): boolean {
    // Types are checked when tool is called
    // If param1 is not a string or param2 is not a number, throws error
    return param1.length > param2
}

// Without type annotations (no validation)
tool flexibleTool(param1, param2) {
    // No type checking
    return param1 + param2
}

// Supported type annotations:
// - Primitives: string, number, boolean, any
// - Arrays: string[], number[], any[]
// - Objects: { key: string, value: number }
// - Union types: string | number
// - Optional: param?: string
```

**Runtime Validation Behavior:**

- Type checks happen when tool is **called**, not when defined
- Invalid arguments throw a runtime error with clear message
- Return type is validated when tool returns
- Uses Zod schemas generated from type annotations

### Async Execution Model

In MCP Script, all tool calls are asynchronous by default. This enables natural parallel execution without special syntax:

**Key principles:**

1. **Async operations start immediately** when called
2. Values are **implicitly awaited**

---

## 6. Agent Configuration Syntax

### Agent Declaration

Agents are declared with a reference to a model and their available tools. Tools can be MCP server tools or user-defined tools:

```mcps
// Define custom tools
tool analyzeData(data: string): string {
    parsed = JSON.parse(data)
    return `Found ${parsed.length} records`
}

tool formatReport(content: string): string {
    return `# Report\n\n${content}`
}

agent DataAnalyst {
    model: claude  // References the 'claude' model declared earlier

    systemPrompt: """
        You are a data analyst. Analyze the provided data
        and generate insights using the available tools.
    """

    tools: [
        filesystem.readFile,    // MCP server tool
        filesystem.writeFile,   // MCP server tool
        database.query,         // MCP server tool
        analyzeData,            // User-defined tool
        formatReport            // User-defined tool
    ]

    // Optional: Override model parameters for this agent
    temperature: 0.5  // Overrides the model's default temperature
}

// Agent using a different model
agent CreativeWriter {
    model: gpt4

    systemPrompt: "You are a creative writer who crafts engaging narratives."

    tools: [
        filesystem.writeFile,  // MCP server tool
        formatReport           // User-defined tool
    ]

    temperature: 0.9  // Override for more creative output
    maxTokens: 10000  // Override for longer responses
}
```

### Agent Invocation and Conversations

Agents are invoked using the `->` operator, which creates and manages conversations - representing the full context and state of an LLM interaction. This enables powerful patterns like agent handoffs, multi-step workflows, and context preservation.

#### Basic Agent Invocation

```mcps
// String literals implicitly create conversations
conv = "Analyze customer satisfaction trends for Q3 2024" -> DataAnalyst

// Simple one-shot invocation
result = "Review this code for security issues: ${code}" -> CodeReviewer
```

#### Multi-Message Conversations

```mcps
// Build up conversation context
conv = "Here's our customer data: ${customerData}" -> DataAnalyst
conv += "What trends do you see?"
conv = conv -> DataAnalyst
conv += "Can you be more specific about the Q3 decline?"
conv = conv -> DataAnalyst
```

#### Agent Handoffs

```mcps
// Start with one agent
conv = "Analyze this sales data: ${data}" -> DataAnalyst
conv += "Now write a professional report based on your analysis"

// Hand off to another agent (preserves full conversation context)
conv = conv -> ReportWriter

// ReportWriter sees the entire conversation history including DataAnalyst's analysis
```

#### Tool Integration

```mcps
tool analyzeWithAgent(inputPath) {
    conv = "Analyze the file at ${inputPath} and create a summary report" -> DataAnalyst
    conv += "Save the report to report.md"
    conv = conv -> DataAnalyst

    return conv
}
```

#### Conditional Agent Usage

```mcps
tool intelligentProcessing(data, useAgent) {
    if (useAgent) {
        result = "Process this data: ${data}" -> DataAnalyst
        return result.getLastMessage()
    } else {
        return standardProcess(data)
    }
}
```

---

## 7. Error Handling & State Management

### Error Handling

MCP Script uses standard try-catch for error handling:

```mcps
tool riskyOperation() {
    if (somethingWrong) {
        throw "Operation failed"
    }
    return "success"
}

// Usage with try-catch
try {
    value = riskyOperation()
    print(value)
} catch (error) {
    print("Error:", error)
}
```

Errors thrown from async operations (like MCP tool calls) are caught just like synchronous errors.

### Tool Error Handling

````mcps
tool robustFileRead(path) {
    try {
        data = filesystem.readFile(path)
        return JSON.parse(data)
    } catch (e) {
        log.error(`Failed to read file: ${e}`)
        return null
    }
}

### State Persistence

For long-running tools that need checkpointing and recovery, MCP Script provides state management primitives:

```mcps
tool processLargeDataset(items) {
    state = {
        checkpoint: "",
        progress: 0
    }

    for (item of items) {
        processItem(item)
        state.progress += 1
        state.checkpoint = item
        persist(state)  // Save state for recovery
    }
}
````

Note: The detailed semantics of state persistence and tool recovery will be defined in a future proposal on runtime architecture.

---

## 8. Logging & Observability

### Logging and Output

MCP Script provides globally available logging and output functions:

```mcps
tool processData(input) {
    // Simple console output (globally available)
    print("Starting processing...")

    // Structured logging (globally available)
    log.debug("Input received", { length: input.length })
    log.info(`Processing ${input.length} bytes`)
    log.warn("Large input detected")
    log.error("Failed to process", { error: "..." })

    data = parseData(input)
    log.info("Successfully parsed", { records: data.length })

    return data
}
```

### Log Structure

All logs follow a structured format for machine readability:

```json
{
  "timestamp": "2025-01-02T10:30:00.123Z",
  "source": "system" | "user",
  "workflow": "processData",
  "executionId": "exec-abc123",
  "level": "debug" | "info" | "warn" | "error",

  // For system logs
  "event": "workflow.start" | "agent.start" | "tool.call" | ...,
  "details": { /* event-specific data */ },

  // For user logs
  "message": "user message",
  "data": { /* optional structured data */ }
}
```

### System vs User Logs

The runtime automatically generates system logs for observability:

```mcps
tool example(path) {
    // System log: {"source": "system", "event": "tool.start", "tool": "example"}

    log.info("Reading file")  // User log: {"source": "user", "message": "Reading file"}

    // System log: {"source": "system", "event": "tool.call", "tool": "filesystem.readFile"}
    content = filesystem.readFile(path)
    // System log: {"source": "system", "event": "tool.complete", "tool": "filesystem.readFile", "duration": 45}

    // System log: {"source": "system", "event": "agent.start", "agent": "DataAnalyst"}
    result = "Analyze this content: ${content}" -> DataAnalyst
    // System log: {"source": "system", "event": "agent.complete", "tokens": 1234, "duration": 2300}

    return result
    // System log: {"source": "system", "event": "tool.complete", "tool": "example"}
}
```

### Automatic System Logging

The MCP Script runtime automatically logs:

- **Tool lifecycle**: start, complete, error (for both user-defined and MCP tools)
- **Agent delegations**: start, complete, tokens used, duration
- **Error propagation**: error source, stack trace
- **Performance metrics**: execution time, memory usage

Example system log entries:

```json
// User-defined tool start
{
  "source": "system",
  "event": "tool.start",
  "tool": "processData",
  "executionId": "exec-123",
  "timestamp": "2025-01-02T10:30:00.000Z"
}

// MCP tool call
{
  "source": "system",
  "event": "tool.call",
  "tool": "filesystem.readFile",
  "params": {"path": "/data.json"},
  "executionId": "exec-123",
  "timestamp": "2025-01-02T10:30:00.100Z"
}

// MCP tool complete
{
  "source": "system",
  "event": "tool.complete",
  "tool": "filesystem.readFile",
  "duration": 45,
  "executionId": "exec-123",
  "timestamp": "2025-01-02T10:30:00.145Z"
}

// Agent delegation
{
  "source": "system",
  "event": "agent.complete",
  "agent": "CodeReviewer",
  "tokens": 2500,
  "duration": 3400,
  "executionId": "exec-123",
  "timestamp": "2025-01-02T10:30:03.500Z"
}
```

### Log Configuration

Logging behavior can be configured at runtime:

```mcps
// Via environment variables
LOG_LEVEL=debug         // Minimum log level
LOG_FORMAT=json         // json or text
LOG_SYSTEM=true         // Include system logs
LOG_DEST=stderr         // stdout, stderr, or file path
```

This design ensures that:

- **System observability** is built-in and automatic
- **User debugging** is straightforward with familiar log levels
- **Log consumers** can easily filter between system and user logs
- **Tracing** is possible via execution IDs
- **Performance analysis** is enabled through automatic metrics

---

## 9. Execution Model

### VM-Based Interpreter

MCP Script uses a **VM-based interpreter** with in-memory transpilation. When you run a `.mcps` file with `mcps run`, the following happens:

1. **Parse**: Source code is parsed into an Abstract Syntax Tree (AST)
2. **Transpile**: AST is transpiled to JavaScript in-memory (no files written)
3. **Inject**: Runtime dependencies are injected into a Node.js VM context
4. **Execute**: Generated JavaScript runs in a sandboxed VM environment

### Dependency Injection

The VM context is pre-populated with all required dependencies:

```javascript
// VM Context (automatically available, no imports needed)
const context = {
  // MCP SDK components
  MCPClient: Client, // @modelcontextprotocol/sdk
  StdioClientTransport: StdioClientTransport,

  // Runtime functions
  print: runtimeModule.print, // @mcpscript/runtime
  log: runtimeModule.log,
  env: runtimeModule.env,

  // Selective Node.js APIs
  console: console,
  process: safeProcess, // Limited process object
};
```

### Security & Sandboxing

The VM execution provides controlled access to system resources:

- **File system**: No direct access (must use MCP tools)
- **Network**: No direct access (must use MCP tools)
- **Process**: Limited access (no arbitrary command execution)
- **Modules**: No dynamic `require()` or `import()`

### Generated Code Structure

The transpiler generates JavaScript that assumes dependencies are globally available:

```mcps
// Declarations (transpiled to runtime initialization)
mcp filesystem {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem"]
}

// Tool definitions (transpiled to async functions)
tool loadData(path) {
    content = filesystem.readFile(path)
    return JSON.parse(content)
}

// Top-level code - executes when running the file
log.info("Starting data processing")

data = loadData("input.json")
log.info(`Loaded ${data.length} records`)

// Process the data...
print("Processing complete!")
```

### File Types

MCP Script files can serve different purposes:

**1. Executable Scripts** - Top-level code that runs directly:

```mcps
// script.mcps
log.info("Running backup job")
files = filesystem.listFiles("/data")
for (file of files) {
    filesystem.copyFile(file, "/backup/${file}")
}
```

**2. Libraries** - Only tool definitions, no top-level execution:

```mcps
// utils.mcps
tool validateEmail(email) {
    return email.contains("@")
}

tool formatDate(date) {
    // formatting logic
}
```

**3. Mixed** - Reusable tools with executable script:

```mcps
// process.mcps
tool transform(data) {
    // reusable transformation
}

// Top-level code runs when executed directly, but not when imported
data = loadData("input.json")
result = transform(data)
print(result)
```

### Running MCP Script Files

```bash
# Transpile and execute a MCP Script file
mcps run script.mcps

# Or transpile first, then run with Node.js
mcps build script.mcps  # Outputs script.js
node script.js

# Pass arguments (accessible via standard process.argv)
mcps run script.mcps --input=data.json --verbose

# All top-level code executes from top to bottom (ES module semantics)
```

---

## 10. Module System & Imports

### Import Syntax

MCP Script uses ES module-style imports to share code between `.mcps` files:

```mcps
// Named imports from other .mcps files
import { processData, validateEmail } from "./utils.mcps"  // Import tools
import { claude, gpt4 } from "./models.mcps"              // Import models
import { filesystem, github } from "./connections.mcps"    // Import MCP servers
import { DataAnalyst, CodeReviewer } from "./agents.mcps"  // Import agents

// Import all as namespace
import * as utils from "./utils.mcps"

// Use imported items
data = processData(input)
isValid = utils.validateEmail(email)
```

**⚠️ Import Limitations:**

- ✅ Importing from other `.mcps` files works
- ❌ Importing from `.js` or `.ts` files is **NOT supported**
- ❌ Importing from npm packages is **NOT supported**

The focus is on MCP-native scripting. For external functionality, use MCP tools rather than npm packages.

### Runtime Library

The MCP Script runtime provides globally available functions and objects:

**Globally Available (no import required):**

**Logging:**

- `log.debug(message, data?)` - Debug level logging
- `log.info(message, data?)` - Info level logging
- `log.warn(message, data?)` - Warning level logging
- `log.error(message, data?)` - Error level logging

**Environment:**

- `env` - Object providing access to environment variables (e.g., `env.API_KEY`)

**Output:**

- `print(value)` - Print a value to stdout (convenience function)

**Collections:**

- `Set(elements?)` - Create a new Set from an optional array of elements
- `Map(entries?)` - Create a new Map from an optional array of [key, value] tuples

**Data Utilities:**

- `JSON.parse(text)` - Parse JSON string into an object
- `JSON.stringify(value)` - Convert a value to JSON string

**Import Behavior:**
Top-level execution code in imported files does not run, eliminating the need for main module detection. When a file is imported, only its declarations (tools, agents, models, etc.) are made available.

### What Can Be Imported

**Importable declarations:**

- **Tools** - Reusable tools
- **Agents** - Agent configurations
- **Models** - Model configurations
- **MCP servers** - Server connections
- **Variables or constants**

**Not importable:**

- Top-level executable code

**Note:** The module system is not yet implemented. See execution backlog Phase 10 for planned features.

### Import Behavior

When a file is imported, only its declarations are made available. Top-level code does NOT execute during import:

```mcps
// lib.mcps
mcp filesystem {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem"]
}

tool processFile(path) {
    content = filesystem.readFile(path)
    return JSON.parse(content)
}

// This top-level code only runs when `mcps run lib.mcps` is called directly
// It does NOT run when lib.mcps is imported
print("Processing files...")
files = filesystem.listFiles("*.json")
for (file of files) {
    processFile(file)
}
```

```mcps
// main.mcps
import { processFile, filesystem } from "./lib.mcps"

// The print() and file processing loop from lib.mcps did NOT execute
// We can use the imported declarations
result = processFile("data.json")
```

---
