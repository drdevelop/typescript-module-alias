import path from 'path';
import inquirer from 'inquirer';
import { cleanPkg, versionIteration } from './util';
import { cloneDeep } from 'lodash';

const root = process.cwd();
/* eslint-disable-next-line */
const pkgInfo = require(path.join(root, './package.json'));

// should do version change
const envReleaseType = process.env.VERSION_ENV;

async function getReleaseType(): Promise<string> {
  if (envReleaseType) return envReleaseType;
  const answers = await inquirer
    .prompt([
      {
        name: 'releaseType',
        /* eslint-disable-next-line */
        message: `what's release type of this publish`,
        type: 'list',
        choices: ['major', 'minor', 'patch', 'other'],
      },
    ]);
  return answers.releaseType;
}

async function getInputVersion(): Promise<string> {
  const answers = await inquirer
    .prompt([
      {
        name: 'version',
        /* eslint-disable-next-line */
        message: `what's version of this publish`,
        type: 'input',
        choices: ['major', 'minor', 'patch', 'other'],
      },
    ]);
  return answers.version;
}

async function start(): Promise<void> {
  let version;
  const releaseType = await getReleaseType();
  if (releaseType === 'other') {
    version = await getInputVersion();
  }
  const nextVersion = versionIteration(releaseType, version);
  await cleanPkg(cloneDeep(pkgInfo), root, nextVersion);
}

start();
