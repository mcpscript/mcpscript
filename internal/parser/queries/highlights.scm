;; Keywords
[
  "import"
  "from"
  "as"
  "mcp"
  "model"
  "agent"
  "workflow"
  "if"
  "else"
  "for"
  "in"
  "while"
  "return"
  "match"
] @keyword

;; Special keywords
[
  "true"
  "false"
] @boolean

;; Types
[
  "string"
  "number"
  "boolean"
  "any"
  "void"
  "Map"
  "Set"
  "Result"
  "Ok"
  "Err"
] @type.builtin

;; Operators
[
  "="
  "+="
  "-="
  "*="
  "/="
  "=="
  "!="
  "<"
  "<="
  ">"
  ">="
  "+"
  "-"
  "*"
  "/"
  "%"
  "&&"
  "||"
  "!"
  "?"
  "->"
  "=>"
] @operator

;; Punctuation
[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
  ","
  ":"
  ";"
] @punctuation.delimiter

;; Comments
(comment) @comment

;; Strings
(string_literal) @string
(string_content) @string
(string_interpolation) @string

;; String interpolation
(interpolation 
  ["$" "${" "}"] @punctuation.special) 

;; Numbers
(number_literal) @number

;; Identifiers
(identifier) @variable

;; Function/workflow names
(workflow_declaration
  (identifier) @function)

;; Function calls - simple identifier calls
(call_expression
  (primary_expression
    (identifier) @function.call))

;; Function calls - method calls (member_expression)
(call_expression
  (member_expression
    _ 
    (identifier) @function.call))

;; Agent names - first identifier child
(agent_declaration
  (identifier) @type
  (agent_config_block))

;; Model names - first identifier child
(model_declaration
  (identifier) @type
  (model_config_block))

;; MCP server names - first identifier child
(mcp_declaration
  (identifier) @namespace
  (mcp_config_block))

;; Parameters
(parameter
  (identifier) @parameter)

;; Type annotations
(type_annotation
  (type_expression) @type)

;; Property access - second child is the property
(member_expression
  _ 
  (identifier) @property)

;; Object properties
(object_property
  (identifier) @property)

;; Import names
(import_statement
  (identifier) @namespace)

;; Agent delegation - right side identifier
(arrow_expression
  _ 
  (primary_expression
    (identifier) @type))

;; Error handling
(postfix_expression
  "?" @operator.error)

;; Match patterns
(match_pattern
  ["Ok" "Err"] @keyword)

;; Configuration blocks
(mcp_config_item
  (identifier) @property)

(model_config_item
  (identifier) @property)

(agent_config_item
  (identifier) @property)