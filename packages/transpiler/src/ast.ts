// AST type definitions

export interface ASTNode {
  type: string;
}

// Expression types
export interface Identifier extends ASTNode {
  type: 'identifier';
  name: string;
}

export interface StringLiteral extends ASTNode {
  type: 'string';
  value: string;
}

export interface NumberLiteral extends ASTNode {
  type: 'number';
  value: number;
}

export interface BooleanLiteral extends ASTNode {
  type: 'boolean';
  value: boolean;
}

export interface ArrayLiteral extends ASTNode {
  type: 'array';
  elements: Expression[];
}

export interface ObjectLiteral extends ASTNode {
  type: 'object';
  properties: Property[];
}

export interface Property extends ASTNode {
  type: 'property';
  key: string;
  value: Expression;
}

export interface CallExpression extends ASTNode {
  type: 'call';
  callee: Expression;
  arguments: Expression[];
}

export interface MemberExpression extends ASTNode {
  type: 'member';
  object: Expression;
  property: string;
}

export interface BracketExpression extends ASTNode {
  type: 'bracket';
  object: Expression;
  index: Expression;
}

export interface BinaryExpression extends ASTNode {
  type: 'binary';
  left: Expression;
  operator:
    | '+'
    | '-'
    | '*'
    | '/'
    | '%'
    | '=='
    | '!='
    | '<'
    | '>'
    | '<='
    | '>='
    | '&&'
    | '||';
  right: Expression;
}

export interface UnaryExpression extends ASTNode {
  type: 'unary';
  operator: '!' | '-';
  operand: Expression;
}

export type Expression =
  | Identifier
  | StringLiteral
  | NumberLiteral
  | BooleanLiteral
  | ArrayLiteral
  | ObjectLiteral
  | CallExpression
  | MemberExpression
  | BracketExpression
  | BinaryExpression
  | UnaryExpression;

// Statement types
export interface MCPDeclaration extends ASTNode {
  type: 'mcp_declaration';
  name: string;
  config: ObjectLiteral;
}

export interface Assignment extends ASTNode {
  type: 'assignment';
  target: AssignmentTarget;
  value: Expression;
}

export type AssignmentTarget =
  | Identifier
  | MemberExpression
  | BracketExpression;

export interface ExpressionStatement extends ASTNode {
  type: 'expression_statement';
  expression: Expression;
}

export type Statement = MCPDeclaration | Assignment | ExpressionStatement;
