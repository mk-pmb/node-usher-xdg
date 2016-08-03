/* -*- coding: UTF-8, tab-width: 2 -*- */
/*jslint indent: 2, maxlen: 80, node: true */
'use strict';

var PT = function UsherXDG() { return PT.init.apply(null, arguments); },
  util = require('util'),
  osLib = require('os'),
  pathLib = require('path'),
  guessFuncRgx = /^guess([A-Z])([a-zA-Z]+)$/;


PT.init = function (opts) {
  var appCtx = Object.create(PT);
  opts = (opts || false);
  if ((typeof opts) === 'string') { opts = { appName: opts }; }
  appCtx.env = (opts.env || process.env);
  appCtx.xdgStrict = PT.tribool(opts.xdgStrict, null);
  appCtx.appMainFile = require.main.filename;
  appCtx.binDir = pathLib.dirname(appCtx.appMainFile);
  appCtx.appAuthor = (String(opts.appAuthor || '') || null);
  PT.initGuess.order.forEach(function (slot) {
    appCtx.initGuess(slot, opts);
  });
  if (opts.xdgStrict instanceof Function) {
    // Start determining the strictness
    setImmediate(opts.xdgStrict.bind(null, appCtx));
  }
  return appCtx;
};


PT.tribool = function (optVal, defVal) {
  if (optVal === null) { return optVal; }
  switch (typeof optVal) {
  case 'function':
    // = callback = Try especially hard, even using async checks.
    //   If it's still a function, that means it isn't decided yet.
    return null;
  case 'boolean':
    return optVal;
  case 'number':
    if (optVal > 0) { return true; }
    if (optVal < 0) { return null; }
    return false;
  }
  return defVal;
};


PT.initGuess = function (slot, opts) {
  var dir = (this && this[slot]);
  if (dir) { return dir; }
  dir = (opts && opts[slot]);
  if (!dir) {
    dir = PT['guess' + slot.substr(0, 1).toUpperCase() +
      slot.substr(1, slot.length)];
    if ('function' !== typeof dir) {
      throw new Error('cannot guess unsupported slot ' + slot);
    }
    dir = dir.call(this);
  }
  this[slot] = dir;
  return dir;
};


PT.initGuess.order = [
  'pathSchema',
  'appDir', 'appName', 'appSafeName', 'appSubdir',
  'userName', 'userHome',
  'userDataDir',
  'userConfigDir',
  'siteDataDirs',
  'siteConfigDirs',
  'userCacheDir',
  'userStateDir',
  'userLogsDir',
];


PT.extendPaths = function (paths, subpath) {
  var uniqPaths = [], hadPath = Object.create(null);
  paths.forEach(function (path) {
    path = pathLib.join(path, subpath);
    if (hadPath[path]) { return; }
    uniqPaths[uniqPaths.length] = path;
    hadPath[path] = true;
  });
  return uniqPaths;
};


PT.colonizePathsArray = function colonizePathsArray() {
  return this.join(':');
};


PT.guessPathSchema = function () {
  var plat = osLib.platform().toLowerCase().replace(/[0-9]+$/, '');
  switch (plat) {
  case 'linux':
    return 'xdg';
  case 'win':
    return 'win';
  case 'darwin':
    return 'mac-darwin';
  }
  return 'xdg';
};


PT.guessAppDir = function () {
  var appDir = this.binDir, appDirBaseName = true;
  while (appDirBaseName) {
    appDirBaseName = pathLib.basename(appDir).replace(/[0-9]+$/, '');
    switch (appDirBaseName.toLowerCase()) {
    case 'bin':
    case 'lib':
    case 'libs':
    case 'inc':
    case 'js':
    case 'node':
    case 'test':
      appDir = pathLib.dirname(appDir);
      break;
    default:
      appDirBaseName = false;
    }
  }
  return appDir;
};


PT.guessAppName = function () {
  return pathLib.basename(this.appDir);
};


