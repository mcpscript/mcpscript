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

  // Generate MCP client initialization
  const mcpInit =
    mcpServers.size > 0 ? generateMCPInitialization(mcpServers) : '';

  // Generate main code
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
