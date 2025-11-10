// Parser tests
import { describe, it, expect } from 'vitest';
import { parseSource } from '../parser.js';
import {
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
  BinaryExpression,
} from '../ast.js';

describe('Parser', () => {
  describe('Literals', () => {
    it('should parse string literals', () => {
      const statements = parseSource('x = "hello world"');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      expect(stmt.type).toBe('assignment');
      expect(stmt.variable).toBe('x');
      expect((stmt.value as StringLiteral).value).toBe('hello world');
    });

    it('should parse single-quoted strings', () => {
      const statements = parseSource("x = 'hello'");
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      expect((stmt.value as StringLiteral).value).toBe('hello');
    });

    it('should parse string escape sequences', () => {
      const statements = parseSource('x = "line1\\nline2\\ttab"');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      expect((stmt.value as StringLiteral).value).toBe('line1\nline2\ttab');
    });

    it('should parse number literals', () => {
      const statements = parseSource('x = 42');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      expect(stmt.type).toBe('assignment');
      expect((stmt.value as NumberLiteral).value).toBe(42);
    });

    it('should parse float literals', () => {
      const statements = parseSource('x = 3.14');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      expect((stmt.value as NumberLiteral).value).toBe(3.14);
    });

    it('should parse decimal literals starting with dot', () => {
      const statements = parseSource('x = .5');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      expect((stmt.value as NumberLiteral).value).toBe(0.5);
    });

    it('should parse scientific notation with lowercase e', () => {
      const statements = parseSource(
        'large = 1e5\nsmall = 2.5e-3\nprecise = 6.022e23'
      );
      expect(statements).toHaveLength(3);
      expect((statements[0] as Assignment).value).toEqual({
        type: 'number',
        value: 1e5,
      });
      expect((statements[1] as Assignment).value).toEqual({
        type: 'number',
        value: 2.5e-3,
      });
      expect((statements[2] as Assignment).value).toEqual({
        type: 'number',
        value: 6.022e23,
      });
    });

    it('should parse scientific notation with uppercase E', () => {
      const statements = parseSource(
        'large = 1E5\npositive = 1.23E+10\nnegative = 4.56E-7'
      );
      expect(statements).toHaveLength(3);
      expect((statements[0] as Assignment).value).toEqual({
        type: 'number',
        value: 1e5,
      });
      expect((statements[1] as Assignment).value).toEqual({
        type: 'number',
        value: 1.23e10,
      });
      expect((statements[2] as Assignment).value).toEqual({
        type: 'number',
        value: 4.56e-7,
      });
    });

    it('should parse zero in different formats', () => {
      const statements = parseSource(
        'zero1 = 0\nzero2 = 0.0\nzero3 = .0\nzero4 = 0e0'
      );
      expect(statements).toHaveLength(4);
      expect((statements[0] as Assignment).value).toEqual({
        type: 'number',
        value: 0,
      });
      expect((statements[1] as Assignment).value).toEqual({
        type: 'number',
        value: 0.0,
      });
      expect((statements[2] as Assignment).value).toEqual({
        type: 'number',
        value: 0.0,
      });
      expect((statements[3] as Assignment).value).toEqual({
        type: 'number',
        value: 0,
      });
    });

    it('should parse boolean literals', () => {
      const statements = parseSource('x = true\ny = false');
      expect(statements).toHaveLength(2);
      expect((statements[0] as Assignment).value).toEqual({
        type: 'boolean',
        value: true,
      });
      expect((statements[1] as Assignment).value).toEqual({
        type: 'boolean',
        value: false,
      });
    });

    it('should parse array literals', () => {
      const statements = parseSource('x = ["a", "b", "c"]');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const arr = stmt.value as ArrayLiteral;
      expect(arr.type).toBe('array');
      expect(arr.elements).toHaveLength(3);
      expect((arr.elements[0] as StringLiteral).value).toBe('a');
      expect((arr.elements[1] as StringLiteral).value).toBe('b');
      expect((arr.elements[2] as StringLiteral).value).toBe('c');
    });

    it('should parse mixed array literals', () => {
      const statements = parseSource('x = ["string", 42, true]');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const arr = stmt.value as ArrayLiteral;
      expect(arr.elements).toHaveLength(3);
      expect((arr.elements[0] as StringLiteral).value).toBe('string');
      expect((arr.elements[1] as NumberLiteral).value).toBe(42);
      expect((arr.elements[2] as BooleanLiteral).value).toBe(true);
    });

    it('should parse empty array literals', () => {
      const statements = parseSource('x = []');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const arr = stmt.value as ArrayLiteral;
      expect(arr.type).toBe('array');
      expect(arr.elements).toHaveLength(0);
    });
  });

  describe('Object Literals', () => {
    it('should parse object literals', () => {
      const statements = parseSource('x = { a: "hello", b: 42 }');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const obj = stmt.value as ObjectLiteral;
      expect(obj.type).toBe('object');
      expect(obj.properties).toHaveLength(2);
      expect(obj.properties[0].key).toBe('a');
      expect((obj.properties[0].value as StringLiteral).value).toBe('hello');
      expect(obj.properties[1].key).toBe('b');
      expect((obj.properties[1].value as NumberLiteral).value).toBe(42);
    });

    it('should parse empty object literals', () => {
      const statements = parseSource('x = {}');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const obj = stmt.value as ObjectLiteral;
      expect(obj.type).toBe('object');
      expect(obj.properties).toHaveLength(0);
    });

    it('should parse nested object literals', () => {
      const statements = parseSource('x = { nested: { value: 42 } }');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const obj = stmt.value as ObjectLiteral;
      expect(obj.properties).toHaveLength(1);
      expect(obj.properties[0].key).toBe('nested');
      const nested = obj.properties[0].value as ObjectLiteral;
      expect(nested.type).toBe('object');
      expect(nested.properties[0].key).toBe('value');
      expect((nested.properties[0].value as NumberLiteral).value).toBe(42);
    });
  });

  describe('Assignments', () => {
    it('should parse simple assignments', () => {
      const statements = parseSource('x = 42');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      expect(stmt.type).toBe('assignment');
      expect(stmt.variable).toBe('x');
      expect((stmt.value as NumberLiteral).value).toBe(42);
    });

    it('should parse multiple assignments', () => {
      const statements = parseSource('x = 1\ny = 2\nz = 3');
      expect(statements).toHaveLength(3);
      expect((statements[0] as Assignment).variable).toBe('x');
      expect((statements[1] as Assignment).variable).toBe('y');
      expect((statements[2] as Assignment).variable).toBe('z');
    });

    it('should parse assignment with identifier reference', () => {
      const statements = parseSource('x = y');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      expect(stmt.variable).toBe('x');
      const id = stmt.value as Identifier;
      expect(id.type).toBe('identifier');
      expect(id.name).toBe('y');
    });
  });

  describe('Call Expressions', () => {
    it('should parse function calls with no arguments', () => {
      const statements = parseSource('result = getData()');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const call = stmt.value as CallExpression;
      expect(call.type).toBe('call');
      expect((call.callee as Identifier).name).toBe('getData');
      expect(call.arguments).toHaveLength(0);
    });

    it('should parse function calls with arguments', () => {
      const statements = parseSource('result = add(1, 2)');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const call = stmt.value as CallExpression;
      expect(call.type).toBe('call');
      expect((call.callee as Identifier).name).toBe('add');
      expect(call.arguments).toHaveLength(2);
      expect((call.arguments[0] as NumberLiteral).value).toBe(1);
      expect((call.arguments[1] as NumberLiteral).value).toBe(2);
    });

    it('should parse function calls with mixed argument types', () => {
      const statements = parseSource('result = process("text", 42, true)');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const call = stmt.value as CallExpression;
      expect(call.arguments).toHaveLength(3);
      expect((call.arguments[0] as StringLiteral).value).toBe('text');
      expect((call.arguments[1] as NumberLiteral).value).toBe(42);
      expect((call.arguments[2] as BooleanLiteral).value).toBe(true);
    });

    it('should parse nested function calls', () => {
      const statements = parseSource('result = outer(inner(42))');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const outerCall = stmt.value as CallExpression;
      expect((outerCall.callee as Identifier).name).toBe('outer');
      expect(outerCall.arguments).toHaveLength(1);
      const innerCall = outerCall.arguments[0] as CallExpression;
      expect(innerCall.type).toBe('call');
      expect((innerCall.callee as Identifier).name).toBe('inner');
      expect((innerCall.arguments[0] as NumberLiteral).value).toBe(42);
    });
  });

  describe('Member Expressions', () => {
    it('should parse member access', () => {
      const statements = parseSource('x = obj.property');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const member = stmt.value as MemberExpression;
      expect(member.type).toBe('member');
      expect((member.object as Identifier).name).toBe('obj');
      expect(member.property).toBe('property');
    });

    it('should parse member method calls', () => {
      const statements = parseSource('result = obj.method(arg)');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const call = stmt.value as CallExpression;
      expect(call.type).toBe('call');
      const member = call.callee as MemberExpression;
      expect(member.type).toBe('member');
      expect((member.object as Identifier).name).toBe('obj');
      expect(member.property).toBe('method');
      expect(call.arguments).toHaveLength(1);
    });

    it('should parse chained member expressions', () => {
      const statements = parseSource('x = a.b.c');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const outer = stmt.value as MemberExpression;
      expect(outer.property).toBe('c');
      const inner = outer.object as MemberExpression;
      expect(inner.type).toBe('member');
      expect((inner.object as Identifier).name).toBe('a');
      expect(inner.property).toBe('b');
    });
  });

  describe('MCP Declarations', () => {
    it('should parse simple MCP declaration', () => {
      const statements = parseSource(
        'mcp filesystem { command: "npx", args: ["-y", "@modelcontextprotocol/server-filesystem"] }'
      );
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as MCPDeclaration;
      expect(stmt.type).toBe('mcp_declaration');
      expect(stmt.name).toBe('filesystem');
      expect(stmt.config.type).toBe('object');
      expect(stmt.config.properties).toHaveLength(2);
      expect(stmt.config.properties[0].key).toBe('command');
      expect((stmt.config.properties[0].value as StringLiteral).value).toBe(
        'npx'
      );
      expect(stmt.config.properties[1].key).toBe('args');
      const args = stmt.config.properties[1].value as ArrayLiteral;
      expect(args.elements).toHaveLength(2);
    });

    it('should parse MCP declaration with multiple properties', () => {
      const statements = parseSource(
        'mcp server { command: "cmd", args: [], timeout: 5000 }'
      );
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as MCPDeclaration;
      expect(stmt.config.properties).toHaveLength(3);
      expect(stmt.config.properties[2].key).toBe('timeout');
      expect((stmt.config.properties[2].value as NumberLiteral).value).toBe(
        5000
      );
    });

    it('should parse empty MCP declaration', () => {
      const statements = parseSource('mcp server {}');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as MCPDeclaration;
      expect(stmt.type).toBe('mcp_declaration');
      expect(stmt.name).toBe('server');
      expect(stmt.config.properties).toHaveLength(0);
    });
  });

  describe('Expression Statements', () => {
    it('should parse function call as statement', () => {
      const statements = parseSource('print("hello")');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as ExpressionStatement;
      expect(stmt.type).toBe('expression_statement');
      const call = stmt.expression as CallExpression;
      expect(call.type).toBe('call');
      expect((call.callee as Identifier).name).toBe('print');
    });

    it('should parse member call as statement', () => {
      const statements = parseSource('obj.method()');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as ExpressionStatement;
      const call = stmt.expression as CallExpression;
      const member = call.callee as MemberExpression;
      expect((member.object as Identifier).name).toBe('obj');
      expect(member.property).toBe('method');
    });
  });

  describe('Binary Expressions', () => {
    it('should parse addition expressions', () => {
      const statements = parseSource('result = a + b');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const binary = stmt.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('+');
      expect((binary.left as Identifier).name).toBe('a');
      expect((binary.right as Identifier).name).toBe('b');
    });

    it('should parse subtraction expressions', () => {
      const statements = parseSource('result = 10 - 5');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const binary = stmt.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('-');
      expect((binary.left as NumberLiteral).value).toBe(10);
      expect((binary.right as NumberLiteral).value).toBe(5);
    });

    it('should parse multiplication expressions', () => {
      const statements = parseSource('result = x * y');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const binary = stmt.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('*');
      expect((binary.left as Identifier).name).toBe('x');
      expect((binary.right as Identifier).name).toBe('y');
    });

    it('should parse division expressions', () => {
      const statements = parseSource('result = 20 / 4');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const binary = stmt.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('/');
      expect((binary.left as NumberLiteral).value).toBe(20);
      expect((binary.right as NumberLiteral).value).toBe(4);
    });

    it('should parse modulo expressions', () => {
      const statements = parseSource('result = a % b');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const binary = stmt.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('%');
      expect((binary.left as Identifier).name).toBe('a');
      expect((binary.right as Identifier).name).toBe('b');
    });

    it('should handle operator precedence (multiplication before addition)', () => {
      const statements = parseSource('result = a + b * c');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const outerBinary = stmt.value as BinaryExpression;
      expect(outerBinary.operator).toBe('+');
      expect((outerBinary.left as Identifier).name).toBe('a');

      const innerBinary = outerBinary.right as BinaryExpression;
      expect(innerBinary.type).toBe('binary');
      expect(innerBinary.operator).toBe('*');
      expect((innerBinary.left as Identifier).name).toBe('b');
      expect((innerBinary.right as Identifier).name).toBe('c');
    });

    it('should handle operator precedence (division before subtraction)', () => {
      const statements = parseSource('result = x - y / z');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const outerBinary = stmt.value as BinaryExpression;
      expect(outerBinary.operator).toBe('-');
      expect((outerBinary.left as Identifier).name).toBe('x');

      const innerBinary = outerBinary.right as BinaryExpression;
      expect(innerBinary.type).toBe('binary');
      expect(innerBinary.operator).toBe('/');
      expect((innerBinary.left as Identifier).name).toBe('y');
      expect((innerBinary.right as Identifier).name).toBe('z');
    });

    it('should handle left associativity for same precedence operators', () => {
      const statements = parseSource('result = a - b + c');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const outerBinary = stmt.value as BinaryExpression;
      expect(outerBinary.operator).toBe('+');
      expect((outerBinary.right as Identifier).name).toBe('c');

      const innerBinary = outerBinary.left as BinaryExpression;
      expect(innerBinary.type).toBe('binary');
      expect(innerBinary.operator).toBe('-');
      expect((innerBinary.left as Identifier).name).toBe('a');
      expect((innerBinary.right as Identifier).name).toBe('b');
    });

    it('should handle parentheses to override precedence', () => {
      const statements = parseSource('result = (a + b) * c');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const outerBinary = stmt.value as BinaryExpression;
      expect(outerBinary.operator).toBe('*');
      expect((outerBinary.right as Identifier).name).toBe('c');

      const innerBinary = outerBinary.left as BinaryExpression;
      expect(innerBinary.type).toBe('binary');
      expect(innerBinary.operator).toBe('+');
      expect((innerBinary.left as Identifier).name).toBe('a');
      expect((innerBinary.right as Identifier).name).toBe('b');
    });

    it('should handle complex nested expressions', () => {
      const statements = parseSource('result = (a + b) * (c - d)');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const outerBinary = stmt.value as BinaryExpression;
      expect(outerBinary.operator).toBe('*');

      const leftBinary = outerBinary.left as BinaryExpression;
      expect(leftBinary.type).toBe('binary');
      expect(leftBinary.operator).toBe('+');
      expect((leftBinary.left as Identifier).name).toBe('a');
      expect((leftBinary.right as Identifier).name).toBe('b');

      const rightBinary = outerBinary.right as BinaryExpression;
      expect(rightBinary.type).toBe('binary');
      expect(rightBinary.operator).toBe('-');
      expect((rightBinary.left as Identifier).name).toBe('c');
      expect((rightBinary.right as Identifier).name).toBe('d');
    });

    it('should handle binary expressions with literals and variables', () => {
      const statements = parseSource('result = 10 + x * 2.5');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const outerBinary = stmt.value as BinaryExpression;
      expect(outerBinary.operator).toBe('+');
      expect((outerBinary.left as NumberLiteral).value).toBe(10);

      const innerBinary = outerBinary.right as BinaryExpression;
      expect(innerBinary.operator).toBe('*');
      expect((innerBinary.left as Identifier).name).toBe('x');
      expect((innerBinary.right as NumberLiteral).value).toBe(2.5);
    });

    it('should handle binary expressions in function calls', () => {
      const statements = parseSource('result = calculate(a + b, x * y)');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const call = stmt.value as CallExpression;
      expect(call.type).toBe('call');
      expect(call.arguments).toHaveLength(2);

      const firstArg = call.arguments[0] as BinaryExpression;
      expect(firstArg.type).toBe('binary');
      expect(firstArg.operator).toBe('+');

      const secondArg = call.arguments[1] as BinaryExpression;
      expect(secondArg.type).toBe('binary');
      expect(secondArg.operator).toBe('*');
    });
  });

  describe('Complete Programs', () => {
    it('should parse the MVP example program', () => {
      const code = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem"]
}

message = "Hello from MCP Script!"
filesystem.writeFile("greeting.txt", message)
content = filesystem.readFile("greeting.txt")
print(content)
      `.trim();

      const statements = parseSource(code);
      expect(statements).toHaveLength(5);

      // MCP declaration
      const mcpDecl = statements[0] as MCPDeclaration;
      expect(mcpDecl.type).toBe('mcp_declaration');
      expect(mcpDecl.name).toBe('filesystem');

      // Assignment
      const assignment = statements[1] as Assignment;
      expect(assignment.type).toBe('assignment');
      expect(assignment.variable).toBe('message');

      // First call (writeFile)
      const writeStmt = statements[2] as ExpressionStatement;
      const writeCall = writeStmt.expression as CallExpression;
      const writeMember = writeCall.callee as MemberExpression;
      expect((writeMember.object as Identifier).name).toBe('filesystem');
      expect(writeMember.property).toBe('writeFile');
      expect(writeCall.arguments).toHaveLength(2);

      // Second call (readFile)
      const readStmt = statements[3] as Assignment;
      expect(readStmt.variable).toBe('content');
      const readCall = readStmt.value as CallExpression;
      const readMember = readCall.callee as MemberExpression;
      expect((readMember.object as Identifier).name).toBe('filesystem');
      expect(readMember.property).toBe('readFile');

      // Print call
      const printStmt = statements[4] as ExpressionStatement;
      const printCall = printStmt.expression as CallExpression;
      expect((printCall.callee as Identifier).name).toBe('print');
    });

    it('should parse program with mixed statements', () => {
      const code = `
debug = true
config = { port: 8080, host: "localhost" }
result = process(getData(), "format")
print("Result:", result)
      `.trim();

      const statements = parseSource(code);
      expect(statements).toHaveLength(4);

      expect((statements[0] as Assignment).variable).toBe('debug');
      expect((statements[1] as Assignment).variable).toBe('config');
      expect((statements[2] as Assignment).variable).toBe('result');
      expect((statements[3] as ExpressionStatement).type).toBe(
        'expression_statement'
      );
    });
  });
});
