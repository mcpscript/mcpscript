# MCP Script Examples

This directory contains example `.mcps` files demonstrating the capabilities of MCP Script.

## Running Examples

You can run any example using the `npm run mcps` command from the project root:

```bash
# Run a simple example
npm run mcps -- run examples/hello.mcps

# Run an MCP integration example
npm run mcps -- run examples/mcp-example.mcps
```

Or use the CLI directly:

```bash
# Direct CLI usage
node packages/cli/bin/mcps.mjs run examples/hello.mcps
```

## Building Examples

You can also build examples to JavaScript:

```bash
# Build to JavaScript
npm run mcps -- build examples/hello.mcps -o dist

# Run the generated JavaScript
node dist/hello.mjs
```

## Available Examples

### hello.mcps
A simple "Hello World" example that demonstrates:
- Variable assignment
- The `print()` function

### mcp-example.mcps
An example that demonstrates:
- MCP server declaration and connection
- Using the MCP filesystem server
- Basic MCP integration

## Writing Your Own

MCP Script files use the `.mcps` extension and support:

1. **Variable Assignment**
   ```mcps
   message = "Hello"
   number = 42
   flag = true
   ```

2. **MCP Server Declaration**
   ```mcps
   mcp servername {
     command: "npx",
     args: ["-y", "@modelcontextprotocol/server-package"]
   }
   ```

3. **MCP Tool Calls**
   ```mcps
   result = servername.toolname(arg1, arg2)
   ```

4. **Print Statements**
   ```mcps
   print("Hello", "World")
   print(variable)
   ```

5. **Arrays and Objects**
   ```mcps
   items = [1, 2, 3]
   config = { name: "test", port: 8080 }
   ```

## Note

Comments are not yet supported in the grammar. Keep your `.mcps` files without comments for now.
