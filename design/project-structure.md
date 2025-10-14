# MCP Script Project Structure

This document outlines the proposed directory structure for the MCP Script interpreter and toolchain, built using Tree-sitter for parsing and Go for the core implementation.

## Technology Stack

### Primary Technologies

- **Tree-sitter**: Grammar definition, parsing, syntax highlighting
- **Go**: Core interpreter, runtime, and tooling
- **LSP**: Language server protocol for editor integration
- **Node.js/JavaScript**: Grammar development and testing (Tree-sitter toolchain)

## Project Directory Structure

```
mcps/
├── grammar/                           # Tree-sitter grammar
│   ├── grammar.js                     # Main grammar definition
│   ├── package.json                   # Node.js dependencies
│   ├── src/                          # Generated C parser
│   │   ├── parser.c
│   │   └── tree_sitter/
│   ├── bindings/                     # Language bindings
│   │   └── go/                       # Go bindings
│   ├── queries/                      # Tree-sitter queries
│   │   ├── highlights.scm            # Syntax highlighting
│   │   ├── locals.scm                # Local variable scoping
│   │   ├── folds.scm                 # Code folding
│   │   └── errors.scm                # Error patterns
│   ├── test/                         # Grammar test cases
│   │   └── corpus/                   # Test files
│   └── examples/                     # Example MCP Script files
│
├── internal/
│   ├── parser/                       # Tree-sitter wrapper
│   │   ├── parser.go                 # Main parser interface
│   │   ├── tree.go                   # Tree manipulation
│   │   └── queries.go                # Query utilities
│   ├── ast/                          # AST definitions
│   │   ├── nodes.go                  # AST node types
│   │   ├── builder.go                # Tree-sitter to AST converter
│   │   └── visitor.go                # AST visitor pattern
│   ├── analyzer/                     # Semantic analysis
│   │   ├── scope.go                  # Scope analysis using queries
│   │   ├── types.go                  # Type checking
│   │   └── diagnostics.go            # Error/warning collection
│   ├── runtime/                      # Interpreter runtime
│   │   ├── interpreter.go            # Main interpreter
│   │   ├── mcp/                      # MCP integration
│   │   ├── agents/                   # Agent management
│   │   ├── models/                   # LLM provider integrations
│   │   └── async/                    # Async execution engine
│   ├── lsp/                          # Language Server Protocol
│   │   ├── server.go                 # LSP server implementation
│   │   ├── completion.go             # Auto-completion using queries
│   │   ├── diagnostics.go            # Real-time error checking
│   │   ├── hover.go                  # Hover information
│   │   └── formatting.go             # Code formatting
│   └── cli/                          # CLI utilities
│       ├── commands.go               # Cobra command definitions
│       └── config.go                 # Configuration management
│
├── cmd/
│   └── mcps/                         # Single CLI binary with all tools
│       ├── main.go                   # Main entry point
│       ├── cmd/                      # Cobra subcommands
│       │   ├── root.go               # Root command setup
│       │   ├── run.go                # run subcommand (interpreter)
│       │   ├── fmt.go                # fmt subcommand (formatter)
│       │   ├── lsp.go                # lsp subcommand (language server)
│       │   ├── query.go              # query subcommand (tree-sitter queries)
│       │   ├── check.go              # check subcommand (type checker)
│       │   └── version.go            # version subcommand
│       └── internal/                 # CLI-specific utilities
│           ├── config.go             # Shared config loading
│           └── output.go             # Shared output formatting
│
├── pkg/                              # Public API
│   └── mcps/                         # Public interfaces
│
├── editors/                          # Editor integrations
│   ├── vscode/                       # VS Code extension
│   │   ├── package.json
│   │   ├── src/extension.ts
│   │   └── syntaxes/                 # Generated from Tree-sitter
│   ├── neovim/                       # Neovim configuration
│   └── emacs/                        # Emacs configuration
│
├── tools/                            # Development tools
│   ├── generate.go                   # Go generate scripts
│   └── grammar-dev/                  # Grammar development helpers
│
└── docs/                             # Documentation
    ├── grammar-reference.md
    ├── lsp-features.md
    └── examples/
```

## Component Descriptions

### Grammar Directory (`grammar/`)

