// JavaScript code generation
import {
  Statement,
  Expression,
  MCPDeclaration,
  Assignment,
  AssignmentTarget,
  ExpressionStatement,
  BlockStatement,
  IfStatement,
  CallExpression,
  MemberExpression,
  BracketExpression,
  Identifier,
  StringLiteral,
  NumberLiteral,
  BooleanLiteral,
  ArrayLiteral,
  ObjectLiteral,
  BinaryExpression,
  UnaryExpression,
} from './ast.js';

/**
 * Generate JavaScript code from an array of AST statements
 */
export function generateCode(statements: Statement[]): string {
  // Track MCP servers to initialize
  const mcpServers = new Map<string, MCPDeclaration>();

  // First pass: collect all MCP declarations
  for (const stmt of statements) {
    if (stmt.type === 'mcp_declaration') {
      mcpServers.set(stmt.name, stmt);
    }
  }

  // Generate MCP client initialization
  const mcpInit =
    mcpServers.size > 0 ? generateMCPInitialization(mcpServers) : '';

  // Generate main code with variable tracking
  const mainCode = generateStatements(statements);

  // Generate cleanup
  const cleanup = mcpServers.size > 0 ? generateCleanup() : '';

  // Combine all parts
  return [mcpInit, mainCode, cleanup].filter(Boolean).join('\n\n');
}

/**
 * Generate MCP client initialization code
 */
function generateMCPInitialization(
  mcpServers: Map<string, MCPDeclaration>
): string {
  const serverInits = Array.from(mcpServers.entries()).map(([name, decl]) =>
    generateMCPServerInit(name, decl)
  );

  return `// Initialize MCP clients
const __mcpClients = {};

${serverInits.join('\n\n')}`;
}

/**
 * Generate transport connection code for an MCP server
 */
function generateTransportConnection(
  name: string,
  config: Record<string, unknown>
): string {
  if (config.url) {
    return generateWebTransportConnection(name, config);
  } else if (config.command) {
    return generateStdioTransportConnection(name, config);
  } else {
    throw new Error(
      `Invalid MCP configuration for ${name}: must specify either 'url' or 'command'`
    );
  }
}

/**
 * Generate transport options (excluding URL) for web transports
 */
function generateTransportOptions(
  config: Record<string, unknown>
): string | null {
  // Extract all options except 'url'
  const { url, ...options } = config;

  // If no additional options, return null
  if (Object.keys(options).length === 0) {
    return null;
  }

  // Serialize the options object
  return serializeConfigObject(options);
}

/**
 * Generate web-based transport connection (HTTP/WebSocket) with SSE fallback
 */
function generateWebTransportConnection(
  name: string,
  config: Record<string, unknown>
): string {
  const url = JSON.stringify(config.url);
  const transportOptions = generateTransportOptions(config);

  if (url.includes('ws://') || url.includes('wss://')) {
    // WebSocket transport (no fallback needed)
    const wsOptions = transportOptions ? `, ${transportOptions}` : '';
    return `const __${name}_transport = new WebSocketClientTransport(new URL(${url})${wsOptions});
await __${name}_client.connect(__${name}_transport);
__mcpClients.${name} = __${name}_client;`;
  } else {
    // HTTP transport with SSE fallback
    const httpOptions = transportOptions ? `, ${transportOptions}` : '';
    return `try {
  const __${name}_transport = new StreamableHTTPClientTransport(new URL(${url})${httpOptions});
  await __${name}_client.connect(__${name}_transport);
  __mcpClients.${name} = __${name}_client;
} catch (httpError) {
  // Fallback to SSE transport for backwards compatibility
  console.log('StreamableHTTP connection failed, falling back to SSE transport');
  const __${name}_sseTransport = new SSEClientTransport(new URL(${url})${httpOptions});
  await __${name}_client.connect(__${name}_sseTransport);
  __mcpClients.${name} = __${name}_client;
}`;
  }
}

/**
 * Generate stdio transport connection
 */
function generateStdioTransportConnection(
  name: string,
  config: Record<string, unknown>
): string {
  return `const __${name}_transport = new StdioClientTransport(${serializeConfigObject(config)});
await __${name}_client.connect(__${name}_transport);
__mcpClients.${name} = __${name}_client;`;
}

/**
 * Generate initialization code for a single MCP server
 */
