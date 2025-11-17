// Declaration code generators for MCP Script
import {
  MCPDeclaration,
  ModelDeclaration,
  AgentDeclaration,
  ToolDeclaration,
  ObjectLiteral,
  Expression,
  StringLiteral,
  NumberLiteral,
  BooleanLiteral,
  ArrayLiteral,
  Identifier,
} from '../ast.js';
import { generateExpression } from './expressions.js';
import { ScopeStack, generateBlockStatement } from './statements.js';

/**
 * Generate MCP client initialization code
 */
export function generateMCPInitialization(
  mcpServers: Map<string, MCPDeclaration>
): string {
  const serverInits = Array.from(mcpServers.entries()).map(([name, decl]) =>
    generateMCPServerInit(name, decl)
  );

  return `// Initialize MCP servers using LlamaIndex
// Track all MCP servers for cleanup
const __mcpServers = [];

${serverInits.join('\n\n')}`;
}

/**
 * Generate initialization code for a single MCP server
 */
function generateMCPServerInit(name: string, decl: MCPDeclaration): string {
  const config = extractObjectValues(decl.config);
  const serverConfig = generateMCPServerConfig(name, config);

  return `// Connect to ${name} MCP server using LlamaIndex
const __${name}_server = __llamaindex_mcp(${serverConfig});

// Register for cleanup
__mcpServers.push(__${name}_server);

// Get tools from MCP server
const __${name}_tools = await __${name}_server.tools();

// Create tool proxy for ${name}
const ${name} = __createToolProxy(__${name}_tools);`;
}

/**
 * Generate MCP server configuration for LlamaIndex mcp() function
 */
function generateMCPServerConfig(
  _name: string,
  config: Record<string, unknown>
): string {
  if (config.url) {
    // URL-based connection (HTTP/WebSocket/SSE)
    const url = JSON.stringify(config.url);
    const params: string[] = [`url: ${url}`];

    // Add verbose flag if specified
    if (config.verbose !== undefined) {
      params.push(`verbose: ${config.verbose}`);
    }

    // Add useSSETransport flag if specified
    if (config.useSSETransport !== undefined) {
      params.push(`useSSETransport: ${config.useSSETransport}`);
    }

    return `{ ${params.join(', ')} }`;
  } else if (config.command) {
    // Command-based connection (stdio)
    const command = JSON.stringify(config.command);
    const params: string[] = [`command: ${command}`];

    // Add args if specified
    if (config.args && Array.isArray(config.args)) {
      params.push(`args: ${serializeConfigObject(config.args)}`);
    }

    // Add stderr if specified
    if (config.stderr !== undefined) {
      params.push(`stderr: ${serializeConfigValue(config.stderr)}`);
    }

    // Add verbose flag if specified
    if (config.verbose !== undefined) {
      params.push(`verbose: ${config.verbose}`);
    }

    return `{ ${params.join(', ')} }`;
  } else {
    throw new Error(
      `Invalid MCP configuration: must specify either 'url' or 'command'`
    );
  }
}

/**
 * Generate model configuration initialization code
 */
export function generateModelInitialization(
  models: Map<string, ModelDeclaration>
): string {
  const modelInits = Array.from(models.entries()).map(([name, decl]) =>
    generateModelConfig(name, decl)
  );

  return `// Initialize model configurations
const __models = {};

${modelInits.join('\n\n')}`;
}

/**
 * Generate configuration object for a single model
 */
function generateModelConfig(name: string, decl: ModelDeclaration): string {
  const config = extractObjectValues(decl.config);
  const provider = config.provider as string;

  if (!provider) {
    throw new Error(
      `Model "${name}" must specify a provider (openai, anthropic, or gemini)`
    );
  }

  return `// Model configuration for ${name}
const ${name} = ${generateLlamaIndexModelInit(provider, decl.config)};
__models.${name} = ${name};`;
}

/**
 * Generate LlamaIndex-compatible model initialization code
 */
function generateLlamaIndexModelInit(
  provider: string,
  config: ObjectLiteral
): string {
  switch (provider.toLowerCase()) {
    case 'openai':
      return generateOpenAIInit(config);
    case 'anthropic':
      return generateAnthropicInit(config);
    case 'gemini':
      return generateGeminiInit(config);
    default:
      throw new Error(`Unsupported model provider: ${provider}`);
  }
}

/**
 * Generate OpenAI model initialization
 */
function generateOpenAIInit(config: ObjectLiteral): string {
  const params: string[] = [];

  // Map common config keys to OpenAI parameters
  for (const prop of config.properties) {
    if (prop.key === 'provider') continue; // Skip provider field

    if (prop.key === 'apiKey') {
      params.push(`apiKey: ${generateExpression(prop.value)}`);
    } else if (prop.key === 'model') {
      params.push(`model: ${generateExpression(prop.value)}`);
    } else if (prop.key === 'temperature') {
      params.push(`temperature: ${generateExpression(prop.value)}`);
    } else if (prop.key === 'maxTokens') {
      params.push(`maxTokens: ${generateExpression(prop.value)}`);
    } else if (prop.key === 'baseURL') {
      params.push(`baseURL: ${generateExpression(prop.value)}`);
    }
  }

  return `new __llamaindex_OpenAI({ ${params.join(', ')} })`;
}

