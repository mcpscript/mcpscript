package tree_sitter_mcps

// #cgo CFLAGS: -std=c11 -fPIC
// #include "../../../grammar/src/parser.c"
// const TSLanguage *tree_sitter_mcps(void);
import "C"

import (
	"unsafe"

	sitter "github.com/smacker/go-tree-sitter"
)

// GetLanguage returns the Tree-sitter Language for MCP Script
func GetLanguage() *sitter.Language {
	ptr := unsafe.Pointer(C.tree_sitter_mcps())
	return sitter.NewLanguage(ptr)
}
