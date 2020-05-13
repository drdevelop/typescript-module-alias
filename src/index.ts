import path from 'path';
import Compiler from './compiler';
import ExecModule from './exec/execModule';
import { readJson } from './lib/util';
import PathHost from './lib/pathHost';
import { ConfigOptions } from '../types/compiler';
import { Env } from '../types/index';
import logger from './lib/logger';

const env = process.env.NODE_ENV;
const root = process.cwd();

export async function getTsconfigOptions(): Promise<any> {
  const configOptions = await readJson(path.join(root, 'tsconfig.json'));
  return configOptions;
}

function getSourceFiles(): string[] {
  const sourceFiles = process.argv.slice(2);
  // const sourceFiles = ['./test/b'];
  return sourceFiles;
}

export function getConfigBaseUrl(configOptions: ConfigOptions): string {
  return configOptions.compilerOptions.baseUrl || './';
}

async function start(args?: string[]): Promise<void> {
  if (env === Env.TEST) return;
  
  const configOptions = await getTsconfigOptions();
  const sourceFiles = args || getSourceFiles();
  logger.log('run files', sourceFiles, root);
  const configBaseUrl = getConfigBaseUrl(configOptions);
  const pathHost = new PathHost({
    baseUrl: path.join(root, configBaseUrl),
    paths: configOptions.compilerOptions.paths,
  });
  logger.log('[pathHost fastwaypaths]', pathHost.fastWayPaths);
  new Compiler({ tsconfig: configOptions, config: { root } }, pathHost);
  new ExecModule({ tsconfig: configOptions, config: { root } }, pathHost).run(sourceFiles);
}

export default start;
