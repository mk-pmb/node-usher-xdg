#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function main () {
  local SPEC_BASE='http://standards.freedesktop.org/basedir-spec/'
  local SPEC_FILE='basedir-spec-latest.html'
  [ -f "$SPEC_FILE" ] || wget "${SPEC_BASE}${SPEC_FILE}"
  <"$SPEC_FILE" tr '\n' '\r' | LANG=C sed -re '
    s~^.*>Basics</h2>~~
    s~<h2 .*$~~
    s~</?(p|div)\b[^<>]*>~~g
    s~^.*<ul [^<>]*>~~
    s~</ul>.*$~~
    s~</?(code)\b[^<>]*>~~g
    s~<li\b[^<>]*>~~g
    s~\r\s*~ ~g
    s~\s*</li>\s*~\n~g
    ' | LANG=C sed -re '
    s~^\s*There is a ~~
    s~This (set of |)(director[yies]+) is defined by the environment(\
      $|) variable ~\r~
    s~^([^\r]+)\r(\$[A-Z_]+)\.$~`\2`:             \1~
    s~^(.{20} ) +~\1\r~
    s~ relative to which ~ ~
    s~\rset of preference ordered base directories ~(list)\r~
    s~\rsingle base directory user-specific ~(path)\r~
    s~\r(.*) should be (writte|search|place)e?[nd]?\.\s*$~\r\2 \1~g
    s~\r(search) ~ read ~
    s~\r(writte|place) ~ save ~
    s~ (data|config)(uration|) files$~ \1~
    s~\r~°~g
    s~^`~  * &~
    '
  return 0
}







main "$@"; exit $?
