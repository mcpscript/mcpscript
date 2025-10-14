# MCP Script

## Technical Proposal: Syntax Specification

**Version:** 0.1.0
**Author:** [Your Name]
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

MCP Script is a scripting language designed specifically for building agentic workflows with native support for MCP servers. MCP Script treats agents and tools as first-class language constructs, making it natural to express complex workflows where some steps execute deterministically while others are delegated to intelligent agents.

### Design Goals

1. **Clarity**: Make the distinction between deterministic and agent-driven execution explicit in syntax
2. **MCP-Native**: Treat MCP servers and tools as first-class citizens
3. **Composability**: Enable easy composition of workflows, tools, and agents
4. **Readability**: Prioritize code that reads like a workflow specification
5. **Type Safety**: Provide strong typing with inference for compile-time safety while maintaining concise syntax
6. **Scriptability**: Support both simple scripts and complex orchestrations with the same language

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
filesystem.writeFile("greeting.txt", message)?
print("Greeting saved!")
```

Run with: `mcps run hello.mcps`

---

## 2. Core Syntax Principles

### Design Philosophy

MCP Script's syntax is guided by several key principles:

- **Declarative where possible, imperative where necessary**: Workflow structure should be clear and readable
- **Async by default**: All tool and workflow calls are asynchronous, enabling natural parallel execution
- **Explicit agent boundaries**: When control passes to an agent, it should be syntactically obvious
- **Tool-centric thinking**: Tools are the atomic units of work
- **Unified composition model**: Workflows compose by calling other workflows

### First-Class Constructs

The following are first-class language constructs in MCP Script:

- MCP servers and their connections
- Models and their configurations
- Tools (both as deterministic calls and agent-available capabilities)
- Agents and their configurations
- Workflows (the only callable unit)

---

## 3. Fundamental Syntax Elements

### Basic Types

MCP Script provides standard primitive types with familiar TypeScript-like names:

```mcps
name: string = "Alice"
age: number = 30
score: number = 98.6
isActive: boolean = true
data: any = {"key": "value"}  // For JSON-like dynamic data
```

### Collections

```mcps
items: string[] = ["apple", "banana", "orange"]
mapping: Map<string, number> = {"a": 1, "b": 2}
unique: Set<number> = {1, 2, 3}
```

### Variable Declarations

MCP Script uses strong typing with type inference. Variables are declared with simple assignment syntax:

```mcps
name = "Alice"           // type inferred as string
count = 0                // type inferred as number
count = count + 1        // reassignment

// Explicit type annotation (optional for local variables)
port: number = 8080
```

**Type System Philosophy:**

MCP Script requires explicit type annotations at API boundaries to ensure safety and clarity:

- Workflow parameters and return types

Within workflow bodies, types are inferred from context:

- Variable assignments infer types from the right-hand side
- MCP tool calls infer return types from tool schemas
- Operations preserve type information through the workflow

This approach provides compile-time type safety while keeping workflow code concise and readable.

```mcps
// Types required at boundaries
workflow processData(path: string): Result<any, Error> {  // Required
    content = filesystem.readFile(path)?  // Inferred as string
    parsed = JSON.parse(content)?         // Inferred as any
    return Ok(parsed)
}

workflow analyzeData(inputPath: string): Result<number, Error> {
    data = processData(inputPath)?  // Inferred as any from processData return type
    return Ok(data["count"])
}
```

### Control Flow

```mcps
// Conditionals
if condition {
    // execute
} else if otherCondition {
    // execute
} else {
    // execute
}

// Loops
for item in collection {
    // process item
}

// Iterating over Maps - destructure key-value pairs
userData: Map<string, number> = {"alice": 25, "bob": 30, "carol": 28}

for (key, value) in userData {
    print("${key} is ${value} years old")
}

