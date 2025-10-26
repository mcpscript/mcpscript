# MCP Script Ultra-Simple MVP Execution Plan

## Overview

This plan outlines the development of an Ultra-Simple Minimal Viable Product (MVP) for MCP Script. The goal is to demonstrate the absolute core concept: define an MCP server, call a tool, store the result, and print it. Nothing more.

## MVP Scope

### What's Included (Absolute Minimum)

1. **MCP Server Declaration** - `mcp servername { command: "...", args: [...] }`
2. **Tool Call** - `result = servername.toolname(arg1, arg2)`
3. **Variable Assignment** - `variable = value`
4. **Print Statement** - `print(variable)`
5. **String Literals** - `"hello world"`

### What's Deferred (Everything Else)

- Types (everything is treated as `any`)
- Control flow (`if`, `for`, `while`)
- Error handling (`try/catch`)
- Environment variables (`env`)
- Logging (`log.*`)
- Functions
- Objects and arrays
- Agent declarations
- Model configurations
- Module system
- Everything else from the full spec

## Repository Setup

### 1. Monorepo Structure

```
mcp-script/
├── package.json             # Workspace root (npm workspaces)
├── tsconfig.json           # Shared TypeScript config
└── packages/
    ├── runtime/            # @mcps/runtime - Core runtime library
    │   ├── package.json
    │   ├── src/
    │   │   ├── index.ts    # Runtime exports
    │   │   ├── mcp.ts      # MCP server management
    │   │   ├── globals.ts  # Global functions (print)
    │   │   └── types.ts    # Runtime type definitions
    │   └── dist/           # Built output
    │
    ├── transpiler/         # @mcps/transpiler - Parser & code generator
    │   ├── package.json
    │   ├── src/
    │   │   ├── index.ts    # Transpiler exports
    │   │   ├── parser.ts   # Tree-sitter wrapper
    │   │   ├── codegen.ts  # JavaScript generator
    │   │   └── ast.ts      # AST type definitions
    │   ├── grammar/
    │   │   ├── grammar.js  # Tree-sitter grammar definition
    │   │   ├── package.json
    │   │   └── src/        # Generated parser files (gitignored)
    │   └── dist/           # Built output
    │
    └── cli/                # @mcps/cli - Command line interface
        ├── package.json
        ├── bin/
        │   └── mcps        # Executable script
        ├── src/
        │   ├── index.ts    # CLI entry point
        │   ├── run.ts      # mcps run command
        │   └── build.ts    # mcps build command (future)
        └── dist/           # Built output
```

### 2. Technology Stack

- **Language**: TypeScript
- **Parser**: Tree-sitter
- **Grammar**: Tree-sitter grammar DSL
- **MCP Client**: @modelcontextprotocol/sdk
- **CLI**: Basic Node.js script
- **Build**: tree-sitter CLI for grammar compilation
- **Workspace**: npm workspaces for monorepo management

### 3. Package Dependencies

**Root workspace (`package.json`):**

```json
{
  "name": "mcp-script",
  "workspaces": ["packages/*"],
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "tree-sitter-cli": "^0.20.0"
  }
}
```

**@mcps/runtime dependencies:**

- `@modelcontextprotocol/sdk` - MCP client
- No external runtime dependencies (keep it minimal)

**@mcps/transpiler dependencies:**

- `tree-sitter` - Parser runtime
- `tree-sitter-mcpscript` - Generated grammar (internal)
- `@mcps/runtime` - Runtime types

**@mcps/cli dependencies:**

- `@mcps/transpiler` - For transpilation
- `@mcps/runtime` - For execution
- `commander` - CLI framework (optional, can use basic process.argv)

### 3. Tree-sitter Grammar

The MVP supports only these 4 constructs:

```javascript
// grammar/grammar.js
module.exports = grammar({
  name: 'mcpscript',

  rules: {
    source_file: $ => repeat($.statement),

    statement: $ => choice($.mcp_declaration, $.assignment, $.print_statement),

    mcp_declaration: $ =>
      seq(
        'mcp',
        $.identifier,
        '{',
        'command:',
        $.string,
        ',',
        'args:',
        '[',
        optional($.string_list),
        ']',
        '}'
      ),

    assignment: $ => seq($.identifier, '=', choice($.string, $.tool_call)),

    tool_call: $ => seq($.identifier, '.', $.identifier, '(', optional($.string_list), ')'),

    print_statement: $ => seq('print', '(', $.identifier, ')'),

    string_list: $ => seq($.string, repeat(seq(',', $.string))),

    string: $ => /"[^"]*"/,

    identifier: $ => /[a-zA-Z][a-zA-Z0-9]*/,
  },
});
```

