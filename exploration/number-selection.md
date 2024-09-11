# Selection on Numerical Values

Status: **Accepted** (moving back to **Proposed**)

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@eemeli</dd>
		<dd>@aphillips</dd>
		<dt>First proposed</dt>
		<dd>2023-09-06</dd>
		<dt>Pull Request</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/471">#471</a></dd>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/621">#621</a></dd>
	</dl>
</details>

## Objective

Define how selection on numbers happens.

## Background

As discussed by the working group and explicitly identified in
<a href="https://github.com/unicode-org/message-format-wg/pull/457">discussion of #457</a>,
there is a need to support multiple types of selection on numeric values in MF2.

MF1 supported selection on either cardinal plurals or ordinal numbers,
via the `plural` and `selectordinal` selectors.
It also customized this selection beyond the capabilities of `com.ibm.icu.text.PluralRules`
by allowing for explicit value matching and an `offset` parameter.

As pointed out by <a href="https://github.com/mihnita">@mihnita</a> in particular,
category selection is not always appropriate for selection on a number:
the number may be representing some completely other quantity,
such as a four-digit year or the integer value of an enumerator.

Furthermore, as pointed out by <a href="https://github.com/ryzokuken">@ryzokuken</a>
in <a href="https://github.com/unicode-org/message-format-wg/pull/457#discussion_r1307443288">#457 (comment)</a>,
ordinal selection works similarly to plural selection, but uses a separate set of rules
for each locale.
This is visible in English, for example, where plural rules use only `one` and `other`
but ordinal rules use `one` (_1st_, _21st_, etc.), `two` (_2nd_, _22nd_, etc.), 
`few` (_3rd_, _23rd_, etc.), and `other` (_4th_, _5th_, etc.).

Additionally,
MF1 provides `ChoiceFormat` selection based on a complex rule set
(and which allows determining if a number falls into a specific range).
This capability is not supported by the default functions of MF2.

Both JS and ICU PluralRules implementations provide for determining the plural category
of a range based on its start and end values.
Range-based selectors are not initially considered here.

In <a href="https://github.com/unicode-org/message-format-wg/pull/842">PR #842</a>
@eemeli points out a number of gaps or infelicities in the current specification
and there was extensive discussion of how to address these gaps.

The `key` for exact numeric match in a variant has to be a string. 
The format of such strings, therefore, has to be specified if messages are to be portable and interoperable. 
In LDML45 Tech Preview we selected JSON's number serialization as a source for `key` values.
The JSON serialization is ambiguous, in that a given number value might be serialized validly in more than one way:
```
123
123.0
1.23E2
... etc...
```

## Use-Cases

As a user, I want to write messages that use the correct plural for
my locale and enables translation to locales that use different rules.

As a user, I want to write messages that use the correct ordinal for
my locale and enables translation to locales that use different rules.

As a user, I want to write messages in which the pattern used depends on exactly matching
a numeric value.

As a user, I want to write messages that mix exact matching and 
either plural or ordinal selection in a single message. 
> For example:
>```
>.match $numRemaining
>0   {{You have no more chances remaining (exact match)}}
>1   {{You have one more chance remaining (exact match)}}
>one {{You have {$numRemaining} chance remaining (plural)}}
>*   {{You have {$numRemaining} chances remaining (plural)}}
>```

As a user, I want the selector to match the options specified:
```
.local $num = {123.123 :number maximumFractionDigits=2 minimumFractionDigits=2}
.match $num
123.12      {{This matches}}
120         {{This does not match}}
123.123     {{This does not match}}
1.23123E2   {{Does this match?}}
*           {{ ... }}
```

Note that badly written keys just don't match, but we want users to be able to intuit whether a given set of keys will work or not.

```
.local $num = {123.456 :integer}
.match $num
123.456 {{Should not match?}}
123     {{Should match}}
123.0   {{Should not match?}}
*       {{ ... }}
```

There can be complications, which we might need to define. Consider:

```
.local $num = {123.002 :number maximumFractionDigits=1 minimumFractionDigits=0}
.match $num
123.002 {{Should not match?}}
123.0   {{Does minimumFractionDigits make this not match?}}
123     {{Does minimumFractionDigits make this match?}}
*       {{ ... }}
```

As an implementer, I am concerned about the cost of incorporating _options_ into the selector. 
This might be accomplished by building a "second formatter". 
Some implementations, such as ICU4J's, might use interfaces like `FormattedNumber` to feed the selector. 
Implementations might also apply options by modifying the number value of the _operand_ 
(or shadowing the options effect on the value)

