The files in this directory were originally copied from the [messageformat project](https://github.com/messageformat/messageformat/tree/11c95dab2b25db8454e49ff4daadb817e1d5b770/packages/mf2-messageformat/src/__fixtures)
and are here relicensed by their original author (Eemeli Aro) under the Unicode License.

These test files are intended to be useful for testing multiple different message processors in different ways:

- `syntax-errors.json` — An array of strings that should produce a Syntax Error when parsed.

- `data-model-errors.json` - An object with string keys and arrays of strings as values,
     where each key is the name of an error and its value is an array of strings that
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
     If `errors` is either absent or empty, the message must be formatted without errors.
  - `only: boolean` — Normally not set. A flag to use during development to only run one or more specific tests.

- `test-function.json` — An object with string keys and arrays of test cases as values,
  using the same definition as for `test-core.json`.
  The keys each correspond to a function that is used in the tests.
  Since the behavior of built-in formatters is implementation-specific,
  the `exp` field should generally be omitted,
  except for error cases.

TypeScript `.d.ts` files are included for `test-core.json` and `test-function.json` with the above definition.

Some examples of test harnesses using these tests, from the source repository:
- [CST parse/stringify tests](https://github.com/messageformat/messageformat/blob/11c95dab2b25db8454e49ff4daadb817e1d5b770/packages/mf2-messageformat/src/cst/cst.test.ts)
- [Data model stringify tests](https://github.com/messageformat/messageformat/blob/11c95dab2b25db8454e49ff4daadb817e1d5b770/packages/mf2-messageformat/src/data-model/stringify.test.ts)
- [Formatting tests](https://github.com/messageformat/messageformat/blob/11c95dab2b25db8454e49ff4daadb817e1d5b770/packages/mf2-messageformat/src/messageformat.test.ts)

## Test Functions

As the behaviour of `:number`, `:datetime`, and other default message functions
is dependent on locale-specific data and may vary between implementations,
the following functions are defined for test use only:

### `test:number`

This function is valid both as a selector and as a formatter.
The only option it recognizes is `fractionDigits`,
all other option values passed to it are ignored.

When resolving a `test:number` expression,
its internal _input_ and _fractionDigits_ values are determined as follows:
1. If the expression argument resolves to a numerical value
   or a string matching the `number-literal` production, then
   1. Let _input_ be the numerical value of the argument.
2. Else,
   1. Emit "bad-input" error.
   1. Use a fallback representation is used as the resolved value of the expression.
      The _fractionDigits_ value is not determined.
3. If the `fractionDigits` option is set, then
   1. If its value resolves to a numerical integer value `0`, `1` or `2`,
      or their corresponding string representations `'0'`, `'1'`, or `'2'`, then
      1. Let _fractionDigits_ be the numerical value of the option.
   2. Else,
      1. Emit "bad-option" error.
      2. Let _fractionDigits_ be `0`.
4. Else,
   1. Let _fractionDigits_ be `0`.

When `test:number` is used as a selector,
the behaviour of calling it as the `rv` value of MatchSelectorKeys(`rv`, `keys`)
(see [Resolve Preferences](/spec/formatting.md#resolve-preferences) for more information)
depends on its _input_ and _fractionDigits_ values.
- If the _input_ is `1` and _fractionDigits_ is `0`,
  the method will return some slice of the list « `'1'`, `'one'` »,
  depending on whether those values are included in `keys`.
- If the _input_ is `1` and _fractionDigits_ is not `0`,
  the method will return the list « `'1'` » if `keys` includes `'1'`, or an empty list otherwise.
- If the _input_ is any other value, the method will return an empty list.

When an expression with a `test:number` annotation is assigned to a variable by a declaration
and that variable is used as an argument or option value,
its resolved value is the _input_ value.

When `test:number` is used as a formatter,
a placeholder resolving to a value with a `test:number` expression
is formatted as a concatenation of the following parts:
1. If _input_ is less than `0`, the character `-` U+002D Hyphen-Minus.
2. The truncated absolute integer value of _input_, i.e. floor(abs(_input_)),
   formatted as a sequence of decimal digit caharacters.
3. If _fractionDigits_ is `1`, then
   1. The character `.` U+002E Full Stop.
   2. The single decimal digit character representing the value floor((abs(_input_) - floor(abs(_input_))) * 10)
4. Else if _fractionDigits_ is `2`, then
   1. The character `.` U+002E Full Stop.
   2. The two decimal digit character string representing the value floor((abs(_input_) - floor(abs(_input_))) * 100),
      with a `0` U+0030 Digit Zero padding at start if the result is less than `10`.

If the formatting target is a sequence of parts,
each of the above parts will be emitted separately
rather than being concatenated into a single string.

Note that for purposes of clarity, the formatting of `test:number` does not perform any rounding.

### `test:plural`

This function behaves exactly the same as `test:number`,
except that it cannot be used for formatting.

When `test:plural` is used as a formatter,
a "not-formattable" error is emitted and the placeholder is formatted with
a fallback representation.