/**
 * Generate Anthropic model initialization
 */
function generateAnthropicInit(config: ObjectLiteral): string {
  const params: string[] = [];

  for (const prop of config.properties) {
    if (prop.key === 'provider') continue;

    if (prop.key === 'apiKey') {
      params.push(`apiKey: ${generateExpression(prop.value)}`);
    } else if (prop.key === 'model') {
      params.push(`model: ${generateExpression(prop.value)}`);
    } else if (prop.key === 'temperature') {
      params.push(`temperature: ${generateExpression(prop.value)}`);
    } else if (prop.key === 'maxTokens') {
      params.push(`maxTokens: ${generateExpression(prop.value)}`);
    }
  }

  return `new __llamaindex_Anthropic({ ${params.join(', ')} })`;
}

/**
 * Generate Gemini model initialization
 */
function generateGeminiInit(config: ObjectLiteral): string {
  const params: string[] = [];

  for (const prop of config.properties) {
    if (prop.key === 'provider') continue;

    if (prop.key === 'apiKey') {
      params.push(`apiKey: ${generateExpression(prop.value)}`);
    } else if (prop.key === 'model') {
      params.push(`model: ${generateExpression(prop.value)}`);
    } else if (prop.key === 'temperature') {
      params.push(`temperature: ${generateExpression(prop.value)}`);
    } else if (prop.key === 'maxTokens') {
      params.push(`maxOutputTokens: ${generateExpression(prop.value)}`);
    }
  }

  return `new __llamaindex_Gemini({ ${params.join(', ')} })`;
}

/**
 * Serialize a single config value
 */
function serializeConfigValue(value: unknown): string {
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  return serializeConfigObject(value);
}

/**
 * Generate agent configuration initialization code
 */
export function generateAgentInitialization(
  agents: Map<string, AgentDeclaration>,
  mcpServers: Map<string, MCPDeclaration>
): string {
  const agentInits = Array.from(agents.entries()).map(([name, decl]) =>
    generateAgentConfig(name, decl, mcpServers)
  );

  return `// Initialize agent configurations
${agentInits.join('\n\n')}`;
}

/**
 * Generate configuration object for a single agent
 */
function generateAgentConfig(
  name: string,
  decl: AgentDeclaration,
  mcpServers: Map<string, MCPDeclaration>
): string {
  const config = extractObjectValues(decl.config);
  const model = config.model as string;

  if (!model) {
    throw new Error(`Agent "${name}" must specify a model reference`);
  }

  const agentParams: string[] = [];

  // Add name
  agentParams.push(`name: ${JSON.stringify(name)}`);

  // Add description if provided
  if (config.description) {
    agentParams.push(`description: ${JSON.stringify(config.description)}`);
  }

  // Add system prompt if provided
  if (config.systemPrompt) {
    agentParams.push(`systemPrompt: ${JSON.stringify(config.systemPrompt)}`);
  }

  // Add tools array
  if (config.tools && Array.isArray(config.tools)) {
    const toolExprs = decl.config.properties.find(p => p.key === 'tools')
      ?.value as ArrayLiteral;
    if (toolExprs) {
      const toolRefs = toolExprs.elements
        .map(elem => generateToolReference(elem, mcpServers))
        .join(', ');
      agentParams.push(`tools: [${toolRefs}]`);
    }
  }

  // Add LLM reference
  agentParams.push(`llm: ${model}`);

  return `// Agent configuration for ${name}
const ${name} = new __Agent({
  ${agentParams.join(',\n  ')}
});`;
}

/**
 * Generate a tool reference for agent configuration
 * Handles both MCP server identifiers (expand to all tools) and specific tool references
 */
function generateToolReference(
  expr: Expression,
  mcpServers: Map<string, MCPDeclaration>
): string {
  // If it's an identifier, check if it refers to an MCP server
  if (expr.type === 'identifier') {
    const identifierName = (expr as Identifier).name;
    // Only expand if this identifier is actually an MCP server
    if (mcpServers.has(identifierName)) {
      return `...__${identifierName}_tools`;
    }
    // Otherwise, treat it as a regular variable reference
    return identifierName;
  }

  // Otherwise, generate the expression normally (e.g., filesystem.readFile)
  return generateExpression(expr);
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
 * Generate tool declaration code
 */
export function generateToolDeclaration(decl: ToolDeclaration): string {
  // Create a new scope stack for the tool body
  const scopeStack = new ScopeStack();

  // Declare all parameters in the tool's scope
  for (const param of decl.parameters) {
    scopeStack.declare(param);
  }

  // Generate the tool body
  const bodyCode = generateBlockStatement(decl.body, scopeStack, false);

  // Generate async function
  const params = decl.parameters.join(', ');
  return `const ${decl.name} = async (${params}) => ${bodyCode};`;
}

/**
 * Generate cleanup code for MCP servers
 */
export function generateCleanup(): string {
  return `// Cleanup MCP servers
await Promise.all(__mcpServers.map(server => server.cleanup()));`;
}
