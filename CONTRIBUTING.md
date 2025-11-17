# Contributing to MCP Script

Thank you for your interest in contributing to MCP Script! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style and Standards](#code-style-and-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior by opening an issue or contacting the project maintainers.

## Getting Started

MCP Script is a scripting language for building agentic workflows with native Model Context Protocol (MCP) support. The project is built in TypeScript and organized as a monorepo with three main packages:

- **@mcpscript/cli** - Command-line interface to run and compile MCP scripts
- **@mcpscript/runtime** - Runtime library for MCP Script execution
- **@mcpscript/transpiler** - Transpiler and parser using tree-sitter grammar

## Development Setup

### Prerequisites

- Node.js (v20 or higher recommended)
- npm (comes with Node.js)
- Git
- Python and C++ build tools (for tree-sitter grammar compilation)
  - On macOS: Xcode Command Line Tools
  - On Linux: `build-essential` package
  - On Windows: Visual Studio Build Tools
- **Ollama** (optional, for running agent-related tests and examples)
  - Install from [ollama.ai](https://ollama.ai)
  - Pull the test model: `ollama pull gpt-oss:20b`
  - Required for E2E agent tests and the `examples/agent-system.mcps` example

### Installation

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/mcpscript.git
   cd mcpscript
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Build all packages:

   ```bash
   npm run build
   ```

5. Run tests to verify your setup:
   ```bash
   npm test
   ```

## Project Structure

```
mcpscript/
├── packages/
│   ├── cli/              # Command-line interface
│   │   ├── src/          # Source files
│   │   ├── bin/          # Executable scripts
│   │   └── __tests__/    # Tests (including E2E)
│   ├── runtime/          # Runtime execution environment
│   │   ├── src/          # Source files
│   │   └── __tests__/    # Unit tests
│   └── transpiler/       # Parser and code generator
│       ├── src/          # Source files
│       ├── grammar/      # Tree-sitter grammar
│       └── __tests__/    # Unit tests
├── examples/             # Example MCP scripts
├── design/               # Language specification
└── backlog/              # Development backlog
```

### Key Technologies

- **TypeScript** - ES2022 target with strict mode
- **Tree-sitter** - Grammar-based parsing
- **Vitest** - Unit and integration testing
- **ESLint & Prettier** - Code quality and formatting
- **LlamaIndex** - AI agent and model integration
- **MCP SDK** - Model Context Protocol support

## Development Workflow

### Available Commands

At the workspace root:

```bash
# Build all packages
npm run build

# Run all tests
npm test

# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Clean build artifacts
npm run clean

# Run MCP Script CLI
npm run mcps -- <args>
```

### Package-Specific Commands

In `packages/transpiler`:

```bash
# Rebuild tree-sitter grammar
npm run build:grammar

# Run grammar tests
npm run test:grammar
```

### Development Cycle

1. **Create a feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines

3. **Add tests** for your changes

4. **Run tests and linting**:

   ```bash
   npm test
   npm run lint
   npm run format
   ```

5. **Commit your changes** using [Conventional Commits](https://www.conventionalcommits.org/) format:

   ```bash
   git add .
   git commit -m "type(scope): description"
   ```

   Examples:
   - `feat(transpiler): add support for template literals`
   - `fix(runtime): resolve agent delegation timeout issue`
   - `docs(contributing): clarify commit message format`
   - `test(cli): add E2E tests for error handling`

6. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request** on GitHub

## Code Style and Standards

### TypeScript

- Use TypeScript strict mode (all strict compiler options enabled)
- Target ES2022 with ESNext modules
- Use `.js` extensions in import statements for ESM compatibility
- Prefer explicit types over implicit `any`
- Prefix unused parameters with underscore (`_param`)

### Formatting

- **Prettier** configuration:
  - Single quotes
  - 2-space indentation
  - Trailing commas
  - Line width: 100 characters

- Run `npm run format` before committing

### Linting

- Follow ESLint rules with TypeScript plugin
- Run `npm run lint` to check for issues
- Run `npm run lint:fix` to auto-fix where possible

### File Organization

- Keep source files in `src/` directories
- Use `index.ts` files for package exports
- Place tests in `__tests__/` subdirectories
- Generate build outputs to `dist/` directories

## Testing

### Test Organization

- **Unit tests**: Place in individual packages (`packages/{package}/src/__tests__/`)
- **Integration/E2E tests**: Place in CLI package (`packages/cli/src/__tests__/e2e/`)
- **Grammar tests**: Place in `packages/transpiler/grammar/test/corpus/`

### Writing Tests

Use Vitest for all tests:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('YourFeature', () => {
  it('should do something', () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

### E2E Test Pattern

Always use `executeInVM` from `@mcpscript/runtime` for E2E tests:

```typescript
import { executeInVM } from '@mcpscript/runtime';
import { parseSource, generateCode } from '@mcpscript/transpiler';

const source = `
  // Your MCP Script code
  print("Hello, World!")
`;

const ast = parseSource(source);
const code = generateCode(ast);
await executeInVM(code, { timeout: 5000 });
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests for a specific package
cd packages/cli && npm test

# Run with coverage
npm test -- --coverage
```

## Submitting Changes

### Pull Request Guidelines

1. **Follow the branching strategy**:
   - `main` - stable releases
   - `feature/*` - new features
   - `fix/*` - bug fixes
   - `docs/*` - documentation updates

2. **Write clear commit messages**:
   - Use conventional commits format: `type(scope): description`
   - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
   - Example: `feat(transpiler): add support for for-of loops`

3. **Ensure all checks pass**:
   - All tests pass
   - No linting errors
   - Code is formatted
   - Build succeeds

4. **Provide a clear PR description**:
   - What changes were made
   - Why the changes were needed
   - How was the change tested
   - Any breaking changes
   - Related issues (use `Fixes #123` to auto-close issues)

5. **Keep PRs focused**:
   - One feature or fix per PR
   - Avoid mixing refactoring with new features

### Review Process

- Maintainers will review your PR
- Address any feedback or requested changes
- Once approved, your PR will be merged

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **MCP Script version** (`mcps --version`)
5. **Environment details** (OS, Node.js version)
6. **Minimal reproducible example** (if possible)

### Feature Requests

When requesting features, please include:

1. **Clear description** of the feature
2. **Use case** - why is this needed?
3. **Proposed solution** (if you have one)
4. **Examples** of how it would work

### Using Issue Templates

Please use the appropriate issue template when creating new issues on GitHub.

## Additional Resources

- [Language Specification](design/mcp-script-spec.md)
- [Development Backlog](backlog/execution-backlog.md)
- [Examples](examples/)

## Questions?

If you have questions that aren't covered in this guide, feel free to:

- Open a discussion on GitHub
- Ask in issue comments
- Check existing issues and PRs for similar questions

Thank you for contributing to MCP Script!