function generateMCPServerInit(name: string, decl: MCPDeclaration): string {
  const config = extractObjectValues(decl.config);
  const connectionCode = generateTransportConnection(name, config);

  return `// Connect to ${name} MCP server
const __${name}_client = new MCPClient({
  name: 'mcps',
  version: '1.0.0'
}, {
  capabilities: {}
});

${connectionCode}

// Create tool proxy for ${name}
const ${name} = {};
const __${name}_tools = await __${name}_client.listTools();
for (const tool of __${name}_tools.tools) {
  ${name}[tool.name] = async (...args) => {
    let toolArgs;

    // If single object argument, use as-is (explicit parameter object)
    if (args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0])) {
      toolArgs = args[0];
    } else {
      // Get tool schema to map positional args to named parameters
      const toolInfo = __${name}_tools.tools.find(t => t.name === tool.name);
      const inputSchema = toolInfo?.inputSchema;

      if (inputSchema && inputSchema.properties) {
        // Map positional arguments to schema parameter names
        const paramNames = Object.keys(inputSchema.properties);
        toolArgs = {};
        paramNames.forEach((paramName, index) => {
          if (index < args.length) {
            toolArgs[paramName] = args[index];
          }
        });
      } else {
        // Fallback: use generic numbered parameters if no schema
        toolArgs = Object.fromEntries(
          args.map((arg, index) => [\`arg\${index}\`, arg])
        );
      }
    }

    const result = await __${name}_client.callTool({
      name: tool.name,
      arguments: toolArgs
    });
    return result.content[0]?.type === 'text' ? result.content[0].text : result.content;
  };
}`;
}

/**
 * Generate code for all statements (excluding MCP declarations)
 */
function generateStatements(statements: Statement[]): string {
  // Track which variables have been declared
  const declaredVariables = new Set<string>();

  const codeLines = statements
    .filter(stmt => stmt.type !== 'mcp_declaration')
    .map(stmt => {
      if (stmt.type === 'assignment') {
        return generateAssignment(stmt, declaredVariables);
      } else if (stmt.type === 'expression_statement') {
        return generateExpressionStatement(stmt);
      } else if (stmt.type === 'block_statement') {
        return generateBlockStatement(stmt, declaredVariables);
      } else if (stmt.type === 'if_statement') {
        return generateIfStatement(stmt, declaredVariables);
      }
      return '';
    })
    .filter(Boolean);

  if (codeLines.length === 0) {
    return '';
  }

  return `// Generated code
${codeLines.join('\n')}`;
}

/**
 * Generate cleanup code for MCP clients
 */
function generateCleanup(): string {
  return `// Cleanup
for (const client of Object.values(__mcpClients)) {
  await client.close();
}`;
}

/**
 * Serialize a config object as JavaScript code (not JSON)
 */
function serializeConfigObject(obj: unknown): string {
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (typeof obj === 'string') return JSON.stringify(obj);
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(item => serializeConfigObject(item)).join(', ') + ']';
  }
  if (typeof obj === 'object') {
    const pairs = Object.entries(obj).map(([key, value]) => {
      // Use quoted key if it's not a valid identifier or contains special chars
      const quotedKey = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)
        ? key
        : JSON.stringify(key);
      return `${quotedKey}: ${serializeConfigObject(value)}`;
    });
    return '{' + pairs.join(', ') + '}';
  }
  return 'undefined';
}

/**
 * Extract object properties as a map of key to actual JavaScript values
 */
function extractObjectValues(obj: ObjectLiteral): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const prop of obj.properties) {
    props[prop.key] = extractValue(prop.value);
  }
  return props;
}

/**
 * Extract actual JavaScript value from an AST expression
 */
function extractValue(expr: Expression): unknown {
  switch (expr.type) {
    case 'string':
      return (expr as StringLiteral).value;
    case 'number':
      return (expr as NumberLiteral).value;
    case 'boolean':
      return (expr as BooleanLiteral).value;
    case 'array':
      return (expr as ArrayLiteral).elements.map(extractValue);
    case 'object': {
      const obj: Record<string, unknown> = {};
      for (const prop of (expr as ObjectLiteral).properties) {
        obj[prop.key] = extractValue(prop.value);
      }
      return obj;
    }
    case 'identifier':
      return (expr as Identifier).name; // Return identifier name as string
    default:
      return undefined;
  }
}

/**
 * Generate code for an assignment statement
 */
function generateAssignment(
  stmt: Assignment,
  declaredVariables: Set<string>
): string {
  const value = generateExpression(stmt.value);

  // Handle different assignment target types
  if (stmt.target.type === 'identifier') {
    const identifier = stmt.target as Identifier;
    const variable = identifier.name;

    // Check if this is the first time we're seeing this variable
    if (declaredVariables.has(variable)) {
      // Variable already declared, generate reassignment
      return `${variable} = ${value};`;
    } else {
      // First time seeing this variable, generate declaration
      declaredVariables.add(variable);
      return `let ${variable} = ${value};`;
    }
  } else {
    // For member and bracket expressions, generate direct assignment
    const target = generateAssignmentTarget(stmt.target);
    return `${target} = ${value};`;
  }
}

/**
 * Generate code for an assignment target
 */
