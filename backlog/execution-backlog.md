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

1. ✅ **DONE** - Number literal parsing in grammar (integers, floats, scientific notation)
2. 🔲 **TODO** - Boolean literal parsing in grammar (`true`, `false`)
3. 🔲 **TODO** - Number literal generation in codegen
4. 🔲 **TODO** - Boolean literal generation in codegen
5. 🔲 **TODO** - Number and boolean runtime tests

**→ Complete Phase 1 before Phase 2**

### Phase 2: Basic Expressions and Operations

**Goal: Enable arithmetic and logical operations**

6. 🔲 **TODO** - Binary arithmetic expression parsing (`+`, `-`, `*`, `/`, `%`)
7. 🔲 **TODO** - Comparison operator parsing (`==`, `!=`, `<`, `>`, `<=`, `>=`)
8. 🔲 **TODO** - Logical operator parsing (`&&`, `||`, `!`)
9. 🔲 **TODO** - Unary expression parsing (`-x`, `!condition`)
10. 🔲 **TODO** - Operator precedence handling in grammar
11. 🔲 **TODO** - Expression evaluation in codegen
12. 🔲 **TODO** - Expression runtime tests

**→ Complete Phase 2 before Phase 3**

### Phase 3: Collections (Arrays and Objects)

**Goal: Add structured data types**

13. 🔲 **TODO** - Array literal syntax parsing (`[1, 2, 3]`)
14. 🔲 **TODO** - Object literal syntax parsing (`{ key: "value", num: 42 }`)
15. 🔲 **TODO** - Array/object literal generation in codegen
16. 🔲 **TODO** - Array indexing parsing (`array[0]`)
17. 🔲 **TODO** - Object property access parsing (`obj.property`, `obj["key"]`)
18. 🔲 **TODO** - Member access generation in codegen
19. 🔲 **TODO** - Array assignment (`array[0] = value`)
20. 🔲 **TODO** - Object property assignment (`obj.property = value`)
21. 🔲 **TODO** - Collection runtime tests

**→ Complete Phase 3 before Phase 4**

### Phase 4: Control Flow

**Goal: Add conditional execution and loops**

22. 🔲 **TODO** - Block statement parsing (`{ ... }`)
23. 🔲 **TODO** - If statement parsing (`if (condition) { ... }`)
24. 🔲 **TODO** - If-else statement parsing (`if (condition) { ... } else { ... }`)
25. 🔲 **TODO** - While loop parsing (`while (condition) { ... }`)
26. 🔲 **TODO** - For loop parsing (`for (let i = 0; i < 10; i++) { ... }`)
27. 🔲 **TODO** - Control flow generation in codegen
28. 🔲 **TODO** - Break and continue statements
29. 🔲 **TODO** - Control flow runtime tests

**→ Complete Phase 4 before Phase 5**

### Phase 5: Functions

**Goal: Enable user-defined reusable logic**

30. 🔲 **TODO** - Function declaration syntax parsing (`function name(params): returnType { ... }`)
31. 🔲 **TODO** - Function parameter parsing
32. 🔲 **TODO** - Return statement parsing
33. 🔲 **TODO** - Function generation in codegen
34. 🔲 **TODO** - Function calls with arguments (extend existing)
35. 🔲 **TODO** - Local variable scoping implementation
36. 🔲 **TODO** - Function runtime tests

**→ Complete Phase 5 before Phase 6**

### Phase 6: Enhanced Runtime (Logging and Environment)

**Goal: Add observability and configuration**

37. 🔲 **TODO** - Structured logging runtime implementation (`log.debug`, `log.info`, `log.warn`, `log.error`)
38. 🔲 **TODO** - Environment variable access (`env.API_KEY`)
39. 🔲 **TODO** - Log message formatting with data objects
40. 🔲 **TODO** - Logging system injection in codegen
41. 🔲 **TODO** - Environment variable injection in codegen
42. 🔲 **TODO** - Runtime enhancement tests

**→ Complete Phase 6 before Phase 7**

### Phase 7: Error Handling

**Goal: Add robust error management**

43. 🔲 **TODO** - Try-catch block parsing (`try { ... } catch (error) { ... }`)
44. 🔲 **TODO** - Throw statement parsing
45. 🔲 **TODO** - Finally block parsing
46. 🔲 **TODO** - Error handling generation in codegen
47. 🔲 **TODO** - Error object creation and properties
48. 🔲 **TODO** - Error propagation through async operations
49. 🔲 **TODO** - MCP tool call error handling
50. 🔲 **TODO** - Error handling runtime tests

**→ Complete Phase 7 before Phase 8**

### Phase 8: Type System

**Goal: Add static typing and validation**

51. 🔲 **TODO** - Type annotation parsing for variables (`name: string = "value"`)
52. 🔲 **TODO** - Type annotation parsing for function parameters
53. 🔲 **TODO** - Type annotation parsing for function return types
54. 🔲 **TODO** - Type inference implementation
55. 🔲 **TODO** - Type checking during transpilation
56. 🔲 **TODO** - Type-aware code generation
57. 🔲 **TODO** - Type system tests

**→ Complete Phase 8 before Phase 9**

### Phase 9: Agent System

**Goal: Add AI agent integration**

