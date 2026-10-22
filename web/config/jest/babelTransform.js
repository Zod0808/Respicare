'use strict';

// CRA's bundled babel-jest transform (react-scripts/config/jest/babelTransform.js)
// doesn't include @babel/plugin-transform-class-static-block, which modern
// node_modules dependencies (e.g. jsdom's dom-selector) use. react-scripts
// locks that file's babel config with babelrc:false/configFile:false, so it
// can't be extended via package.json "babel" — this file re-implements the
// same transformer with that one plugin added.
const babelJest = require('react-scripts/node_modules/babel-jest').default;

const hasJsxRuntime = (() => {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
    return false;
  }

  try {
    require.resolve('react/jsx-runtime');
    return true;
  } catch (e) {
    return false;
  }
})();

module.exports = babelJest.createTransformer({
  presets: [
    [
      require.resolve('babel-preset-react-app'),
      {
        runtime: hasJsxRuntime ? 'automatic' : 'classic',
      },
    ],
  ],
  plugins: [require.resolve('@babel/plugin-transform-class-static-block')],
  babelrc: false,
  configFile: false,
});
