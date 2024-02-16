# Selection and Formatting on String Values

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@aphillips</dd>
		<dt>First proposed</dt>
		<dd>2024-02-16</dd>
		<dt>Pull Request</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/660">#660</a></dd>
	</dl>
</details>

## Objective

Define how selection and formatting of string literals takes place.

## Background

This design doc covers the text needed in the registry for selection and formatting of
string values.
This includes functionality to match or replace that found in MF1's `SelectFormat`.

## Use-Cases

As a user, I wish to select the pattern to use based on an enumerated list of values.

As a user, I wish to insert strings into a pattern.

As a user, I wish to insert data values that do not have a custom or built-in formatting
function into a pattern, relying on the data value or object's ability to stringify itself.


## Requirements

- Enable `SelectFormat`

## Constraints

ICU MF1 messages using `select` should be representable in MF2.

## Proposed Design

## String Selection and Formatting

### Functions

The following functions are provided:

The function `:string` provides string selection and formatting.

### Operands

The _operand_ is any literal or an implementation-defined set of string or
character-sequence types.

> [!NOTE]
> This should probably include individual character types, such as `char`.

In addition, implementations MAY perform formatting and selection on 
`operand` values that do not otherwise have a formatting function registered, 
although emitting an `Unsupported Expression` error is RECOMMENDED.

### Options

The function `:string` has no options.

> [!NOTE]
> Proposals for string transformation options or implementation
> experience with user requirements is desired during the Tech Preview.

### Selection

When implementing [`MatchSelectorKeys`](spec/formatting.md#resolve-preferences), 
the `:string` selector performs as described below.

- Let `return_value` be a new empty list of strings.
- Let `operand` be the resolved value of the _operand_.
  If the `operand` is not a string literal, convert the value to a string literal,
  or, optionally: emit a _Selection Error_ and return `return_value`.
- Let `keys` be a list of strings containing keys to match.
  (Hint: this list is an argument to `MatchSelectorKeys`)
- For each string `key` in `keys`:
   - If the value of `key` is equal to the string value of `operand`
     then `key` matches the selector.
     A `key` and an `operand` are equal if they consist of the same
     sequence of Unicode code points.
     Add `key` to the front of the `return_value` list.
- Return `return_value`

> [!NOTE]
> Matching of `key` and `operand` values is sensitive to the sequence of code points
> in each string.
> As a result, variations in how text can be encoded can affect the performance of matching.
> The function `:string` does not perform case folding or Unicode Normalization of string values.

> [!NOTE]
> Unquoted string literals in a _variant_ do not include spaces.
> If users wish to match strings that begin or end with spaces
> (including U+3000 `IDEOGRAPHIC SPACE`)
> to a key, the `key` needs to have the spaces quoted.
> > For example:
> >```
> > .match {$string :string}
> > | space key | {{Matches the string " space key "}}
> > *             {{Matches the string "space key"}}
> >```

### Formatting

The `:string` function returns the string value of the resolved value of the _operand_.
