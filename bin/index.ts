import { program } from 'commander';
import runMain from '../src/index';

program
  .option('-d, --dev', 'development run typescript program')
  .option('-b, --build', 'build typescript program');

program.parse(process.argv);

const sourceFiles = program.args;

if (program.dev) {
  runMain(sourceFiles);
} else if (program.build) {
  console.warn('build project is not supported temporarily');
  // runMain(sourceFiles);
}
