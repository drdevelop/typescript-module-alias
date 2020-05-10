interface CompilerOptions {
  baseUrl: string;
}

export interface ConfigOptions {
  compilerOptions?: CompilerOptions;
  config: any;
  tsconfig: any;
}