PT.hyphenizePath = function (path) {
  var parts = [];
  String(path).replace(/[a-zA-Z0-9_]+/g, function collect(part) {
    parts[parts.length] = part;
    return '';
  });
  path = parts.join('/').toLowerCase();
  path = path.replace(/([A-Za-z0-9])\/([A-Za-z0-9])/g, '$1-$2');
  path = path.replace(/^([A-Za-z0-9]{1,2})-/g, '$1');
  path = path.replace(/-([A-Za-z0-9]{1,2})$/g, '$1');
  path = path.replace(/\//g, '');
  return path;
};


PT.guessAppSafeName = function () { return PT.hyphenizePath(this.appName); };


PT.guessAppSubdir = function () {
  var asd = this.appSafeName, hypAuthor = null;
  if (this.appAuthor) { hypAuthor = PT.hyphenizePath(this.appAuthor); }
  if (hypAuthor) { asd = pathLib.join(hypAuthor, asd); }
  return asd;
};


PT.guessUserHome = function () {
  var env = this.env, home;
  home = String(env.HOMEPATH || env.USERPROFILE || env.HOME || '');
  // ^-- darwin:  http://macobserver.com/tips/macosxcl101/2002/20020712.shtml
  // ^-- windows: http://en.wikipedia.org/wiki/Environment_variable
  // ^-- linux:   my Ubuntu experience
  if (home) { return home; }
  throw new Error('unable to guess user home dir!');
};


PT.guessUserName = function () {
  var env = this.env, un;
  un = String(env.USERNAME || env.USER || '');
  // ^-- darwin:  http://macobserver.com/tips/macosxcl101/2002/20020712.shtml
  // ^-- windows: http://en.wikipedia.org/wiki/Environment_variable
  // ^-- linux:   my Ubuntu experience
  if (un) { return un; }
  throw new Error('unable to guess user name!');
};


PT.xdgPathLooksSane_quick = function (path) {
  if (path[0] !== '/') { return false; }
  return true;
};


PT.xdgEnv = function (slot, multi) {
  var paths = String(this.env['XDG_' + slot] || '');
  if (!paths) { return null; }
  paths = (multi ? paths.split(/:/) : [paths]);
  paths = paths.filter(PT.xdgPathLooksSane_quick);
  return (multi ? paths : paths[0]);
};


PT.fail2guess = function (slot) {
  return new Error('cannot guess ' + slot + ' by path scheme ' +
    JSON.stringify(this.pathSchema));
};


PT.guessUserDataDir = function () {
  var sub = this.appSubdir, env = this.env;
  switch (this.pathSchema) {
  case 'win':
    return pathLib.join(env.APPDATA, sub);
  case 'xdg':
    return (this.xdgEnv('DATA_HOME', false) ||
      pathLib.join(this.userHome, '.local', 'share', sub));
  case 'mac-darwin':
    return pathLib.join(this.userHome, 'Library', 'Application Support', sub);
    // ^-- as per appdirs.js
  }
  throw this.fail2guess('userDataDir');
};


PT.guessUserConfigDir = function () {
  var sub = this.appSubdir, env = this.env;
  switch (this.pathSchema) {
  case 'win':
    return pathLib.join(env.APPDATA, sub);
  case 'xdg':
    return (this.xdgEnv('CONFIG_HOME', false) ||
      pathLib.join(this.userHome, '.config', sub));
  case 'mac-darwin':
    return pathLib.join(this.userHome, 'Library', 'Preferences', sub);
    // ^-- .userHome as per appdirs.js, "Preferences" per iOS Dev Library
  case 'mac-darwin:xbmc':
    return pathLib.join('/var', 'usr',  'Library', 'Preferences', sub);
    // ^-- according to the XBMC iOS FAQ, "4.2 Userdata folder and logs"
  }
  throw this.fail2guess('userConfigDir');
};


PT.guessSiteDataDirs = function () {
  var sub = this.appSubdir, dirs;
  switch (this.pathSchema) {
  case 'win':
    return [PT.winPathTODO()];
  case 'xdg':
    dirs = (this.xdgEnv('DATA_DIRS', true) ||
      ['/usr/local/share/', '/usr/share/']);
    dirs = PT.extendPaths(dirs, sub);
    dirs.toString = PT.colonizePathsArray;
    return dirs;
  case 'mac-darwin':
    return [
      pathLib.join('/', 'Library', 'Application Support', sub)
      // ^-- as per appdirs.js
    ];
  }
  throw this.fail2guess('siteDataDirs');
};


PT.guessSiteConfigDirs = function () {
  var sub = this.appSubdir, dirs;
  switch (this.pathSchema) {
  case 'win':
    return [PT.winPathTODO()];
  case 'xdg':
    dirs = (this.xdgEnv('DATA_DIRS', true) || ['/etc/xdg']);
    if (!this.xdgStrict()) { dirs[dirs.length] = '/etc'; }
    dirs = PT.extendPaths(dirs, sub);
    dirs.toString = PT.colonizePathsArray;
    return dirs;
  case 'mac-darwin':
    return [
      pathLib.join('/', 'Library', 'Preferences', sub)
      // ^-- "/Library" as per appdirs.js, "Preferences" per iOS Dev Library
    ];
  }
  throw this.fail2guess('siteConfigDirs');
};


PT.guessUserCacheDir = function () {
  var sub = this.appSubdir, env = this.env;
  // cache = (env.LOCALAPPDATA || env.APPDATA);
  switch (this.pathSchema) {
  case 'win':
    return pathLib.join(env.APPDATA, sub);
  case 'xdg':
    return (this.xdgEnv('CACHE_HOME', false) ||
      pathLib.join(this.userHome, '.cache', sub));
  case 'mac-darwin':
    return pathLib.join(this.userHome, 'Library', 'Caches', sub);
    // ^-- as per appdirs.js
  }
  throw this.fail2guess('userCacheDir');
};


PT.guessUserStateDir = function () {
  var path;
  switch (this.pathSchema) {
  case 'win':
    return [PT.winPathTODO()];
  case 'xdg':
    path = (this.xdgEnv('RUNTIME_DIR', false) ||
      pathLib.join(this.userCacheDir, 'run'));
    if (this.xdgStrict instanceof Function) {
      throw new Error('Unable to verify whether XDG_RUNTIME_DIR is ' +
        'fully-featured by the standards of the operating system: ' +
        'Checks not yet implemented');
    }
    return path;
  case 'mac-darwin':
    return pathLib.join(this.userCacheDir, 'run');
    // ^-- couldn't find better ideas onliine
  }
  throw this.fail2guess('userStateDir');
};


PT.guessUserLogsDir = function () {
  var sub = this.appSubdir;
  switch (this.pathSchema) {
  case 'win':
    return [PT.winPathTODO()];
  case 'xdg':
    return pathLib.join(this.userCacheDir, 'logs');
  case 'mac-darwin':
    return pathLib.join(this.userHome, 'Library', 'Logs', sub);
    // ^-- as per appdirs.js
  }
  throw this.fail2guess('userStateDir');
};






















module.exports = PT;
