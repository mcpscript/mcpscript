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
  TypeExpression,
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
  agents: Map<string, AgentDeclaration>
): string {
  const agentInits = Array.from(agents.entries()).map(([name, decl]) =>
    generateAgentConfig(name, decl)
  );

  return `// Initialize agent configurations
${agentInits.join('\n\n')}`;
}

/**
 * Generate configuration object for a single agent
 */
function generateAgentConfig(name: string, decl: AgentDeclaration): string {
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
        .map(elem => generateExpression(elem))
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
 * Generate tool declaration code using __createUserTool helper
 * This wraps the tool function with metadata via Proxy
 */
export function generateToolDeclaration(decl: ToolDeclaration): string {
  // Create a new scope stack for the tool body
  const scopeStack = new ScopeStack();

  // Declare all parameters in the tool's scope
  for (const param of decl.parameters) {
    scopeStack.declare(param.name);
  }

  // Generate the tool body
  const bodyCode = generateBlockStatement(decl.body, scopeStack, false);

  return generateValidatedTool(decl, bodyCode);
}

/**
 * Generate a tool with Zod schema metadata
 * The schema is passed to __createUserTool and attached via Proxy for agent registration
 */
function generateValidatedTool(
  decl: ToolDeclaration,
  bodyCode: string
): string {
  const nameJson = JSON.stringify(decl.name);
  const paramsJson = JSON.stringify(decl.parameters.map(p => p.name));
  const params = decl.parameters.map(p => p.name).join(', ');

  // Generate schema definition object for all parameters
  // Unannotated parameters are treated as 'any' type
  const paramSchemas: Record<string, string> = {};
  for (const param of decl.parameters) {
    const schemaDef = param.typeAnnotation
      ? generateSchemaDefinition(param.typeAnnotation)
      : '{ type: "any" }';
    const optionalDef = param.optional
      ? `{ type: "optional", schema: ${schemaDef} }`
      : schemaDef;
    paramSchemas[param.name] = optionalDef;
  }

  // Build the schema definition object
  const schemaProps = Object.entries(paramSchemas)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  // Create the tool with schema attached
  return `const ${decl.name} = __createUserTool(${nameJson}, ${paramsJson}, async (${params}) => ${bodyCode}, __buildZodSchema({ type: "object", properties: { ${schemaProps} } }));`;
}

/**
 * Generate schema definition object from type expression
 * This generates a simple object that __buildZodSchema can convert to a Zod schema at runtime
 */
function generateSchemaDefinition(typeExpr: TypeExpression): string {
  switch (typeExpr.type) {
    case 'primitive_type':
      return `{ type: "${typeExpr.value}" }`;
    case 'array_type':
      return `{ type: "array", elementType: ${generateSchemaDefinition(typeExpr.elementType)} }`;
    case 'object_type': {
      const props = typeExpr.properties.map(prop => {
        const propDef = generateSchemaDefinition(prop.typeAnnotation);
        const finalDef = prop.optional
          ? `{ type: "optional", schema: ${propDef} }`
          : propDef;
        return `${prop.name}: ${finalDef}`;
      });
      return `{ type: "object", properties: { ${props.join(', ')} } }`;
    }
    case 'union_type': {
      if (typeExpr.types.length === 0) {
        throw new Error('Union type must have at least one type');
      }
      if (typeExpr.types.length === 1) {
        return generateSchemaDefinition(typeExpr.types[0]);
      }
      const types = typeExpr.types.map(t => generateSchemaDefinition(t));
      return `{ type: "union", types: [${types.join(', ')}] }`;
    }
    default:
      throw new Error(
        `Unknown type expression: ${(typeExpr as { type: string }).type}`
      );
  }
}

/**
 * Generate cleanup code for MCP servers
 */
export function generateCleanup(): string {
  return `// Cleanup MCP servers
await Promise.all(__mcpServers.map(server => server.cleanup()));`;
}
