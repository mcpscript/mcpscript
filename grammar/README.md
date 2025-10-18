# Tree-sitter Grammar for MCP Script

This directory contains the Tree-sitter grammar definition for the MCP Script
language (`.mcps` files).

## Quick Start

### Prerequisites

Make sure you have Node.js and the Tree-sitter CLI installed:

```bash
npm install -g tree-sitter-cli
```

### Building the Grammar

```bash
# Install dependencies
npm install

# Generate the parser and bindings
tree-sitter generate

# Generate Go bindings (automatically creates bindings/go/)
tree-sitter generate --build

# Run tests
tree-sitter test

# Parse an example file
tree-sitter parse examples/hello.mcps
```

### Development Workflow

1. **Edit the grammar**: Modify `grammar.js`
2. **Generate parser**: Run `tree-sitter generate`
3. **Test changes**: Run `tree-sitter test`
4. **Parse examples**: Use `tree-sitter parse examples/*.mcps`

### Testing

The grammar includes comprehensive test cases in `test/corpus/`:

- `declarations.txt` - Variable, MCP, model, agent, and workflow declarations
- `expressions.txt` - All expression types including string interpolation and
  agent delegation
- `control_flow.txt` - If/else, for loops, while loops, return statements
- `imports.txt` - Import statement variations
- `comments.txt` - Line and block comments

Run all tests:

```bash
tree-sitter test
```

Run specific test file:

```bash
tree-sitter test --filter declarations
```

### Syntax Highlighting

The grammar includes query files for syntax highlighting:

- `queries/highlights.scm` - Syntax highlighting rules
- `queries/locals.scm` - Local variable scoping
- `queries/folds.scm` - Code folding patterns
- `queries/errors.scm` - Error detection patterns

Test highlighting on an example:

```bash
tree-sitter highlight examples/hello.mcps
```

### Examples

See the `examples/` directory for sample MCP Script files:

- `hello.mcps` - Simple hello world with MCP server
- `agents.mcps` - Agent workflows and conversations
- `types.mcps` - Type system examples

## Grammar Structure

The grammar supports all MCP Script language features:

- **Declarations**: MCP servers, models, agents, workflows, variables
- **Type System**: Primitive types, arrays, maps, sets, Result types
- **Expressions**: Binary ops, calls, member access, string interpolation
- **Control Flow**: If/else, for loops, while loops, match expressions
- **Agent Features**: Agent delegation with `->` operator
- **Error Handling**: `?` operator and Result types
- **Imports**: Named and namespace imports

## Integration

This grammar integrates with:

- **Go bindings**: For the MCP Script interpreter
- **VS Code**: Syntax highlighting and LSP features
- **Other editors**: Via Tree-sitter's standard tooling

## Contributing

When modifying the grammar:

1. Update `grammar.js` with your changes
2. Add test cases to `test/corpus/` for new features
3. Update query files if needed for highlighting
4. Run the full test suite
5. Test with example files

The grammar should handle all syntax from the MCP Script specification while
maintaining good error recovery for incomplete code.
