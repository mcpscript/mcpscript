// Tree-sitter grammar for MCP Script with flexible expressions
module.exports = grammar({
  name: 'mcpscript',

  extras: $ => [
    /\s/, // whitespace
    $.comment,
  ],

  rules: {
    source_file: $ => repeat($.statement),

    comment: _$ => token(seq('//', /.*/)),

    statement: $ =>
      choice(
        $.mcp_declaration,
        $.assignment,
        $.expression_statement,
        $.block_statement,
        $.if_statement
      ),

    block_statement: $ => prec(1, seq('{', repeat($.statement), '}')),

    if_statement: $ => seq('if', '(', $.expression, ')', $.statement),

    expression_statement: $ => $.expression,

    assignment: $ => seq($.assignment_target, '=', $.expression),

    assignment_target: $ =>
      choice($.identifier, $.member_expression, $.bracket_expression),

    expression: $ =>
      choice(
        $.binary_expression,
        $.unary_expression,
        $.literal,
        $.identifier,
        $.call_expression,
        $.member_expression,
        $.bracket_expression,
        $.parenthesized_expression
      ),

    binary_expression: $ =>
      choice(
        prec.left(1, seq($.expression, '||', $.expression)),
        prec.left(2, seq($.expression, '&&', $.expression)),
        prec.left(
          3,
          seq(
            $.expression,
            choice('==', '!=', '<', '>', '<=', '>='),
            $.expression
          )
        ),
        prec.left(4, seq($.expression, choice('+', '-'), $.expression)),
        prec.left(5, seq($.expression, choice('*', '/', '%'), $.expression))
      ),

    unary_expression: $ => prec(6, seq(choice('!', '-'), $.expression)),

    call_expression: $ =>
      prec.left(7, seq($.expression, '(', optional($.argument_list), ')')),

    member_expression: $ => prec.left(7, seq($.expression, '.', $.identifier)),

    bracket_expression: _$ =>
      prec.left(7, seq(_$.expression, '[', _$.expression, ']')),

    parenthesized_expression: $ => seq('(', $.expression, ')'),

    argument_list: $ => seq($.expression, repeat(seq(',', $.expression))),

    literal: $ =>
      choice($.string, $.number, $.boolean, $.array_literal, $.object_literal),

    array_literal: $ =>
      seq(
        '[',
        optional(seq($.expression, repeat(seq(',', $.expression)))),
        ']'
      ),

    mcp_declaration: $ => seq('mcp', $.identifier, $.object_literal),

    object_literal: $ => seq('{', optional($.property_list), '}'),

    property_list: $ => seq($.property, repeat(seq(',', $.property))),

    property: $ => seq($.identifier, ':', $.expression),

    string: $ => choice($.double_quoted_string, $.single_quoted_string),

    double_quoted_string: $ =>
      seq(
        '"',
        repeat(
          choice(
            /[^"\\]/, // Any character except " or \
            $.escape_sequence
          )
        ),
        '"'
      ),

    single_quoted_string: $ =>
      seq(
        "'",
        repeat(
          choice(
            /[^'\\]/, // Any character except ' or \
            $.escape_sequence
          )
        ),
        "'"
      ),

    escape_sequence: _ =>
      seq(
        '\\',
        choice(
          /["'\\nrtbf]/, // Common escape sequences: " ' \ n r t b f
          /u[0-9a-fA-F]{4}/, // Unicode: \u1234
          /x[0-9a-fA-F]{2}/, // Hex: \x41
          /[0-7]{1,3}/ // Octal: \123
        )
      ),
    number: _$ =>
      token(
        choice(
          // Scientific notation: 1e5, 2.5e-3, 1.2E+10
          /\d+(\.\d+)?[eE][+-]?\d+/,
          // Decimal numbers: 3.14, 0.5, .25
          /\d*\.\d+/,
          // Integers: 42, 0, 123
          /\d+/
        )
      ),
    boolean: _$ => choice('true', 'false'),
    identifier: _$ => /[a-zA-Z_][a-zA-Z0-9_]*/,
  },
});
