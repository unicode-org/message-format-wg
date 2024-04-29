The tests in the `./tests/` directory were originally copied from the [messageformat project](https://github.com/messageformat/messageformat/tree/11c95dab2b25db8454e49ff4daadb817e1d5b770/packages/mf2-messageformat/src/__fixtures)
and are here relicensed by their original author (Eemeli Aro) under the Unicode License.

These test files are intended to be useful for testing multiple different message processors in different ways:

- `syntax.json` — Test cases that do not depend on any registry definitions.

- `syntax-errors.json` — Strings that should produce a Syntax Error when parsed.

- `data-model-errors.json` - Strings that should produce Data Model Error when processed.
  Error names are defined in ["MessageFormat 2.0 Errors"](../spec/errors.md) in the spec.

- `functions/` — Test cases that correspond to built-in functions.
  The behaviour of the built-in formatters is implementation-specific so the `exp` field is often
  omitted and assertions are made on error cases.

Some examples of test harnesses using these tests, from the source repository:

- [CST parse/stringify tests](https://github.com/messageformat/messageformat/blob/11c95dab2b25db8454e49ff4daadb817e1d5b770/packages/mf2-messageformat/src/cst/cst.test.ts)
- [Data model stringify tests](https://github.com/messageformat/messageformat/blob/11c95dab2b25db8454e49ff4daadb817e1d5b770/packages/mf2-messageformat/src/data-model/stringify.test.ts)
- [Formatting tests](https://github.com/messageformat/messageformat/blob/11c95dab2b25db8454e49ff4daadb817e1d5b770/packages/mf2-messageformat/src/messageformat.test.ts)

A [JSON schema](./schemas/) is included for the test files in this repository.

For users of Visual Studio Code, a [settings file](./.vscode/settings.json) is included that enables schema validation while editing the test files.

## Test Functions

As the behaviour of some of the default registry functions
such as `:number` and `:datetime`
is dependent on locale-specific data and may vary between implementations,
the following functions are defined for **test use only**:

### `:test:function`

This function is valid both as a selector and as a formatter.

#### Operands

The function `:test:function` requires a [Number Operand](/spec/registry.md#number-operands) as its _operand_.

#### Options

The only option `:test:function` recognizes is `fd`,
a _digit size option_ for which only `0` and `1` are valid values.

All other options and their values are ignored.

#### Behavior

When resolving a `:test:function` expression,
its _Input_ and _FD_ values are determined as follows:

1. Let _FD_ be `0`.
1. Let _arg_ be the resolved value of the expression operand.
1. If _arg_ is the resolved value of an expression
   with a `:test:function`, `:test:select`, or `:test:format` annotation
   for which resolution has succeeded, then
   1. Let _Input_ be the _Input_ value of _arg_.
   1. Set _FD_ to be _FD_ value of _arg_.
1. Else if _arg_ is a numerical value
   or a string matching the `number-literal` production, then
   1. Let _Input_ be the numerical value of _arg_.
1. Else,
   1. Emit "bad-input" Resolution Error.
   1. Use a fallback representation as the resolved value of the expression.
      Further steps of this algorithm are not followed.
1. If the `fd` option is set, then
   1. If its value resolves to a numerical integer value `0` or `1`
      or their corresponding string representations `'0'` or `'1'`, then
      1. Set _FD_ to be the numerical value of the option.
   1. Else if its value is not an unresolved value set by [Option Resolution](/spec/formatting.md#option-resolution),
      1. Emit "bad-option" Resolution Error.
      1. Use a fallback representation as the resolved value of the expression.

When `:test:function` is used as a selector,
the behaviour of calling it as the `rv` value of MatchSelectorKeys(`rv`, `keys`)
(see [Resolve Preferences](/spec/formatting.md#resolve-preferences) for more information)
depends on its _Input_ and _FD_ values.

- If the _Input_ is `1` and _FD_ is `1`,
  the method will return some slice of the list « `'1.0'`, `'1'` »,
  depending on whether those values are included in `keys`.
- If the _Input_ is `1` and _FD_ is `0`,
  the method will return the list « `'1'` » if `keys` includes `'1'`, or an empty list otherwise.
- If the _Input_ is any other value, the method will return an empty list.

When an expression with a `:test:function` annotation is assigned to a variable by a declaration
and that variable is used as an option value,
its resolved value is the _Input_ value.

When `:test:function` is used as a formatter,
a placeholder resolving to a value with a `:test:function` expression
is formatted as a concatenation of the following parts:

1. If _Input_ is less than `0`, the character `-` U+002D Hyphen-Minus.
1. The truncated absolute integer value of _Input_, i.e. floor(abs(_Input_)),
   formatted as a sequence of decimal digit characters (U+0030...U+0039).
1. If _FD_ is `1`, then
   1. The character `.` U+002E Full Stop.
   1. The single decimal digit character representing the value floor((abs(_Input_) - floor(abs(_Input_))) \* 10)

If the formatting target is a sequence of parts,
each of the above parts will be emitted separately
rather than being concatenated into a single string.

Note that for purposes of clarity, the formatting of `:test:function` does not perform any rounding.

### `:test:select`

This function accepts the same operands and options,
and behaves exactly the same as `:test:function`,
except that it cannot be used for formatting.

When `:test:select` is used as a formatter,
a "not-formattable" error is emitted and the placeholder is formatted with
a fallback representation.

### `:test:format`

This function accepts the same operands and options,
and behaves exactly the same as `:test:function`,
except that it cannot be used for selection.

When `:test:format` is used as a selector,
the steps under 2.iii. of [Resolve Selectors](/spec/formatting.md#resolve-selectors) are followed.
