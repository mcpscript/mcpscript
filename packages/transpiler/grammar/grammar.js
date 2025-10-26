// Tree-sitter grammar for MCP Script MVP
module.exports = grammar({
  name: 'mcpscript',

  rules: {
    source_file: $ => repeat($.statement),

    statement: $ => choice($.mcp_declaration, $.assignment, $.print_statement),

    mcp_declaration: $ =>
      seq(
        'mcp',
        $.identifier,
        '{',
        'command:',
        $.string,
        ',',
        'args:',
        '[',
        optional($.string_list),
        ']',
        '}'
      ),

    assignment: $ => seq($.identifier, '=', choice($.string, $.tool_call)),

    tool_call: $ =>
      seq($.identifier, '.', $.identifier, '(', optional($.string_list), ')'),

    print_statement: $ => seq('print', '(', $.identifier, ')'),

    string_list: $ => seq($.string, repeat(seq(',', $.string))),

    string: _$ => /"[^"]*"/,

    identifier: _$ => /[a-zA-Z][a-zA-Z0-9]*/,
  },
});
