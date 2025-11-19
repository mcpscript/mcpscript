# MCP Script Development Guide

## Project Overview

MCP Script is a scripting language for agentic workflows with native MCP (Model Context Protocol) support. The project is built in TypeScript and organized as a monorepo with three main packages.

### Key Information

- **Language**: TypeScript with ES2022 target
- **Module System**: ESNext modules with `.mjs` extension for CLI binaries
- **Package Manager**: npm with workspaces
- **Architecture**: Monorepo with sub packages (e.g. CLI, Runtime, Transpiler)
- **Testing**: Vitest for unit testing
- **Build System**: TypeScript compiler with tree-sitter for grammar generation

### Code Style and Formatting

- Use Prettier with single quotes, 2-space indentation, trailing commas
- Follow TypeScript strict mode with all strict compiler options enabled
- Use ESLint with TypeScript plugin and Prettier integration
- Prefix unused parameters with underscore (`_param`)
- Use `.js` extensions in import statements (for ESM compatibility)

### File Organization

- Keep source files in `src/` directories within each package
- Use `index.ts` files for package exports
- Place tests in `__tests__/` subdirectories
- Generate build outputs to `dist/` directories

### Package Dependencies

- Runtime depends on `@modelcontextprotocol/sdk`
- CLI depends on `commander` and internal packages
- Transpiler uses `tree-sitter` for parsing
- All packages use file: protocol for internal dependencies

## Build and Development Commands

### Workspace Commands

- `npm run build` - Build all packages
- `npm run test` - Run tests for all packages
- `npm run lint` - Lint all TypeScript files
- `npm run lint:fix` - Auto-fix linting issues
- `npm run dev` - Start development mode (watch builds)
- `npm run clean` - Remove build artifacts

### Package-Specific Commands

- In `packages/transpiler`
  - `npm run build:grammar` - Generate tree-sitter grammar

## Testing Architecture

### Test Organization Best Practices

- **Unit tests**: Keep in individual packages (`packages/{package}/src/__tests__/`)
- **Integration/E2E tests**: Place in CLI package (`packages/cli/src/__tests__/e2e/`)
- **Rationale**: CLI is the natural user entry point and already depends on all other packages

### TypeScript Cross-Package Dependencies

- Avoid relative imports across package boundaries (violates `rootDir` constraints)
- Add proper package dependencies in `package.json` when tests need cross-package imports
- Use package imports (`@mcpscript/transpiler`) instead of relative paths (`../../../transpiler/src/`)
- Example pattern for test dependencies:
  ```json
  "devDependencies": {
    "@mcpscript/transpiler": "file:../transpiler"
  }
  ```

### Vitest Mock Type Annotations

- Use `MockInstance` type from vitest for consistent mock typing
- Import pattern: `import { type MockInstance } from 'vitest'`
- Declare mocks as: `let consoleSpy: MockInstance;`
- Avoid `any` type to maintain type safety

### E2E Test Patterns

- **Always use `executeInVM` from `@mcpscript/runtime`** for E2E tests, never raw Node.js `vm` module
- Benefits: Proper dependency injection, consistent test patterns, sandboxing, timeout support
- Standard pattern:

  ```typescript
  import { executeInVM } from '@mcpscript/runtime';
  import { parseSource, generateCode } from '@mcpscript/transpiler';

  const ast = parseSource(source);
  const code = generateCode(ast);
  await executeInVM(code, { timeout: 5000 });
  ```

- Use `console.log` spy for assertions: `vi.spyOn(console, 'log')`
- Set up/tear down spies in `beforeEach`/`afterEach` hooks

### Local LLM

- Use Ollama's OpenAI API-compatible endpoint for local LLM for testing
- That means using OpenAI as the provider, `http://localhost:11434/v1` as the API base URL, and "ollama" as api key
- Always use `gpt-oss:20b` as test model id

## Grammar and Codegen Consistency

### Critical Synchronization Points

When modifying operator precedence or grammar rules, ensure consistency across components:

- **Tree-sitter grammar** (`packages/transpiler/grammar/grammar.js`): Defines parsing precedence with `prec.left()` values
- **Codegen precedence function** (`packages/transpiler/src/codegen.ts`): Must match grammar precedence for correct parenthesization

### Build Dependencies

- Grammar changes require: `npm run build` in the transpiler package to regenerate parser
- Always rebuild grammar before running parser tests after grammar modifications

## Development Guidelines

- Whenever needed, use context7 to look up relevant dependency documentation
- After finishing making code changes to implement a feature, ALWAYS run tests and linting, and make sure they pass
- Do NOT write a big file explaining everything you did. Instead, just respond with a concise summary
- Do NOT edit the CHANGELOG.md or version numbers. This will be handled during the release process
