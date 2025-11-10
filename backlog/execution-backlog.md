# MCP Script Execution Backlog

## Implementation Plan: MVP to Full Specification

This backlog outlines the implementation steps. Items are ordered sequentially with clear dependencies.

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
- 🔲 **TODO** - Break and continue statements
- 🔲 **TODO** - **CRITICAL**: Refactor codegen variable tracking for proper scoping
  - Current approach uses flat `Set<string>` for declared variables
  - Works for current global-only scope but will break with blocks/nested scopes
  - Need scope stack/hierarchy to track variables per scope level
  - Must implement immediately after adding blocks to avoid incorrect codegen
  - See: Variable reassignment generates `let x = 5; let x = 10;` issue

**→ Complete Phase 4 before Phase 5**

### Phase 5: Functions

**Goal: Enable user-defined reusable logic**

- 🔲 **TODO** - Function declaration syntax parsing (`function name(params): returnType { ... }`)
- 🔲 **TODO** - Function parameter parsing
- 🔲 **TODO** - Return statement parsing
- 🔲 **TODO** - Function generation in codegen
- 🔲 **TODO** - Function calls with arguments (extend existing)
- 🔲 **TODO** - Local variable scoping implementation
- 🔲 **TODO** - Function runtime tests

**→ Complete Phase 5 before Phase 6**

### Phase 6: Enhanced Runtime (Logging and Environment)

**Goal: Add observability and configuration**

- 🔲 **TODO** - Structured logging runtime implementation (`log.debug`, `log.info`, `log.warn`, `log.error`)
- 🔲 **TODO** - Environment variable access (`env.API_KEY`)
- 🔲 **TODO** - Log message formatting with data objects
- 🔲 **TODO** - Logging system injection in codegen
- 🔲 **TODO** - Environment variable injection in codegen
- 🔲 **TODO** - Runtime enhancement tests

**→ Complete Phase 6 before Phase 7**

### Phase 7: Error Handling

**Goal: Add robust error management**

- 🔲 **TODO** - Try-catch block parsing (`try { ... } catch (error) { ... }`)
- 🔲 **TODO** - Throw statement parsing
- 🔲 **TODO** - Finally block parsing
- 🔲 **TODO** - Error handling generation in codegen
- 🔲 **TODO** - Error object creation and properties
- 🔲 **TODO** - Error propagation through async operations
- 🔲 **TODO** - MCP tool call error handling
- 🔲 **TODO** - Error handling runtime tests

**→ Complete Phase 7 before Phase 8**

### Phase 8: Type System

**Goal: Add static typing and validation**

- 🔲 **TODO** - Type annotation parsing for variables (`name: string = "value"`)
- 🔲 **TODO** - Type annotation parsing for function parameters
- 🔲 **TODO** - Type annotation parsing for function return types
- 🔲 **TODO** - Type inference implementation
- 🔲 **TODO** - Type checking during transpilation
- 🔲 **TODO** - Type-aware code generation
- 🔲 **TODO** - Type system tests

**→ Complete Phase 8 before Phase 9**

### Phase 9: Agent System

**Goal: Add AI agent integration**

- 🔲 **TODO** - Model configuration parsing (`model ModelName { provider: "openai", name: "gpt-4" }`)
- 🔲 **TODO** - Agent declaration parsing (`agent AgentName { model: ModelName, tools: [tool1, tool2] }`)
- 🔲 **TODO** - Agent delegation syntax parsing (`"prompt text" -> AgentName`)
- 🔲 **TODO** - Agent system generation in codegen
- 🔲 **TODO** - Agent runtime integration
- 🔲 **TODO** - Agent response handling and parsing
- 🔲 **TODO** - Tool access restriction per agent
- 🔲 **TODO** - Agent system tests

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

- 🔲 **TODO** - Named parameter tool calling (`tool(param: value)`)
- 🔲 **TODO** - MCP resource access beyond tools
- 🔲 **TODO** - MCP server authentication (HTTP/WebSocket)
- 🔲 **TODO** - Connection pooling and persistent connections
- 🔲 **TODO** - Tool result caching mechanisms
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

### Phase 13: Developer Experience Enhancements

**Goal: Improve debugging and tooling**

- 🔲 **TODO** - Syntax error reporting with line/column numbers
- 🔲 **TODO** - Type error messages during compilation
- 🔲 **TODO** - Runtime error source mapping to .mcps files
- 🔲 **TODO** - `mcps check` command for syntax/type checking
- 🔲 **TODO** - Automatic system logging (workflow lifecycle, agent delegation, tool calls)
- 🔲 **TODO** - Log configuration via environment variables
- 🔲 **TODO** - Execution ID tracking across logs

**→ Complete Phase 13 before Phase 14**

### Phase 14: Advanced Language Features

**Goal: Add sophisticated language constructs**

- 🔲 **TODO** - For-of loops (`for (item of array) { ... }`)
- 🔲 **TODO** - Array methods (`push`, `pop`, `length` property)
- 🔲 **TODO** - Template string literals with interpolation
- 🔲 **TODO** - Comment syntax (`// single-line` and `/* multi-line */`)
- 🔲 **TODO** - Object destructuring in assignments
- 🔲 **TODO** - Multi-line string support
- 🔲 **TODO** - Escape sequence handling in strings

**→ Complete Phase 14 before Phase 15**

### Phase 15: Security and Sandboxing

**Goal: Enhance execution security**

- 🔲 **TODO** - Configurable resource limits (memory, CPU)
- 🔲 **TODO** - File system access restrictions
- 🔲 **TODO** - Network access controls
- 🔲 **TODO** - Process execution limitations
- 🔲 **TODO** - Module import restrictions
- 🔲 **TODO** - MCP server capability validation
- 🔲 **TODO** - Tool permission system
- 🔲 **TODO** - Secure credential management

**→ Complete Phase 15 before Phase 16**

### Phase 16: Additional CLI and Tooling

**Goal: Complete developer tooling**

- 🔲 **TODO** - `mcps format` command for code formatting
- 🔲 **TODO** - `mcps test` command for running test files
- 🔲 **TODO** - Verbose logging options (`--verbose`, `--debug`)
- 🔲 **TODO** - Watch mode for file changes (`--watch`)
- 🔲 **TODO** - Configuration file support (`.mcpsrc`)
- 🔲 **TODO** - Source map generation for debugging

**→ Complete Phase 16 before Phase 17**

### Phase 17: Documentation and Examples

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

## Implementation Notes

**Key Dependencies:**

- **Grammar → Parser → Codegen → Tests** is the standard flow for each feature
- **Phase order is critical** - later phases depend on earlier ones
- **Test each phase thoroughly** before moving to the next
- **Each item should be individually testable** and mergeable

**Parallel Work Opportunities:**

- Documentation can be written alongside implementation
- CLI enhancements can be done in parallel with core features
- Performance optimization can happen after core features are stable

---

## Future Enhancements (Post-Spec)

### Advanced Features

- 🔲 **TODO** - Interactive debugger with breakpoints
- 🔲 **TODO** - Language server for IDE integration
- 🔲 **TODO** - Package manager for MCP Script modules
- 🔲 **TODO** - CI/CD integration tools
- 🔲 **TODO** - Performance profiling tools
- 🔲 **TODO** - Extension API for custom runtime behaviors

### Ecosystem Integration

- 🔲 **TODO** - VS Code extension with syntax highlighting
- 🔲 **TODO** - GitHub Actions for MCP Script workflows
- 🔲 **TODO** - Docker containers for isolated execution
- 🔲 **TODO** - Web-based playground for learning
- 🔲 **TODO** - Integration with popular workflow engines
