;; Error patterns for syntax highlighting and LSP diagnostics

;; Missing semicolons (optional in mcps, but detect if used inconsistently)
(ERROR) @error

;; Incomplete expressions
(expression_statement
  (ERROR) @error.expression)

;; Incomplete type annotations
(type_annotation
  (ERROR) @error.type)

;; Incomplete blocks
(block
  (ERROR) @error.block)

;; Incomplete parameter lists
(parameter_list
  (ERROR) @error.parameter)

;; Incomplete import statements
(import_statement
  (ERROR) @error.import)

;; Incomplete string interpolation
(interpolation
  (ERROR) @error.interpolation)