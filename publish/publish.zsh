#!/bin/zsh

for f in \
  header.md\
  ../spec/intro.md\
  ../spec/syntax.md\
  <(
    echo '## message.abnf'
    echo
    echo '```abnf'
    cat ../spec/message.abnf
    echo '```'
  )\
  ../spec/formatting.md\
  ../spec/errors.md\
  ../spec/functions/README.md\
  ../spec/functions/string.md\
  ../spec/functions/number.md\
  ../spec/functions/datetime.md\
  ../spec/u-namespace.md\
  ../spec/data-model/README.md\
  <(
    echo '### `message.json`'
    echo
    echo '```json'
    cat ../spec/data-model/message.json
    echo '```'
  )\
  ../spec/appendices.md\
  footer.md
do
  cat $f
  echo
done | gsed -e '
  s!\[\([^[]\+\)\](../docs/why_mf_next.md)!\1!
  s!\./errors.md#errors!#errors!
  s!\./formatting.md!!
  s!\./message.abnf!#messageabnf!
  s!\./message.json!#messagejson!
  s!\./spec/functions/README.md!!
  s!\.\?/spec/formatting.md!!
  s!/spec/message.abnf!#messageabnf!
  s!/spec/syntax.md!#syntax!
  s!appendices.md!!
  s!https://unicode.org/reports/tr35/tr35.html!tr35.md!
  s!https://www.unicode.org/reports/tr35/tr35-dates.html!tr35-dates.md!
  s!https://www.unicode.org/reports/tr35/tr35-75/tr35-dates.html!tr35-dates.md!
  s!https://www.unicode.org/reports/tr35/tr35-general.html!tr35-general.md!
  s!https://www.unicode.org/reports/tr35/tr35-info.html!tr35-info.md!
  s/ \+$//
  /# Table of Contents/,/^[^1 ]/{//!d}
  /# Table of Contents/d
  /# The Unicode MessageFormat Standard Specification/d
' | cat -s
