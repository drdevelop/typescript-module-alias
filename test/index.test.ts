import { getTsconfigOptions, getConfigBaseUrl } from '../src';

export async function getBaseConfig(): Promise<any> {
  const configOptions = await getTsconfigOptions();
  const configBaseUrl = getConfigBaseUrl(configOptions);
  return {
    configOptions,
    configBaseUrl,
  }
}

test('get base config', async () => {
  const { configBaseUrl } = await getBaseConfig();
  expect(configBaseUrl).toBe('./');
})
