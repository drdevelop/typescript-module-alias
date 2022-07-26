#!/usr/bin/env node
// eslint-disable-next-line
const { spawn } = require('child_process');
// eslint-disable-next-line
const path = require('path');
// eslint-disable-next-line
const { program } = require('commander');

program
  .option('--out-dir <value>', 'path to output directory');

program.parse(process.argv);

const options = program.opts();

const root = process.cwd();

let entry = process.argv[2];
entry = path.join(root, entry);

babelConfigFilePath = path.join(__dirname, '../babel.config.js');

const outDir = options.outDir || 'dist';

const isWindows = process.platform === 'win32';

spawn(
  'npx',
  [
    'babel',
    '--extensions',
    '.ts,.js',
    entry,
    '--config-file',
    babelConfigFilePath,
    '--out-dir',
    outDir,
    '--ignore',
    'node_modules',
  ],
  {
    stdio: 'inherit',
    shell: isWindows,
  }
);
