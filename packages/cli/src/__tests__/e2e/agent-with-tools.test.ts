import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from 'vitest';
import { parseSource, generateCode } from '@mcps/transpiler';
import { executeInVM } from '@mcps/runtime';

describe('E2E - Agent with User-Defined Tools', () => {
  let consoleLogSpy: MockInstance;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should execute agent with user-defined tool', async () => {
    const source = `
      tool double(x) {
        return x * 2
      }

      model gpt {
        provider: "openai",
        apiKey: "ollama",
        baseURL: "http://localhost:11434/v1",
        model: "gpt-oss:20b"
      }

      agent Calculator {
        model: gpt,
        systemPrompt: "You are a calculator. Use the double tool to double numbers.",
        tools: [double]
      }

      result = "Double the number 21" -> Calculator
      print("Agent executed successfully")
    `;

    const ast = parseSource(source);
    const code = generateCode(ast);

    // Execute in VM - this will test that the wrapping works correctly
    await executeInVM(code, { timeout: 60000 });

    // Just verify that execution completed without errors
    expect(consoleLogSpy).toHaveBeenCalledWith('Agent executed successfully');
  }, 70000);

  it('should execute agent with multiple user-defined tools', async () => {
    const source = `
      tool add(a, b) {
        return a + b
      }

      tool multiply(a, b) {
        return a * b
      }

      model gpt {
        provider: "openai",
        apiKey: "ollama",
        baseURL: "http://localhost:11434/v1",
        model: "gpt-oss:20b"
      }

      agent MathAssistant {
        model: gpt,
        systemPrompt: "You are a math assistant. You have add and multiply tools available.",
        tools: [add, multiply]
      }

      result = "What is 5 plus 3?" -> MathAssistant
      print("Agent executed with multiple tools")
    `;

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, { timeout: 60000 });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Agent executed with multiple tools'
    );
  }, 70000);

  it('should execute agent with tool that has no parameters', async () => {
    const source = `
      tool getAnswer() {
        return 42
      }

      model gpt {
        provider: "openai",
        apiKey: "ollama",
        baseURL: "http://localhost:11434/v1",
        model: "gpt-oss:20b"
      }

      agent Oracle {
        model: gpt,
        systemPrompt: "You have access to a getAnswer tool that returns the answer to everything.",
        tools: [getAnswer]
      }

      result = "What is the answer to life, the universe, and everything?" -> Oracle
      print("Agent executed with no-param tool")
    `;

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, { timeout: 60000 });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Agent executed with no-param tool'
    );
  }, 70000);

  it('should execute agent with complex user-defined tool', async () => {
    const source = `
      tool processData(input) {
        items = [1, 2, 3, 4, 5]
        total = 0
        for (i = 0; i < items.length; i = i + 1) {
          total = total + items[i]
        }
        return total
      }

      model gpt {
        provider: "openai",
        apiKey: "ollama",
        baseURL: "http://localhost:11434/v1",
        model: "gpt-oss:20b"
      }

      agent DataProcessor {
        model: gpt,
        systemPrompt: "You can process data using the processData tool.",
        tools: [processData]
      }

      result = "Process the data" -> DataProcessor
      print("Agent executed with complex tool")
    `;

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, { timeout: 60000 });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Agent executed with complex tool'
    );
  }, 70000);
});
