#!/usr/bin/env node
// eslint-disable-next-line
const { exec } = require('child_process');
// eslint-disable-next-line
const path = require('path');

const root = process.cwd();

let entry = process.argv[2];
entry = path.join(root, entry);

babelConfigFilePath = path.join(__dirname, '../babel.config.js');

exec(
  `npx babel-node --extensions .ts,.js ${entry} --config-file ${babelConfigFilePath}`,
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
