package parser

import (
	_ "embed"
)

// Embedded query files from the grammar
// These will be compiled into the binary for easy access

//go:embed ../../../grammar/queries/highlights.scm
var HighlightsQuery string

//go:embed ../../../grammar/queries/locals.scm  
var LocalsQuery string

//go:embed ../../../grammar/queries/folds.scm
var FoldsQuery string

//go:embed ../../../grammar/queries/errors.scm
var ErrorsQuery string

// QueryType represents different types of Tree-sitter queries
type QueryType string

const (
	QueryHighlights QueryType = "highlights"
	QueryLocals     QueryType = "locals"
	QueryFolds      QueryType = "folds"
	QueryErrors     QueryType = "errors"
)

// GetQuery returns the query string for a given type
func GetQuery(queryType QueryType) string {
	switch queryType {
	case QueryHighlights:
		return HighlightsQuery
	case QueryLocals:
		return LocalsQuery
	case QueryFolds:
		return FoldsQuery
	case QueryErrors:
		return ErrorsQuery
	default:
		return ""
	}
}