while condition {
    // execute
}
```

### Workflows

Workflows are declared with typed parameters and return types using TypeScript-like syntax:

```mcps
workflow processData(input: string): Result<any, Error> {
    content = filesystem.readFile(input)?
    parsed = JSON.parse(content)?
    return Ok(parsed)
}
```

See Section 5 for complete details on workflow syntax.

### Trailing Commas

MCP Script supports optional trailing commas in all comma-separated contexts (objects, arrays, function parameters, etc.). This improves developer experience by:

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

---

## 4. MCP Server Integration Syntax

### Server Declaration

MCP servers are declared using the `mcp` keyword following standard MCP configuration conventions. Servers can be configured to run as local processes or connect to remote HTTP/SSE endpoints:

```mcps
// Local process-based MCP server
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/project"],
  env: {
    HOME  // Shorthand for HOME: HOME (reads from environment)
  }
}

// Local process with environment variables
mcp github {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
  env: {
    GITHUB_TOKEN  // Shorthand syntax
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

Environment variables are implicitly accessible as variables throughout MCP Script programs. Whenever a variable is referenced that doesn't exist in the current scope, MCP Script checks if an environment variable with that name exists and uses its value.

```mcps
// Environment variables can be used directly as variables
token = GITHUB_TOKEN  // Reads from environment if no local variable exists

// In string interpolation
message = "Token is: $GITHUB_TOKEN"
path = "/home/${USER}_backup"

// In MCP configurations - use regular variable references
mcp github {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
  env: {
    GITHUB_TOKEN: GITHUB_TOKEN,  // Pass environment variable to MCP server
    API_KEY: API_KEY
  }
}

// Shorthand when key and value are the same
mcp github {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
  env: {
    GITHUB_TOKEN,  // Equivalent to GITHUB_TOKEN: GITHUB_TOKEN
    API_KEY
  }
}

// Can also use in computations
baseUrl = "https://api.example.com/$REGION/v1"
timeout = REQUEST_TIMEOUT  // Reads from environment
```

**Variable Resolution Order:**

1. Local variables in current scope
2. Environment variables
3. Error if neither exists

This design means environment variables behave like implicitly-declared global constants, making configuration and secrets management natural and straightforward.

**Escaping Dollar Signs:**

To include a literal `$` character in a string without triggering variable interpolation, use a backslash escape:

```mcps
price = "This item costs \$50"           // Literal: "This item costs $50"
regex = "Match \$[0-9]+ for prices"      // Literal: "Match $[0-9]+ for prices"
message = "Use \$VAR or \${VAR} syntax"  // Literal: "Use $VAR or ${VAR} syntax"
```

Other common escape sequences are also supported:

- `\n` - newline
- `\t` - tab
- `\\` - backslash
- `\"` - quote

### Tool Invocation (Deterministic)

Tools from MCP servers can be invoked directly as deterministic steps:

```mcps
// Direct tool call with error handling
fileContent = filesystem.readFile("/path/to/file.txt")?

// Tool call with explicit error handling
result = match github.createIssue(title, body) {
    Ok(issue) => issue,
    Err(e) => return Err(e)
}
```

---

## 5. Model Configuration Syntax

### Model Declaration

Models are declared as top-level constructs with their endpoints, parameters, and capabilities:

```mcps
// Anthropic model via API
model claude {
    provider: "anthropic"
    url: "https://api.anthropic.com/v1/messages"
    model: "claude-3-opus-20240229"
    apiKey: ANTHROPIC_API_KEY  // from environment
    temperature: 0.7
    maxTokens: 4000
}

// OpenAI model
model gpt4 {
    provider: "openai"
    url: "https://api.openai.com/v1/chat/completions"
    model: "gpt-4-turbo-preview"
    apiKey: OPENAI_API_KEY
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

## 6. Workflows: The Fundamental Construct

### Overview

In MCP Script, workflows are the fundamental unit of composition. A workflow is a typed function that can:

- Perform computations
- Call MCP tools (async by default)
- Delegate tasks to agents
- Call other workflows (async by default)

Workflows have explicit type signatures at their boundaries and use type inference within their bodies. There is no distinction between "simple functions" and "complex workflows" - everything is a workflow.

**Important:** All tool and workflow calls in MCP Script are asynchronous by default, enabling natural parallel execution. The `?` operator or data dependencies create sequential execution when needed.

### Basic Workflow Syntax

```mcps
// Simple workflow (like a function)
workflow calculateScore(points: number, multiplier: number): number {
    return points * multiplier
}

// Workflow with logic
workflow processFile(path: string): Result<any, Error> {
    content = filesystem.readFile(path)?
    parsed = JSON.parse(content)?
    return Ok(parsed)
}

// Workflow calling other workflows
workflow analyzeData(inputPath: string): Result<number, Error> {
    data = processFile(inputPath)?
    score = calculateScore(data["points"], data["multiplier"])
    return Ok(score)
}
```

### Workflow Type Signatures

Workflows must declare:

- Parameter names and types
- Return type

```mcps
workflow myWorkflow(param1: Type1, param2: Type2): ReturnType {
    // workflow body
}
```

### Async Execution Model

In MCP Script, all tool calls and workflow calls are asynchronous by default. This enables natural parallel execution without special syntax:

**Key principles:**

1. **Async operations start immediately** when called
2. **The `?` operator implicitly awaits** the result before checking for errors
3. **Data dependencies create sequential execution** naturally
4. **Return statements implicitly await** all pending operations in scope

```mcps
// Parallel execution - happens naturally!
workflow processAllFiles(files: string[]): Result<any[], Error> {
    // All processFile calls start immediately in parallel
    results = files.map(file => processFile(file))
    // Return waits for all to complete
    return Ok(results)
}

// Sequential execution - use ? to wait for each operation
workflow processSequential(files: string[]): Result<any[], Error> {
    results = []
    for file in files {
        data = processFile(file)?  // ? waits for completion before continuing
        results.push(data)
    }
    return Ok(results)
}

// Mixed parallel and sequential
workflow complexPipeline(data: any): Result<any, Error> {
    // These run in parallel (no dependencies)
    analysis = analyzeData(data)      // starts immediately
    summary = generateSummary(data)   // starts immediately
    metrics = calculateMetrics(data)  // starts immediately

    // Return waits for all three to complete
    return Ok({
        analysis: analysis,
        summary: summary,
        metrics: metrics
    })
}
```

---

## 7. Agent Configuration Syntax

### Agent Declaration

Agents are declared with a reference to a model and their available tools:

```mcps
agent DataAnalyst {
    model: claude  // References the 'claude' model declared earlier

    systemPrompt: """
        You are a data analyst. Analyze the provided data
        and generate insights using the available tools.
    """

    tools: [
        filesystem.readFile,
        filesystem.writeFile,
        database.query
    ]

    // Optional: Override model parameters for this agent
    temperature: 0.5  // Overrides the model's default temperature
}

// Agent using a different model
agent CreativeWriter {
    model: gpt4

    systemPrompt: "You are a creative writer who crafts engaging narratives."

    tools: [filesystem.writeFile]

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

#### Workflow Integration

```mcps
workflow analyzeWithAgent(inputPath: string): Result<Conversation, Error> {
    conv = "Analyze the file at ${inputPath} and create a summary report" -> DataAnalyst
    conv += "Save the report to report.md"
    conv = conv -> DataAnalyst

    return Ok(conv)
}
```

#### Conditional Agent Usage

```mcps
workflow intelligentProcessing(data: any, useAgent: boolean): Result<any, Error> {
    if useAgent {
        result = "Process this data: ${data}" -> DataAnalyst
        return Ok(result.getLastMessage())
    } else {
        return standardProcess(data)
    }
}
```

---

## 8. Error Handling & State Management

### Result Type

MCP Script uses a Result type for error handling (inspired by Rust):

```mcps
workflow riskyOperation(): Result<string, Error> {
    // Returns Ok(value) or Err(error)
}

// Usage with ? operator
value = riskyOperation()?

// Usage with match
value = match riskyOperation() {
    Ok(v) => v,
    Err(e) => {
        log.error("Operation failed: ${e}")
        return Err(e)
    }
}
```

### Workflow Error Handling

```mcps
workflow robustFileRead(path: string): Result<any, Error> {
    result = match filesystem.readFile(path) {
        Ok(data) => JSON.parse(data),
        Err(e) => {
            log.error("Failed to read file: ${e}")
            return Err(e)
        }
    }

    return result
}
```

### State Persistence

For long-running workflows that need checkpointing and recovery, MCP Script provides state management primitives:

```mcps
workflow processLargeDataset(items: string[]): Result<void, Error> {
    state = {
        checkpoint: "",
        progress: 0
    }

    for item in items {
        processItem(item)?
        state.progress += 1
        state.checkpoint = item
        persist(state)  // Save state for recovery
    }

    return Ok(void)
}
```

Note: The detailed semantics of state persistence and workflow recovery will be defined in a future proposal on runtime architecture.

---

## 9. Logging & Observability

### Built-in Logging Primitives

MCP Script provides native logging primitives for debugging and observability:

```mcps
workflow processData(input: string): Result<any, Error> {
    // Simple print for basic output
    print("Starting processing...")

    // Structured logging with levels
    log.debug("Input received", { length: input.length })
    log.info("Processing ${input.length} bytes")
    log.warn("Large input detected")
    log.error("Failed to process", { error: "..." })

    data = parseData(input)?
    log.info("Successfully parsed", { records: data.length })

    return Ok(data)
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
workflow example(path: string): Result<any, Error> {
    // System log: {"source": "system", "event": "workflow.start", "workflow": "example"}

    log.info("Reading file")  // User log: {"source": "user", "message": "Reading file"}

    // System log: {"source": "system", "event": "tool.call", "tool": "filesystem.readFile"}
    content = filesystem.readFile(path)?
    // System log: {"source": "system", "event": "tool.complete", "duration": 45}

    // System log: {"source": "system", "event": "agent.start", "agent": "DataAnalyst"}
    result = "Analyze this content: ${content}" -> DataAnalyst
    // System log: {"source": "system", "event": "agent.complete", "tokens": 1234, "duration": 2300}

    return Ok(result)
    // System log: {"source": "system", "event": "workflow.complete", "workflow": "example"}
}
```

### Automatic System Logging

The MCP Script runtime automatically logs:

- **Workflow lifecycle**: start, complete, error
- **Agent delegations**: start, complete, tokens used, duration
- **Tool calls**: invocation, parameters, results, errors
- **Error propagation**: error source, stack trace
- **Performance metrics**: execution time, memory usage

Example system log entries:

```json
// Workflow start
{
  "source": "system",
  "event": "workflow.start",
  "workflow": "processData",
  "executionId": "exec-123",
  "timestamp": "2025-01-02T10:30:00.000Z"
}

// Tool invocation
{
  "source": "system",
  "event": "tool.call",
  "tool": "filesystem.readFile",
  "params": {"path": "/data.json"},
  "workflow": "processData",
  "executionId": "exec-123",
  "timestamp": "2025-01-02T10:30:00.100Z"
}

// Agent delegation
{
  "source": "system",
  "event": "agent.complete",
  "agent": "CodeReviewer",
  "tokens": 2500,
  "duration": 3400,
  "workflow": "reviewCode",
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

## 10. Execution Model

### Script-Based Execution

MCP Script is an interpreted scripting language. When you run a MCP Script file, the interpreter executes all top-level code from top to bottom, similar to Python or JavaScript:

```mcps
// Declarations
mcp filesystem {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem"]
}

// Workflow definitions (like functions)
workflow loadData(path: string): Result<any, Error> {
    content = filesystem.readFile(path)?
    return Ok(JSON.parse(content)?)
}

// Top-level code - executes when running the file
log.info("Starting data processing")

data = loadData("input.json")?
log.info("Loaded ${data.length} records")

// Process the data...
print("Processing complete!")
```

### File Types

MCP Script files can serve different purposes:

**1. Executable Scripts** - Top-level code that runs directly:

```mcps
// script.mcps
log.info("Running backup job")
files = filesystem.listFiles("/data")?
for file in files {
    filesystem.copyFile(file, "/backup/${file}")?
}
```

**2. Libraries** - Only workflow definitions, no top-level execution:

```mcps
// utils.mcps
workflow validateEmail(email: string): boolean {
    return email.contains("@")
}

workflow formatDate(date: string): string {
    // formatting logic
}
```

**3. Mixed** - Reusable workflows with executable script:

```mcps
// process.mcps
workflow transform(data: any): Result<any, Error> {
    // reusable transformation
}

// Can be run directly or imported
if RUN_STANDALONE {
    data = loadData("input.json")?
    result = transform(data)?
    print(result)
}
```

### Running MCP Script Files

```bash
# Execute a MCP Script script
mcps run script.mcps

# Pass arguments (accessible via ARGS variable)
mcps run script.mcps --input=data.json --verbose

# All top-level code executes from top to bottom
```

---

## 11. Module System & Imports

### Import Syntax

MCP Script uses TypeScript-style imports to share code between files. You can import workflows, agents, models, and MCP servers from other MCP Script files:

```mcps
// Named imports
import { processData, validateEmail } from "./utils.mcps"
import { claude, gpt4 } from "./models.mcps"
import { filesystem, github } from "./connections.mcps"
import { DataAnalyst, CodeReviewer } from "./agents.mcps"

// Import all as namespace
import * as utils from "./utils.mcps"

// Use imported items
data = processData(input)?
isValid = utils.validateEmail(email)
```

### What Can Be Imported

**Importable declarations:**

- **Workflows** - Reusable functions
- **Agents** - Agent configurations
- **Models** - Model configurations
- **MCP servers** - Server connections

**Not importable:**

- Variables or constants
- Top-level executable code

### Import Behavior

When a file is imported, only its declarations are made available. Top-level code does NOT execute during import:

```mcps
// lib.mcps
mcp filesystem {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem"]
}

workflow processFile(path: string): Result<any, Error> {
    content = filesystem.readFile(path)?
    return Ok(JSON.parse(content)?)
}

// This top-level code only runs when `mcps run lib.mcps` is called directly
// It does NOT run when lib.mcps is imported
print("Processing files...")
files = filesystem.listFiles("*.json")?
for file in files {
    processFile(file)?
}
```

```mcps
// main.mcps
import { processFile, filesystem } from "./lib.mcps"

// The print() and file processing loop from lib.mcps did NOT execute
// We can use the imported declarations
result = processFile("data.json")?
```

### Organizing Code

This import system enables clean code organization:

```mcps
// models.mcps - Shared model configurations
model claude {
    provider: "anthropic"
    url: "https://api.anthropic.com/v1/messages"
    model: "claude-3-opus-20240229"
    apiKey: ANTHROPIC_API_KEY
}

model gpt4 {
    provider: "openai"
    url: "https://api.openai.com/v1/chat/completions"
    model: "gpt-4-turbo-preview"
    apiKey: OPENAI_API_KEY
}
```

```mcps
// connections.mcps - Shared MCP servers
mcp github {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    env: { GITHUB_TOKEN }
}

mcp slack {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-slack"],
    env: { SLACK_TOKEN }
}
```

```mcps
// agents.mcps - Shared agent configurations
import { claude, gpt4 } from "./models.mcps"
import { github, slack } from "./connections.mcps"

agent Researcher {
    model: claude
    systemPrompt: "You research technical topics thoroughly."
    tools: [github.searchCode, github.getRepository]
}

agent Notifier {
    model: gpt4
    systemPrompt: "You craft clear notification messages."
    tools: [slack.sendMessage]
}
```

```mcps
// main.mcps - Main script using shared components
import { Researcher, Notifier } from "./agents.mcps"
import { github } from "./connections.mcps"

// Script execution
topic = "authentication"
research = "Research ${topic} in the codebase" -> Researcher

notification = "Notify the team about: ${research}" -> Notifier

print("Research completed and team notified!")
```

### File Organization Pattern

Since top-level code only runs when a file is executed directly (not when imported), you can add test code to any file:

```mcps
// utils.mcps
workflow validateEmail(email: string): boolean {
    return email.contains("@") && email.contains(".")
}

workflow formatCurrency(amount: number): string {
    return "${amount.toFixed(2)}"
}

// Test code - only runs with `mcps run utils.mcps`
// Never runs when utils.mcps is imported
print("Testing utilities...")
assert(validateEmail("test@example.com") == true)
assert(validateEmail("invalid") == false)
assert(formatCurrency(42.5) == "$42.50")
print("All tests passed!")
```

---

## 12. Next Steps

This syntax specification provides the foundation for the MCP Script. Future technical proposals will cover:

- Type system and type inference details
- Memory management
- Interpreter implementation strategy
- Runtime architecture and async execution
- Standard library design
- Tooling and developer experience
- Error handling patterns
- Package management and distribution

We welcome feedback from the engineering team on this syntax design before proceeding to implementation planning.

