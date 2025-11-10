// Code generator tests
import { describe, it, expect } from 'vitest';
import { parseSource } from '../parser.js';
import { generateCode } from '../codegen.js';

describe('Code Generator', () => {
  it('should generate code for simple assignment and print', () => {
    const source = `
message = "Hello World"
print(message)
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let message = "Hello World";');
    expect(code).toContain('print(message);');
  });

  it('should generate code for MCP declaration', () => {
    const source = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem"]
}
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('StdioClientTransport');
    expect(code).toContain('command: "npx"');
    expect(code).toContain('const filesystem = {}');
    expect(code).toContain('await __filesystem_client.connect');
    expect(code).toContain('__filesystem_client.listTools()');
  });

  it('should generate code for MCP tool calls', () => {
    const source = `
mcp server { command: "cmd", args: [] }
result = server.getTool("arg1", "arg2")
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('const server = {}');
    expect(code).toContain(
      'let result = await server.getTool("arg1", "arg2");'
    );
  });

  it('should generate code with cleanup', () => {
    const source = `
mcp server { command: "cmd", args: [] }
x = 1
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('// Cleanup');
    expect(code).toContain('for (const client of Object.values(__mcpClients))');
    expect(code).toContain('await client.close()');
  });

  it('should generate code for complete MVP example', () => {
    const source = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem"]
}

message = "Hello from MCP Script!"
filesystem.writeFile("greeting.txt", message)
content = filesystem.readFile("greeting.txt")
print(content)
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    // Check MCP initialization
    expect(code).toContain('// Initialize MCP clients');
    expect(code).toContain('const __mcpClients = {}');

    // Check MCP setup
    expect(code).toContain('const filesystem = {}');
    expect(code).toContain('await __filesystem_client.connect');

    // Check generated code
    expect(code).toContain('let message = "Hello from MCP Script!";');
    expect(code).toContain(
      'await filesystem.writeFile("greeting.txt", message);'
    );
    expect(code).toContain(
      'let content = await filesystem.readFile("greeting.txt");'
    );
    expect(code).toContain('print(content);');

    // Check cleanup
    expect(code).toContain('await client.close()');
  });

  it('should handle arrays and objects', () => {
    const source = `
config = { name: "test", port: 8080, enabled: true }
items = [1, 2, 3]
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain(
      'let config = { name: "test", port: 8080, enabled: true };'
    );
    expect(code).toContain('let items = [1, 2, 3];');
  });

  it('should handle function calls', () => {
    const source = `
result = processData("input", 42, true)
print("Result:", result)
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let result = processData("input", 42, true);');
    expect(code).toContain('print("Result:", result);');
  });

  it('should generate code for integer literals', () => {
    const source = `
zero = 0
positive = 42
large = 123456
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let zero = 0;');
    expect(code).toContain('let positive = 42;');
    expect(code).toContain('let large = 123456;');
  });

  it('should generate code for decimal literals', () => {
    const source = `
pi = 3.14159
half = 0.5
fraction = .25
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let pi = 3.14159;');
    expect(code).toContain('let half = 0.5;');
    expect(code).toContain('let fraction = 0.25;');
  });

  it('should generate code for scientific notation', () => {
    const source = `
large = 1e5
small = 2.5e-3
avogadro = 6.022e23
uppercase = 1E10
positive = 1.23E+5
negative = 4.56E-7
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let large = 100000;');
    expect(code).toContain('let small = 0.0025;');
    expect(code).toContain('let avogadro = 6.022e+23;');
    expect(code).toContain('let uppercase = 10000000000;');
    expect(code).toContain('let positive = 123000;');
    expect(code).toContain('let negative = 4.56e-7;');
  });

  it('should generate code for numbers in arrays and objects', () => {
    const source = `
numbers = [42, 3.14, 1e5, 2.5e-3]
config = { port: 8080, ratio: 0.75, timeout: 1e4 }
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let numbers = [42, 3.14, 100000, 0.0025];');
    expect(code).toContain(
      'let config = { port: 8080, ratio: 0.75, timeout: 10000 };'
    );
  });

  it('should generate code for numbers in function calls', () => {
    const source = `
result = calculate(42, 3.14, 1e-5)
mcp server { command: "test", timeout: 5000, retries: 3 }
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let result = calculate(42, 3.14, 0.00001);');
    expect(code).toContain('timeout: 5000, retries: 3');
  });

  it('should generate code for boolean literals', () => {
    const source = `
isEnabled = true
isDisabled = false
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let isEnabled = true;');
    expect(code).toContain('let isDisabled = false;');
  });

  it('should generate code for booleans in arrays and objects', () => {
    const source = `
flags = [true, false, true]
config = { enabled: true, debug: false, verbose: true }
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let flags = [true, false, true];');
    expect(code).toContain(
      'let config = { enabled: true, debug: false, verbose: true };'
    );
  });

  it('should generate code for booleans in function calls', () => {
    const source = `
result = processData("input", 42, true, false)
mcp server { command: "test", enabled: true, debug: false }
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain(
      'let result = processData("input", 42, true, false);'
    );
    expect(code).toContain('enabled: true, debug: false');
  });

  describe('Binary Expressions', () => {
    it('should generate basic arithmetic operations', () => {
      const source = `
result = a + b
x = 10 - 5
y = m * n
z = p / q
w = r % s
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('let result = a + b;');
      expect(code).toContain('let x = 10 - 5;');
      expect(code).toContain('let y = m * n;');
      expect(code).toContain('let z = p / q;');
      expect(code).toContain('let w = r % s;');
    });

    it('should handle operator precedence correctly', () => {
      const source = `
result = a + b * c
x = m - n / p
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('let result = a + b * c;');
      expect(code).toContain('let x = m - n / p;');
    });

    it('should add parentheses when needed for precedence', () => {
      const source = `
result = (a + b) * c
x = (m - n) / p
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('let result = (a + b) * c;');
      expect(code).toContain('let x = (m - n) / p;');
    });

    it('should handle left associativity correctly', () => {
      const source = `
result = a - b + c
x = m / n * p
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('let result = a - b + c;');
      expect(code).toContain('let x = m / n * p;');
    });

    it('should handle complex nested expressions', () => {
      const source = `
result = (a + b) * (c - d)
complex = (x + y * 2) / (z - 1)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('let result = (a + b) * (c - d);');
      expect(code).toContain('let complex = (x + y * 2) / (z - 1);');
    });

    it('should work with mixed literals and variables', () => {
      const source = `
result = 10 + x * 2.5
calc = y / 3 - 1.5
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('let result = 10 + x * 2.5;');
      expect(code).toContain('let calc = y / 3 - 1.5;');
    });

    it('should work in function call arguments', () => {
      const source = `
result = calculate(a + b, x * y)
process(10 - 5, m / n)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('let result = calculate(a + b, x * y);');
      expect(code).toContain('process(10 - 5, m / n);');
    });

    it('should work with boolean expressions and mixed types', () => {
      const source = `
result = count + 1
flag = enabled + false
mixed = 3.14 * radius
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('let result = count + 1;');
      expect(code).toContain('let flag = enabled + false;');
      expect(code).toContain('let mixed = 3.14 * radius;');
    });

    it('should work with arrays containing binary expressions', () => {
      const source = `
results = [a + b, x * y, m - n]
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('let results = [a + b, x * y, m - n];');
    });

    it('should work with objects containing binary expressions', () => {
      const source = `
config = { sum: a + b, product: x * y, diff: m - n }
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain(
        'let config = { sum: a + b, product: x * y, diff: m - n };'
      );
    });

    // Comparison operators tests
    it('should generate code for equality comparisons', () => {
      const source = `
result1 = a == b
result2 = x != y
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('let result1 = a == b;');
      expect(code).toContain('let result2 = x != y;');
    });

    it('should generate code for relational comparisons', () => {
      const source = `
result1 = a < b
result2 = x > y
result3 = m <= n
result4 = p >= q
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('let result1 = a < b;');
      expect(code).toContain('let result2 = x > y;');
      expect(code).toContain('let result3 = m <= n;');
      expect(code).toContain('let result4 = p >= q;');
    });

    it('should handle comparison operator precedence correctly', () => {
      const source = `
result1 = a + b == c * d
result2 = x - y != p / q
result3 = m * 2 < n + 1
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('let result1 = a + b == c * d;');
      expect(code).toContain('let result2 = x - y != p / q;');
      expect(code).toContain('let result3 = m * 2 < n + 1;');
    });

    it('should generate code for comparisons with literals', () => {
      const source = `
result1 = age >= 18
result2 = score < 100
result3 = name == "John"
result4 = flag != true
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('let result1 = age >= 18;');
      expect(code).toContain('let result2 = score < 100;');
      expect(code).toContain('let result3 = name == "John";');
      expect(code).toContain('let result4 = flag != true;');
    });

    it('should handle parentheses with comparisons', () => {
      const source = `
result1 = (a == b) != (c < d)
result2 = (x + y) > (m - n)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      // For same-precedence comparison operators, left operand doesn't need parentheses
      // but right operand with same precedence does need them in some cases
      expect(code).toContain('let result1 = a == b != (c < d);');
      // Arithmetic has higher precedence than comparison, so no parentheses needed
      expect(code).toContain('let result2 = x + y > m - n;');
    });

    it('should work with comparisons in function calls', () => {
      const source = `
result = process(a == b, x < y)
check(age >= 18, score > 90)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('let result = process(a == b, x < y);');
      expect(code).toContain('check(age >= 18, score > 90);');
    });

    it('should work with comparisons in arrays and objects', () => {
      const source = `
checks = [a == b, x < y, m >= n]
results = { equal: a == b, less: x < y, greater: m > n }
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('let checks = [a == b, x < y, m >= n];');
      expect(code).toContain(
        'let results = { equal: a == b, less: x < y, greater: m > n };'
      );
    });

    it('should handle chained comparisons', () => {
      const source = `
result1 = a < b == c
result2 = x != y <= z
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('let result1 = a < b == c;');
      expect(code).toContain('let result2 = x != y <= z;');
    });
  });
});
