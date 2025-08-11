# Tools for publication

The contents of [Unicode MessageFormat Standard](./spec/) are published
as a part of [Unicode Technical Standard #35](https://unicode.org/reports/tr35/).

The contents of this directory are used to collect the spec parts into a single file for publication,
and to fix internal and external links.

The scripts require Node.js 20 or later, and expect to be run in a POSIX environment.

To build a spec update:

1. Use `make prepare` to:
   1. Update the CLDR submodule
   1. Install `tr-archive` tool dependencies
   1. Update `header.md` and `footer.md`
1. Apply any updates needed in `header.md`.
1. Update `collect.mjs` as required for any structural changes or new links.
1. Use `make dist` to:
   1. Collect the current spec parts into `cldr/docs/ldml/tr35-messageFormat.md`.
   1. Fix link targets.
   1. Add the Table of Contents.
   1. Check the Table of Contents for duplicate section title links.
   1. Build a local copy of the rendered HTML at `dist/index.html`.
1. Inspect the results; `git diff` in the `cldr/` submodule may be useful.
1. Apply fixes and repeat as necessary until the output is clean.
