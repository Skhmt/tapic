'use strict';
const path = require('path');
const webpack = require('webpack');
const ClosureCompiler = require('google-closure-compiler-js').webpack; // https://github.com/google/closure-compiler-js

const MINIFY = (process.argv.indexOf('--min') !== -1);

let plugins = [];
if (MINIFY) {
  plugins.push(
    new ClosureCompiler({
      options: {
        //languageIn: 'ECMASCRIPT6',
        //languageOut: 'ECMASCRIPT5',
        compilationLevel: 'SIMPLE', // SIMPLE, ADVANCED
        warningLevel: 'DEFAULT', // QUIET, DEFAULT, VERBOSE
      },
    })
  )
}

module.exports = {
  entry: [
    path.join(__dirname + '/src/', 'app.js')
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: MINIFY ? 'tapic.min.js' : 'tapic.js',
    libraryTarget: 'var', // var, commonjs2
  },
  target: 'web', // web, webworker, node, node-webkit
  externals: {
    ws: "require('ws')",
    https: "require('https')",
  },
  plugins,
};
