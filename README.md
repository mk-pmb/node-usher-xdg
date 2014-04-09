-*- coding: utf-8, tab-width: 2 -*-

Usher
=====

Usher suggests directories where to put stuff,
to help you house-train your programs.

There were previous attempts like [mwilliamson's xdg module][npm-xdg] or
[leedm777's appdirs.js][appdirs-js] (based on [Python appdirs][appdirs-py]),
but none supported all the directory roles that I'd want to use.


Features
--------
Basic self-awareness:
* ![☑][ck-hz] Expose `appMainFile`
* ![☑][ck-hz] Expose `binDir`
* ![☑][ck-hz] Guess `appDir` (what people often mean when they write `__dirname`)
* ![☑][ck-hz] Guess `userHome`
* ![☑][ck-hz] Guess `appName`
* ![☑][ck-hz] Guess `safeAppName` (hyphenize unusual characters)

The usual suspects:

| Scope | …ConfigDir  | …DataDir    | …CacheDir   | …LogsDir    |
| ----- |:-----------:|:-----------:|:-----------:|:-----------:|
| user… | ![☑][ck-hz] | ![☑][ck-hz] | ![☑][ck-hz] | ![☑][ck-hz] |
| roam… | ![◪][ck-pt] | ![◪][ck-pt] | ![◪][ck-pt] | ![◪][ck-pt] |
| site… | ![☑][ck-hz] | ![☑][ck-hz] | ![☑][ck-hz] | ![☑][ck-hz] |

Standards awareness:
* ![☐][ck-no] Loosely support [Windows Roaming][win-roam] support
  * ![☐][ck-no] Strictly compliant mode available
* ![☑][ck-hz] Loosely support [XDG Base Directory Specification][xdg-dirs]
  * ![☐][ck-no] Strictly compliant mode available

Reliability:
* ![☐][ck-no] Fallbacks for environments where usher as no clue

Sugar:
* ![☐][ck-no] Join XDG path lists with colons when used as strings
* ![☐][ck-no] Function to auto-create the suggested directory


Clues
-----
* [Windows XP/Vista/7/8 environment variables][win-vars]
* [XDG environment variables][xdg-dirs]


Good to know
------------

* __Why should I use `appDir` instead of `__dirname`?__

  The latter is [defined][nodeapi-dirname] as the directory of the "currently
  executing _script_", which is no difference as long as your application is
  just some single JavaScript file in the base directory.

  However, as soon as you divide it into subdirectories like `/bin` and `/lib`,
  that
  ```javascript
  webPub = __dirname + '/static';
  ```
  will probably break.
  It gets worse when you try to extract that code into a plugin and suddenly
  some of those `__dirname` relate to the plugin's hierarchy while others are
  meant to relate to the application that's using the plugin.

  Therefor, do future refactorers (probably: you yourself in a few months)
  a favor and use an expression that works independent of the call site and
  clearly conveys the real intention, so readers don't have to guess whether
  it was an accident and instead see that you knew what you were doing.




License
-------

[MIT](LICENSE.MIT.md)


  [xdg-dirs]: http://standards.freedesktop.org/basedir-spec/basedir-spec-latest.html
  [win-roam]: http://technet.microsoft.com/en-us/library/cc766489%28WS.10%29.aspx
  [win-vars]: http://www.askvg.com/list-of-environment-variables-in-windows-xp-vista-and-7/
  [npm-xdg]: https://www.npmjs.org/package/xdg
  [appdirs-js]: https://github.com/building5/appdirsjs
  [appdirs-py]: https://pypi.python.org/pypi/appdirs
  [nodeapi-dirname]: http://nodejs.org/api/globals.html#globals_dirname
  [ck-hz]: https://raw.githubusercontent.com/mk-pmb/misc/master/gfm-util/img/checkmark-has.gif# "☑"
  [ck-pt]: https://raw.githubusercontent.com/mk-pmb/misc/master/gfm-util/img/checkmark-partial.gif# "◪"
  [ck-no]: https://raw.githubusercontent.com/mk-pmb/misc/master/gfm-util/img/checkmark-minus.gif# "☐"
