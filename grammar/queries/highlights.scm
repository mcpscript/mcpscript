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
  name: (identifier) @function)

;; Function calls
(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (member_expression
    property: (identifier) @function.call))

;; Agent names
(agent_declaration
  name: (identifier) @type)

;; Model names  
(model_declaration
  name: (identifier) @type)

;; MCP server names
(mcp_declaration
  name: (identifier) @namespace)

;; Parameters
(parameter
  name: (identifier) @parameter)

;; Type annotations
(type_annotation
  (type_expression) @type)

;; Property access
(member_expression
  property: (identifier) @property)

;; Object properties
(object_property
  key: (identifier) @property)

;; Import names
(import_statement
  (identifier) @namespace)

;; Agent delegation
(arrow_expression
  right: (identifier) @type)

;; Error handling
(postfix_expression
  operator: "?" @operator.error)

;; Match patterns
(match_pattern
  ["Ok" "Err"] @keyword)

;; Configuration blocks
(mcp_config_item
  key: (identifier) @property)

(model_config_item
  key: (identifier) @property)

(agent_config_item
  key: (identifier) @property)