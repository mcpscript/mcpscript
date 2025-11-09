// JavaScript code generation
import {
  Statement,
  Expression,
  MCPDeclaration,
  Assignment,
  ExpressionStatement,
  CallExpression,
  MemberExpression,
  Identifier,
  StringLiteral,
  NumberLiteral,
  BooleanLiteral,
  ArrayLiteral,
  ObjectLiteral,
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

  // Generate imports
  const imports = generateImports();

  // Generate MCP client initialization
  const mcpInit =
    mcpServers.size > 0 ? generateMCPInitialization(mcpServers) : '';

  // Generate main code
  const mainCode = generateStatements(statements);

  // Generate cleanup
  const cleanup = mcpServers.size > 0 ? generateCleanup() : '';

  // Combine all parts
  return [imports, mcpInit, mainCode, cleanup].filter(Boolean).join('\n\n');
}

/**
 * Generate import statements
 */
function generateImports(): string {
  return `import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { print } from '@mcps/runtime';`;
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
 * Generate initialization code for a single MCP server
 */
function generateMCPServerInit(name: string, decl: MCPDeclaration): string {
  const config = extractObjectProperties(decl.config);
  const command = config.command || '""';
  const args = config.args || '[]';

  return `// Connect to ${name} MCP server
const __${name}_transport = new StdioClientTransport({
  command: ${command},
  args: ${args}
});

const __${name}_client = new Client({
  name: 'mcps',
  version: '1.0.0'
});

await __${name}_client.connect(__${name}_transport);
__mcpClients.${name} = __${name}_client;

// Create tool proxy for ${name}
const ${name} = {};
const __${name}_tools = await __${name}_client.listTools();
for (const tool of __${name}_tools.tools) {
  ${name}[tool.name] = async (...args) => {
    const result = await __${name}_client.callTool({
      name: tool.name,
      arguments: args.length === 1 && typeof args[0] === 'object' ? args[0] : { args }
    });
    return result.content[0]?.type === 'text' ? result.content[0].text : result.content;
  };
}`;
}

/**
 * Generate code for all statements (excluding MCP declarations)
 */
function generateStatements(statements: Statement[]): string {
  const codeLines = statements
    .filter(stmt => stmt.type !== 'mcp_declaration')
    .map(stmt => {
      if (stmt.type === 'assignment') {
        return generateAssignment(stmt);
      } else if (stmt.type === 'expression_statement') {
        return generateExpressionStatement(stmt);
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
 * Extract object properties as a map of key to generated expression code
 */
function extractObjectProperties(obj: ObjectLiteral): Record<string, string> {
  const props: Record<string, string> = {};
  for (const prop of obj.properties) {
    props[prop.key] = generateExpression(prop.value);
  }
  return props;
}

/**
 * Generate code for an assignment statement
 */
function generateAssignment(stmt: Assignment): string {
  const value = generateExpression(stmt.value);
  // Assignments capture the result, so await is included in the expression
  return `let ${stmt.variable} = ${value};`;
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
  const callee = generateExpression(expr.callee);
  const args = expr.arguments.map(generateExpression);

  // Check if this is a member call that needs await
  if (expr.callee.type === 'member') {
    return `await ${callee}(${args.join(', ')})`;
  }

  return `${callee}(${args.join(', ')})`;
}

/**
 * Generate code for a member expression
 */
function generateMemberExpression(expr: MemberExpression): string {
  const object = generateExpression(expr.object);
  return `${object}.${expr.property}`;
}
