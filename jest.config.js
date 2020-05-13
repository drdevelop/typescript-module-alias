const { defaults } = require('jest-config');

module.exports = {
  moduleFileExtensions: [ ...defaults.moduleFileExtensions, 'd.ts', 'ts', 'tsx' ],
  transform: {
    "^.+\\.js$": 'babel-jest',
    ".*[d]?\\.(ts)$": 'ts-jest'
  }
}
