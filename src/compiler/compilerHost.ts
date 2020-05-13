import ts from 'typescript';
import path from 'path';
import { ConfigOptions } from '~types/compiler';
import PathHost from '../lib/pathHost';
import logger from '../lib/logger';

class CompilerHost {
  configOptions: ConfigOptions;
  pathHost: PathHost;
  fileExists: (fileName: string) => any;
  readFile: (fileName: string) => any;

  constructor(configOptions: ConfigOptions, pathHost: PathHost) {
    this.configOptions = configOptions;
    this.pathHost = pathHost;
    Object.assign(this, {
      // getDefaultLibFileName: () => 'lib.d.ts',
      getDefaultLibFileName: () => {
        return path.join(
          configOptions.config.root,
          'node_modules/typescript/lib/lib.d.ts'
        );
      },
      fileExists: (fileName: string) => ts.sys.fileExists(fileName),
      readFile: (fileName: string) => ts.sys.readFile(fileName),
      writeFile: (fileName: string) => ts.sys.writeFile(fileName, ''),
      getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
      getDirectories: (fileName: string) => ts.sys.getDirectories(fileName),
      getCanonicalFileName: (fileName: string) =>
        ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
      getNewLine: () => ts.sys.newLine,
      useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
    });
  }

  getSourceFile(fileName: string, languageVersion: ts.ScriptTarget): any {
    const sourceText = ts.sys.readFile(fileName);
    let changedPathsSourceText;
    if (!fileName.includes('node_modules')) {
      logger.info('get source file', fileName);
      // it can modify emit source text at this
      logger.log('source text', fileName, sourceText);
      // 只能在此处修改路径引用，不能直接修改source file ast的imports[0].text的路径，会导致虚拟树紊乱
      // sourceText = sourceText.replace('@test/b', '@test/ctest');
      const imports = this.collectExternalModuleReferences(ts.createSourceFile(fileName, sourceText, languageVersion));
      changedPathsSourceText = this.pathHost.changeModulePaths(fileName, sourceText, imports, 'relative');
      logger.info('[after change module paths sourceText]', changedPathsSourceText);
      logger.log(
        'create source file',
        imports,
        fileName,
      );
    }
    return sourceText !== undefined
      ? ts.createSourceFile(fileName, changedPathsSourceText || sourceText, languageVersion)
      : undefined;
  }

  collectExternalModuleReferences(file: any): any {
    let imports: any = [];
    for (let _i = 0, _a = file.statements; _i < _a.length; _i++) {
      const node = _a[_i];
      // eslint-disable-next-line
      collectModuleReferences(node, /*inAmbientModule*/ false);
    }
    return imports;
    function collectModuleReferences(node: any, inAmbientModule: boolean): void {
      const typescript: any = ts;
      if (typescript.isAnyImportOrReExport(node)) {
        const moduleNameExpr = typescript.getExternalModuleName(node);
        // TypeScript 1.0 spec (April 2014): 12.1.6
        // An ExternalImportDeclaration in an AmbientExternalModuleDeclaration may reference other external modules
        // only through top - level external module names. Relative external module names are not permitted.
        if (
          moduleNameExpr &&
          ts.isStringLiteral(moduleNameExpr) &&
          moduleNameExpr.text &&
          (!inAmbientModule ||
            !ts.isExternalModuleNameRelative(moduleNameExpr.text))
        ) {
          imports = typescript.append(imports, moduleNameExpr);
        }
      } else if (ts.isModuleDeclaration(node)) {
        if (
          typescript.isAmbientModule(node) &&
          (inAmbientModule ||
            typescript.hasModifier(node, 2 /* Ambient */) ||
            file.isDeclarationFile)
        ) {
          // const nameText = typescript.getTextOfIdentifierOrLiteral(node.name);
          // Ambient module declarations can be interpreted as augmentations for some existing external modules.
          // This will happen in two cases:
          // - if current file is external module then module augmentation is a ambient module declaration defined in the top level scope
          // - if current file is not external module then module augmentation is an ambient module declaration with non-relative module name
          //   immediately nested in top level ambient module declaration .
          // if (
          //   isExternalModuleFile ||
          //   (inAmbientModule && !ts.isExternalModuleNameRelative(nameText))
          // ) {
          //   (moduleAugmentations || (moduleAugmentations = [])).push(node.name);
          // } else if (!inAmbientModule) {
          //   if (file.isDeclarationFile) {
          //     // for global .d.ts files record name of ambient module
          //     (ambientModules || (ambientModules = [])).push(nameText);
          //   }
          //   // An AmbientExternalModuleDeclaration declares an external module.
          //   // This type of declaration is permitted only in the global module.
          //   // The StringLiteral must specify a top - level external module name.
          //   // Relative external module names are not permitted
          //   // NOTE: body of ambient module is always a module block, if it exists
          //   const body = node.body;
          //   if (body) {
          //     for (let _i = 0, _a = body.statements; _i < _a.length; _i++) {
          //       const statement = _a[_i];
          //       collectModuleReferences(statement, /*inAmbientModule*/ true);
          //     }
          //   }
          // }
        }
      }
    }
  }

  resolveModuleNames(moduleNames: string[], containingFile: string): any[] {
    logger.log('resolve modulenames', moduleNames);
    const resolvedModules = [];
    // console.log('[normal]', this.pathHost.fast2absolute(moduleNames), moduleNames);
    // moduleNames[0] = moduleNames[0].replace('@', './');
    for (const moduleName of moduleNames) {
      // try to use standard resolution
      const result = ts.resolveModuleName(
        moduleName,
        containingFile,
        this.configOptions.tsconfig.compilerOptions,
        {
          fileExists: this.fileExists,
          readFile: this.readFile,
        }
      );
      if (result.resolvedModule) {
        logger.log('resolve module', result.resolvedModule, moduleName);
        resolvedModules.push(result.resolvedModule);
      } else {
        // check fallback locations, for simplicity assume that module at location
        // should be represented by '.d.ts' file
        // if (moduleName.includes('es')) {
        //   const modulePath = path.join('lib.' + moduleName + '.d.ts');
        //   if (fileExists(modulePath)) {
        //     resolvedModules.push({ resolvedFileName: modulePath });
        //   }
        // } else {
        // for (const location of moduleSearchLocations) {
        //   const modulePath = path.join(location, moduleName + '.d.ts');
        //   if (fileExists(modulePath)) {
        //     resolvedModules.push({ resolvedFileName: modulePath });
        //   }
        // }
        // }
      }
    }
    return resolvedModules;
  }
}

export default CompilerHost;
