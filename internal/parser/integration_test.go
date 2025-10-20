package parser

import (
	"context"
	"os"
	"path/filepath"
	"testing"
)

func TestParseExampleFiles(t *testing.T) {
	examples := []string{
		"../../grammar/examples/hello.mcps",
		"../../grammar/examples/agents.mcps",
		"../../grammar/examples/types.mcps",
	}

	parser := New()
	defer parser.Close()

	for _, examplePath := range examples {
		t.Run(filepath.Base(examplePath), func(t *testing.T) {
			// Read the example file
			content, err := os.ReadFile(examplePath)
			if err != nil {
				t.Fatalf("Failed to read example file %s: %v", examplePath, err)
			}

			// Parse the file
			tree, err := parser.Parse(context.Background(), content)
			if err != nil {
				t.Fatalf("Failed to parse %s: %v", examplePath, err)
			}
			defer tree.Close()

			// Verify root node
			root := tree.RootNode()
			if root.Type() != "program" {
				t.Errorf("Expected root type 'program', got '%s'", root.Type())
			}

			// Verify no parse errors
			if root.HasError() {
				t.Errorf("Parse tree contains errors for %s", examplePath)
			}

			// Verify we have some content
			if root.ChildCount() == 0 {
				t.Errorf("Expected some child nodes, got 0 for %s", examplePath)
			}

			t.Logf("✅ Successfully parsed %s: %d top-level nodes", 
				filepath.Base(examplePath), root.ChildCount())
		})
	}
}

func TestQueryHighlighting(t *testing.T) {
	parser := New()
	defer parser.Close()

	source := `
mcp filesystem {
    command: "npx"
}

workflow test(input: string): Result<any, Error> {
    content = filesystem.readFile(input)?
    return Ok(content)
}
`

	tree, err := parser.ParseString(context.Background(), source)
	if err != nil {
		t.Fatalf("Failed to parse: %v", err)
	}
	defer tree.Close()

	// Test highlights query
	query, cursor, err := parser.Query(tree, GetQuery(QueryHighlights))
	if err != nil {
		t.Fatalf("Failed to execute highlights query: %v", err)
	}
	defer query.Close()
	defer cursor.Close()

	// Count highlights
	count := 0
	for {
		match, ok := cursor.NextMatch()
		if !ok {
			break
		}
		count += len(match.Captures)
	}

	if count == 0 {
		t.Error("Expected some highlight captures, got 0")
	}

	t.Logf("✅ Found %d highlight captures", count)
}
