/* -*- coding: UTF-8, tab-width: 2 -*- */
/*jslint indent: 2, maxlen: 80, node: true */
'use strict';

var EX = exports;



EX.asyncRecv = function rcv(err, dirs) {
  if (err) { return console.error(err); }
  if (dirs) { delete dirs.env; }
  console.error(dirs);
};
