# MCP Script Execution Backlog

## Implementation Plan: MVP to Full Specification

This backlog outlines the implementation steps. Items are ordered sequentially with clear dependencies.

Do NOT drop implementation notes into this document.

**Legend:**

- ✅ **DONE** - Completed
- 🔲 **TODO** - Needs implementation
- **→** - Dependency relationship (complete before moving to next)

---

## Sequential Implementation Plan

### Phase 1: Core Data Types and Literals

**Goal: Expand basic value types beyond strings**

- ✅ **DONE** - Number literal parsing in grammar (integers, floats, scientific notation)
- ✅ **DONE** - Boolean literal parsing in grammar (`true`, `false`)
- ✅ **DONE** - Number literal generation in codegen
- ✅ **DONE** - Boolean literal generation in codegen
- ✅ **DONE** - Number and boolean runtime tests

**→ Complete Phase 1 before Phase 2**

### Phase 2: Basic Expressions and Operations

**Goal: Enable arithmetic and logical operations**

- ✅ **DONE** - Binary arithmetic expression parsing (`+`, `-`, `*`, `/`, `%`)
- ✅ **DONE** - Comparison operator parsing (`==`, `!=`, `<`, `>`, `<=`, `>=`)
- ✅ **DONE** - Logical operator parsing (`&&`, `||`, `!`)
- ✅ **DONE** - Unary expression parsing (`-x`, `!condition`)
- ✅ **DONE** - Operator precedence handling in grammar
- ✅ **DONE** - Expression evaluation in codegen
- ✅ **DONE** - Expression runtime tests
- ✅ **DONE** - Nullish coalescing operator parsing (`??`) and codegen

**→ Complete Phase 2 before Phase 3**

### Phase 3: Collections (Arrays and Objects)

**Goal: Add structured data types**

- ✅ **DONE** - Array literal syntax parsing (`[1, 2, 3]`)
- ✅ **DONE** - Object literal syntax parsing (`{ key: "value", num: 42 }`)
- ✅ **DONE** - Array/object literal generation in codegen
- ✅ **DONE** - Array indexing parsing (`array[0]`)
- ✅ **DONE** - Object property access parsing (`obj.property`, `obj["key"]`)
- ✅ **DONE** - Member access generation in codegen
- ✅ **DONE** - Array assignment (`array[0] = value`)
- ✅ **DONE** - Object property assignment (`obj.property = value`)
- ✅ **DONE** - Collection runtime tests

**→ Complete Phase 3 before Phase 4**

### Phase 4: Control Flow

**Goal: Add conditional execution and loops**

- ✅ **DONE** - Block statement parsing (`{ ... }`)
- ✅ **DONE** - If statement parsing (`if (condition) { ... }`)
- ✅ **DONE** - If-else statement parsing (`if (condition) { ... } else { ... }`)
- ✅ **DONE** - While loop parsing (`while (condition) { ... }`)
- ✅ **DONE** - For loop parsing (`for (let i = 0; i < 10; i++) { ... }`)
- ✅ **DONE** - Break and continue statements
- ✅ **DONE** - **CRITICAL**: Refactor codegen variable tracking for proper scoping
  - ✅ Replaced flat `Set<string>` with proper `ScopeStack` class implementing inheritance-based scoping
  - ✅ **Inheritance rule**: Each new scope inherits variables from its parent scope
  - ✅ **No redeclaration within scope lineage**: Variables declared in ancestor scopes are never redeclared
  - ✅ **Separate branches can redeclare**: Sibling scopes (like separate `{}` blocks) can each declare their own variables
  - ✅ **Synthetic vs explicit blocks**: Only explicit `{}` create new scopes; synthetic blocks share parent scope
  - ✅ Much simpler and more intuitive than JavaScript's variable shadowing

**→ Complete Phase 4 before Phase 5**

### Phase 5: Enhanced Runtime (Logging and Environment)

**Goal: Add observability and configuration**

- ✅ **DONE** - Structured logging runtime implementation (`log.debug`, `log.info`, `log.warn`, `log.error`)
- ✅ **DONE** - Environment variable access (`env.API_KEY`)
- ✅ **DONE** - Log message formatting with data objects
- ✅ **DONE** - Logging system injection in codegen
- ✅ **DONE** - Environment variable injection in codegen
- ✅ **DONE** - Runtime enhancement tests

**→ Complete Phase 5 before Phase 5.5**

### Phase 5.5: Standard Library and Global Validation

**Goal: Provide standard utilities and validate global access**

- ✅ **DONE** - Implement global variable whitelist validation
  - Track all globals that we do want to expose the script: `log`, `env`, `print`, `Set`, `Map`, `JSON`, etc.
  - Static analysis during transpilation to detect references to undefined variables
- ✅ **DONE** - Implement `JSON.parse()` and `JSON.stringify()` and any missing runtime function (just wrappers around vanilla JS)

**→ Complete Phase 5.5 before Phase 6**

### Phase 6: Agent System

**Goal: Add AI agent integration**

