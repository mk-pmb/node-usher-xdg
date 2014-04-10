/* -*- coding: UTF-8, tab-width: 2 -*- */
/*jslint indent: 2, maxlen: 80, continue: true, unparam: true, node: true */
'use strict';

var EX = function AppDirs() { return EX.init.apply(this, arguments); },
  util = require('util'),
  osLib = require('os'),
  pathLib = require('path'),
  guessFuncRgx = /^guess([A-Z])([a-zA-Z]+)$/,
  ld = require('lodash');


/*jslint nomen:true */
EX.my__dirname = __dirname;
EX.my__filename = __filename;
/*jslint nomen:false */


EX.init = function (opts) {
  var appCtx = Object.create(EX), initErr = null;
  if (!opts) { opts = this; }
  if (!opts) { opts = {}; }
  if ('string' === typeof opts) { opts = { appName: opts }; }
  try{
    appCtx.env = (opts.env || process.env);
    appCtx.xdgStrict = EX.tribool(opts.xdgStrict, null);
    appCtx.appMainFile = require.main.filename;
    appCtx.binDir = pathLib.dirname(appCtx.appMainFile);
    appCtx.appAuthor = (String(opts.appAuthor || '') || null);
    ld.each(EX.initGuess.order, function (slot) {
      appCtx.initGuess(slot, opts);
    });
  } catch (prepErr) {
    initErr = prepErr;
  }
  if ('function' === typeof appCtx.xdgStrict) {
    setImmediate(appCtx.xdgStrict.bind(null, initErr, appCtx));
    return;
  }
  if (initErr) { throw initErr; }
  return appCtx;
};


EX.tribool = function (optVal, defVal) {
  if (optVal === null) { return optVal; }
  switch (typeof optVal) {
  case 'function':
    // = callback = try especially hard, even using async checks
    return optVal;
  case 'boolean':
    return optVal;
  case 'number':
    if (optVal > 0) { return true; }
    if (optVal < 0) { return null; }
    return false;
  }
  return defVal;
};


EX.initGuess = function (slot, opts) {
  var dir = (this && this[slot]);
  if (dir) { return dir; }
  dir = (opts && opts[slot]);
  if (!dir) {
    dir = EX['guess' + slot.substr(0, 1).toUpperCase() +
      slot.substr(1, slot.length)];
    if ('function' !== typeof dir) {
      throw new Error('cannot guess unsupported slot ' + slot);
    }
    dir = dir.call(this);
  }
  this[slot] = dir;
  return dir;
};


