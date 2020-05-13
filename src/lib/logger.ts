import config from '../../config/config.dev';
import { Logger } from '~types/logger';

const color = {
  white: '\x1b[37m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  Cyan: '\x1b[36m',
  green: '\x1b[32m',
  reset: '\x1b[0m',
};

const loggerNames = ['log', 'warn', 'info', 'error', 'success'];
const level = loggerNames.indexOf(config.logger.level);

function getColorLog(levelColor: any, args: any): string[] {
  return [
    `${color[levelColor]}${args[0]}`,
    color.reset,
    ...args.slice(1),
  ];
}

const logger: Logger = {
  log(...args) {
    if (0 < level) return;
    console.log(...args);
  },
  warn(...args) {
    if (1 < level) return;
    console.log(...getColorLog('yellow', args));
  },
  info(...args) {
    if (2 < level) return;
    console.log(...getColorLog('blue', args));
  },
  error(...args) {
    if (3 < level) return;
    console.log(...getColorLog('red', args));
    process.exit();
  },
  success(...args) {
    if (4 < level) return;
    console.log(...getColorLog('green', args));
  },
};

export default logger;