function generateAssignmentTarget(target: AssignmentTarget): string {
  switch (target.type) {
    case 'identifier':
      return (target as Identifier).name;
    case 'member':
      return generateMemberExpression(target as MemberExpression);
    case 'bracket':
      return generateBracketExpression(target as BracketExpression);
    default:
      throw new Error(
        `Unknown assignment target type: ${(target as AssignmentTarget).type}`
      );
  }
}

/**
 * Generate code for an expression statement
 */
function generateExpressionStatement(stmt: ExpressionStatement): string {
  const expr = generateExpression(stmt.expression);
  // Expression already includes await if needed
  return `${expr};`;
}

/**
 * Generate code for a block statement
 */
function generateBlockStatement(
  stmt: BlockStatement,
  declaredVariables: Set<string>
): string {
  const blockLines = stmt.statements
    .filter(s => s.type !== 'mcp_declaration')
    .map(s => {
      if (s.type === 'assignment') {
        return generateAssignment(s, declaredVariables);
      } else if (s.type === 'expression_statement') {
        return generateExpressionStatement(s);
      } else if (s.type === 'block_statement') {
        return generateBlockStatement(s, declaredVariables);
      } else if (s.type === 'if_statement') {
        return generateIfStatement(s, declaredVariables);
      }
      return '';
    })
    .filter(Boolean);

  if (blockLines.length === 0) {
    return '{}';
  }

  const indentedLines = blockLines
    .map(line =>
      // If line is already a block, indent each of its lines
      line.includes('\n')
        ? line
            .split('\n')
            .map(subLine => `  ${subLine}`)
            .join('\n')
        : `  ${line}`
    )
    .join('\n');

  return `{\n${indentedLines}\n}`;
}

/**
 * Generate code for an if statement
 */
function generateIfStatement(
  stmt: IfStatement,
  declaredVariables: Set<string>
): string {
  const condition = generateExpression(stmt.condition);

  // Always normalize statements to block format for consistency
  const thenCode = generateStatementAsBlock(stmt.then, declaredVariables);

  if (stmt.else) {
    const elseCode = generateStatementAsBlock(stmt.else, declaredVariables);
    return `if (${condition}) ${thenCode} else ${elseCode}`;
  } else {
    return `if (${condition}) ${thenCode}`;
  }
}

/**
 * Generate a statement as a block, wrapping non-block statements
 */
function generateStatementAsBlock(
  stmt: Statement,
  declaredVariables: Set<string>
): string {
  if (stmt.type === 'block_statement') {
    return generateBlockStatement(stmt, declaredVariables);
  } else {
    // Wrap non-block statements in a block with proper indentation
    const statementCode = generateSingleStatement(stmt, declaredVariables);
    const indentedCode = indentCode(statementCode, '  ');
    return `{\n${indentedCode}\n}`;
  }
}

/**
 * Indent code by adding the given prefix to each line
 */
function indentCode(code: string, indent: string): string {
  return code
    .split('\n')
    .map(line => (line.trim() ? `${indent}${line}` : line))
    .join('\n');
}

/**
 * Generate code for a single statement (non-block)
 */
function generateSingleStatement(
  stmt: Statement,
  declaredVariables: Set<string>
): string {
  switch (stmt.type) {
    case 'assignment':
      return generateAssignment(stmt, declaredVariables);
    case 'expression_statement':
      return generateExpressionStatement(stmt);
    case 'if_statement':
      return generateIfStatement(stmt, declaredVariables);
    default:
      return '';
  }
}

/**
 * Generate code for an expression
 */
function generateExpression(expr: Expression): string {
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
  return `${callee}(${args.join(', ')})`;
}

/**
 * Generate code for a member expression
 */
function generateMemberExpression(expr: MemberExpression): string {
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
function generateBracketExpression(expr: BracketExpression): string {
  const object = generateExpression(expr.object);
  const index = generateExpression(expr.index);
  return `${object}[${index}]`;
}

/**
 * Generate code for a binary expression
 */
function generateBinaryExpression(expr: BinaryExpression): string {
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
 * Generate code for a unary expression
 */
function generateUnaryExpression(expr: UnaryExpression): string {
  const operand = generateExpression(expr.operand);

  // Check if operand needs parentheses (for binary expressions with lower precedence than unary)
  const needsParen = expr.operand.type === 'binary';
  const operandCode = needsParen ? `(${operand})` : operand;

  return `${expr.operator}${operandCode}`;
}

/**
 * Get operator precedence (higher number = higher precedence)
 */
function getOperatorPrecedence(op: string): number {
  switch (op) {
    case '||':
      return 1;
    case '&&':
      return 2;
    case '==':
    case '!=':
    case '<':
    case '>':
    case '<=':
    case '>=':
      return 3;
    case '+':
    case '-':
      return 4;
    case '*':
    case '/':
    case '%':
      return 5;
    default:
      return 0;
  }
}
