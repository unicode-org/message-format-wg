The files in this directory were originally copied from the [messageformat project](https://github.com/messageformat/messageformat/tree/11c95dab2b25db8454e49ff4daadb817e1d5b770/packages/mf2-messageformat/src/__fixtures)
and are here relicensed by their original author (Eemeli Aro) under the Unicode License.

These test files are intended to be useful for testing multiple different message processors in different ways:

- `syntax-errors.json` — An array of strings that should produce a Syntax Error when parsed.

- `data-model-errors.json` - An object with string keys and arrays of strings as values,
     where each key is the name of an error and its value is array of strings that
     should produce `error` when processed.
     Error names are defined in ["MessageFormat 2.0 Errors"](../spec/errors.md) in the spec.

- `test-core.json` — An array of test cases that do not depend on any registry definitions.
  Each test may include some of the following fields:
  - `src: string` (required) — The MF2 syntax source.
  - `exp: string` (required) — The expected result of formatting the message to a string.
  - `locale: string` — The locale to use for formatting. Defaults to 'en-US'.
  - `params: Record<string, string | number | null | undefined>` — Parameters to pass in to the formatter for resolving external variables.
  - `parts: object[]` — The expected result of formatting the message to parts.
  - `cleanSrc: string` — A normalixed form of `src`, for testing stringifiers.
  - `errors: { type: string }[]` — The runtime errors expected to be emitted when formatting the message.
  - `only: boolean` — Normally not set. A flag to use during development to only run one or more specific tests.

- `test-function.json` — An object with string keys and arrays of test cases as values,
  using the same definition as for `test-core.json`.
  The keys each correspond to a function that is used in the tests.

TypeScript `.d.ts` files are included for `test-core.json` and `test-function.json` with the above definition.

Some examples of test harnesses using these tests, from the source repository:
- [CST parse/stringify tests](https://github.com/messageformat/messageformat/blob/11c95dab2b25db8454e49ff4daadb817e1d5b770/packages/mf2-messageformat/src/cst/cst.test.ts)
- [Data model stringify tests](https://github.com/messageformat/messageformat/blob/11c95dab2b25db8454e49ff4daadb817e1d5b770/packages/mf2-messageformat/src/data-model/stringify.test.ts)
- [Formatting tests](https://github.com/messageformat/messageformat/blob/11c95dab2b25db8454e49ff4daadb817e1d5b770/packages/mf2-messageformat/src/messageformat.test.ts)
