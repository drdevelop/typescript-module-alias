import * as fs from 'fs';
import MakeError from 'make-error';

export function toLowerCase(str: string): string {
  return str && str.toLowerCase() || '';
}

export function isExist(filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    fs.stat(filePath, function(err: any, stat: any) {
      if (stat && stat.isFile()) {
        resolve(true);
      } else {
        resolve(false);
      }
    })
  })
}

export async function readJson(filePath: string): Promise<boolean | string> {
  const isFileExist = await isExist(filePath);
  return isFileExist && require(filePath);
}

// function transformCompilerOptions(compilerOptions) {
//   return {
//     ...compilerOptions,
//     module: ts.ModuleKind.CommonJS,
//     moduleResolution: ts.ModuleResolutionKind.NodeJs,
//     target: ts.ScriptTarget[toLowerCase(compilerOptions.target)],
//   }
// }

export class TSError extends MakeError.BaseError {
  diagnosticText: string;
  diagnosticCodes: string;

  constructor(diagnosticText: string, diagnosticCodes: string) {
      super(`⨯ Unable to compile TypeScript:\n${diagnosticText}`);
      this.diagnosticText = diagnosticText;
      this.diagnosticCodes = diagnosticCodes;
      this.name = 'TSError';
  }
  /**
   * @internal
   */
  [exports.INSPECT_CUSTOM](): string {
      return this.diagnosticText;
  }
}
