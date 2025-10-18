/**
 * Tree-sitter grammar for MCP Script
 *
 * This grammar defines the syntax for .mcps files, supporting:
 * - MCP server declarations
 * - Model configurations
 * - Agent definitions
 * - Workflows (functions)
 * - Variable declarations with type inference
 * - Control flow (if/else, for, while)
 * - Tool calls and agent delegations
 * - Import/export statements
 */

module.exports = grammar({
  name: 'mcps',

  extras: ($) => [
    /\s/, // whitespace
    $.comment, // comments
  ],

  // Keywords that cannot be used as identifiers
  word: ($) => $.identifier,

  conflicts: ($) => [
    [$.variable_declaration, $.primary_expression],
    [$.object_property, $.primary_expression],
    [$.variable_declaration, $.primary_expression, $.object_property],
    [$.primary_expression, $.type_expression],
    [$.primary_expression, $.generic_type],
    [$.object_literal, $.block],
  ],

  rules: {
    // Root rule - a MCP Script program
    program: ($) => repeat($._statement),

    // Comments
    comment: ($) =>
      choice(
        seq('//', /.*/), // Line comment
        seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/') // Block comment
      ),

    // Statements
    _statement: ($) =>
      choice(
        $.import_statement,
        $.mcp_declaration,
        $.model_declaration,
        $.agent_declaration,
        $.workflow_declaration,
        $.variable_declaration,
        $.expression_statement,
        $.if_statement,
        $.for_statement,
        $.while_statement,
        $.return_statement
      ),

    // Import statements
    import_statement: ($) =>
      seq(
        'import',
        choice(
          // import { name1, name2 } from "module"
          seq('{', commaSep($.identifier), '}', 'from', $.string_literal),
          // import * as name from "module"
          seq('*', 'as', $.identifier, 'from', $.string_literal)
        )
      ),

    // MCP server declarations
    mcp_declaration: ($) => seq('mcp', $.identifier, $.mcp_config_block),

    mcp_config_block: ($) => seq('{', repeat($.mcp_config_item), '}'),

    mcp_config_item: ($) => seq($.identifier, ':', $._expression, optional(',')),

    // Model declarations
    model_declaration: ($) => seq('model', $.identifier, $.model_config_block),

    model_config_block: ($) => seq('{', repeat($.model_config_item), '}'),

    model_config_item: ($) => seq($.identifier, ':', $._expression, optional(',')),

    // Agent declarations
    agent_declaration: ($) => seq('agent', $.identifier, $.agent_config_block),

    agent_config_block: ($) => seq('{', repeat($.agent_config_item), '}'),

    agent_config_item: ($) => seq($.identifier, ':', $._expression, optional(',')),

    // Workflow declarations (functions)
    workflow_declaration: ($) =>
      seq('workflow', $.identifier, $.parameter_list, ':', $.type_expression, $.block),

    parameter_list: ($) => seq('(', commaSep($.parameter), ')'),

    parameter: ($) => seq($.identifier, ':', $.type_expression),

    // Variable declarations
    variable_declaration: ($) => seq($.identifier, optional($.type_annotation), '=', $._expression),

    type_annotation: ($) => seq(':', $.type_expression),

    // Statements
    expression_statement: ($) => seq($._expression, optional(';')),

    if_statement: ($) =>
      seq('if', $._expression, $.block, repeat($.else_if_clause), optional($.else_clause)),

    else_if_clause: ($) => seq('else', 'if', $._expression, $.block),
    else_clause: ($) => seq('else', $.block),

    for_statement: ($) =>
      choice(
        // for item in collection
        seq('for', $.identifier, 'in', $._expression, $.block),
        // for (key, value) in map
        seq('for', '(', $.identifier, ',', $.identifier, ')', 'in', $._expression, $.block)
      ),

    while_statement: ($) => seq('while', $._expression, $.block),

    return_statement: ($) => prec.left(seq('return', optional($._expression))),

    // Block
    block: ($) => seq('{', repeat($._statement), '}'),

    // Expressions
    _expression: ($) =>
      choice(
        $.assignment_expression,
        $.binary_expression,
        $.unary_expression,
        $.postfix_expression,
        $.call_expression,
        $.member_expression,
        $.arrow_expression, // Agent delegation: "message" -> Agent
        $.primary_expression,
        $.match_expression,
        $.string_interpolation
      ),

    assignment_expression: ($) =>
      prec.right(1, seq($._expression, choice('=', '+=', '-=', '*=', '/='), $._expression)),

    binary_expression: ($) =>
      choice(
        prec.left(10, seq($._expression, '||', $._expression)),
        prec.left(11, seq($._expression, '&&', $._expression)),
        prec.left(12, seq($._expression, '==', $._expression)),
        prec.left(12, seq($._expression, '!=', $._expression)),
        prec.left(13, seq($._expression, '<', $._expression)),
        prec.left(13, seq($._expression, '<=', $._expression)),
        prec.left(13, seq($._expression, '>', $._expression)),
        prec.left(13, seq($._expression, '>=', $._expression)),
        prec.left(14, seq($._expression, '+', $._expression)),
        prec.left(14, seq($._expression, '-', $._expression)),
        prec.left(15, seq($._expression, '*', $._expression)),
        prec.left(15, seq($._expression, '/', $._expression)),
        prec.left(15, seq($._expression, '%', $._expression))
      ),

    unary_expression: ($) =>
      prec(16, choice(seq('!', $._expression), seq('-', $._expression), seq('+', $._expression))),

    postfix_expression: ($) =>
      prec(
        17,
        choice(
          seq($._expression, '?'), // Error handling operator
          seq($._expression, '++'),
          seq($._expression, '--')
        )
      ),

    call_expression: ($) => prec(18, seq($._expression, $.argument_list)),

    member_expression: ($) =>
      prec(
        19,
        choice(seq($._expression, '.', $.identifier), seq($._expression, '[', $._expression, ']'))
      ),

    // Agent delegation: "message" -> Agent
    arrow_expression: ($) => prec.right(5, seq($._expression, '->', $._expression)),

    argument_list: ($) => seq('(', commaSep($._expression), ')'),

    // Match expressions for error handling
    match_expression: ($) => seq('match', $._expression, '{', repeat($.match_arm), '}'),

    match_arm: ($) => seq($.match_pattern, '=>', choice($._expression, $.block), optional(',')),

    match_pattern: ($) =>
      choice(
        seq('Ok', '(', $.identifier, ')'),
        seq('Err', '(', $.identifier, ')'),
        $.identifier // catch-all
      ),

    // String interpolation: "Hello ${name}!"
    string_interpolation: ($) => seq('"', repeat1(choice($.string_content, $.interpolation)), '"'),

    string_content: ($) => /[^"$\\]+/,

    interpolation: ($) => choice(seq('$', $.identifier), seq('${', $._expression, '}')),

    // Primary expressions
    primary_expression: ($) =>
      choice(
        $.identifier,
        $.number_literal,
        $.string_literal,
        $.boolean_literal,
        $.array_literal,
        $.object_literal,
        seq('(', $._expression, ')')
      ),

    // Literals
    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    number_literal: ($) =>
      choice(
        /\d+/, // Integer
        /\d+\.\d+/, // Float
        /\d+[eE][+-]?\d+/, // Scientific
        /\d+\.\d+[eE][+-]?\d+/ // Scientific float
      ),

    string_literal: ($) =>
      choice(
        seq('"', repeat(choice(/[^"\\]/, /\\./)), '"'),
        seq("'", repeat(choice(/[^'\\]/, /\\./)), "'"),
        // Multi-line strings
        seq('"""', repeat(/[^"]/), '"""')
      ),

    boolean_literal: ($) => choice('true', 'false'),

    array_literal: ($) => seq('[', commaSep($._expression), ']'),

    // Objects use {key: value} syntax for structured data (like JSON)
    // Maps and Sets use constructor syntax (like TypeScript)
    object_literal: ($) => seq('{', commaSep($.object_property), '}'),

    object_property: ($) => seq(choice($.identifier, $.string_literal), ':', $._expression),

    // Type expressions
    type_expression: ($) =>
      choice(
        $.primitive_type,
        $.array_type,
        $.map_type,
        $.set_type,
        $.result_type,
        $.generic_type,
        $.identifier // Custom types
      ),

    primitive_type: ($) => choice('string', 'number', 'boolean', 'any', 'void'),

    array_type: ($) => seq($.type_expression, '[', ']'),

    map_type: ($) => seq('Map', '<', $.type_expression, ',', $.type_expression, '>'),

    set_type: ($) => seq('Set', '<', $.type_expression, '>'),

    result_type: ($) => seq('Result', '<', $.type_expression, ',', $.type_expression, '>'),

    generic_type: ($) => seq($.identifier, '<', commaSep($.type_expression), '>'),
  },
})

// Helper function for comma-separated lists
function commaSep(rule) {
  return optional(
    seq(
      rule,
      repeat(seq(',', rule)),
      optional(',') // Trailing comma support
    )
  )
}

// Helper for comma-separated lists requiring at least one element
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)), optional(','))
}
