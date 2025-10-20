package parser

import (
	"context"
	"testing"
)

func TestParserBasic(t *testing.T) {
	parser := New()
	defer parser.Close()

	// Test simple variable declaration
	source := `name = "Alice"`
	
	tree, err := parser.ParseString(context.Background(), source)
	if err != nil {
		t.Fatalf("Failed to parse: %v", err)
	}
	defer tree.Close()

	root := tree.RootNode()
	if root.Type() != "program" {
		t.Errorf("Expected root type 'program', got '%s'", root.Type())
	}

	if root.ChildCount() == 0 {
		t.Error("Expected at least one child node")
	}
}

func TestParserMCPDeclaration(t *testing.T) {
	parser := New()
	defer parser.Close()

	source := `mcp filesystem {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem"]
}`

	tree, err := parser.ParseString(context.Background(), source)
	if err != nil {
		t.Fatalf("Failed to parse MCP declaration: %v", err)
	}
	defer tree.Close()

	root := tree.RootNode()
	if root.ChildCount() == 0 {
		t.Error("Expected MCP declaration to be parsed")
	}

	// Check if we have an mcp_declaration node
	child := root.Child(0)
	if child.Type() != "mcp_declaration" {
		t.Errorf("Expected 'mcp_declaration', got '%s'", child.Type())
	}
}

func TestParserWorkflow(t *testing.T) {
	parser := New()
	defer parser.Close()

	source := `workflow processData(input: string): Result<any, Error> {
    content = filesystem.readFile(input)?
    return Ok(content)
}`

	tree, err := parser.ParseString(context.Background(), source)
	if err != nil {
		t.Fatalf("Failed to parse workflow: %v", err)
	}
	defer tree.Close()

	root := tree.RootNode()
	if root.ChildCount() == 0 {
		t.Error("Expected workflow to be parsed")
	}

	child := root.Child(0)
	if child.Type() != "workflow_declaration" {
		t.Errorf("Expected 'workflow_declaration', got '%s'", child.Type())
	}
}

func TestHighlightsQuery(t *testing.T) {
	query := GetQuery(QueryHighlights)
	if query == "" {
		t.Error("Highlights query should not be empty")
	}

	// Check if it contains expected patterns
	expectedPatterns := []string{
		"@keyword",
		"@string", 
		"@number",
		"@function",
	}

	for _, pattern := range expectedPatterns {
		if !containsString(query, pattern) {
			t.Errorf("Highlights query missing pattern: %s", pattern)
		}
	}
}

func TestQueryExecution(t *testing.T) {
	parser := New()
	defer parser.Close()

	source := `workflow test(): string { return "hello" }`
	
	tree, err := parser.ParseString(context.Background(), source)
	if err != nil {
		t.Fatalf("Failed to parse: %v", err)
	}
	defer tree.Close()

	// Test executing a simple query - match any workflow_declaration
	queryStr := `(workflow_declaration) @workflow`
	
	query, cursor, err := parser.Query(tree, queryStr)
	if err != nil {
		t.Fatalf("Failed to execute query: %v", err)
	}
	defer query.Close()
	defer cursor.Close()

	// Should find at least one match
	match, ok := cursor.NextMatch()
	if !ok || match == nil {
		t.Error("Expected to find workflow name in query results")
	}
}

// Helper function to check if string contains substring
func containsString(s, substr string) bool {
	return len(s) >= len(substr) && 
		   func() bool {
			   for i := 0; i <= len(s)-len(substr); i++ {
				   if s[i:i+len(substr)] == substr {
					   return true
				   }
			   }
			   return false
		   }()
}