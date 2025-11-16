// CLI command types and interfaces

export interface RunOptions {
  file: string;
  timeout?: number;
}

export interface CompileOptions {
  file: string;
}
