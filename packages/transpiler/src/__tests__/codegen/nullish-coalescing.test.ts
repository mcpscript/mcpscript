import { describe, it, expect } from 'vitest';
import { generateCode } from '../../codegen.js';
import { parseSource } from '../../parser.js';

describe('Codegen - Nullish Coalescing Operator', () => {
  describe('Basic nullish coalescing', () => {
    it('should generate nullish coalescing operator (??)', () => {
      const statements = parseSource('result = a ?? b');
      const code = generateCode(statements);
      expect(code).toContain('let result = a ?? b;');
    });

    it('should generate ?? with literals', () => {
      const statements = parseSource('result = value ?? 0');
      const code = generateCode(statements);
      expect(code).toContain('let result = value ?? 0;');
    });

    it('should generate ?? with string literals', () => {
      const statements = parseSource('result = name ?? "default"');
      const code = generateCode(statements);
      expect(code).toContain('let result = name ?? "default";');
    });

    it('should generate ?? with boolean literals', () => {
      const statements = parseSource('result = flag ?? false');
      const code = generateCode(statements);
      expect(code).toContain('let result = flag ?? false;');
    });
  });

  describe('Chained nullish coalescing', () => {
    it('should generate chained ?? without extra parentheses', () => {
      const statements = parseSource('result = a ?? b ?? c');
      const code = generateCode(statements);
      expect(code).toContain('let result = a ?? b ?? c;');
    });

    it('should generate multiple ?? with default values', () => {
      const statements = parseSource(
        'result = primary ?? secondary ?? "fallback"'
      );
      const code = generateCode(statements);
      expect(code).toContain(
        'let result = primary ?? secondary ?? "fallback";'
      );
    });
  });

  describe('Operator precedence with ??', () => {
    it('should generate ?? with || with required parentheses (JavaScript restriction)', () => {
      const statements = parseSource('result = a ?? b || c');
      const code = generateCode(statements);
      // JavaScript requires parentheses when mixing ?? with || or &&
      expect(code).toContain('let result = a ?? (b || c);');
    });

    it('should generate ?? with && with required parentheses (JavaScript restriction)', () => {
      const statements = parseSource('result = a ?? b && c');
      const code = generateCode(statements);
      // JavaScript requires parentheses when mixing ?? with || or &&
      expect(code).toContain('let result = a ?? (b && c);');
    });

    it('should generate ?? with comparison operators', () => {
      const statements = parseSource('result = a ?? b > 0');
      const code = generateCode(statements);
      expect(code).toContain('let result = a ?? b > 0;');
    });

    it('should generate ?? with arithmetic operators', () => {
      const statements = parseSource('result = a ?? b + 1');
      const code = generateCode(statements);
      expect(code).toContain('let result = a ?? b + 1;');
    });

    it('should generate ?? with multiplication', () => {
      const statements = parseSource('result = a ?? b * 2');
      const code = generateCode(statements);
      expect(code).toContain('let result = a ?? b * 2;');
    });
  });

  describe('Mixed operators with ??', () => {
    it('should generate || on the left of ?? with required parentheses', () => {
      const statements = parseSource('result = a || b ?? c');
      const code = generateCode(statements);
      // JavaScript requires parentheses when mixing ?? with || or &&
      expect(code).toContain('let result = (a || b) ?? c;');
    });

    it('should generate complex expression with ?? and arithmetic', () => {
      const statements = parseSource('result = count ?? 0 + 1');
      const code = generateCode(statements);
      expect(code).toContain('let result = count ?? 0 + 1;');
    });

    it('should generate ?? with nested arithmetic', () => {
      const statements = parseSource('result = value ?? x * 2 + 1');
      const code = generateCode(statements);
      expect(code).toContain('let result = value ?? x * 2 + 1;');
    });

    it('should generate ?? with comparison and logical operators', () => {
      const statements = parseSource('result = a ?? b > 0 && c < 10');
      const code = generateCode(statements);
      // JavaScript requires parentheses when mixing ?? with &&
      expect(code).toContain('let result = a ?? (b > 0 && c < 10);');
    });
  });

  describe('Parentheses handling with ??', () => {
    it('should preserve explicit parentheses with ??', () => {
      const statements = parseSource('result = (a ?? b) || c');
      const code = generateCode(statements);
      expect(code).toContain('let result = (a ?? b) || c;');
    });

    it('should add parentheses when needed for precedence', () => {
      const statements = parseSource('result = a ?? (b + c)');
      const code = generateCode(statements);
      expect(code).toContain('let result = a ?? b + c;');
    });

    it('should handle parentheses in left operand', () => {
      const statements = parseSource('result = (a || b) ?? c');
      const code = generateCode(statements);
      // JavaScript requires parentheses when mixing ?? with ||
      expect(code).toContain('let result = (a || b) ?? c;');
    });

    it('should handle nested parentheses', () => {
      const statements = parseSource('result = (a ?? (b ?? c))');
      const code = generateCode(statements);
      // Inner parentheses create right-associativity
      // a ?? (b ?? c) is different from (a ?? b) ?? c in evaluation order
      expect(code).toContain('let result = a ?? (b ?? c);');
    });
  });

  describe('Expression statements with ??', () => {
    it('should generate ?? as expression statement', () => {
      const statements = parseSource('a ?? b');
      const code = generateCode(statements);
      expect(code).toContain('a ?? b;');
    });

    it('should generate complex ?? expression statement', () => {
      const statements = parseSource('config.value ?? defaultValue ?? 0');
      const code = generateCode(statements);
      expect(code).toContain('config.value ?? defaultValue ?? 0;');
    });
  });

  describe('Real-world use cases', () => {
    it('should generate environment variable with default', () => {
      const statements = parseSource('port = env.PORT ?? 3000');
      const code = generateCode(statements);
      expect(code).toContain('let port = env.PORT ?? 3000;');
    });

    it('should generate optional configuration with fallback chain', () => {
      const statements = parseSource(
        'timeout = userConfig.timeout ?? defaultConfig.timeout ?? 30'
      );
      const code = generateCode(statements);
      expect(code).toContain(
        'let timeout = userConfig.timeout ?? defaultConfig.timeout ?? 30;'
      );
    });

    it('should generate ?? with function calls', () => {
      const statements = parseSource('result = getValue() ?? getDefault()');
      const code = generateCode(statements);
      expect(code).toContain('let result = getValue() ?? getDefault();');
    });

    it('should generate ?? in complex assignment', () => {
      const statements = parseSource(
        'config.host = userHost ?? env.HOST ?? "localhost"'
      );
      const code = generateCode(statements);
      expect(code).toContain(
        'config.host = userHost ?? env.HOST ?? "localhost";'
      );
    });
  });
});