As a user, I want to be able to perform exact match using arbitrary digit numeric types where they are available.

As an implementer, I do **not** want to be required to provide or implement arbitrary precision
numeric types not available in my platform.
Programming/runtime environments vary widely in support of these types.
MF2 should not prevent the implementation using, for example, `BigDecimal` or `BigInt` types
and permit their use in MF2 messages.
MF2 should not _require_ implementations to support such types where they do not exist.
The problem of numeric type precision,
which is implementation dependent,
should not affect how message `key` values are specified.

> For example:
>```
>.local $num = {11111111111111.11111111111111 :number}
>.match $num
>11111111111111.11111111111111 {{This works on some implementations.}}
>* {{... but not on others? ...}}
>```

## Requirements

- Enable cardinal plural selection.
- Enable ordinal number selection.
- Enable exact match selection.
- Enable simultaneous "exact match" and either plural or ordinal selection.
  > For example, allow variants `[1]` and `[one]` in the same message.
- Selection must support relevant formatting options, such as `minimumFractionDigits`.
  > For example, in English the value `1` matches plural rule `one` while the value `1.0`
  > matches the plural rule `other` (`*`)
- Encourage developers to provide the formatting options used in patterns to the selector
  so that proper selection can be done.

## Constraints

ICU MF1 messages using `plural` and `selectordinal` should be representable in MF2.

## Proposed Design

### Number Selection

Number selection has three modes:
- `exact` selection matches the operand to explicit numeric keys exactly
- `plural` selection matches the operand to explicit numeric keys exactly
  or to plural rule categories if there is no explicit match
- `ordinal` selection matches the operand to explicit numeric keys exactly
  or to ordinal rule categories if there is no explicit match


### Functions

The following functions use numeric selection:

The function `:number` is the default selector for numeric values.

The function `:integer` provides a reduced set of options for selecting
and formatting numeric values as integers.

### Operands

The _operand_ of a number function is either an implementation-defined type or
a literal that matches the `number-literal` production in the [ABNF](/main/spec/message.abnf).
All other values produce a _Selection Error_ when evaluated for selection
or a _Formatting Error_ when attempting to format the value.

> For example, in Java, any subclass of `java.lang.Number` plus the primitive
> types (`byte`, `short`, `int`, `long`, `float`, `double`, etc.) 
> might be considered as the "implementation-defined numeric types".
> Implementations in other programming languages would define different types
> or classes according to their local needs.

> [!NOTE]
> String values passed as variables in the _formatting context_'s
> _input mapping_ can be formatted as numeric values as long as their
> contents match the `number-literal` production in the [ABNF](/main/spec/message.abnf).
>
> For example, if the value of the variable `num` were the string
> `-1234.567`, it would behave identically to the local
> variable in this example:
> ```
> .local $example = {|-1234.567| :number}
> {{{$num :number} == {$example}}}
> ```

> [!NOTE]
> Implementations are encouraged to provide support for compound types or data structures
> that provide additional semantic meaning to the formatting of number-like values.
> For example, in ICU4J, the type `com.ibm.icu.util.Measure` can be used to communicate
> a value that include a unit
> or the type `com.ibm.icu.util.CurrencyAmount` can be used to set the currency and related
> options (such as the number of fraction digits).


### Options

The following options and their values are required in the default registry to be available on the 
function `:number`:
- `select`
   -  `plural` (default)
   -  `ordinal`
   -  `exact`
- `compactDisplay` // this option only has meaning when combined with the option `notation=compact`
   - `short` (default)
   - `long`
- `notation`
   - `standard` (default)
   - `scientific`
   - `engineering`
   - `compact`
