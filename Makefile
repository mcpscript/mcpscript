# MCP Script Project Makefile

.PHONY: help grammar test-grammar clean-grammar go-deps test build dev-tools

# Default target
help:
	@echo "MCP Script Development Commands:"
	@echo ""
	@echo "Grammar Development:"
	@echo "  grammar        - Generate Tree-sitter parser"
	@echo "  test-grammar   - Run Tree-sitter grammar tests"
	@echo "  clean-grammar  - Clean generated grammar files"
	@echo ""
	@echo "Go Development:"
	@echo "  go-deps        - Install Go dependencies"
	@echo "  test           - Run Go tests"
	@echo "  build          - Build mcps binary"
	@echo ""
	@echo "Development Tools:"
	@echo "  dev-tools      - Install development tools"
	@echo "  clean          - Clean all generated files"

# Grammar targets
grammar:
	@echo "🏗️  Generating Tree-sitter grammar..."
	cd grammar && npm install
	cd grammar && tree-sitter generate
	@echo "✅ Grammar generated successfully"

# Generate Go bindings from the grammar
go-bindings: grammar
	@echo "🔗 Generating Go bindings..."
	cd grammar && tree-sitter generate --build
	mkdir -p internal/parser/tree_sitter_mcps
	# Copy generated Go bindings to our internal package
	if [ -d "grammar/bindings/go" ]; then \
		cp grammar/bindings/go/* internal/parser/tree_sitter_mcps/; \
	else \
		echo "⚠️  Go bindings not found. Run 'cd grammar && tree-sitter generate --build' manually"; \
	fi
	@echo "✅ Go bindings generated"

test-grammar:
	@echo "🧪 Testing Tree-sitter grammar..."
	cd grammar && tree-sitter test
	@echo "✅ Grammar tests passed"

format-grammar:
	@echo "🎨 Formatting grammar files..."
	cd grammar && npm run format
	@echo "✅ Grammar files formatted"

format-check:
	@echo "🔍 Checking grammar file formatting..."
	cd grammar && npm run format:check
	@echo "✅ Grammar formatting check passed"

clean-grammar:
	@echo "🧹 Cleaning grammar artifacts..."
	cd grammar && rm -rf src/ build/ node_modules/
	@echo "✅ Grammar cleaned"

# Go targets
go-deps:
	@echo "📦 Installing Go dependencies..."
	go mod tidy
	go mod download
	@echo "✅ Go dependencies installed"

test:
	@echo "🧪 Running Go tests..."
	go test -v ./...
	@echo "✅ Go tests passed"

build: go-bindings
	@echo "🔨 Building mcps binary..."
	go build -o bin/mcps ./cmd/mcps
	@echo "✅ Built bin/mcps"

# Development setup
dev-tools:
	@echo "🛠️  Installing development tools..."
	# Tree-sitter CLI
	npm install -g tree-sitter-cli
	# Go tools
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install golang.org/x/tools/cmd/goimports@latest
	@echo "✅ Development tools installed"

# Parse examples with grammar
parse-examples: grammar
	@echo "📝 Parsing example files..."
	cd grammar && tree-sitter parse examples/hello.mcps
	cd grammar && tree-sitter parse examples/agents.mcps  
	cd grammar && tree-sitter parse examples/types.mcps
	@echo "✅ Examples parsed successfully"

# Highlight examples  
highlight-examples: grammar
	@echo "🎨 Testing syntax highlighting..."
	cd grammar && tree-sitter highlight examples/hello.mcps
	@echo "✅ Highlighting test complete"

# Full development setup
setup: dev-tools go-bindings go-deps
	@echo "🚀 Development environment ready!"
	@echo ""
	@echo "Next steps:"
	@echo "  make test-grammar  # Test the grammar"
	@echo "  make build         # Build the interpreter"
	@echo "  make test          # Run Go tests"

# Clean everything
clean: clean-grammar
	@echo "🧹 Cleaning all artifacts..."
	rm -rf bin/
	go clean -cache
	@echo "✅ All clean"

# Quick development cycle  
dev: grammar test-grammar parse-examples
	@echo "🔄 Development cycle complete"

# Test everything
test-all: test-grammar test
	@echo "🧪 All tests complete"

# Development workflow
workflow: go-bindings test-all
	@echo "🔄 Full development workflow complete"