// MCP server management
import { MCPServerConfig } from './types.js';

export class MCPServerManager {
  private servers = new Map<string, MCPServerConfig>();

  registerServer(name: string, config: MCPServerConfig): void {
    this.servers.set(name, config);
  }

  getServer(name: string): MCPServerConfig | undefined {
    return this.servers.get(name);
  }
}
