// Expression code generators for MCP Script
import {
  Expression,
  Identifier,
  StringLiteral,
  NumberLiteral,
  BooleanLiteral,
  ArrayLiteral,
  ObjectLiteral,
  CallExpression,
  MemberExpression,
  BracketExpression,
  BinaryExpression,
  UnaryExpression,
} from '../ast.js';

/**
 * Generate code for an expression
 */
export function generateExpression(expr: Expression): string {
  switch (expr.type) {
    case 'identifier':
      return (expr as Identifier).name;

    case 'string':
      return JSON.stringify((expr as StringLiteral).value);

    case 'number':
      return String((expr as NumberLiteral).value);

    case 'boolean':
      return String((expr as BooleanLiteral).value);

    case 'array':
      return generateArrayLiteral(expr as ArrayLiteral);

    case 'object':
      return generateObjectLiteral(expr as ObjectLiteral);

    case 'call':
      return generateCallExpression(expr as CallExpression);

    case 'member':
      return generateMemberExpression(expr as MemberExpression);

    case 'bracket':
      return generateBracketExpression(expr as BracketExpression);

    case 'binary':
      return generateBinaryExpression(expr as BinaryExpression);

    case 'unary':
      return generateUnaryExpression(expr as UnaryExpression);

    default:
      throw new Error(`Unknown expression type: ${(expr as Expression).type}`);
  }
}

/**
 * Generate code for an array literal
 */
function generateArrayLiteral(expr: ArrayLiteral): string {
  const elements = expr.elements.map(generateExpression);
  return `[${elements.join(', ')}]`;
}

/**
 * Generate code for an object literal
 */
function generateObjectLiteral(expr: ObjectLiteral): string {
  const props = expr.properties.map(prop => {
    const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(prop.key)
      ? prop.key
      : JSON.stringify(prop.key);
    const value = generateExpression(prop.value);
    return `${key}: ${value}`;
  });
  return `{ ${props.join(', ')} }`;
}

/**
 * Generate code for a call expression
 */
function generateCallExpression(expr: CallExpression): string {
  const args = expr.arguments.map(generateExpression);

  // Check if this is a member call that needs await
  if (expr.callee.type === 'member') {
    // For member calls, generate the callee without await in the member expression
    const callee = generateMemberExpressionForCall(
      expr.callee as MemberExpression
    );
    return `await ${callee}(${args.join(', ')})`;
  }

  const callee = generateExpression(expr.callee);
  // All function calls are async in MCP Script (including user-defined tools)
  return `await ${callee}(${args.join(', ')})`;
}

/**
 * Generate code for a member expression
 */
export function generateMemberExpression(expr: MemberExpression): string {
  const object = generateExpression(expr.object);
  return `${object}.${expr.property}`;
}

/**
 * Generate code for a member expression in a call context
 * This avoids adding await to intermediate calls in a chain
 */
function generateMemberExpressionForCall(expr: MemberExpression): string {
  let object: string;

  // If the object is a call expression with a member callee, generate it without await
  if (
    expr.object.type === 'call' &&
    (expr.object as CallExpression).callee.type === 'member'
  ) {
    const callExpr = expr.object as CallExpression;
    const callee = generateMemberExpressionForCall(
      callExpr.callee as MemberExpression
    );
    const args = callExpr.arguments.map(generateExpression);
    object = `${callee}(${args.join(', ')})`;
  } else {
    object = generateExpression(expr.object);
  }

  return `${object}.${expr.property}`;
}

/**
 * Generate code for a bracket expression (array/object indexing)
 */
export function generateBracketExpression(expr: BracketExpression): string {
  const object = generateExpression(expr.object);
  const index = generateExpression(expr.index);
  return `${object}[${index}]`;
}

/**
 * Generate code for a binary expression
 */
function generateBinaryExpression(expr: BinaryExpression): string {
  // Handle agent delegation operator specially
  if (expr.operator === '->') {
    return generateAgentDelegation(expr);
  }

  const left = generateExpression(expr.left);
  const right = generateExpression(expr.right);

  // Handle operator precedence by wrapping operands in parentheses if they are binary expressions
  // with lower precedence than the current operator
  const leftParen = needsParentheses(expr.left, expr.operator, 'left');
  const rightParen = needsParentheses(expr.right, expr.operator, 'right');

  const leftCode = leftParen ? `(${left})` : left;
  const rightCode = rightParen ? `(${right})` : right;

  return `${leftCode} ${expr.operator} ${rightCode}`;
}

/**
 * Check if mixing ?? with && or || requires explicit parentheses (JavaScript restriction)
 */
function requiresNullishCoalescingParens(
  childOp: string,
  parentOp: string
): boolean {
  // JavaScript doesn't allow mixing ?? with && or || without parentheses
  if (parentOp === '??' && (childOp === '&&' || childOp === '||')) {
    return true;
  }
  if ((parentOp === '&&' || parentOp === '||') && childOp === '??') {
    return true;
  }
  return false;
}

/**
 * Generate code for agent delegation (-> operator)
 */
function generateAgentDelegation(expr: BinaryExpression): string {
  const prompt = generateExpression(expr.left);
  const agentName = generateExpression(expr.right);

  return `await ${agentName}.run(${prompt})`;
}

/**
 * Check if an expression needs parentheses when used as an operand
 */
function needsParentheses(
  expr: Expression,
  parentOp: string,
  side: 'left' | 'right'
): boolean {
  if (expr.type !== 'binary') {
    return false;
  }

  const childOp = (expr as BinaryExpression).operator;

  // JavaScript restriction: ?? cannot be mixed with && or || without parentheses
  if (requiresNullishCoalescingParens(childOp, parentOp)) {
    return true;
  }

  const parentPrec = getOperatorPrecedence(parentOp);
  const childPrec = getOperatorPrecedence(childOp);

  // Lower precedence needs parentheses
  if (childPrec < parentPrec) {
    return true;
  }

  // Same precedence: left-associative operators need parentheses on the right
  if (childPrec === parentPrec && side === 'right') {
    return true;
  }

  return false;
}

/**
 * Get operator precedence (higher number = higher precedence)
 */
function getOperatorPrecedence(op: string): number {
  switch (op) {
    case '->':
      return 0;
    case '??':
      return 1;
    case '||':
      return 2;
    case '&&':
      return 3;
    case '==':
    case '!=':
    case '<':
    case '>':
    case '<=':
    case '>=':
      return 4;
    case '+':
    case '-':
      return 5;
    case '*':
    case '/':
    case '%':
      return 6;
    default:
      return 0;
  }
}

/**
 * Generate code for a unary expression
 */
function generateUnaryExpression(expr: UnaryExpression): string {
  const operand = generateExpression(expr.operand);

  // Check if operand needs parentheses (for binary expressions with lower precedence than unary)
  const needsParen = expr.operand.type === 'binary';
  const operandCode = needsParen ? `(${operand})` : operand;

  return `${expr.operator}${operandCode}`;
}
