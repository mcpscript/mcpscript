import { describe, it, expect, vi } from 'vitest';
import { parseSource, generateCode } from '@mcpscript/transpiler';
import { executeInVM } from '@mcpscript/runtime';

describe('E2E: User Input', () => {
  it('should request user input and use it in script', async () => {
    const source = `
name = input("Enter your name: ")
print("Hello, " + name + "!")
`;

    const mockUserInputHandler = vi.fn().mockResolvedValue('Alice');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, {
      timeout: 5000,
      userInput: mockUserInputHandler,
    });

    expect(mockUserInputHandler).toHaveBeenCalledWith('Enter your name: ');
    expect(consoleSpy).toHaveBeenCalledWith('Hello, Alice!');

    consoleSpy.mockRestore();
  });

  it('should support multiple user input requests in a script', async () => {
    const source = `
firstName = input("First name: ")
lastName = input("Last name: ")
age = input("Age: ")
print(firstName + " " + lastName + " is " + age + " years old")
`;

    const mockUserInputHandler = vi
      .fn()
      .mockResolvedValueOnce('John')
      .mockResolvedValueOnce('Doe')
      .mockResolvedValueOnce('30');

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, {
      timeout: 5000,
      userInput: mockUserInputHandler,
    });

    expect(mockUserInputHandler).toHaveBeenCalledTimes(3);
    expect(mockUserInputHandler).toHaveBeenNthCalledWith(1, 'First name: ');
    expect(mockUserInputHandler).toHaveBeenNthCalledWith(2, 'Last name: ');
    expect(mockUserInputHandler).toHaveBeenNthCalledWith(3, 'Age: ');
    expect(consoleSpy).toHaveBeenCalledWith('John Doe is 30 years old');

    consoleSpy.mockRestore();
  });

  it('should use user input result in conditional logic', async () => {
    const source = `
answer = input("Do you want to continue? (yes/no): ")
if (answer == "yes") {
  print("Continuing...")
} else {
  print("Stopped.")
}
`;

    const mockUserInputHandler = vi.fn().mockResolvedValue('yes');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, {
      timeout: 5000,
      userInput: mockUserInputHandler,
    });

    expect(consoleSpy).toHaveBeenCalledWith('Continuing...');

    consoleSpy.mockRestore();
  });

  it('should use user input in a loop', async () => {
    const source = `
count = 0
while (count < 2) {
  name = input("Enter a name: ")
  print("Added: " + name)
  count = count + 1
}
`;

    const mockUserInputHandler = vi
      .fn()
      .mockResolvedValueOnce('Alice')
      .mockResolvedValueOnce('Bob');

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, {
      timeout: 5000,
      userInput: mockUserInputHandler,
    });

    expect(mockUserInputHandler).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenCalledWith('Added: Alice');
    expect(consoleSpy).toHaveBeenCalledWith('Added: Bob');

    consoleSpy.mockRestore();
  });

  it('should handle user input inside a tool', async () => {
    const source = `
tool getUserInfo() {
  name = input("Name: ")
  age = input("Age: ")
  return name + " (" + age + ")"
}

info = getUserInfo()
print(info)
`;

    const mockUserInputHandler = vi
      .fn()
      .mockResolvedValueOnce('Alice')
      .mockResolvedValueOnce('25');

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, {
      timeout: 5000,
      userInput: mockUserInputHandler,
    });

    expect(mockUserInputHandler).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenCalledWith('Alice (25)');

    consoleSpy.mockRestore();
  });

  it('should work with number conversion', async () => {
    const source = `
userInput = input("Enter a number: ")
num = parseInt(userInput)
result = num * 2
print("Double is: " + result)
`;

    const mockUserInputHandler = vi.fn().mockResolvedValue('42');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, {
      timeout: 5000,
      userInput: mockUserInputHandler,
    });

    expect(consoleSpy).toHaveBeenCalledWith('Double is: 84');

    consoleSpy.mockRestore();
  });

  it('should handle empty input', async () => {
    const source = `
userInput = input("Press enter to continue: ")
if (userInput == "") {
  print("Empty input received")
} else {
  print("Input: " + userInput)
}
`;

    const mockUserInputHandler = vi.fn().mockResolvedValue('');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, {
      timeout: 5000,
      userInput: mockUserInputHandler,
    });

    expect(consoleSpy).toHaveBeenCalledWith('Empty input received');

    consoleSpy.mockRestore();
  });

  it('should throw error when user input handler is not configured', async () => {
    const source = `
name = input("Enter your name: ")
`;

    const ast = parseSource(source);
    const code = generateCode(ast);

    await expect(
      executeInVM(code, {
        timeout: 5000,
        // No userInput handler provided
      })
    ).rejects.toThrow('User input handler not configured');
  });
});
