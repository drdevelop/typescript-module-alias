import path from 'path';
import Module from 'module';
import { ConfigOptions } from '~types/compiler';
import Compiler from '../compiler';
import PathHost from '../lib/pathHost';
import logger from '../lib/logger';

class ExecModule {
  configOptions: ConfigOptions;
  pathHost: PathHost;
  root: string;

  constructor(configOptions: ConfigOptions, pathHost: PathHost) {
    require.extensions['.ts'] = this.registerExtensions.bind(this);
    this.configOptions = configOptions;
    this.root = configOptions.config.root;
    this.pathHost = pathHost;
  }

  run(sourceFiles: string[]): void {
    // run service
    // const module = new Module('/Users/cxd/Documents/my-lib/npm_lock2yarn/t.ts');
    // module.filename = '/Users/cxd/Documents/my-lib/npm_lock2yarn/t.ts';
    // module.paths = Module._nodeModulePaths(this.root);
    // Module._preloadModules([]); // 预加载自己定义的一些模块
    // process.execArgv = [
    //   '/Users/cxd/Documents/my-lib/npm_lock2yarn/node_modules/_ts-node@8.8.1@ts-node/dist/bin.js',
    //   '-H',
    // ];
    process.argv = [
      'node',
      // '/Users/cxd/Documents/my-lib/npm_lock2yarn/node_modules/.bin/ts-node',
      // '/Users/cxd/Documents/my-lib/npm_lock2yarn/t.ts',
      path.join(this.root, sourceFiles[0]),
    ]; // Module.runMain会用到此参数去跑对应的文件
    // let code: string;
    // if (code !== undefined && !interactive) {
    //   evalAndExit(service, state, module, code, print);
    // } else {
    //   console.log('run module');
    //   Module.runMain();
    // }
    logger.log('run module');
    Module.runMain();
  }

  registerExtensions(m: any, fileName: string): any {
    logger.log('it will require module', fileName);
    // const old = require.extensions['.ts'] || originalHandler;
    // if (filename.includes('node_modules')) return old(m, filename);
    const old = require.extensions['.js'];
    const _compile = m._compile;
    const configOptions = this.configOptions;
    const pathHost = this.pathHost;
    m._compile = function (code: string, fileName: string): any {
      logger.log('_compile', fileName);
      return _compile.call(this, new Compiler(configOptions, pathHost).compile(code, fileName), fileName);
    };
    return old(m, fileName);
  }
}

export default ExecModule;
