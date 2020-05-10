import path from 'path';
import { writeFile } from './fs-extra';

const cleanFields = ['devDependencies', 'husky', 'lint-staged'];

async function cleanPkg(pkgInfo: any, root: string, nextVersion: string): Promise<void> {
  console.log('next version', nextVersion);
  pkgInfo.version = nextVersion;
  for (let i = 0; i < cleanFields.length; i++) {
    delete pkgInfo[cleanFields[i]];
  }
  await writeFile(path.join(root, './release/package.json'), JSON.stringify(pkgInfo, null, 2));
}

export default cleanPkg;