- ✅ **DONE** - Model configuration parsing with real LlamaIndex integration
  - Grammar support for `model modelName { provider: "...", model: "...", ... }`
  - Provider-specific code generation using class constructors (`new __llamaindex_OpenAI`, etc.)
  - **Runtime VM context with actual LlamaIndex classes** (OpenAI, Anthropic, Gemini, Ollama)
- ✅ **DONE** - Adapt MCP server declarations to use mcp tools from llamaindex
- ✅ **DONE** - Agent declaration parsing (`agent agentName { model: modelName, tools: [tool1, tool2] }`)
- ✅ **DONE** - Allow agent tools array to contain a MCP server (means include all tools from that server)
- ✅ **DONE** - Agent delegation syntax (`"prompt text" -> AgentName`)
- ✅ **DONE** - Agent system e2e example script

**→ Complete Phase 6 before Phase 7**

### Phase 7: Tools

**Goal: Enable user-defined reusable logic**

- ✅ **DONE** - Tool declaration syntax parsing and codegen (`tool name(params) { ... }`)
- ✅ **DONE** - Support assigning tools to agents in `tools` array
- ✅ **DONE** - Tool runtime tests with agents
- ✅ **DONE** - Create example scripts demonstrating tool usage with agents

**→ Complete Phase 7 before Phase 8**

### Phase 8: Error Handling

**Goal: Add robust error management**

- 🔲 **TODO** - Try-catch block parsing (`try { ... } catch (error) { ... }`)
- 🔲 **TODO** - Throw statement parsing (supports throwing strings or values)
- 🔲 **TODO** - Finally block parsing
- 🔲 **TODO** - Error handling generation in codegen
  - `throw "message"` → transpile to `throw new Error("message")`
  - `throw value` → transpile to `throw new Error(String(value))`
- 🔲 **TODO** - Error propagation through async operations
- 🔲 **TODO** - MCP tool call error handling
- 🔲 **TODO** - Error handling runtime tests

**→ Complete Phase 8 before Phase 9**

### Phase 9: Runtime Type Validation

**Goal: Add optional runtime type checking using Zod**

- 🔲 **TODO** - Tool parameter parsing with optional type annotations
  - Parse `param: type` syntax
  - Parse `param?: type` for optional parameters
  - Parse return type annotations `: type`
- 🔲 **TODO** - Add Zod dependency to runtime package
- 🔲 **TODO** - Generate Zod schemas from type annotations in codegen
  - Primitives: `string`, `number`, `boolean`, `any`
  - Arrays: `string[]`, `number[]`, etc.
  - Objects: `{ key: string, value: number }`
  - Union types: `string | number`
  - Optional parameters: `param?: string`
- 🔲 **TODO** - Generate runtime validation wrappers in codegen
  - Wrap tool bodies with parameter validation
  - Wrap return statements with return type validation
- 🔲 **TODO** - Error messages for type validation failures
- 🔲 **TODO** - Support for nested object types
- 🔲 **TODO** - Support for complex array types
- 🔲 **TODO** - Runtime type validation tests

**→ Complete Phase 9 before Phase 10**

### Phase 10: Module System

**Goal: Enable code organization and reuse**

- 🔲 **TODO** - Import statement parsing (`import { function, agent } from "./module.mcps"`)
- 🔲 **TODO** - Export statement parsing
- 🔲 **TODO** - Module resolution implementation
- 🔲 **TODO** - Module loading generation in codegen
- 🔲 **TODO** - Circular import detection
- 🔲 **TODO** - Top-level code execution prevention in imported modules
- 🔲 **TODO** - Module caching and reuse
- 🔲 **TODO** - Module system tests

**→ Complete Phase 10 before Phase 11**

### Phase 11: Advanced MCP Features

**Goal: Enhance MCP integration**

- 🔲 **TODO** - MCP resource access beyond tools
- 🔲 **TODO** - MCP server authentication (HTTP/WebSocket)
- 🔲 **TODO** - MCP server health checking
- 🔲 **TODO** - Advanced MCP tests

**→ Complete Phase 11 before Phase 12**

### Phase 12: Performance and Optimization

**Goal: Improve execution performance**

- 🔲 **TODO** - Parallel execution detection and optimization
- 🔲 **TODO** - Lazy loading of MCP servers
- 🔲 **TODO** - Promise-like value handling
- 🔲 **TODO** - Timeout handling for long operations
- 🔲 **TODO** - Memory usage optimization
- 🔲 **TODO** - Performance benchmarking tests

**→ Complete Phase 12 before Phase 13**

### Phase 13: Code Organization and Refactoring

**Goal: Improve codebase maintainability**

- ✅ **DONE** - Refactor `packages/transpiler/src/parser.ts` into separate modules
  - Extracted declaration parsers into `parser/declarations.ts`
  - Extracted expression parsers into `parser/expressions.ts`
  - Extracted statement parsers into `parser/statements.ts`
  - Main `parser.ts` now serves as entry point and orchestrator