## Implementation Plan

### Step 1: Monorepo Setup (1 day)

1. **Initialize workspace**
   - Create root `package.json` with npm workspaces
   - Setup shared `tsconfig.json`
   - Create package directories: `packages/runtime/`, `packages/transpiler/`, `packages/cli/`

2. **Package scaffolding**
   - Individual `package.json` files for each package
   - TypeScript configs extending root config
   - Basic `src/` and `dist/` structure

### Step 2: Runtime Package (@mcps/runtime) (1 day)

1. **Core runtime library** (`packages/runtime/`)
   - MCP server connection management (`src/mcp.ts`)
   - Global functions (`src/globals.ts`) - `print()` for MVP
   - Runtime types (`src/types.ts`)
   - Main exports (`src/index.ts`)

2. **Dependencies**
   - Install `@modelcontextprotocol/sdk`
   - Build setup with TypeScript

### Step 3: Grammar & Parser (@mcps/transpiler) (2 days)

1. **Tree-sitter grammar** (`packages/transpiler/grammar/`)
   - Define the 4 MVP constructs in `grammar.js`
   - Create grammar `package.json`
   - Test with `tree-sitter generate` and `tree-sitter parse`

2. **Parser integration** (`packages/transpiler/src/`)
   - TypeScript wrapper around Tree-sitter (`parser.ts`)
   - AST type definitions (`ast.ts`)
   - Parse .mcps files into semantic AST

### Step 4: Code Generator (@mcps/transpiler) (1 day)

1. **JavaScript generation** (`packages/transpiler/src/codegen.ts`)
   - Transform AST to JavaScript modules
   - Import from `@mcps/runtime`
   - Generate async/await for MCP operations

2. **Transpiler exports** (`packages/transpiler/src/index.ts`)
   - Export `parseFile()` and `generateCode()` functions
   - Export AST types

### Step 5: CLI Package (@mcps/cli) (1 day)

1. **Command implementation** (`packages/cli/src/`)
   - CLI entry point (`index.ts`)
   - `mcps run` command (`run.ts`)
   - Import from `@mcps/transpiler` and `@mcps/runtime`

2. **CLI setup**
   - Executable script (`bin/mcps`)
   - Proper shebang and module loading
   - Process command line arguments

### Step 6: Integration & Testing (1 day)

1. **Build pipeline**
   - Root build scripts that build all packages
   - Proper dependency order: runtime → transpiler → cli
   - Link packages with `npm link` for development

2. **End-to-end testing**
   - Create example `hello.mcps`
   - Test `mcps run hello.mcps`
   - Verify MCP server connection and tool calls work

## MVP Example

The ultra-simple MVP handles exactly this:

```mcps
// hello.mcps
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem"]
}

message = "Hello from MCP Script!"
filesystem.writeFile("greeting.txt", message)
content = filesystem.readFile("greeting.txt")
print(content)
```

Expected JavaScript output:

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Connect to filesystem MCP server
const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-filesystem'],
});
const client = new Client({ name: 'mcps', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);

// Get available tools
const tools = await client.listTools();
const filesystem = {};
for (const tool of tools.tools) {
  filesystem[tool.name] = async (...args) => {
    const result = await client.callTool({ name: tool.name, arguments: { ...args } });
    return result.content;
  };
}

// Generated code
let message = 'Hello from MCP Script!';
await filesystem.writeFile('greeting.txt', message);
let content = await filesystem.readFile('greeting.txt');
console.log(content);
```

## Success Criteria

The MVP is complete when:

1. ✅ Can parse the simple example above
2. ✅ Generates working JavaScript
3. ✅ Connects to MCP servers
4. ✅ Calls tools successfully
5. ✅ `mcps run hello.mcps` works

## Next Steps After Ultra-Simple MVP

1. Add more language features gradually
2. Improve error messages
3. Add more examples
4. Better runtime organization

That's it! A working proof-of-concept in about a week.