The Tree-sitter grammar and all related parsing infrastructure:

- **`grammar.js`**: The main Tree-sitter grammar definition file
- **`src/`**: Generated C parser code from Tree-sitter
- **`bindings/go/`**: Go language bindings for the parser
- **`queries/`**: Tree-sitter query files for various language features:
  - `highlights.scm`: Syntax highlighting rules
  - `locals.scm`: Variable scoping and local definitions
  - `folds.scm`: Code folding patterns
  - `errors.scm`: Error detection patterns
- **`test/corpus/`**: Test cases for grammar validation
- **`examples/`**: Example MCP Script files for testing

### Internal Packages (`internal/`)

Core implementation packages not exposed as public API:

#### Parser (`internal/parser/`)

- Wrapper around Tree-sitter parser
- Tree manipulation utilities
- Query execution helpers

#### AST (`internal/ast/`)

- Abstract Syntax Tree node definitions
- Builder to convert Tree-sitter parse trees to typed AST
- Visitor pattern for AST traversal

#### Analyzer (`internal/analyzer/`)

- Semantic analysis using Tree-sitter queries
- Type checking and inference
- Scope analysis
- Diagnostic collection

#### Runtime (`internal/runtime/`)

- Main interpreter implementation
- MCP server integration
- Agent conversation management
- LLM provider integrations
- Async execution engine

#### LSP (`internal/lsp/`)

- Language Server Protocol implementation
- Real-time diagnostics with incremental parsing
- Auto-completion using Tree-sitter queries
- Hover information and code navigation
- Code formatting

#### CLI (`internal/cli/`)

- Command-line interface utilities
- Configuration management
- Shared CLI components

### Commands (`cmd/`)

Single executable binary with multiple subcommands:

- **`mcps/`**: Unified CLI tool containing all functionality
  - `mcps run`: Execute MCP Script files (interpreter)
  - `mcps fmt`: Format MCP Script code
  - `mcps lsp`: Start language server for editor integration
  - `mcps query`: Run Tree-sitter queries for testing and analysis
  - `mcps check`: Type check files without execution
  - `mcps version`: Display version information

### Public API (`pkg/`)

Public interfaces and APIs for external consumption

### Editor Integrations (`editors/`)

Editor-specific integrations and configurations:

- **`vscode/`**: VS Code extension with LSP client
- **`neovim/`**: Neovim configuration and plugins
- **`emacs/`**: Emacs mode and configuration

### Development Tools (`tools/`)

- Go generate scripts for code generation
- Grammar development helpers and utilities

### Documentation (`docs/`)

- Grammar reference documentation
- LSP feature documentation
- Usage examples and tutorials

## Key Architectural Decisions

### Tree-sitter as Foundation

- **Single grammar** drives parser, LSP, and syntax highlighting
- **Incremental parsing** for real-time editor performance
- **Query-based analysis** for consistent tooling behavior
- **Error recovery** for robust handling of incomplete code

### Go for Core Implementation

- **Performance**: Compiled language with excellent concurrency
- **Ecosystem**: Rich libraries for HTTP, JSON-RPC, CLI tools
- **Maintainability**: Strong typing and clear package structure
- **Cross-platform**: Easy distribution of binaries

### Modular Design

- **Clear separation** between parsing, analysis, and execution
- **Plugin architecture** for MCP servers and LLM providers
- **Extensible** grammar and query system
- **Testable** components with dependency injection

## Development Workflow

### Grammar Development

```bash
cd grammar
tree-sitter generate    # Generate parser
tree-sitter test        # Run grammar tests
tree-sitter parse file  # Test parsing
```

### Go Development

```bash
go generate ./...       # Generate bindings
go test ./...          # Run tests
go build ./cmd/...     # Build binaries
```

### Editor Integration

```bash
tree-sitter build-wasm              # Build WASM parser
tree-sitter generate --build        # Generate bindings
```

## Future Extensions

### Additional Tooling

- Debugger integration
- Profiling tools
- Package manager
- Testing framework

### Editor Support

- IntelliJ IDEA plugin
- Sublime Text package
- Vim plugin

### Runtime Features

- WebAssembly target
- Distributed execution
- Hot reloading
- Interactive REPL