- `numberingSystem`
   - valid [Unicode Number System Identifier](https://cldr-smoke.unicode.org/spec/main/ldml/tr35.html#UnicodeNumberSystemIdentifier)
     (default is locale-specific)
- `signDisplay`
   -  `auto` (default)
   -  `always`
   -  `exceptZero`
   -  `negative`
   -  `never`
- `style`
  - `decimal` (default)
  - `percent` (see [Percent Style](#percent-style) below)
- `useGrouping`
  - `auto` (default)
  - `always`
  - `never`
  - `min2`
- `minimumIntegerDigits`
  - (non-negative integer, default: `1`)
  - 
> [!NOTE]
> The following options do not have default values because they are only to be used
> as overrides for an existing locale-and-value dependent implementation-defined
> default

- `minimumFractionDigits`
  - (non-negative integer)
- `maximumFractionDigits`
  - (non-negative integer)
- `minimumSignificantDigits`
  - (non-negative integer)
- `maximumSignificantDigits`
  - (non-negative integer)

The following options and their values are required in the default registry to be available on the 
function `:integer`:
- `select`
   -  `plural` (default)
   -  `ordinal`
   -  `exact`
- `numberingSystem`
   - valid [Unicode Number System Identifier](https://cldr-smoke.unicode.org/spec/main/ldml/tr35.html#UnicodeNumberSystemIdentifier)
     (default is locale-specific)
- `signDisplay`
   -  `auto` (default)
   -  `always`
   -  `exceptZero`
   -  `negative`
   -  `never`
- `style`
  - `decimal` (default)
  - `percent` (see [Percent Style](#percent-style) below)
- `useGrouping`
  - `auto` (default)
  - `true`
  - `false`
  - `min2`
  - `always`
- `minimumIntegerDigits`
  - (non-negative integer, default: `1`)

> [!NOTE]
> The following option does not have a default value because it is only to be used
> as an override for an existing locale-and-value dependent implementation-defined
> default

- `maximumSignificantDigits`
  - (non-negative integer)

> [!NOTE]
> The following options or option values are being developed during the Technical Preview
> period.

The following values for the option `style` are _not_ part of the default registry.
Implementations SHOULD avoid creating options that conflict with these, but
are encouraged to track development of these options during Tech Preview:
- `currency`
- `unit`

The following options are _not_ part of the default registry.
Implementations SHOULD avoid creating options that conflict with these, but
are encouraged to track development of these options during Tech Preview:
- `currency`
   - valid [Unicode Currency Identifier](https://cldr-smoke.unicode.org/spec/main/ldml/tr35.html#UnicodeCurrencyIdentifier)
     (no default)
- `currencyDisplay`
   - `symbol` (default)
   - `narrowSymbol`
   - `code`
   - `name`
- `currencySign`
  - `accounting`
  - `standard` (default)
- `unit`
   - (anything not empty)
- `unitDisplay`
   - `long`
   - `short` (default)
   - `narrow`

### Default Value of `select` Option

The value `plural` is default for the option `select` 
because it is the most common use case for numeric selection.
It can be used for exact value matches but also allows for the grammatical needs of other 
languages using CLDR's plural rules.
This might not be noticeable in the source language (particularly English), 
but can cause problems in target locales that the original developer is not considering.

> For example, a naive developer might use a special message for the value `1` without
> considering other locale's need for a `one` plural:
>
> ```
> .input {$var :integer}
> .match $var
> 1   {{You have one last chance}}
> one {{You have {$var} chance remaining}} // needed by languages such as Polish or Russian
>                                          // such locales typically require other keywords
>                                          // such as two, few, many, and so forth
> *   {{You have {$var} chances remaining}}
> ```


### Percent Style

When implementing `style=percent`, the numeric value of the operand
MUST be divided by 100 for the purposes of formatting.

> For example,
> ```
> .local $percent = {1000 :integer style=percent}
> {{This formats as '10%' in the en-US locale: {$percent}}}
> ```

### Selection

When implementing [`MatchSelectorKeys`](spec/formatting.md#resolve-preferences), 
numeric selectors perform as described below.

- Let `return_value` be a new empty list of strings.
- Let `operand` be the resolved value of the _operand_.
  If the `operand` is not a number type, emit a _Selection Error_
  and return `return_value`.
- Let `keys` be a list of strings containing keys to match.
  (Hint: this list is an argument to `MatchSelectorKeys`)
- For each string `key` in `keys`:
   - If the value of `key` matches the production `number-literal`:
     - If the parsed value of `key` is an [exact match](#determining-exact-literal-match)
       of the value of the `operand`, then `key` matches the selector.
       Add `key` to the front of the `return_value` list.
   - Else, if the value of `key` is a keyword:
      - Let `keyword` be a string which is the result of [rule selection](#rule-selection).
      - If `keyword` equals `key`, then `key` matches the selector.
        Append `key` to the end of the `return_value` list.
   - Else, `key` is invalid;
     emit a _Selection Error_.
     Do not add `key` to `return_value`
- Return `return_value`

### Plural/Ordinal Keywords
The _plural/ordinal keywords_ are: `zero`, `one`, `two`, `few`, `many`, and
`other`.

### Rule Selection

If the option `select` is set to `exact`, rule-based selection is not used.
Return the empty string.

> [!NOTE]
> Since keys cannot be the empty string in a numeric selector, returning the
> empty string disables keyword selection

If the option `select` is set to `plural`, selection should be based on CLDR plural rule data
of type `cardinal`. See [charts](https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html)
for examples.

If the option `select` is set to `ordinal`, selection should be based on CLDR plural rule data
of type `ordinal`. See [charts](https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html)
for examples.

Apply the rules defined by CLDR to the resolved value of the operand and the function options,
and return the resulting keyword.
If no rules match, return `other`.

> **Example.**
> In CLDR 44, the Czech (`cs`) plural rule set can be found
> [here](https://www.unicode.org/cldr/charts/44/supplemental/language_plural_rules.html#cs).
>
> A message in Czech might be:
> ```
> .match {$numDays :number}
> one  {{{$numDays} den}}
> few  {{{$numDays} dny}}
> many {{{$numDays} dne}}
> *    {{{$numDays} dní}}
> ```
> Using the rules found above, the results of various `operand` values might look like:
> | Operand value | Keyword | Formatted Message |
> |---|---|---|
> | 1 | `one` | 1 den |
> | 2 | `few` | 2 dny |
> | 5 | `other` | 5 dní |
> | 22 | `few` | 22 dny |
> | 27 | `other` | 27 dní |
> | 2.4 | `many` | 2,4 dne |



### Determining Exact Literal Match

> [!IMPORTANT]
> The exact behavior of exact literal match is only defined for non-zero-filled
> integer values.
> Annotations that use fraction digits or significant digits might work in specific
> implementation-defined ways.
> Users should avoid depending on these types of keys in message selection.


Number literals in the MessageFormat 2 syntax use the 
[format defined for a JSON number](https://www.rfc-editor.org/rfc/rfc8259#section-6).
The resolved value of an `operand` exactly matches a numeric literal `key`
if, when the `operand` is serialized using the format for a JSON number
the two strings are equal.

> [!NOTE]
> Implementations are not expected to implement this exactly as written,
> as there are clearly optimizations that can be applied.

> [!NOTE]
> Only integer matching is required in the Technical Preview.
> Feedback describing use cases for fractional and significant digits-based
> selection would be helpful.
Otherwise, users should avoid using matching with fractional numbers or significant digits.


## Alternatives Considered

### Completely Separate Functions

An alternative approach to this problem could be to leave the `:number` `<matchSignature>` undefined,
and to define three further functions, each with a `<matchSignature>`:

- `:plural`
- `:ordinal`
- `:exact` (actual name TBD, pending the resolution of [#433](https://github.com/unicode-org/message-format-wg/issues/433)

which would each need the same set of options as `:number`, except for `type`.

This approach would also mostly work, but it introduces new failure modes:

- If a `:number` is used directly as a selector, this should produce a runtime error.
- If a `:plural`/`:ordinal`/`:exact` is used as a formatter, this should produce a runtime error.
- Developers are less encouraged to use the same formatting and selection options.

To expand on the last of these,
consider this message:

```
.input {$count :number minimumFractionDigits=1}
.local $selector = {$count :plural}
.match $selector
0 {{You have no apples}}
1 {{You have exactly one apple}}
* {{You have {$count :number minimumFractionDigits=1} apples}}
```

Here, because selection on `:number` is not allowed,
it's easy to duplicate the options because _some_ annotation is required on the selector.
It would also be relatively easy to leave out the `minimumFractionDigits=1` option from the selector,
as it's not required for the English source.

With the proposed design, this message would much more naturally be written as:

```
.input {$count :number minimumFractionDigits=1}
.match $count
0.0 {{You have no apples}}
1.0 {{You have exactly one apple}}
one {{You have {$count} apple}}
* {{You have {$count} apples}}
```

#### Pros

- None?

#### Cons

- Naïve selection on `:number` will fail, leading to user confusion and annoyance.
- No encouragement to use the same options for selection and formatting.

### Do Not Standardize Number Selection

We could leave number selection undefined in the spec, making it an implementation concern.
Each implementation could/would then provide their own selectors,
and they _might_ converge on some overlap that users could safely use across platforms.

#### Pros

- The spec is a little bit lighter, as we've left out this part.

#### Cons

- No guarantees about interoperability for a relatively core feature.

## Alternatives Considered (`key` matching)

### Standardize the Serialization Forms

Using the design above, remove the integer-only and no-sig-digits restrictions from LDML45
and specify numeric matching by specifying the form of matching `key` values.
Comparison is as-if by string comparison of the serialized forms, just as in LDML45.

### Compare numeric values

This is the design proposed in #842.

This modifies the key-match algorithm to use implementation-defined numeric value exact match:

>   1. Let `exact` be the numeric value represented by `key`.
>      1. If `value` and `exact` are numerically equal, then

