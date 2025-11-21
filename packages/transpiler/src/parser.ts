// Tree-sitter wrapper for parsing .mcps files
import Parser from 'tree-sitter';
import { readFileSync } from 'fs';
import { Statement } from './ast.js';
import { parseStatement } from './parser/statements.js';

// Import the generated parser
// Note: This uses createRequire to load the native binding in ESM context
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// The binding exports the Language object directly
// Resolve path relative to the transpiler package root
const grammarPath = join(__dirname, '..', 'grammar', 'bindings', 'node');
const MCPScriptLanguage: Parser.Language = require(grammarPath);

export function parseFile(filePath: string): Statement[] {
  const content = readFileSync(filePath, 'utf-8');
  return parseSource(content);
}

export function parseSource(content: string): Statement[] {
  const parser = new Parser();
  parser.setLanguage(MCPScriptLanguage);

  const tree = parser.parse(content);

  // Check for parse errors
  if (tree.rootNode.hasError) {
    // Find the first error node to provide a helpful error message
    const errorNode = findFirstError(tree.rootNode);
    if (errorNode) {
      const line = errorNode.startPosition.row + 1;
      const column = errorNode.startPosition.column + 1;
      const errorMessage = generateErrorMessage(errorNode, content);
      throw new Error(
        `Parse error at line ${line}, column ${column}: ${errorMessage}`
      );
    }
    throw new Error('Parse error: The source code contains syntax errors');
  }

  const statements: Statement[] = [];

  for (const child of tree.rootNode.children) {
    if (child.type === 'statement') {
      const statement = parseStatement(child);
      if (statement) {
        statements.push(statement);
      }
    }
  }

  return statements;
}

/**
 * Find the first error node in the syntax tree
 */
function findFirstError(node: Parser.SyntaxNode): Parser.SyntaxNode | null {
  if (node.type === 'ERROR' || node.isMissing) {
    return node;
  }

  for (const child of node.children) {
    const errorNode = findFirstError(child);
    if (errorNode) {
      return errorNode;
    }
  }

  return null;
}

/**
 * Generate a helpful, context-specific error message
 */
