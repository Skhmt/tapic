// header.js [path1] ...
'use strict';

let header = `
/**
* Twitch API & Chat in javascript.
* @author Skhmt
* @license MIT
* @version ${require('../package.json').version}
*
* @module TAPIC
*/

/* jshint
  esversion: 6,
  node: true
*/

var __nodeModule__;
if (typeof module == 'object') __nodeModule__ = module;

`;

let fs = require('fs');

for (let i = 2; i < process.argv.length; i++) {
  let path = process.argv[i];
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, header + data);
}

// process.stdout.write(header + tapic);
