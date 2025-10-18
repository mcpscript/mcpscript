;; Scopes
(program) @local.scope
(block) @local.scope
(workflow_declaration) @local.scope
(for_statement) @local.scope
(match_expression) @local.scope

;; Definitions
(workflow_declaration
  name: (identifier) @local.definition.function)

(parameter
  name: (identifier) @local.definition.parameter)

(variable_declaration
  (identifier) @local.definition.variable)

(mcp_declaration
  name: (identifier) @local.definition.namespace)

(model_declaration
  name: (identifier) @local.definition.type)

(agent_declaration
  name: (identifier) @local.definition.type)

;; For loop variable definitions
(for_statement
  variable: (identifier) @local.definition.variable)

(for_statement
  key: (identifier) @local.definition.variable
  value: (identifier) @local.definition.variable)

;; Match pattern bindings
(match_arm
  pattern: (match_pattern
    (identifier) @local.definition.variable))

;; Import definitions
(import_statement
  (identifier) @local.definition.import)

;; References
(identifier) @local.reference