- ✅ **DONE** - Refactor `packages/transpiler/src/codegen.ts` into separate modules
  - Extracted declaration generators (models, agents, MCPs) into `codegen/declarations.ts`
  - Extracted expression generators into `codegen/expressions.ts`
  - Extracted statement generators into `codegen/statements.ts`
  - Main `codegen.ts` now serves as orchestrator with scope management
    **→ Complete Phase 13 before Phase 14**

### Phase 14: Developer Experience Enhancements

**Goal: Improve debugging and tooling**

- 🔲 **TODO** - Syntax error reporting with line/column numbers
- 🔲 **TODO** - Type error messages during compilation
- 🔲 **TODO** - Runtime error source mapping to .mcps files
- 🔲 **TODO** - `mcps check` command for syntax/type checking
- 🔲 **TODO** - Automatic system logging (tool lifecycle with tool names, agent delegation)
- 🔲 **TODO** - Log configuration via environment variables
- 🔲 **TODO** - Execution ID tracking across logs

**→ Complete Phase 14 before Phase 14.5**

### Phase 14.5: Advanced Collections (Sets and Maps)

**Goal: Add Set and Map collection types**

- ✅ **DONE** - Runtime `Set()` global function implementation (codegen should call vanilla JS `Set`)
  - `Set()` - create empty Set
  - `Set([1, 2, 3])` - create Set from array
- ✅ **DONE** - Runtime `Map()` global function implementation (codegen should call vanilla JS `Map`)
  - `Map()` - create empty Map
  - `Map([["key", "value"], ...])` - create Map from array of tuples
- ✅ **DONE** - Set/Map runtime tests
- 🔲 **TODO** - array, Set, Map iteration support in for-of loops

**→ Complete Phase 14.5 before Phase 15**

### Phase 15: Advanced Language Features

**Goal: Add sophisticated language constructs**

- 🔲 **TODO** - For-of loops (`for (item of array) { ... }`)
  - Support iterating over arrays, Sets, and Maps
  - Support destructuring in for-of: `for ([key, value] of mapObject) { ... }`
- 🔲 **TODO** - Array methods (`push`, `pop`, `length` property, etc.)
- 🔲 **TODO** - Multi-line comments (`/* ... */`)
- 🔲 **TODO** - Template string literals with interpolation (`` `Hello ${name}` ``)
- 🔲 **TODO** - Object destructuring in assignments
- 🔲 **TODO** - Array destructuring in assignments
- 🔲 **TODO** - Triple-quoted string literals (`"""..."""`)
  - Support for multi-line strings with automatic indentation adjustment
  - Remove common leading whitespace from content
  - Ideal for agent system prompts

**→ Complete Phase 15 before Phase 16**

### Phase 16: Security and Sandboxing

**Goal: Enhance execution security**

- 🔲 **TODO** - Configurable resource limits (memory, CPU)
- 🔲 **TODO** - File system access restrictions
- 🔲 **TODO** - Network access controls
- 🔲 **TODO** - Process execution limitations
- 🔲 **TODO** - Module import restrictions
- 🔲 **TODO** - MCP server capability validation
- 🔲 **TODO** - Tool permission system
- 🔲 **TODO** - Secure credential management

**→ Complete Phase 16 before Phase 17**

### Phase 17: Additional CLI and Tooling

**Goal: Complete developer tooling**

- 🔲 **TODO** - `mcps format` command for code formatting
- 🔲 **TODO** - `mcps test` command for running test files
- 🔲 **TODO** - Verbose logging options (`--verbose`, `--debug`)
- 🔲 **TODO** - Watch mode for file changes (`--watch`)
- 🔲 **TODO** - Configuration file support (`.mcpsrc`)
- 🔲 **TODO** - Source map generation for debugging

**→ Complete Phase 17 before Phase 18**

### Phase 18: Documentation and Examples

**Goal: Complete user-facing materials**

- 🔲 **TODO** - Complete language reference documentation
- 🔲 **TODO** - Type system guide and best practices
- 🔲 **TODO** - MCP integration patterns and examples
- 🔲 **TODO** - Agent workflow examples
- 🔲 **TODO** - Complex data processing examples
- 🔲 **TODO** - Error handling pattern examples
- 🔲 **TODO** - Multi-module project examples
- 🔲 **TODO** - Migration guide from MVP to full spec

---

## Future Enhancements (Post-Spec)

### Advanced Features

- 🔲 **TODO** - Interactive debugger with breakpoints
- 🔲 **TODO** - Use dotenv to load environment variables in CLI's run command
- 🔲 **TODO** - Language server for IDE integration
- 🔲 **TODO** - Package manager for MCP Script modules
- 🔲 **TODO** - CI/CD integration tools
- 🔲 **TODO** - Performance profiling tools
- 🔲 **TODO** - Extension API for custom runtime behaviors

### Ecosystem Integration

- 🔲 **TODO** - VS Code extension with syntax highlighting
- 🔲 **TODO** - Tree-sitter syntax highlighting support for Neovim
- 🔲 **TODO** - GitHub Actions for MCP Script workflows
- 🔲 **TODO** - Docker containers for isolated execution
- 🔲 **TODO** - Web-based playground for learning
- 🔲 **TODO** - Integration with popular workflow engines
