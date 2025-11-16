// Declaration code generators for MCP Script
import {
  MCPDeclaration,
  ModelDeclaration,
  AgentDeclaration,
  ObjectLiteral,
  Expression,
  StringLiteral,
  NumberLiteral,
  BooleanLiteral,
  ArrayLiteral,
  Identifier,
  MemberExpression,
} from '../ast.js';
import { generateExpression } from './expressions.js';

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
const ${name} = {};
for (const tool of __${name}_tools) {
  ${name}[tool.metadata.name] = async (...args) => {
    let toolInput;

    // If single object argument, use as-is (explicit parameter object)
    if (args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0])) {
      toolInput = args[0];
    } else {
      // Map positional arguments to schema parameter names
      const params = tool.metadata.parameters;

      if (params && params.properties) {
        // Get parameter names from the schema
        const paramNames = Object.keys(params.properties);
        toolInput = {};
        paramNames.forEach((paramName, index) => {
          if (index < args.length) {
            toolInput[paramName] = args[index];
          }
        });
      } else {
        // Fallback: use generic numbered parameters if no schema
        toolInput = Object.fromEntries(
          args.map((arg, index) => [\`arg\${index}\`, arg])
        );
      }
    }

    // Call the tool with the mapped input
    const result = await tool.call(toolInput);

    // Extract text content from the result if it's in MCP format
    if (result && result.content && Array.isArray(result.content)) {
      return result.content[0]?.type === 'text' ? result.content[0].text : result.content;
    }

    return result;
  };
}`;
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
const ${name} = ${generateLlamaIndexModelInit(provider, config)};
__models.${name} = ${name};`;
}

/**
 * Generate LlamaIndex-compatible model initialization code
 */
function generateLlamaIndexModelInit(
  provider: string,
  config: Record<string, unknown>
): string {
  const { provider: _provider, ...modelConfig } = config;

  switch (provider.toLowerCase()) {
    case 'openai':
      return generateOpenAIInit(modelConfig);
    case 'anthropic':
      return generateAnthropicInit(modelConfig);
    case 'gemini':
      return generateGeminiInit(modelConfig);
    default:
      throw new Error(`Unsupported model provider: ${provider}`);
  }
}

/**
 * Generate OpenAI model initialization
 */
function generateOpenAIInit(config: Record<string, unknown>): string {
  const params: string[] = [];

  // Map common config keys to OpenAI parameters
  if (config.apiKey) {
    params.push(`apiKey: ${serializeConfigValue(config.apiKey)}`);
  }
  if (config.model) {
    params.push(`model: ${serializeConfigValue(config.model)}`);
  }
  if (config.temperature !== undefined) {
    params.push(`temperature: ${serializeConfigValue(config.temperature)}`);
  }
  if (config.maxTokens !== undefined) {
    params.push(`maxTokens: ${serializeConfigValue(config.maxTokens)}`);
  }
  if (config.baseURL) {
    params.push(`baseURL: ${serializeConfigValue(config.baseURL)}`);
  }

  return `new __llamaindex_OpenAI({ ${params.join(', ')} })`;
}

/**
 * Generate Anthropic model initialization
 */
function generateAnthropicInit(config: Record<string, unknown>): string {
  const params: string[] = [];

  if (config.apiKey) {
    params.push(`apiKey: ${serializeConfigValue(config.apiKey)}`);
  }
  if (config.model) {
    params.push(`model: ${serializeConfigValue(config.model)}`);
  }
  if (config.temperature !== undefined) {
    params.push(`temperature: ${serializeConfigValue(config.temperature)}`);
  }
  if (config.maxTokens !== undefined) {
    params.push(`maxTokens: ${serializeConfigValue(config.maxTokens)}`);
  }

  return `new __llamaindex_Anthropic({ ${params.join(', ')} })`;
}

/**
 * Generate Gemini model initialization
 */
function generateGeminiInit(config: Record<string, unknown>): string {
  const params: string[] = [];

  if (config.apiKey) {
    params.push(`apiKey: ${serializeConfigValue(config.apiKey)}`);
  }
  if (config.model) {
    params.push(`model: ${serializeConfigValue(config.model)}`);
  }
  if (config.temperature !== undefined) {
    params.push(`temperature: ${serializeConfigValue(config.temperature)}`);
  }
  if (config.maxTokens !== undefined) {
    params.push(`maxOutputTokens: ${serializeConfigValue(config.maxTokens)}`);
  }

  return `new __llamaindex_Gemini({ ${params.join(', ')} })`;
}

/**
 * Serialize a single config value
 */
function serializeConfigValue(value: unknown): string {
  if (typeof value === 'string') {
    // Check if this is an environment variable reference
    if (value.startsWith('env.')) {
      const envVar = value.substring(4); // Remove 'env.' prefix
      return `process.env.${envVar}`;
    }
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
    case 'member': {
      // Handle member expressions like env.OPENAI_API_KEY
      const memberExpr = expr as MemberExpression;
      if (
        memberExpr.object.type === 'identifier' &&
        (memberExpr.object as Identifier).name === 'env'
      ) {
        return `env.${memberExpr.property}`;
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

/**
 * Generate cleanup code for MCP servers
 */
export function generateCleanup(): string {
  return `// Cleanup MCP servers
for (const server of __mcpServers) {
  await server.cleanup();
}`;
}
