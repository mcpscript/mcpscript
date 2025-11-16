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

// Re-export for backward compatibility
export { parseStatement } from './parser/statements.js';
