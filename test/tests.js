/* -*- coding: UTF-8, tab-width: 2 -*- */
/*jslint indent: 2, maxlen: 80, node: true */
'use strict';

var EX = exports,
  usher = require('../index.js'),
  hlp = require('./helpers.js'),
  mockEnvs = require('./mock-envs.js');


console.dir(usher.my__dirname);

hlp.asyncRecv(null, usher({
  appName: 'Usher XDG',
  appAuthor: 'M.K.',
  pathSchema: 'xdg',
  env: mockEnvs.ubuntuXfce,
}));


hlp.asyncRecv(null, usher({
  appName: 'Usher XDG',
  appAuthor: 'M.K.',
  pathSchema: 'win',
  env: mockEnvs.winXP,
}));
