import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';

describe('Parser Error Messages', () => {
  describe('Incomplete expressions', () => {
    it('should report specific error for incomplete assignment', () => {
      const source = `x =`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error at line 1/);
        expect(message).toMatch(/column \d+/);
        expect(message).toMatch(/expected value after "=" operator/i);
      }
    });

    it('should report specific error for incomplete addition', () => {
      const source = `x = 5 +`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error at line 1/);
        expect(message).toMatch(/column \d+/);
        expect(message).toMatch(/expected value after "\+" operator/i);
      }
    });
  });

  describe('Unclosed brackets and braces', () => {
    it('should report specific error for unclosed curly brace', () => {
      const source = `if (x > 5) {
  print("hello")`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line \d+/);
        expect(message).toMatch(/Missing closing brace/i);
      }
    });

    it('should report specific error for unclosed parenthesis', () => {
      const source = `print("hello"`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line \d+/);
        expect(message).toMatch(/Missing closing parenthesis/i);
      }
    });

    it('should report specific error for unclosed array bracket', () => {
      const source = `arr = [1, 2, 3`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line \d+/);
        expect(message).toMatch(/Missing closing bracket/i);
      }
    });

    it('should report specific error for unclosed object brace', () => {
      const source = `obj = { name: "test", value: 42`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line \d+/);
        expect(message).toMatch(/Missing closing brace/i);
      }
    });

    it('should report specific error for unterminated string', () => {
      const source = `msg = "hello world`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line \d+/);
        expect(message).toMatch(/Unterminated string/i);
      }
    });
  });

  describe('Invalid syntax in declarations', () => {
    it('should report specific error for model declaration missing name', () => {
      const source = `model {
  provider: "openai",
  model: "gpt-4"
}`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line 1/);
        expect(message).toMatch(/Missing name.*model/i);
      }
    });

    it('should report specific error for agent declaration without braces', () => {
      const source = `agent myAgent
  model: gpt4`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line \d+/);
        expect(message).toMatch(/Expected "\{" to start agent/i);
      }
    });

    it('should report specific error for tool without name', () => {
      const source = `tool () {
  return 42
}`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line 1/);
        expect(message).toMatch(/expected tool name before parameter/i);
      }
    });
  });

  describe('Invalid expressions', () => {
    it('should report specific error for incomplete binary expression', () => {
      const source = `x = 5 +`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line 1/);
        expect(message).toMatch(/expected value after "\+" operator/i);
      }
    });

    it('should report specific error for incomplete comparison operator', () => {
      const source = `if (x >) {
  print("test")
}`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line 1/);
        expect(message).toMatch(/expected value after ">" operator/i);
      }
    });

    it('should report specific error for incomplete member access', () => {
      const source = `x = obj.`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line 1/);
        expect(message).toMatch(/expected property name after "\."?/i);
      }
    });

    it('should report error for double operators', () => {
      const source = `x = 5 ++ 3`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line 1/);
        // This will likely be a generic error or operator-specific
        expect(message).toMatch(/(Unexpected syntax|expected value)/i);
      }
    });
  });

  describe('Invalid control flow', () => {
    it('should report specific error for if without condition', () => {
      const source = `if {
  print("hello")
}`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line 1/);
        expect(message).toMatch(
          /Missing condition.*if.*expected "\(\.\.\.\)"/i
        );
      }
    });

    it('should report specific error for while without condition', () => {
      const source = `while {
  print("hello")
}`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line 1/);
        expect(message).toMatch(
          /Missing condition.*while.*expected "\(\.\.\.\)"/i
        );
      }
    });

    it('should report specific error for incomplete for loop', () => {
      const source = `for (let i = 0) {
  print(i)
}`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line 1/);
        expect(message).toMatch(/Incomplete for loop/i);
      }
    });

    it('should parse break statement (validation handles context checking)', () => {
      // Note: Break is valid syntax; semantic validation checks if it's in a loop
      const source = `break`;

      // Parser should accept this as valid syntax
      const statements = parseSource(source);
      expect(statements).toBeDefined();
      expect(statements.length).toBeGreaterThan(0);
    });
  });

  describe('Invalid agent delegation', () => {
    it('should report specific error for incomplete delegation', () => {
      const source = `"prompt" ->`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line 1/);
        expect(message).toMatch(/expected agent name after "->"/i);
      }
    });
  });

  describe('Invalid MCP declarations', () => {
    it('should report specific error for MCP without name', () => {
      const source = `mcp {
  command: "node",
  args: ["server.js"]
}`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line 1/);
        expect(message).toMatch(/Missing name.*mcp/i);
      }
    });

    it('should report specific error for incomplete MCP declaration', () => {
      const source = `mcp myServer`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line 1/);
        expect(message).toMatch(/Expected "\{" to start mcp/i);
      }
    });
  });

  describe('Mixed invalid syntax', () => {
    it('should report error for invalid special characters', () => {
      const source = `@ # $`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line 1/);
        // Could match various errors depending on what the parser sees
        expect(message).toMatch(/(Unexpected syntax|Incomplete expression)/i);
      }
    });

    it('should parse valid identifiers that happen to be JS keywords', () => {
      // Note: var, const, function are valid identifiers in MCP Script
      // They're only keywords in JavaScript, not in MCP Script
      const source1 = `var = 5`;
      expect(() => parseSource(source1)).not.toThrow();

      const source2 = `const = 10`;
      expect(() => parseSource(source2)).not.toThrow();

      const source3 = `function = "test"`;
      expect(() => parseSource(source3)).not.toThrow();
    });
  });

  describe('Error location reporting', () => {
    it('should include correct line number for multi-line errors', () => {
      const source = `x = 5
y = 10
z = 15 +`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error at line 3/);
        expect(message).toMatch(/column \d+/);
        expect(message).toMatch(/expected value after "\+" operator/i);
      }
    });

    it('should include column information in error message', () => {
      const source = `x = 5 +`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line 1/);
        expect(message).toMatch(/column \d+/);
        expect(message).toMatch(/expected value after "\+" operator/i);
      }
    });

    it('should show helpful context-specific error message', () => {
      const source = `x = 5 +`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        // The improved error message explains what's missing
        expect(message).toMatch(/expected value after "\+" operator/i);
      }
    });
  });

  describe('Complex nested errors', () => {
    it('should report error in nested block with correct line number', () => {
      const source = `if (x > 5) {
  if (y < 10) {
    z = 5 +
  }
}`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error at line 3/);
        expect(message).toMatch(/column \d+/);
        expect(message).toMatch(/expected value after "\+" operator/i);
      }
    });

    it('should report error in tool declaration with incomplete expression', () => {
      const source = `tool myTool(x: number) {
  return x +
}`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line 2/);
        expect(message).toMatch(/expected value after "\+" operator/i);
      }
    });

    it('should report error in object literal with invalid syntax', () => {
      const source = `obj = {
  name: "test",
  value: 42 +,
  done: true
}`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line 3/);
        // The error correctly identifies the incomplete expression on line 3
        expect(message).toMatch(/expected value after "\+" operator/i);
      }
    });
  });

  describe('Type annotation errors', () => {
    it('should report specific error for missing type in annotation', () => {
      const source = `tool test(x: ) {
  return x
}`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line 1/);
        expect(message).toMatch(/Missing type in type annotation/i);
      }
    });

    it('should report specific error for incomplete union type', () => {
      const source = `tool test(x: number | ) {
  return x
}`;

      try {
        parseSource(source);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toMatch(/Parse error/);
        expect(message).toMatch(/line 1/);
        expect(message).toMatch(/expected type after "\|"/i);
      }
    });
  });

  describe('Valid edge cases that should NOT error', () => {
    it('should parse empty file', () => {
      const source = ``;
      expect(() => parseSource(source)).not.toThrow();
    });

    it('should parse file with only comments', () => {
      const source = `// This is a comment
// Another comment`;
      expect(() => parseSource(source)).not.toThrow();
    });

    it('should parse file with whitespace', () => {
      const source = `

      
      `;
      expect(() => parseSource(source)).not.toThrow();
    });
  });
});
