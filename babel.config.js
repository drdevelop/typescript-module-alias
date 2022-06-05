const path = require('path');

module.exports = {
  presets: [
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        targets: {
          node: true,
        }
      }
    ]
  ],
  plugins: [
    'babel-plugin-alias',
  ]
}
