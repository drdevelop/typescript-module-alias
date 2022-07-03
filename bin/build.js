#!/usr/bin/env node
// eslint-disable-next-line
const { exec } = require('child_process');
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

exec(
  `npx babel --extensions .ts,.js ${entry} --config-file ${babelConfigFilePath} --out-dir ${outDir} `,
  (error, stdout, stderr) => {
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.log(stderr);
    }
    if (error) {
      console.error(error.message);
    }
  }
);
