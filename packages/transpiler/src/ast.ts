// AST type definitions

export interface ASTNode {
  type: string;
}

export interface MCPDeclaration extends ASTNode {
  type: 'mcp_declaration';
  name: string;
  command: string;
  args: string[];
}

export interface Assignment extends ASTNode {
  type: 'assignment';
  variable: string;
  value: string | ToolCall;
}

export interface ToolCall extends ASTNode {
  type: 'tool_call';
  server: string;
  tool: string;
  args: string[];
}

export interface PrintStatement extends ASTNode {
  type: 'print_statement';
  variable: string;
}

export type Statement = MCPDeclaration | Assignment | PrintStatement;
