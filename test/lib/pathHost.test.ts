import * as path from 'path';
import PathHost from '../../src/lib/pathHost';
import { getBaseConfig } from '../index.test';

const root = process.cwd();

test('change module paths for file external modules', async () => {
  const { configBaseUrl, configOptions } = await getBaseConfig();
  const pathHost = new PathHost({
    baseUrl: path.join(root, configBaseUrl),
    paths: configOptions.compilerOptions.paths,
  });
  const absolutePath = pathHost.fast2absoluteWithModule('@test/main.ts');
  expect(absolutePath).toBe(path.join(root, '/test/main.ts'));
})
