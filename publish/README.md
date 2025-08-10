# Tools for publication

The contents of [Unicode MessageFormat Standard](./spec/) are published
as a part of [Unicode Technical Standard #35](https://unicode.org/reports/tr35/).

The contents of this directory are used to collect the spec parts into a single file for publication,
and to fix internal and external links.

The `publish.zsh` script expects to be run in a MacOS environment where GNU sed is available as `gsed`.
It is likely to need modification to work elsewhere.

To build a spec update:

1. Get a copy of the current https://github.com/unicode-org/cldr/blob/main/docs/ldml/tr35-messageFormat.md.
2. Update `header.md` and `footer.md` from `tr35-messageFormat.md`,
   replacing the Table of Contents with `[TOC]`.
3. Update `publish.zsh` as required for any structural changes or new links.
4. Run `./publish.zsh > tr35-messageFormat.md`.
5. Inspect the results; a `diff` with the old contents may be useful.
6. Generate the Table of Contents at https://bitdowntoc.derlin.ch/:
   1. Reset the default options, then set:
      - indent characters `*`
      - indent spaces `2`
      - oneshot `x`
   2. Copy the generated `tr35-messageFormat.md` into the left field.
   3. Generate the TOC.
   4. Verify that no TOC items have trailing `-1`, `-2`, etc, caused by duplicate titles.
   5. Copy the TOC only into the generated `tr35-messageFormat.md`.

Make fixes and repeat as necessary until the output is clean.
