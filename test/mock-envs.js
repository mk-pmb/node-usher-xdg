/* -*- coding: UTF-8, tab-width: 2 -*- */
/*jslint indent: 2, maxlen: 80, node: true */
'use strict';

var EX = exports;

EX.resolveOne = function (mockEnv, varName, maxDepth) {
  var val = String(mockEnv[varName] || '');
  if (maxDepth < 1) { throw new Error('resolve mockEnv: too deep'); }
  val = val.replace(/%([A-Z_]+)%/g, function (insVal, vn) {
    vn = vn.replace(/%/g, '');
    insVal = EX.resolveOne(mockEnv, vn, maxDepth - 1);
    if (!insVal) { throw new Error('resolve mockEnv: empty var: ' + vn); }
    return insVal;
  });
  return val;
};

EX.resolveInplace = function (mockEnv) {
  Object.keys(mockEnv).forEach(function (vn) {
    mockEnv[vn] = EX.resolveOne(mockEnv, vn, 2);
  });
  return mockEnv;
};

EX.winXP = EX.resolveInplace({
  '_DOCS_':           "Documents and Settings",
  ALLUSERSPROFILE:    "C:\\%_DOCS_%\\All Users",
  APPDATA:            "C:\\%_DOCS_%\\_user_\\Application Data",
  COMPUTERNAME:       "_host_",
  COMMONPROGRAMFILES: "C:\\Program Files\\Common Files",
  HOMEDRIVE:          "C:",
  HOMEPATH:           "\\%_DOCS_%\\_user_",
  PROGRAMFILES:       "%SystemDrive%\\Program Files",
  SystemDrive:        "C:",
  SystemRoot:         "C:\\Windows",
  TEMP:               "%SystemDrive%\\%_DOCS_%\\_user_\\Local Settings\\Temp",
  TMP:                "%TEMP%",
  USERDOMAIN:         "_domain_",
  USERNAME:           "_user_",
  USERPROFILE:        "%SystemDrive%\\%_DOCS_%\\_user_",
  windir:             "%SystemDrive%\\WINDOWS",
});

EX.winVista = EX.resolveInplace({
  ALLUSERSPROFILE:    "C:\\ProgramData",
  APPDATA:            "C:\\Users\\_user_\\AppData\\Roaming",
  COMPUTERNAME:       "_host_",
  COMMONPROGRAMFILES: "C:\\Program Files\\Common Files",
  HOMEDRIVE:          "C:",
  HOMEPATH:           "\\Users\\_user_",
  LOCALAPPDATA:       "C:\\Users\\_user_\\AppData\\Local",
  PROGRAMDATA:        "%SystemDrive%\\ProgramData",
  PROGRAMFILES:       "%SystemDrive%\\Program Files",
  PUBLIC:             "%SystemDrive%\\Users\\Public",
  SystemDrive:        "C:",
  SystemRoot:         "%SystemDrive%\\Windows",
  TEMP:               "%SystemDrive%\\Users\\_user_\\AppData\\Local\\Temp",
  TMP:                "%TEMP%",
  USERDOMAIN:         "_domain_",
  USERNAME:           "_user_",
  USERPROFILE:        "%SystemDrive%\\Users\\_user_",
  windir:             "%SystemDrive%\\WINDOWS",
});


EX.ubuntuXfce = {
  DEFAULTS_PATH:    '/usr/share/gconf/xfce.default.path',
  HOME:             '/home/_user_',
  LANG:             'en_US.UTF-8',
  LOGNAME:          '_user_',
  USER:             '_user_',
  XDG_CONFIG_DIRS:  '/etc/xdg/xdg-xfce:/etc/xdg:/etc/xdg',
  XDG_CURRENT_DESKTOP:  'XFCE',
  XDG_DATA_DIRS:    '/usr/share/xfce:/usr/local/share/:/usr/share/:/usr/share',
  XDG_MENU_PREFIX:  'xfce-',
};



















/* np2 */