function generateErrorMessage(
  errorNode: Parser.SyntaxNode,
  content: string
): string {
  const snippet = errorNode.text.substring(0, 50);
  const fullErrorText = errorNode.text; // Keep full text for multi-line detection
  const parent = errorNode.parent;

  // Get the line content for better context
  const lines = content.split('\n');
  const lineIndex = errorNode.startPosition.row;
  const lineContent = lines[lineIndex] || '';
  const trimmedLine = lineContent.trim();

  // Look at the full context around the error
  const fullContext = content.substring(0, errorNode.endIndex);

  // Normalize whitespace in snippet for pattern matching
  const normalizedSnippet = snippet.replace(/\s+/g, ' ').trim();

  // Check for common error patterns based on parent context
  if (parent) {
    // Check for incomplete operators and specific syntax errors BEFORE delimiter checks
    // These are more specific and should take precedence

    // Agent delegation - check very early before '>' operator
    if (trimmedLine.endsWith('->')) {
      return 'Incomplete agent delegation: expected agent name after "->"';
    }

    // Look at the text immediately before the error for better context
    const beforeError = fullContext
      .substring(Math.max(0, fullContext.length - 30))
      .trim();

    // Type annotations - check very early as they often have incomplete parens
    if (
      trimmedLine.match(/:\s*\)/) ||
      (trimmedLine.match(/:\s*$/) && fullContext.match(/\(\s*\w+\s*:\s*$/))
    ) {
      return 'Missing type in type annotation';
    }

    if (
      (trimmedLine.endsWith('|') || beforeError.endsWith('|')) &&
      fullContext.match(/:\s*[^:]*\|/)
    ) {
      return 'Incomplete union type: expected type after "|"';
    }

    // Incomplete expressions - check if there's an operator right before the error position

    const operators = [
      {
        op: '==',
        msg: 'Incomplete expression: expected value after "==" operator',
      },
      {
        op: '!=',
        msg: 'Incomplete expression: expected value after "!=" operator',
      },
      {
        op: '<=',
        msg: 'Incomplete expression: expected value after "<=" operator',
      },
      {
        op: '>=',
        msg: 'Incomplete expression: expected value after ">=" operator',
      },
      {
        op: '&&',
        msg: 'Incomplete expression: expected value after "&&" operator',
      },
      {
        op: '||',
        msg: 'Incomplete expression: expected value after "||" operator',
      },
      {
        op: '=',
        msg: 'Incomplete expression: expected value after "=" operator',
      },
      {
        op: '+',
        msg: 'Incomplete expression: expected value after "+" operator',
      },
      {
        op: '-',
        msg: 'Incomplete expression: expected value after "-" operator',
      },
      {
        op: '*',
        msg: 'Incomplete expression: expected value after "*" operator',
      },
      {
        op: '/',
        msg: 'Incomplete expression: expected value after "/" operator',
      },
      {
        op: '%',
        msg: 'Incomplete expression: expected value after "%" operator',
      },
      {
        op: '>',
        msg: 'Incomplete expression: expected value after ">" operator',
      },
      {
        op: '<',
        msg: 'Incomplete expression: expected value after "<" operator',
      },
    ];

    for (const { op, msg } of operators) {
      if (trimmedLine.endsWith(op) || beforeError.endsWith(op)) {
        return msg;
      }
    }

    // Function/tool declarations - check early before other patterns
    if (
      fullContext.match(/tool\s*\(/) ||
      normalizedSnippet.match(/^tool\s*\(/)
    ) {
      return 'Invalid tool declaration: expected tool name before parameter list';
    }

    // Model/agent/mcp declarations - check early (multi-line aware)
    // Check if "model" keyword is followed by "{" anywhere in the remaining content
    if (
      snippet === 'model' ||
      snippet.startsWith('model\n') ||
      snippet.startsWith('model ')
    ) {
      // Look ahead in the full content to see if there's a { after model
      const afterError = content.substring(errorNode.endIndex).trim();
      if (afterError.startsWith('{')) {
        return 'Missing name in model declaration';
      }
    }
    if (
      snippet === 'agent' ||
      snippet.startsWith('agent\n') ||
      snippet.startsWith('agent ')
    ) {
      const afterError = content.substring(errorNode.endIndex).trim();
      if (afterError.startsWith('{')) {
        return 'Missing name in agent declaration';
      }
    }
    if (
      snippet === 'mcp' ||
      snippet.startsWith('mcp\n') ||
      snippet.startsWith('mcp ')
    ) {
      const afterError = content.substring(errorNode.endIndex).trim();
      if (afterError.startsWith('{')) {
        return 'Missing name in mcp declaration';
      }
    }

    // Check for declaration without body (multi-line aware)
    if (
      fullContext.match(/model\s+\w+\s*$/) ||
      normalizedSnippet.match(/^model\s+\w+/)
    ) {
      return 'Expected "{" to start model declaration body';
    }
    if (
      fullContext.match(/agent\s+\w+\s*$/) ||
      normalizedSnippet.match(/^agent\s+\w+/)
    ) {
      return 'Expected "{" to start agent declaration body';
    }
    if (
      fullContext.match(/mcp\s+\w+\s*$/) ||
      normalizedSnippet.match(/^mcp\s+\w+/)
    ) {
      return 'Expected "{" to start mcp declaration body';
    }

    // Check for unclosed delimiters FIRST if error spans multiple lines (likely EOF error)
    if (fullErrorText.includes('\n')) {
      const openBraces = (fullContext.match(/\{/g) || []).length;
      const closeBraces = (fullContext.match(/\}/g) || []).length;
      if (openBraces > closeBraces) {
        return 'Missing closing brace "}"';
      }

      const openParens = (fullContext.match(/\(/g) || []).length;
      const closeParens = (fullContext.match(/\)/g) || []).length;
      if (openParens > closeParens) {
        return 'Missing closing parenthesis ")"';
      }

      const openBrackets = (fullContext.match(/\[/g) || []).length;
      const closeBrackets = (fullContext.match(/\]/g) || []).length;
      if (openBrackets > closeBrackets) {
        return 'Missing closing bracket "]"';
      }
    }

    // Control flow - check after unclosed delimiter checks
    if (
      trimmedLine.match(/^if\s*\{/) ||
      fullContext.match(/if\s*\{[^}]*$/) ||
      normalizedSnippet.match(/^if\s*\(/)
    ) {
      if (
        !normalizedSnippet.includes(')') ||
        normalizedSnippet.match(/if\s*\{/)
      ) {
        return 'Missing condition in if statement: expected "(...)"';
      }
    }
    if (
      trimmedLine.match(/^while\s*\{/) ||
      fullContext.match(/while\s*\{[^}]*$/) ||
      normalizedSnippet.match(/^while\s*\{/)
    ) {
      return 'Missing condition in while statement: expected "(...)"';
    }
    if (
      trimmedLine.match(/^for\s*\([^;]*\)\s*\{/) ||
      fullContext.match(/for\s*\([^;]*\)\s*\{/)
    ) {
      return 'Incomplete for loop: expected "let variable = start; variable < end; variable++" syntax';
    }

    // Member access errors
    if (trimmedLine.endsWith('.')) {
      return 'Incomplete member access: expected property name after "."';
    }

    // Unclosed delimiters - check across the full content up to error
    const openBraces = (fullContext.match(/\{/g) || []).length;
    const closeBraces = (fullContext.match(/\}/g) || []).length;
    if (openBraces > closeBraces) {
      return 'Missing closing brace "}"';
    }

    const openParens = (fullContext.match(/\(/g) || []).length;
    const closeParens = (fullContext.match(/\)/g) || []).length;
    if (openParens > closeParens) {
      return 'Missing closing parenthesis ")"';
    }

    const openBrackets = (fullContext.match(/\[/g) || []).length;
    const closeBrackets = (fullContext.match(/\]/g) || []).length;
    if (openBrackets > closeBrackets) {
      return 'Missing closing bracket "]"';
    }

    // Unterminated strings
    const doubleQuotes = (fullContext.match(/(?<!\\)"/g) || []).length;
    const singleQuotes = (fullContext.match(/(?<!\\)'/g) || []).length;
    if (doubleQuotes % 2 !== 0 || singleQuotes % 2 !== 0) {
      return 'Unterminated string literal';
    }
  }

  // Fallback: Check for unclosed delimiters even without parent context
  if (fullErrorText.includes('\n') || errorNode.endIndex === content.length) {
    const openBraces = (fullContext.match(/\{/g) || []).length;
    const closeBraces = (fullContext.match(/\}/g) || []).length;
    if (openBraces > closeBraces) {
      return 'Missing closing brace "}"';
    }

    const openParens = (fullContext.match(/\(/g) || []).length;
    const closeParens = (fullContext.match(/\)/g) || []).length;
    if (openParens > closeParens) {
      return 'Missing closing parenthesis ")"';
    }

    const openBrackets = (fullContext.match(/\[/g) || []).length;
    const closeBrackets = (fullContext.match(/\]/g) || []).length;
    if (openBrackets > closeBrackets) {
      return 'Missing closing bracket "]"';
    }
  }

  // Default error with snippet
  if (snippet.trim()) {
    return `Unexpected syntax near "${snippet}"`;
  }
  return `Unexpected syntax`;
}

// Re-export for backward compatibility
export { parseStatement } from './parser/statements.js';
