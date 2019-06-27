/* -*- coding: UTF-8, tab-width: 2 -*- */
/*jslint indent: 2, maxlen: 80, continue: true, unparam: true, node: true */
'use strict';

var pathLib = require('path');

[
  '/home/username',
  '/home/username/',
  '/',
  '/.',
  '/./',
  './username',
  './username/',
  '../username/',
  '.././../username/',
].forEach(function chkRel(path) {
  var resolved = pathLib.resolve('/', path);
  console.log(JSON.stringify({
    origPath: path,
    resolved: resolved,
    isRel: null,
  }, null, 2).replace(/^\{\s*/, '- ').replace(/\s*\}$/, ''
    ).replace(/,\n/g, '\n').replace(/(^\- |\n {2})"(\w+)": /g, '$1$2:\t'
    ).replace(/"/g, '') + '\n');
});


