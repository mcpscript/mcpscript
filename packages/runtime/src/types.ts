// Runtime type definitions
export interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface MCPServer {
  name: string;
  config: MCPServerConfig;
}
