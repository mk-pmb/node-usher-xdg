#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function mock_envs_win () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFNAME="$FUNCNAME"
  local SELFPATH="$(readlink -m "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH" || return $?

  local WSP42="$(printf '% 42s' '')"
  case "$1" in
  tsv )
    echo '# -*- coding: utf-8, tab-width: 20 -*-'
    wp_vartbl
    return 0;;
  pfx )
    wp_vartbl | sed -re '
      s~^~var:~
      s~\t~\nxp:~
      s~\t~\nvista:~
      '
    return 0;;
  cmp | '')
    wp_vartbl | sed -re '
      s~^~'"$WSP42"'&~
      s~^ *([^\t]{25})\t~\1\t~
      s~^([^\t]+)\t([^\t]*)\t\2$~\1\tboth : \2~
      s~^([^\t]+)\t([^\t]*)\t([^\t]*|\
        )$~\1\txp   : \2\n'"${WSP42:0:25}"'\tvista: \3~
      s~\t *xp *: *\n *~~
      s~\t~ ~g
      s~ *(\t|\n|$)~\1~g
      1s~^\n+~~
      $s~\n+$~~
      ' | uniq
    return 0;;
  xp.json )
    wp_vartbl | cut -f 1,2 | tsv2json
    return 0;;
  vista.json )
    wp_vartbl | cut -f 1,3 | tsv2json
    return 0;;
  esac

  echo "E: unsupported output mode" >&2
  return 2
}


function wp_vartbl () {
  local WP_FN="$SELFNAME".xml
  local WP_API='https://en.wikipedia.org/w/api.php?action=parse&format=xml&'
  if [ ! -s "$WP_FN" ]; then
    wget --output-document="$WP_FN".tmp --continue \
      "$WP_API"'prop=wikitext&oldid=898972990&section=13' || return $?
    mv --no-clobber --no-target-directory -- "$WP_FN"{.tmp,} || return $?
  fi

  sed -rf <(echo '
    s~\a~~g
    s~\s+~ ~g
    s~\&lt;ref name=.*$~~
    s~\&#160;~~g
    ') -- "$SELFNAME".xml | sed -nrf <(echo '
    /^\| \{{2}mono\|/{
      N;N;N
      s~(^|\n)\| ~\1~g
      s~(\{{2})(mono\||)(\S+)\}{2}~\3~g
      s~\n~\t~g
      s~^(\S+\t)(Yes|No)\t~\1~

      /^%/!d
      /only in 64-bit version/d
      s~(^|\t)[^\t]* usually (\S+), formerly (\S+)(\t|$)~\1\2\4~g

      # filter some distractions
      /^%(COMSPEC)%\t/d
      /^%(LOGONSERVER)%\t/d
      /^%(PATH)%\t/d
      /^%(PATHEXT)%\t/d
      /^%(PROMPT)%\t/d
      /^%(PSModulePath)%\t/d
      s~\{(user)(name)\}~_\1_~g
      s~\{(computer)(name)\}~_host_~g
      s~\{(user)(domain)\}~_\2_~g

      s~^(%[A-Za-z0-9_]+%)\t\1 \S*not supported, not replaced by any value\S*|\
        ^~\1\t(unsupported)~
      s~^(%[A-Z_]+%) *and *(%[A-Z_]+%)\t(.*)$~\1\t\3\n\2\t\1\t\1~
      s~ *(\t|\n|$)~\1~g
      p
    }')
}


function tsv2json () {
  sed -re '
    /\t$/d
    s~^%(\S+)%\t~"\1":'"$WSP42"'\t"~
    s~^(.{30}) *\t~  \1~
    s~$~",~
    s~\\~&&~g
    1s~^ ~{~
    $s~,$~ }~
    '
}










mock_envs_win "$@"; exit $?
