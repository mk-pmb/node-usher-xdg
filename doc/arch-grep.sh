#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
SELFPATH="$(readlink -m "$0"/..)"


function main () {
  cd "$SELFPATH" || return $?
  local ARCH="$1"
  [ -n "$ARCH" ] || return 2$(echo 'E: no arch name given!' >&2)
  sed ../index.js -re '
    /^\s*(\}|\]|\)|;)+$/d
    /^\s*return \[$/d
    /^\s*throw this\.fail2guess\(/d
    ' | grep -xPe "\s*case '$ARCH':|EX\.guess\w+ = function \(.*" \
    -A 5 | tr -s '\r\n' '\r' | LANG=C sed -re '
    s~^|\r--\r|$~\n~g
    s~(^|\r)(\s*case\s'"'$ARCH'"':)~\n\2~g
    s~\nEX\.(guess[A-Za-z]+) =[^\n]+~\n<<func>>=\1<</func>>~g
    s~<</func>>\n<<func>>=~,~g
    s~(\n<<func>>=)[^\n]+,([^\n,]+<</func>>)~\1\2~g
    s~\r~\n~g
    s~^\n+~~
    s~\n+$~~
    ' | LANG=C sed -re '
    /^<<func>>=/{
      N;s~^<<func>>=([A-Za-z]+)<</func>>\n(\s+)(.*)$~\2\3 === @\1 =~
      s~$~'"$(head -c 80 /dev/zero | tr -c = =)"'~
      s~^(.{100})=+$~\1~
      s!=!–!g
    }
    s~'"'$ARCH':"'|user(Home|Name)|\bhome\b~\x1b[93;1m&\x1b[0m~g
    /^\s*case\s/{
      s~^|\x1b\[0m~\x1b\[0;30;43m~g
      s~(\s+(–){3,}\s+@[A-Za-z]+\s+(–){3,})$~\x1b\[0;33m\1~
      s~$~\x1b\[0m~
    }
    ' | less -rS +Gg
  return 0
}









main "$@"; exit $?
