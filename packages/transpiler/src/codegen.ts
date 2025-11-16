// JavaScript code generation
import {
  Statement,
  MCPDeclaration,
  ModelDeclaration,
  AgentDeclaration,
} from './ast.js';
import {
  generateMCPInitialization,
  generateModelInitialization,
  generateAgentInitialization,
  generateCleanup,
} from './codegen/declarations.js';
import { ScopeStack, dispatchStatement } from './codegen/statements.js';
import { validateStatements } from './validator.js';

/**
 * Generate JavaScript code from an array of AST statements (without validation)
 * This is exposed for testing purposes only. Production code should use generateCode().
 */
export function generateCodeUnsafe(statements: Statement[]): string {
  // Track MCP servers, models, and agents to initialize
  const mcpServers = new Map<string, MCPDeclaration>();
  const models = new Map<string, ModelDeclaration>();
  const agents = new Map<string, AgentDeclaration>();

  // First pass: collect all MCP, model, and agent declarations
  for (const stmt of statements) {
    if (stmt.type === 'mcp_declaration') {
      mcpServers.set(stmt.name, stmt);
    } else if (stmt.type === 'model_declaration') {
      models.set(stmt.name, stmt);
    } else if (stmt.type === 'agent_declaration') {
      agents.set(stmt.name, stmt);
    }
  }

  // Generate MCP client initialization
  const mcpInit =
    mcpServers.size > 0 ? generateMCPInitialization(mcpServers) : '';

  // Generate model configurations
  const modelInit = models.size > 0 ? generateModelInitialization(models) : '';

  // Generate agent configurations
  const agentInit =
    agents.size > 0 ? generateAgentInitialization(agents, mcpServers) : '';

  // Generate main code with variable tracking
  const mainCode = generateStatements(statements);

  // Generate cleanup
  const cleanup = mcpServers.size > 0 ? generateCleanup() : '';

  // Combine all parts
  return [mcpInit, modelInit, agentInit, mainCode, cleanup]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Generate JavaScript code from an array of AST statements
 * Validates variable references before code generation.
 */
export function generateCode(statements: Statement[]): string {
  // Validate all variable references before code generation
  validateStatements(statements);

  // Generate code
  return generateCodeUnsafe(statements);
}

/**
 * Generate code for all statements (excluding MCP declarations)
 */
function generateStatements(statements: Statement[]): string {
  // Initialize scope stack with global scope
  const scopeStack = new ScopeStack();

  const codeLines = statements
    .filter(
      stmt =>
        stmt.type !== 'mcp_declaration' &&
        stmt.type !== 'model_declaration' &&
        stmt.type !== 'agent_declaration'
    )
    .map(stmt => dispatchStatement(stmt, scopeStack))
    .filter(Boolean);

  if (codeLines.length === 0) {
    return '';
  }

  return `// Generated code
${codeLines.join('\n')}`;
}
