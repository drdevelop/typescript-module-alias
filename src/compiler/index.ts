import ts from 'typescript';
import { ConfigOptions } from '~types/compiler';
import CompilerHost from './compilerHost';
import { toLowerCase } from '../lib/util';
import PathHost from '../lib/pathHost';
import logger from '../lib/logger';

class Compiler {
  configOptions: ConfigOptions;
  compilerOptions: any;
  compilerHost: any;
  pathHost: PathHost;
  root: string;

  constructor(configOptions: ConfigOptions, pathHost: PathHost) {
    this.configOptions = configOptions;
    // this.compilerOptions = {
    //   module: ts.ModuleKind.CommonJS,
    //   moduleResolution: ts.ModuleResolutionKind.NodeJs,
    //   allowSyntheticDefaultImports: true,
    //   experimentalDecorators: true,
    //   resolveJsonModule: true,
    //   esModuleInterop: true,
    //   noImplicitAny: true,
    //   suppressImplicitAnyIndexErrors: true,
    //   // lib: ['lib.es5.d.ts', 'lib.es2015.d.ts', 'lib.es2017.d.ts'], 这个会与getDefaultFileName冲突，去掉这个可以默认使用lib.d.ts
    //   baseUrl: '',
    //   paths: {
    //     '~types/*': ['./typings/*'],
    //     '@test/*': ['./test/*']
    //   },
    //   sourceMap: true,
    //   inlineSourceMap: false,
    //   inlineSources: true,
    //   declaration: false,
    //   noEmit: false,
    //   outDir: '',
    //   configFilePath: '',
    //   target: 1,
    // };
    this.setCompilerOptions(configOptions.tsconfig.compilerOptions || {});
    this.pathHost = pathHost;
    this.root = configOptions.config.root;
  }

  transformCompilerOptions(compilerOptions: any): any {
    const newCompilerOptions = {
      ...compilerOptions,
      module: ts.ModuleKind[toLowerCase(compilerOptions.module)],
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      target: ts.ScriptTarget[toLowerCase(compilerOptions.target)],
    }
    delete newCompilerOptions.lib;
    return newCompilerOptions;
  }

  setCompilerOptions(compilerOptions: any): void {
    this.compilerOptions = this.transformCompilerOptions(compilerOptions);
  }

  getCompilerHost(compilerOptions: any): any {
    const host = this.compilerHost || new CompilerHost({tsconfig: { compilerOptions }, config: {root: this.root}}, this.pathHost);
    if (!this.compilerHost) {
      // cache compiler host
      this.compilerHost = host;
    }
    return host;
  }

  createIncrementalCompilerHost(compilerOptions: any): any {
    // const host = ts.createCompilerHostWorker(options, /*setParentNodes*/ undefined, system);
    const typescript: any = ts;
    const system = ts.sys;
    const host = this.getCompilerHost(compilerOptions);
    host.createHash = typescript.maybeBind(system, system.createHash);
    typescript.setGetSourceFileAsHashVersioned(host, system);
    typescript.changeCompilerHostLikeToUseCache(host, function (fileName: string) { return typescript.toPath(fileName, host.getCurrentDirectory(), host.getCanonicalFileName); });
    return host;
  }

  compile(code: string, fileName: string): string {
    logger.log('[compile]', code.slice(0, 8), fileName);
    // const host = ts.createIncrementalCompilerHost(this.config.options, ts.sys);
    // const host = createCompilerHost(config.options, moduleSearchLocations);
    // const program = ts.createIncrementalProgram({
    //   rootNames: [],
    //   options: this.config.options,
    //   host: host,
    // });
    // const host = new CompilerHost(this.config.options, []);
    const host = this.createIncrementalCompilerHost(this.compilerOptions);
    const program = ts.createIncrementalProgram({
      rootNames: [fileName],
      options: this.compilerOptions,
      host: host,
    });
    // const program = ts.createProgram([fileName], this.config.options, host);
    const sourceFile: any = program.getSourceFile(
      fileName
    );
    // console.log('[source File about]', fileName, sourceFile.externalModuleIndicator.moduleSpecifier.text, Object.keys(sourceFile.externalModuleIndicator.moduleSpecifier));
    logger.log('[source File about]', fileName, sourceFile.imports);
    this.pathHost.fast2absoluteWithAst(code, sourceFile);
    // console.log('source file', sourceFile)
    // const transformers = {
    //   before() {
    //     return {};
    //   }
    // }
    // const getCustomTransformers = () => {
    //   // console.log('getCustomTransformers')
    //   // if (typeof transformers === 'function') {
    //   //   const program = service.getProgram();
    //   //   return program ? transformers(program) : undefined;
    //   // }
    //   // return transformers;
    // };
    const output: string[] = [];
    // const emitResult =
    program.emit(
      sourceFile,
      (path: any, file: string) => {
        if (path.endsWith('.map')) {
          output[1] = file;
        } else {
          output[0] = file;
        }
        // if (options.emit) sys.writeFile(path, file, writeByteOrderMark);
      },
      undefined,
      undefined,
      undefined
    );
    const diagnostics: any = program.getSemanticDiagnostics();
    this.reportError(this.formatDiagnostics(diagnostics));
    logger.log('output', output[0])
    // return sourceFile.text.replace('@', './').replace("import './test/b'", "require('./test/b')");
    // return output[0].replace('@', './');
    return output[0];
  }

  reportError(diagnosticText: string): void {
    console.log(diagnosticText);
  }

  formatDiagnostics(diagnostics: string): string {
    const root = this.root;
    const diagnosticHost = {
      // @ts-ignore
      getNewLine: (): any => ts.sys.newLine,
      // @ts-ignore
      getCurrentDirectory: (): any => root,
      getCanonicalFileName: ts.sys.useCaseSensitiveFileNames
        ? ((x: any): string => x)
        : ((x: any): string => x.toLowerCase())
    };
    const oldFormatDiagnostics: any = process.stdout.isTTY
        ? (ts.formatDiagnosticsWithColorAndContext || ts.formatDiagnostics)
        : ts.formatDiagnostics;
    const diagnosticText = oldFormatDiagnostics(diagnostics, diagnosticHost);
    return diagnosticText;
  }
}

export default Compiler;
