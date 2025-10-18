package parser

import (
	"context"
	"fmt"

	sitter "github.com/smacker/go-tree-sitter"
	tree_sitter_mcps "github.com/your-org/mcps/internal/parser/tree_sitter_mcps"
)

// Parser wraps the Tree-sitter parser for MCP Script
type Parser struct {
	parser   *sitter.Parser
	language *sitter.Language
}

// New creates a new MCP Script parser
func New() *Parser {
	language := tree_sitter_mcps.GetLanguage()
	parser := sitter.NewParser()
	parser.SetLanguage(language)

	return &Parser{
		parser:   parser,
		language: language,
	}
}

// Parse parses MCP Script source code and returns the syntax tree
func (p *Parser) Parse(ctx context.Context, source []byte) (*sitter.Tree, error) {
	tree := p.parser.ParseCtx(ctx, nil, source)
	if tree == nil {
		return nil, fmt.Errorf("failed to parse source code")
	}

	// Check for parse errors
	if tree.RootNode().HasError() {
		return tree, fmt.Errorf("parse errors found in source code")
	}

	return tree, nil
}

// ParseString is a convenience method for parsing string source
func (p *Parser) ParseString(ctx context.Context, source string) (*sitter.Tree, error) {
	return p.Parse(ctx, []byte(source))
}

// GetLanguage returns the Tree-sitter language definition
func (p *Parser) GetLanguage() *sitter.Language {
	return p.language
}

// Query executes a Tree-sitter query against a syntax tree
func (p *Parser) Query(tree *sitter.Tree, queryString string) (*sitter.Query, *sitter.QueryCursor, error) {
	query, err := sitter.NewQuery([]byte(queryString), p.language)
	if err != nil {
		return nil, nil, fmt.Errorf("invalid query: %w", err)
	}

	cursor := sitter.NewQueryCursor()
	cursor.Exec(query, tree.RootNode())

	return query, cursor, nil
}

// Close releases parser resources
func (p *Parser) Close() {
	if p.parser != nil {
		p.parser.Close()
	}
}