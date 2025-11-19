// Tests for undefined variable detection
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { validateStatements, UndefinedVariableError } from '../../validator.js';

describe('Validator - Undefined Variables', () => {
  describe('Valid Programs', () => {
    it('should allow using declared variables', () => {
      const source = `
        x = 5
        y = x + 10
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).not.toThrow();
    });

    it('should allow using global functions', () => {
      const source = `
        print("Hello")
        log.info("Info message")
        data = JSON.parse("{}")
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).not.toThrow();
    });

    it('should allow using environment variables', () => {
      const source = `
        apiKey = env.API_KEY
        port = env.PORT
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).not.toThrow();
    });

    it('should allow using Set and Map constructors', () => {
      const source = `
        mySet = Set([1, 2, 3])
        myMap = Map([["key", "value"]])
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).not.toThrow();
    });

    it('should allow using JavaScript built-ins', () => {
      const source = `
        pi = Math.PI
        now = Date.now()
        num = parseInt("42")
        testVal = 123
        result = isNaN(testVal)
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).not.toThrow();
    });

    it('should allow using MCP server names', () => {
      const source = `
        mcp filesystem {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-filesystem"]
        }
        
        content = filesystem.readFile("test.txt")
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).not.toThrow();
    });

    it('should allow using model names', () => {
      const source = `
        model gpt4 {
          provider: "openai",
          model: "gpt-4"
        }
        
        print(gpt4)
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).not.toThrow();
    });

    it('should allow using agent names', () => {
      const source = `
        model gpt4 {
          provider: "openai",
          model: "gpt-4"
        }
        
        agent MyAgent {
          model: gpt4,
          systemPrompt: "You are helpful",
          tools: []
        }
        
        result = "Hello" | MyAgent
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).not.toThrow();
    });

    it('should allow variables in nested scopes', () => {
      const source = `
        x = 10
        if (x > 5) {
          y = 20
          z = x + y
        }
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).not.toThrow();
    });

    it('should allow variables declared in for loop init', () => {
      const source = `
        for (i = 0; i < 10; i = i + 1) {
          print(i)
        }
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).not.toThrow();
    });

    it('should allow variables in while loops', () => {
      const source = `
        counter = 0
        while (counter < 10) {
          counter = counter + 1
        }
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).not.toThrow();
    });
  });

  describe('Invalid Programs', () => {
    it('should detect undefined variable in assignment', () => {
      const source = `
        x = undefinedVar + 5
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'undefinedVar'"
      );
    });

    it('should detect undefined variable in expression statement', () => {
      const source = `
        print(unknownVariable)
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'unknownVariable'"
      );
    });

    it('should detect undefined variable in if condition', () => {
      const source = `
        if (undeclaredVar > 5) {
          print("yes")
        }
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'undeclaredVar'"
      );
    });

    it('should detect undefined variable in while condition', () => {
      const source = `
        while (missingVar < 10) {
          print("looping")
        }
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'missingVar'"
      );
    });

    it('should detect undefined variable in for condition', () => {
      const source = `
        for (i = 0; unknownLimit < 10; i = i + 1) {
          print(i)
        }
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'unknownLimit'"
      );
    });

    it('should detect undefined variable in array literal', () => {
      const source = `
        arr = [1, 2, undefinedElement]
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'undefinedElement'"
      );
    });

    it('should detect undefined variable in object literal', () => {
      const source = `
        obj = {
          key: missingValue
        }
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'missingValue'"
      );
    });

    it('should detect undefined variable in function call', () => {
      const source = `
        result = someFunction(42)
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'someFunction'"
      );
    });

    it('should detect undefined variable in member expression object', () => {
      const source = `
        value = undefinedObj.property
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'undefinedObj'"
      );
    });

    it('should detect undefined variable in bracket expression', () => {
      const source = `
        value = undefinedArr[0]
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'undefinedArr'"
      );
    });

    it('should detect undefined variable in binary expression', () => {
      const source = `
        result = 5 + unknownVar
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'unknownVar'"
      );
    });

    it('should detect undefined variable in unary expression', () => {
      const source = `
        result = -missingNumber
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'missingNumber'"
      );
    });

    it('should detect undefined variable in logical expression', () => {
      const source = `
        result = true && undefinedBool
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'undefinedBool'"
      );
    });

    it('should detect undefined variable in nullish coalescing', () => {
      const source = `
        result = value ?? undefinedDefault
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      // Should detect 'value' first
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'value'"
      );
    });

    it('should detect undefined variable in agent delegation', () => {
      const source = `
        result = "prompt" | UndefinedAgent
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'UndefinedAgent'"
      );
    });

    it('should detect undefined variable in member assignment target', () => {
      const source = `
        undefinedObj.property = 5
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'undefinedObj'"
      );
    });

    it('should detect undefined variable in bracket assignment target', () => {
      const source = `
        undefinedArr[0] = 5
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'undefinedArr'"
      );
    });
  });

  describe('Scoping Rules', () => {
    it('should allow variables declared in parent scope', () => {
      const source = `
        x = 10
        {
          y = x + 5
        }
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).not.toThrow();
    });

    it('should allow variables in if branches to use outer scope', () => {
      const source = `
        x = 10
        if (x > 5) {
          y = x + 1
        } else {
          z = x - 1
        }
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).not.toThrow();
    });

    it('should allow for loop body to access loop variable', () => {
      const source = `
        for (i = 0; i < 10; i = i + 1) {
          print(i)
        }
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).not.toThrow();
    });

    it('should not allow accessing loop variable after for loop', () => {
      const source = `
        for (i = 0; i < 10; i = i + 1) {
          print(i)
        }
        print(i)
      `;
      const statements = parseSource(source);
      // For loop variables are scoped to the loop
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'i'"
      );
    });

    it('should handle nested blocks correctly', () => {
      const source = `
        x = 1
        {
          y = 2
          {
            z = x + y
          }
        }
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).not.toThrow();
    });
  });

  describe('Declaration Order', () => {
    it('should allow forward references to MCP servers', () => {
      const source = `
        content = filesystem.readFile("test.txt")
        
        mcp filesystem {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-filesystem"]
        }
      `;
      const statements = parseSource(source);
      // MCP servers are hoisted, so this should work
      expect(() => validateStatements(statements)).not.toThrow();
    });

    it('should allow forward references to models', () => {
      const source = `
        print(gpt4)
        
        model gpt4 {
          provider: "openai",
          model: "gpt-4"
        }
      `;
      const statements = parseSource(source);
      // Models are hoisted, so this should work
      expect(() => validateStatements(statements)).not.toThrow();
    });

    it('should allow forward references to agents', () => {
      const source = `
        result = "prompt" | MyAgent
        
        model gpt4 {
          provider: "openai",
          model: "gpt-4"
        }
        
        agent MyAgent {
          model: gpt4,
          systemPrompt: "You are helpful",
          tools: []
        }
      `;
      const statements = parseSource(source);
      // Agents are hoisted, so this should work
      expect(() => validateStatements(statements)).not.toThrow();
    });

    it('should not allow forward references to regular variables', () => {
      const source = `
        y = x + 5
        x = 10
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'x'"
      );
    });
  });

  describe('MCP and Agent Configurations', () => {
    it('should validate variables in MCP config', () => {
      const source = `
        mcp filesystem {
          command: "npx",
          args: undefinedArgs
        }
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'undefinedArgs'"
      );
    });

    it('should allow env variables in MCP config', () => {
      const source = `
        mcp github {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-github"],
          env: {
            GITHUB_TOKEN: env.GITHUB_TOKEN
          }
        }
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).not.toThrow();
    });

    it('should validate variables in model config', () => {
      const source = `
        model gpt4 {
          provider: "openai",
          apiKey: undefinedKey
        }
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'undefinedKey'"
      );
    });

    it('should validate variables in agent config', () => {
      const source = `
        model gpt4 {
          provider: "openai",
          model: "gpt-4"
        }
        
        agent MyAgent {
          model: undefinedModel,
          systemPrompt: "You are helpful",
          tools: []
        }
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'undefinedModel'"
      );
    });
  });

  describe('Complex Expressions', () => {
    it('should validate deeply nested expressions', () => {
      const source = `
        x = 1
        y = 2
        result = (x + y) * (x - y) / (x * y)
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).not.toThrow();
    });

    it('should detect undefined in deeply nested expressions', () => {
      const source = `
        x = 1
        y = 2
        result = (x + y) * (x - undefinedZ) / (x * y)
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'undefinedZ'"
      );
    });

    it('should validate chained member expressions', () => {
      const source = `
        obj = { nested: { value: 42 } }
        result = obj.nested.value
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).not.toThrow();
    });

    it('should detect undefined in chained member expressions', () => {
      const source = `
        result = undefinedObj.nested.value
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).toThrow(
        UndefinedVariableError
      );
      expect(() => validateStatements(statements)).toThrow(
        "Undefined variable: 'undefinedObj'"
      );
    });

    it('should validate complex MCP tool chains', () => {
      const source = `
        mcp filesystem {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-filesystem"]
        }
        
        mcp database {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-database"]
        }
        
        data = filesystem.readFile("data.json")
        parsed = JSON.parse(data)
        database.insert(parsed)
      `;
      const statements = parseSource(source);
      expect(() => validateStatements(statements)).not.toThrow();
    });
  });
});
