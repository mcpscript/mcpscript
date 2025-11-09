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

## Development Guidelines

- After finishing implementing a feature, ALWAYS run tests and linting, and make sure they pass.
- Do NOT write a big file explaining everything you did. Instead, just respond with a concise summary.
