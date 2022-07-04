#!/usr/bin/env node
// eslint-disable-next-line
const { spawn } = require('child_process');
// eslint-disable-next-line
const path = require('path');

const root = process.cwd();

let entry = process.argv[2];
entry = path.join(root, entry);

const babelConfigFilePath = path.join(__dirname, '../babel.config.js');

const isWindows = process.platform === 'win32';

spawn(
  'npx',
  [
    'babel-node',
    '--extensions',
    '.ts,.js',
    entry,
    '--config-file',
    babelConfigFilePath,
  ],
  {
    stdio: 'inherit',
    shell: isWindows,
  }
);
