
<!--#echo json="package.json" key="name" underline="=" -->
usher-xdg
=========
<!--/#echo -->

<!--#echo json="package.json" key="description" -->
Suggest paths for where to save what, trying to follow OS-specific
conventions.
<!--/#echo -->


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

| Scope →     | user…       | roam…       | site…       |
| ----------- |:-----------:|:-----------:|:-----------:|
| …DataDir    | ![☑][ck-hz] | ![◪][ck-pt] | ![☑][ck-hz] |
| …ConfigDir  | ![☑][ck-hz] | ![◪][ck-pt] | ![☑][ck-hz] |
| …CacheDir   | ![☑][ck-hz] | –           | ![◪][ck-pt] |
| …StateDir   | ![◪][ck-pt] | –           | ![◪][ck-pt] |
| …LogsDir    | ![☑][ck-hz] | ![◪][ck-pt] | ![◪][ck-pt] |

Standards awareness:
* ![☐][ck-no] Loosely support [Windows Roaming][win-roam]
  * ![☐][ck-no] Strictly compliant mode available
* ![☑][ck-hz] Loosely support [XDG Base Directory Specification][xdg-dirs]
  * ![☐][ck-no] Strictly compliant mode available
    * ![☑][ck-hz] Ignore relative paths
    * ![☐][ck-no] Check file system features on `XDG_RUNTIME_DIR`

Reliability:
* ![☐][ck-no] Fallbacks for environments where usher has no clue

Sugar:
* ![☑][ck-hz] Join XDG path lists with colons when used as strings
* ![☐][ck-no] Function to auto-create the suggested directory


Clues
-----
* Windows environment variables: [env-askvg], [env-wp-en]
* [XDG environment variables][xdg-dirs]
* Darwin (Mac OS X/ iOS) paths:
  * [Apple's iOS File System Programming Guide][apple-paths-guide]
  * [XBMC iOS FAQ](http://wiki.xbmc.org/index.php?title=IOS_FAQ)
* [Darvin environment variables][env-macobs]


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
  meant to relate to the application that uses the plugin.

  Therefor, do future refactorers (probably: you yourself in a few months)
  a favor and use an expression that works independent of the call site and
  clearly conveys the real intention, so readers don't have to guess whether
  it was an accident and instead see that you knew what you were doing.




<!--#toc stop="scan" -->



&nbsp;

  [xdg-dirs]: http://standards.freedesktop.org/basedir-spec/basedir-spec-latest.html
  [win-roam]: http://technet.microsoft.com/en-us/library/cc766489%28WS.10%29.aspx
  [env-askvg]: http://www.askvg.com/list-of-environment-variables-in-windows-xp-vista-and-7/
  [env-wp-en]: http://en.wikipedia.org/wiki/Environment_variable
  [env-macobs]: http://www.macobserver.com/tips/macosxcl101/2002/20020712.shtml
  [npm-xdg]: https://www.npmjs.org/package/xdg
  [appdirs-js]: https://github.com/building5/appdirsjs
  [appdirs-py]: https://pypi.python.org/pypi/appdirs
  [nodeapi-dirname]: http://nodejs.org/api/globals.html#globals_dirname
  [apple-paths-guide]: https://developer.apple.com/library/ios/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/FileSystemOverview/FileSystemOverview.html
  [ck-hz]: https://raw.githubusercontent.com/mk-pmb/misc/master/gfm-util/img/checkmark-has.gif# "☑"
  [ck-up]: https://raw.githubusercontent.com/mk-pmb/misc/master/gfm-util/img/checkmark-up.gif# "⟎"
  [ck-pt]: https://raw.githubusercontent.com/mk-pmb/misc/master/gfm-util/img/checkmark-partial.gif# "◪"
  [ck-no]: https://raw.githubusercontent.com/mk-pmb/misc/master/gfm-util/img/checkmark-minus.gif# "☐"

License
-------
<!--#echo json="package.json" key=".license" -->
ISC
<!--/#echo -->