58. 🔲 **TODO** - Model configuration parsing (`model ModelName { provider: "openai", name: "gpt-4" }`)
59. 🔲 **TODO** - Agent declaration parsing (`agent AgentName { model: ModelName, tools: [tool1, tool2] }`)
60. 🔲 **TODO** - Agent delegation syntax parsing (`"prompt text" -> AgentName`)
61. 🔲 **TODO** - Agent system generation in codegen
62. 🔲 **TODO** - Agent runtime integration
63. 🔲 **TODO** - Agent response handling and parsing
64. 🔲 **TODO** - Tool access restriction per agent
65. 🔲 **TODO** - Agent system tests

**→ Complete Phase 9 before Phase 10**

### Phase 10: Module System

**Goal: Enable code organization and reuse**

66. 🔲 **TODO** - Import statement parsing (`import { function, agent } from "./module.mcps"`)
67. 🔲 **TODO** - Export statement parsing
68. 🔲 **TODO** - Module resolution implementation
69. 🔲 **TODO** - Module loading generation in codegen
70. 🔲 **TODO** - Circular import detection
71. 🔲 **TODO** - Top-level code execution prevention in imported modules
72. 🔲 **TODO** - Module caching and reuse
73. 🔲 **TODO** - Module system tests

**→ Complete Phase 10 before Phase 11**

### Phase 11: Advanced MCP Features

**Goal: Enhance MCP integration**

74. 🔲 **TODO** - Named parameter tool calling (`tool(param: value)`)
75. 🔲 **TODO** - MCP resource access beyond tools
76. 🔲 **TODO** - MCP server authentication (HTTP/WebSocket)
77. 🔲 **TODO** - Connection pooling and persistent connections
78. 🔲 **TODO** - Tool result caching mechanisms
79. 🔲 **TODO** - MCP server health checking
80. 🔲 **TODO** - Advanced MCP tests

**→ Complete Phase 11 before Phase 12**

### Phase 12: Performance and Optimization

**Goal: Improve execution performance**

81. 🔲 **TODO** - Parallel execution detection and optimization
82. 🔲 **TODO** - Lazy loading of MCP servers
83. 🔲 **TODO** - Promise-like value handling
84. 🔲 **TODO** - Timeout handling for long operations
85. 🔲 **TODO** - Memory usage optimization
86. 🔲 **TODO** - Performance benchmarking tests

**→ Complete Phase 12 before Phase 13**

### Phase 13: Developer Experience Enhancements

**Goal: Improve debugging and tooling**

87. 🔲 **TODO** - Syntax error reporting with line/column numbers
88. 🔲 **TODO** - Type error messages during compilation
89. 🔲 **TODO** - Runtime error source mapping to .mcps files
90. 🔲 **TODO** - `mcps check` command for syntax/type checking
91. 🔲 **TODO** - Automatic system logging (workflow lifecycle, agent delegation, tool calls)
92. 🔲 **TODO** - Log configuration via environment variables
93. 🔲 **TODO** - Execution ID tracking across logs

**→ Complete Phase 13 before Phase 14**

### Phase 14: Advanced Language Features

**Goal: Add sophisticated language constructs**

94. 🔲 **TODO** - For-of loops (`for (item of array) { ... }`)
95. 🔲 **TODO** - Array methods (`push`, `pop`, `length` property)
96. 🔲 **TODO** - Template string literals with interpolation
97. 🔲 **TODO** - Comment syntax (`// single-line` and `/* multi-line */`)
98. 🔲 **TODO** - Object destructuring in assignments
99. 🔲 **TODO** - Multi-line string support
100.  🔲 **TODO** - Escape sequence handling in strings

**→ Complete Phase 14 before Phase 15**

### Phase 15: Security and Sandboxing

**Goal: Enhance execution security**

101. 🔲 **TODO** - Configurable resource limits (memory, CPU)
102. 🔲 **TODO** - File system access restrictions
103. 🔲 **TODO** - Network access controls
104. 🔲 **TODO** - Process execution limitations
105. 🔲 **TODO** - Module import restrictions
106. 🔲 **TODO** - MCP server capability validation
107. 🔲 **TODO** - Tool permission system
108. 🔲 **TODO** - Secure credential management

**→ Complete Phase 15 before Phase 16**

### Phase 16: Additional CLI and Tooling

**Goal: Complete developer tooling**

109. 🔲 **TODO** - `mcps format` command for code formatting
110. 🔲 **TODO** - `mcps test` command for running test files
111. 🔲 **TODO** - Verbose logging options (`--verbose`, `--debug`)
112. 🔲 **TODO** - Watch mode for file changes (`--watch`)
113. 🔲 **TODO** - Configuration file support (`.mcpsrc`)
114. 🔲 **TODO** - Source map generation for debugging

**→ Complete Phase 16 before Phase 17**

### Phase 17: Documentation and Examples

**Goal: Complete user-facing materials**

115. 🔲 **TODO** - Complete language reference documentation
116. 🔲 **TODO** - Type system guide and best practices
117. 🔲 **TODO** - MCP integration patterns and examples
118. 🔲 **TODO** - Agent workflow examples
119. 🔲 **TODO** - Complex data processing examples
120. 🔲 **TODO** - Error handling pattern examples
121. 🔲 **TODO** - Multi-module project examples
122. 🔲 **TODO** - Migration guide from MVP to full spec

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

