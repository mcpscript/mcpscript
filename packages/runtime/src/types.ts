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

export type AppMessage = {
  title: string;
  body: string;
};

export interface UserInputRequest {
  message: string;
  onSubmit: (value: string) => void;
}

export interface AppState {
  messages: AppMessage[];
  userInput?: UserInputRequest;
}