EX.initGuess.order = [
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


EX.extendPaths = function (paths, subpath) {
  paths = ld.map(paths, function (path) {
    return pathLib.join(path, subpath);
  });
  paths = ld.uniq(paths);
  return paths;
};


EX.colonizePathsArray = function colonizePathsArray() { return this.join(':'); };


EX.guessPathSchema = function () {
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


EX.guessAppDir = function () {
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


EX.guessAppName = function () {
  return pathLib.basename(this.appDir);
};


EX.hyphenizePath = function (path) {
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


EX.guessAppSafeName = function () {
  return EX.hyphenizePath(this.appName);
};


EX.guessAppSubdir = function () {
  var asd = this.appSafeName, hypAuthor = null;
  if (this.appAuthor) { hypAuthor = EX.hyphenizePath(this.appAuthor); }
  if (hypAuthor) { asd = pathLib.join(hypAuthor, asd); }
  return asd;
};


EX.guessUserHome = function () {
  var env = this.env, home;
  home = String(env.HOMEPATH || env.USERPROFILE || env.HOME || '');
  // ^-- darwin:  http://macobserver.com/tips/macosxcl101/2002/20020712.shtml
  // ^-- windows: http://en.wikipedia.org/wiki/Environment_variable
  // ^-- linux:   my Ubuntu experience
  if (home) { return home; }
  throw new Error('unable to guess user home dir!');
};


EX.guessUserName = function () {
  var env = this.env, un;
  un = String(env.USERNAME || env.USER || '');
  // ^-- darwin:  http://macobserver.com/tips/macosxcl101/2002/20020712.shtml
  // ^-- windows: http://en.wikipedia.org/wiki/Environment_variable
  // ^-- linux:   my Ubuntu experience
  if (un) { return un; }
  throw new Error('unable to guess user name!');
};


EX.xdgCheckPathQuick = function (path) {
  if (path.substr(0, 1) !== '/') { return false; }
  return true;
};


EX.xdgEnv = function (slot, multi) {
  var paths = String(this.env['XDG_' + slot] || '');
  if (!paths) { return null; }
  paths = (multi ? paths.split(/:/) : [paths]);
  ld.filter(paths, EX.xdgCheckPathQuick);
  return (multi ? paths : paths[0]);
};


EX.fail2guess = function (slot) {
  return new Error('cannot guess ' + slot + ' by path scheme ' +
    JSON.stringify(this.pathSchema));
};


EX.guessUserDataDir = function () {
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


EX.guessUserConfigDir = function () {
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
    return pathLib.join('/var', usr,  'Library', 'Preferences', sub)
    // ^-- according to the XBMC iOS FAQ, "4.2 Userdata folder and logs"
  }
  throw this.fail2guess('userConfigDir');
};


EX.guessSiteDataDirs = function () {
  var sub = this.appSubdir, env = this.env, dirs;
  switch (this.pathSchema) {
  case 'win':
    return [EX.winPathTODO()];
  case 'xdg':
    dirs = (this.xdgEnv('DATA_DIRS', true) ||
      ['/usr/local/share/', '/usr/share/']);
    dirs = EX.extendPaths(dirs, sub);
    dirs.toString = EX.colonizePathsArray;
    return dirs;
  case 'mac-darwin':
    return [
      pathLib.join('/', 'Library', 'Application Support', sub)
      // ^-- as per appdirs.js
    ];
  }
  throw this.fail2guess('siteDataDirs');
};


EX.guessSiteConfigDirs = function () {
  var sub = this.appSubdir, env = this.env, dirs;
  switch (this.pathSchema) {
  case 'win':
    return [EX.winPathTODO()];
  case 'xdg':
    dirs = (this.xdgEnv('DATA_DIRS', true) || ['/etc/xdg']);
    if (!this.xdgStrict) { dirs[dirs.length] = '/etc'; }
    dirs = EX.extendPaths(dirs, sub);
    dirs.toString = EX.colonizePathsArray;
    return dirs;
  case 'mac-darwin':
    return [
      pathLib.join('/', 'Library', 'Preferences', sub)
      // ^-- "/Library" as per appdirs.js, "Preferences" per iOS Dev Library
    ];
  }
  throw this.fail2guess('siteConfigDirs');
};


EX.guessUserCacheDir = function () {
  var sub = this.appSubdir, env = this.env,
    cache = (env.LOCALAPPDATA || env.APPDATA);
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


EX.guessUserStateDir = function () {
  var sub = this.appSubdir, env = this.env, path;
  switch (this.pathSchema) {
  case 'win':
    return [EX.winPathTODO()];
  case 'xdg':
    path = (this.xdgEnv('RUNTIME_DIR', false) ||
      pathLib.join(this.userCacheDir, 'run'));
    if ('function' === typeof this.xdgStrict) {
      throw new Error('Unable to verify whether XDG_RUNTIME_DIR is ' +
        'fully-featured by the standards of the operating system' +
        ': Checks not yet implemented');
    }
    return path;
  case 'mac-darwin':
    return pathLib.join(this.userCacheDir, 'run');
    // ^-- couldn't find better ideas onliine
  }
  throw this.fail2guess('userStateDir');
};


EX.guessUserLogsDir = function () {
  var sub = this.appSubdir, env = this.env, path;
  switch (this.pathSchema) {
  case 'win':
    return [EX.winPathTODO()];
  case 'xdg':
    return pathLib.join(this.userCacheDir, 'logs');
  case 'mac-darwin':
    return pathLib.join(this.userHome, 'Library', 'Logs', sub);
    // ^-- as per appdirs.js
  }
  throw this.fail2guess('userStateDir');
};






















module.exports = EX;
