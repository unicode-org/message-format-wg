### Numeric Value Selection and Formatting

#### The `:number` function

The function `:number` is a selector and formatter for numeric values.

##### Operands

The function `:number` requires a [Number Operand](#number-operands) as its _operand_.

##### Options

Some options do not have default values defined in this specification.
The defaults for these options are implementation-dependent.
In general, the default values for such options depend on the locale,
the value of other options, or both.

> [!NOTE]
> The names of _options_ and their _option values_ were derived from the
> [options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options)
> in JavaScript's `Intl.NumberFormat`.

The following _options_ are REQUIRED to be available on the function `:number`:

- `select` (see [Number Selection](#number-selection) below)
  - `plural` (default)
  - `ordinal`
  - `exact`
- `signDisplay`
  - `auto` (default)
  - `always`
  - `exceptZero`
  - `negative`
  - `never`
- `useGrouping`
  - `auto` (default)
  - `always`
  - `never`
  - `min2`
- `minimumIntegerDigits`
  - _digit size option_, default: `1`
- `minimumFractionDigits`
  - _digit size option_
- `maximumFractionDigits`
  - _digit size option_
- `minimumSignificantDigits`
  - _digit size option_
- `maximumSignificantDigits`
  - _digit size option_
- `trailingZeroDisplay`
  - `auto` (default)
  - `stripIfInteger`
- `roundingPriority`
  - `auto` (default)
  - `morePrecision`
  - `lessPrecision`
- `roundingIncrement`
  - 1 (default), 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, and 5000
- `roundingMode`
  - `ceil`
  - `floor`
  - `expand`
  - `trunc`
  - `halfCeil`
  - `halfFloor`
  - `halfExpand` (default)
  - `halfTrunc`
  - `halfEven`

If the _operand_ of the _expression_ is an implementation-defined type,
such as the _resolved value_ of an _expression_ with a `:number` or `:integer` _annotation_,
it can include option values.
These are included in the resolved option values of the _expression_,
with _options_ on the _expression_ taking priority over any options of the _operand_.

> For example, the _placeholder_ in this _message_:
>
> ```
> .input {$n :number minimumFractionDigits=2 signDisplay=always}
> {{{$n :number minimumFractionDigits=1}}}
> ```
>
> would be formatted with the resolved options
> `{ minimumFractionDigits: '1', signDisplay: 'always' }`.

##### Resolved Value

The _resolved value_ of an _expression_ with a `:number` _function_
contains an implementation-defined numerical value
of the _operand_ of the annotated _expression_,
together with the resolved options' values.

##### Selection

The _function_ `:number` performs selection as described in [Number Selection](#number-selection) below.

#### The `:integer` function

The function `:integer` is a selector and formatter for matching or formatting numeric
values as integers.

##### Operands

The function `:integer` requires a [Number Operand](#number-operands) as its _operand_.

##### Options

Some options do not have default values defined in this specification.
The defaults for these options are implementation-dependent.
In general, the default values for such options depend on the locale,
the value of other options, or both.

> [!NOTE]
> The names of _options_ and their _option values_ were derived from the
> [options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options)
> in JavaScript's `Intl.NumberFormat`.

The following _options_ are REQUIRED to be available on the function `:integer`:

- `select` (see [Number Selection](#number-selection) below)
  - `plural` (default)
  - `ordinal`
  - `exact`
- `signDisplay`
  - `auto` (default)
  - `always`
  - `exceptZero`
  - `negative`
  - `never`
- `useGrouping`
  - `auto` (default)
  - `always`
  - `never`
  - `min2`
- `minimumIntegerDigits`
  - _digit size option_, default: `1`
- `maximumSignificantDigits`
  - _digit size option_

If the _operand_ of the _expression_ is an implementation-defined type,
such as the _resolved value_ of an _expression_ with a `:number` or `:integer` _annotation_,
it can include option values.
In general, these are included in the resolved option values of the _expression_,
with _options_ on the _expression_ taking priority over any options of the _operand_.
Options with the following names are however discarded if included in the _operand_:

- `minimumFractionDigits`
- `maximumFractionDigits`
- `minimumSignificantDigits`

##### Resolved Value

The _resolved value_ of an _expression_ with an `:integer` _function_
contains the implementation-defined integer value
of the _operand_ of the annotated _expression_,
together with the resolved options' values.

##### Selection

The _function_ `:integer` performs selection as described in [Number Selection](#number-selection) below.

#### The `:offset` function

The _function_ `:offset` is a _selector_ and _formatter_ for matching or formatting
numeric values to which an offset has been applied.
The "offset" is a small integer adjustment of the _operand_'s value.

> This function is useful for selection and formatting of values that
> differ from the input value by a specified amount.
> For example, it can be used in a _message_ such as this:
>
> ```
> .input {$like_count :integer}
> .local $others_count = {$like_count :offset subtract=1}
> .match $like_count $others_count
> 0 *   {{Your post has no likes.}}
> 1 *   {{{$name} liked your post.}}
> * one {{{$name} and {$others_count} other user liked your post.}}
> * *   {{{$name} and {$others_count} other users liked your post.}}
> ```

> [!NOTE]
> The purpose of this _function_ is to supply compatibility with
> ICU's `PluralFormat` and its `offset` feature, also found in ICU MessageFormat.

##### `:offset` Operands

The function `:offset` requires a [Number Operand](#number-operands) as its _operand_.

##### `:offset` Options

The _options_ on `:offset` are exclusive with each other,
and exactly one _option_ is always required.
The _options_ do not have default values.

The following _options_ are REQUIRED to be available on the function `:offset`:

- `add`
  - _digit size option_
- `subtract`
  - _digit size option_

If no _options_ or more than one _option_ is set,
or if an _option value_ is not a _digit size option_,
a _Bad Option_ error is emitted
and a _fallback value_ used as the _resolved value_ of the _expression_.

##### `:offset` Resolved Value

The _resolved value_ of an _expression_ with a `:offset` _function_
contains the implementation-defined numeric value
of the _operand_ of the annotated _expression_.

If the `add` _option_ is set,
the numeric value of the _resolved value_ is formed by incrementing
the numeric value of the _operand_ by the integer value of the _digit size option_.

If the `subtract` _option_ is set,
the numeric value of the _resolved value_ is formed by decrementing
the numeric value of the _operand_ by the integer value of the _digit size option_.

If the _operand_ of the _expression_ is an implementation-defined numeric type,
such as the _resolved value_ of an _expression_ with a `:number` or `:integer` _annotation_,
it can include option values.
These are included in the resolved option values of the _expression_.
The `:offset` _options_ are not included in the resolved option values.

> [!NOTE]
> Implementations can encounter practical limits with `:offset` _expressions_,
> such as the result of adding two integers exceeding
> the storage or precision of some implementation-defined number type.
> In such cases, implementations can emit an _Unsupported Operation_ error
> or they might just silently overflow the underlying data value.

##### `:offset` Selection

The _function_ `:offset` performs selection as described in [Number Selection](#number-selection) below.

#### The `:currency` function

> [!IMPORTANT]
> The _function_ `:currency` has a status of **Draft**.
> It is proposed for inclusion in a future release of this specification and is not Stable.

The _function_ `:currency` is a _formatter_ for currency values,
which are a specialized form of numeric formatting.

##### Operands

The _operand_ of the `:currency` function can be one of any number of
implementation-defined types,
each of which contains a numerical `value` and a `currency`;
or it can be a [Number Operand](#number-operands), as long as the _option_
`currency` is provided.
The _option_ `currency` MUST NOT be used to override the currency of an implementation-defined type.
Using this _option_ in such a case results in a _Bad Option_ error.

The value of the _operand_'s `currency` MUST be either a string containing a
well-formed [Unicode Currency Identifier](https://unicode.org/reports/tr35/tr35.html#UnicodeCurrencyIdentifier)
or an implementation-defined currency type.
Currency codes are case-insensitive.
A well-formed Unicode Currency Identifier matches the production `currency_code` in this ABNF:

```abnf
currency_code = 3ALPHA
```

A [Number Operand](#number-operands) without a `currency` _option_ results in a _Bad Operand_ error.

> [!NOTE]
> For example, in ICU4J, the type `com.ibm.icu.util.CurrencyAmount` can be used
> to set the amount and currency.

> [!NOTE]
> The `currency` is only required to be well-formed rather than checked for validity.
> This allows new currency codes to be defined
> (there are many recent examples of this occuring).
> It also avoids requiring implementations to check currency codes for validity,
> although implementations are permitted to emit _Bad Option_ or _Bad Operand_ for invalid codes.

> [!NOTE]
> For runtime environments that do not provide a ready-made data structure,
> class, or type for currency values, the implementation ought to provide
> a data structure, convenience function, or documentation on how to encode
> the value and currency code for formatting.
> For example, such an implementation might define a "currency operand"
> to include a key-value structure with specific keys to be the
> local currency operand, which might look like the following:
>
> ```
> {
>    "value": 123.45,
>    "currency": "EUR"
> }
> ```

##### Options

Some options do not have default values defined in this specification.
The defaults for these options are implementation-dependent.
In general, the default values for such options depend on the locale,
the currency,
the value of other options, or all of these.

Fraction digits for currency values behave differently than for other numeric formatters.
The number of fraction digits displayed is usually set by the currency used.
For example, USD uses 2 fraction digits, while JPY uses none.
Setting some other number of `fractionDigits` allows greater precision display
(such as when performing currency conversions or other specialized operations)
or disabling fraction digits if set to `0`.

The _option_ `trailingZeroDisplay` has an _option value_ `stripIfInteger` that is useful
for displaying currencies with their fraction digits removed when the fraction
part of the _operand_ is zero.
This is sometimes used in _messages_ to make the displayed value omit the fraction part
automatically.

> For example, this _message_:
>
> ```
> The special price is {$price :currency trailingZeroDisplay=stripIfInteger}.
> ```
>
> When used with the value `5.00 USD` in the `en-US` locale displays as:
>
> ```
> The special price is $5.
> ```
>
> But like this when when value is `5.01 USD`:
>
> ```
> The special price is $5.01.
> ```

Implementations MAY internally alias _option values_ that they do not have data or a backing implementation for.
Notably, the `currencyDisplay` option has a rich set of values that mirrors developments in CLDR data.
Some implementations might not be able to produce all of these formats for every currency.

> [!NOTE]
> Except where noted otherwise, the names of _options_ and their _option values_ were derived from the
> [options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options)
> in JavaScript's `Intl.NumberFormat`.

The following _options_ are REQUIRED to be available on the function `:currency`:

- `currency`
  - well-formed [Unicode Currency Identifier](https://unicode.org/reports/tr35/tr35.html#UnicodeCurrencyIdentifier)
    (no default)
- `currencySign`
  - `accounting`
  - `standard` (default)
- `currencyDisplay`
  - `narrowSymbol`
  - `symbol` (default)
  - `name`
  - `code`
  - `never` (this is called `hidden` in ICU)
- `useGrouping`
  - `auto` (default)
  - `always`
  - `never`
  - `min2`
- `minimumIntegerDigits`
  - _digit size option_, default: `1`
- `fractionDigits` (unlike number/integer formats, the fraction digits for currency formatting are fixed)
  - `auto` (default) (the number of digits used by the currency)
  - _digit size option_
- `minimumSignificantDigits`
  - _digit size option_
- `maximumSignificantDigits`
  - _digit size option_
- `trailingZeroDisplay`
  - `auto` (default)
  - `stripIfInteger`
- `roundingPriority`
  - `auto` (default)
  - `morePrecision`
  - `lessPrecision`
- `roundingIncrement`
  - 1 (default), 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, and 5000
- `roundingMode`
  - `ceil`
  - `floor`
  - `expand`
  - `trunc`
  - `halfCeil`
  - `halfFloor`
  - `halfExpand` (default)
  - `halfTrunc`
  - `halfEven`

If the _operand_ of the _expression_ is an implementation-defined type,
such as the _resolved value_ of an _expression_ with a `:currency` _annotation_,
it can include option values.
These are included in the resolved option values of the _expression_,
with _options_ on the _expression_ taking priority over any options of the _operand_.

> For example, the _placeholder_ in this _message_:
>
> ```
> .input {$n :currency currency=USD trailingZeroDisplay=stripIfInteger}
> {{{$n :currency currencySign=accounting}}}
> ```
>
> would be formatted with the resolved options
> `{ currencySign: 'accounting', trailingZeroDisplay: 'stripIfInteger', currency: 'USD' }`.

##### Resolved Value

The _resolved value_ of an _expression_ with a `:currency` _function_
contains an implementation-defined currency value
of the _operand_ of the annotated _expression_,
together with the resolved options' values.

#### The `:percent` function

> [!IMPORTANT]
> The _function_ `:percent` has a status of **Draft**.
> It is proposed for inclusion in a future release of this specification and is not Stable.

The function `:percent` is a selector and formatter for percent values.

##### Operands

The function `:percent` requires a [Number Operand](#number-operands) as its _operand_.

When either selecting or formatting the _expression_,
the numeric value of the _operand_ is multiplied by 100.

##### Options

Some options do not have default values defined in this specification.
The defaults for these options are implementation-dependent.
In general, the default values for such options depend on the locale,
the value of other options, or both.

> [!NOTE]
> The names of _options_ and their _option values_ were derived from the
> [options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options)
> in JavaScript's `Intl.NumberFormat`.

The following _options_ are REQUIRED to be available on the function `:percent`:

- `signDisplay`
  - `auto` (default)
  - `always`
  - `exceptZero`
  - `negative`
  - `never`
- `useGrouping`
  - `auto` (default)
  - `always`
  - `never`
  - `min2`
- `minimumFractionDigits`
  - _digit size option_, default: `0`
- `maximumFractionDigits`
  - _digit size option_, default: `0`
- `minimumSignificantDigits`
  - _digit size option_
- `maximumSignificantDigits`
  - _digit size option_
- `trailingZeroDisplay`
  - `auto` (default)
  - `stripIfInteger`
- `roundingPriority`
  - `auto` (default)
  - `morePrecision`
  - `lessPrecision`
- `roundingMode`
  - `ceil`
  - `floor`
  - `expand`
  - `trunc`
  - `halfCeil`
  - `halfFloor`
  - `halfExpand` (default)
  - `halfTrunc`
  - `halfEven`

The numeric value of the _operand_ is multiplied by 100
at the start of formatting or selection.
Each _option_ is applied to the formatted (or selected) value
rather than the unaltered value of the _operand_.

> For example, this _placeholder_:
>
> ```
> {0.1234 :percent maximumFractionDigits=1}
> ```
>
> might be formatted as "12.3%" in an English locale.

If the _operand_ of the _expression_ is an implementation-defined type,
such as the _resolved value_ of an _expression_ with a `:number` or `:integer` _annotation_,
it can include option values.
In general, these are included in the resolved option values of the _expression_,
with _options_ on the _expression_ taking priority over any options of the _operand_.
Options with the following names are however discarded if included in the _operand_:

- `minimumIntegerDigits`
- `roundingIncrement`
- `select`

##### Resolved Value

The _resolved value_ of an _expression_ with a `:percent` _function_
contains an implementation-defined numerical value
of the _operand_ of the annotated _expression_
together with the resolved options' values.
The _resolved value_ is not altered by `:percent`,
that is, its numerical value is not multiplied by 100.

##### Selection

The _function_ `:percent` performs selection as described in [Number Selection](#number-selection) below.
This selection always uses the `plural` selection mode,
and is performed on the numerical value of the _operand_
multiplied by 100.

> For example, this _message_:
> ```
> .local $pct = {1 :percent}
> .match $pct
> 1   {{Would match with 0.01 as the operand}}
> 100 {{Matches 💯}}
> *   {{Otherwise}}
> ```
>
> would be formatted as "Matches 💯".

#### The `:unit` function

> [!IMPORTANT]
> The _function_ `:unit` has a status of **Draft**.
> It is proposed for inclusion in a future release of this specification and is not Stable.

The _function_ `:unit` is proposed to be a RECOMMENDED formatter for unitized values,
that is, for numeric values associated with a unit of measurement.
This is a specialized form of numeric formatting.

##### Operands

The _operand_ of the `:unit` function can be one of any number of
implementation-defined types,
each of which contains a numerical `value` plus a `unit`
or it can be a [Number Operand](#number-operands), as long as the _option_
`unit` is provided.

Valid values of the _operand_'s `unit` are either a string containing a
valid [Unit Identifier](https://www.unicode.org/reports/tr35/tr35-general.html#unit-identifiers)
or an implementation-defined unit type.

A [Number Operand](#number-operands) without a `unit` _option_ results in a _Bad Operand_ error.

> [!NOTE]
> For example, in ICU4J, the type `com.ibm.icu.util.Measure` might be used
> as an _operand_ for `:unit` because it contains the `value` and `unit`.

> [!NOTE]
> For runtime environments that do not provide a ready-made data structure,
> class, or type for unit values, the implementation ought to provide
> a data structure, convenience function, or documentation on how to encode
> the value and unit for formatting.
> For example, such an implementation might define a "unit operand"
> to include a key-value structure with specific keys to be the
> local unit operand, which might look like the following:
>
> ```
> {
>    "value": 123.45,
>    "unit": "kilometer-per-hour"
> }
> ```

##### Options

Some _options_ do not have default values defined in this specification.
The defaults for these _options_ are implementation-dependent.
In general, the default values for such _options_ depend on the locale,
the unit,
the value of other _options_, or all of these.

The following _options_ are REQUIRED to be available on the function `:unit`,
unless otherwise indicated:

- `unit`
  - valid [Unit Identifier](https://www.unicode.org/reports/tr35/tr35-general.html#unit-identifiers)
    (no default)
- `usage` \[RECOMMENDED\]
  - valid [Unicode Unit Preference](https://www.unicode.org/reports/tr35/tr35-info.html#unit-preferences)
    (no default, see [Unit Conversion](#unit-conversion) below)
- `unitDisplay`
  - `short` (default)
  - `narrow`
  - `long`
- `signDisplay`
  - `auto` (default)
  - `always`
  - `exceptZero`
  - `negative`
  - `never`
- `useGrouping`
  - `auto` (default)
  - `always`
  - `never`
  - `min2`
- `minimumIntegerDigits`
  - _digit size option_, default: `1`
- `minimumFractionDigits`
  - _digit size option_
- `maximumFractionDigits`
  - _digit size option_
- `minimumSignificantDigits`
  - _digit size option_
- `maximumSignificantDigits`
  - _digit size option_
- `roundingPriority`
  - `auto` (default)
  - `morePrecision`
  - `lessPrecision`
- `roundingIncrement`
  - 1 (default), 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, and 5000
- `roundingMode`
  - `ceil`
  - `floor`
  - `expand`
  - `trunc`
  - `halfCeil`
  - `halfFloor`
  - `halfExpand` (default)
  - `halfTrunc`
  - `halfEven`

If the _operand_ of the _expression_ is an implementation-defined type,
such as the _resolved value_ of an _expression_ with a `:unit` _annotation_,
it can include option values.
These are included in the resolved option values of the _expression_,
with _options_ on the _expression_ taking priority over any options of the _operand_.

> For example, the _placeholder_ in this _message_:
>
> ```
> .input {$n :unit unit=furlong minimumFractionDigits=2}
> {{{$n :unit minimumIntegerDigits=1}}}
> ```
>
> would have the resolved options:
> `{ unit: 'furlong', minimumFractionDigits: '2', minimumIntegerDigits: '1' }`.

##### Resolved Value

The _resolved value_ of an _expression_ with a `:unit` _function_
consist of an implementation-defined unit value
of the _operand_ of the annotated _expression_,
together with the resolved options and their resolved values.

##### Unit Conversion

Implementations MAY support conversion to the locale's preferred units via the `usage` _option_.
Implementing this _option_ is optional.
Not all `usage` _option values_ are compatible with a given unit.
Implementations SHOULD emit an _Unsupported Operation_ error if the requested conversion is not supported.

> For example, trying to convert a `length` unit (such as "meters")
> to a `volume` usage (which might be a unit akin to "liters" or "gallons", depending on the locale)
> could produce an _Unsupported Operation_ error.

Implementations MUST NOT substitute the unit without performing the associated conversion.

> For example, consider the value:
>
> ```
> {
>    "value": 123.5,
>    "unit": "meter"
> }
> ```
>
> The following _message_ might convert the formatted result to U.S. customary units
> in the `en-US` locale:
>
> ```
> You have {$v :unit usage=road maximumFractionDigits=0} to go.
> ```
>
> This can produce "You have 405 feet to go."

#### Number Operands

The _operand_ of a number function is either an implementation-defined type or
a _literal_ whose contents match the following `number-literal` production.
All other values produce a _Bad Operand_ error.

```abnf
number-literal = ["-"] (%x30 / (%x31-39 *DIGIT)) ["." 1*DIGIT] [%i"e" ["-" / "+"] 1*DIGIT]
```

> For example, in Java, any subclass of `java.lang.Number` plus the primitive
> types (`byte`, `short`, `int`, `long`, `float`, `double`, etc.)
> might be considered as the "implementation-defined numeric types".
> Implementations in other programming languages would define different types
> or classes according to their local needs.

> [!NOTE]
> String values passed as variables in the _formatting context_'s
> _input mapping_ can be formatted as numeric values as long as their
> contents match the `number-literal` production.
>
> For example, if the value of the variable `num` were the string
> `-1234.567`, it would behave identically to the local
> variable in this example:
>
> ```
> .local $example = {|-1234.567| :number}
> {{{$num :number} == {$example}}}
> ```

> [!NOTE]
> Implementations are encouraged to provide support for compound types or data structures
> that provide additional semantic meaning to the formatting of number-like values.
> For example, in ICU4J, the type `com.ibm.icu.util.Measure` can be used to communicate
> a value that includes a unit
> or the type `com.ibm.icu.util.CurrencyAmount` can be used to set the currency and related
> options (such as the number of fraction digits).

#### Digit Size Options

Some _options_ of number _functions_ are defined to take a _digit size option_.
The _function handlers_ for number _functions_ use these _options_ to control aspects of numeric display
such as the number of fraction, integer, or significant digits.

A **_<dfn>digit size option</dfn>_** is an _option_ 
whose _option value_ is interpreted by the _function_
as a small integer greater than or equal to zero.
Implementations MAY define upper and lower limits on the _resolved value_
of a _digit size option_ consistent with that implementation's practical limits.

In most cases, the value of a _digit size option_ will be a string that
encodes the value as a non-negative integer.
Implementations MAY also accept implementation-defined types as the _option value_.
When provided as a string, the representation of a _digit size option_ matches the following ABNF:

```abnf
digit-size-option = "0" / (("1"-"9") [DIGIT])
```

If the value of a _digit size option_ does not evaluate as a non-negative integer,
or if the value exceeds any implementation-defined and option-specific upper or lower limit,
the implementation will emit a _Bad Option Error_
and ignore the _option_.
An implementation MAY replace a _digit size option_
that exceeds an implementation-defined or option-specific upper or lower limit
with an implementation-defined value rather than ignoring the _option_.
Any such replacement value becomes the _resolved value_ of that _option_.

> For example, if an implementation imposed an upper limit of 20 on the _option_
> `minimumIntegerDigits` for the function `:number`
> then the _resolved value_ of the _option_ `minimumIntegerDigits`
> for both `$x` and `$y` in the following _message_ would be 20:
> ```
> .input {$x :number minimumIntegerDigits=999}
> .local $y = {$x}
> {{{$y}}}
> ```

#### Number Selection

The _option value_ of the `select` _option_ MUST be set by a _literal_.
Allowing a _variable_ _option value_ for `select` would produce a _message_ that
is impossible to translate because the set of _keys_ is tied to the _selector_ chosen.
If the _option value_ is a _variable_ or
if the `select` option is set by an implementation-defined type used as an _operand_,
a _Bad Option Error_ is emitted and
the _resolved value_ of the expression MUST NOT support selection.
The formatting of the _resolved value_ is not affected by the `select` _option_.

Number selection has three modes:

- `exact` selection matches the operand to explicit numeric keys exactly
- `plural` selection matches the operand to explicit numeric keys exactly
  followed by a plural rule category if there is no explicit match
- `ordinal` selection matches the operand to explicit numeric keys exactly
  followed by an ordinal rule category if there is no explicit match

When implementing [Match(`resolvedSelector`, `key`)](/spec/formatting.md#operations-on-resolved-values)
where `resolvedSelector` is the _resolved value_ of a _selector_
and `key` is a string,
numeric selectors perform as described below.

1. Let `exact` be the serialized representation of the numeric value of `resolvedSelector`.
   (See [Exact Literal Match Serialization](#exact-literal-match-serialization) for details)
1. Let `keyword` be a string which is the result of [rule selection](#rule-selection) on `resolvedSelector`.
1. If the value of `key` matches the production `number-literal`, then
      1. If `key` and `exact` consist of the same sequence of Unicode code points, then
         1. Return true.
      1. Return false.
1. If `key` is one of the keywords `zero`, `one`, `two`, `few`, `many`, or `other`, then
      1. If `key` and `keyword` consist of the same sequence of Unicode code points, then
         1. Return true.
      1. Return false.
1. Emit a _Bad Variant Key_ error.

When implementing [BetterThan(`resolvedSelector`, `key1`, `key2`)](/spec/formatting.md#operations-on-resolved-values)
where `resolvedSelector` is the _resolved value_ of a _selector_
and `key1` and `key2` are strings,
numeric selectors perform as described below.

1. Assert that Match(`resolvedSelector`, `key1`) is true.
1. Assert that Match(`resolvedSelector`, `key2`) is true.
1. If the value of `key1` matches the production `number-literal`, then
   1. If the value of `key2` does not match the production `number-literal`, then
      1. Return true.
1. Return false.

> [!NOTE]
> Implementations are not required to implement this exactly as written.
> However, the observed behavior must be consistent with what is described here.

##### Default Value of `select` Option

The _option value_ `plural` is the default for the _option_ `select`
because it is the most common use case for numeric selection.
It can be used for exact value matches but also allows for the grammatical needs of
languages using CLDR's plural rules.
This might not be noticeable in the source language (particularly English),
but can cause problems in target locales that the original developer is not considering.

> For example, a naive developer might use a special message for the value `1` without
> considering a locale's need for a `one` plural:
>
> ```
> .input {$var :number}
> .match $var
> 1   {{You have one last chance}}
> one {{You have {$var} chance remaining}}
> *   {{You have {$var} chances remaining}}
> ```
>
> The `one` variant is needed by languages such as Polish or Russian.
> Such locales typically also require other keywords such as `two`, `few`, and `many`.

##### Rule Selection

Rule selection is intended to support the grammatical matching needs of different
languages/locales in order to support plural or ordinal numeric values.

If the `select` _option value_ is `exact`, rule-based selection is not used.
Otherwise rule selection matches the _operand_, as modified by function _options_, to exactly one of these keywords:
`zero`, `one`, `two`, `few`, `many`, or `other`.
The keyword `other` is the default.

> [!NOTE]
> Since valid keys cannot be the empty string in a numeric expression, returning the
> empty string disables keyword selection.

The meaning of the keywords is locale-dependent and implementation-defined.
A _key_ that matches the rule-selected keyword is a stronger match than the fallback key `*`
but a weaker match than any exact match _key_ value.

The rules for a given locale might not produce all of the keywords.
A given _operand_ value might produce different keywords depending on the locale.

Apply the rules to the _resolved value_ of the _operand_ and the relevant function _options_,
and return the resulting keyword.
If no rules match, return `other`.

If the `select` _option value_ is `plural`, the rules applied to selection SHOULD be
the CLDR plural rule data of type `cardinal`.
See [charts](https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html)
for examples.

If the `select` _option value_ is `ordinal`, the rules applied to selection SHOULD be
the CLDR plural rule data of type `ordinal`.
See [charts](https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html)
for examples.

> **Example.**
> In CLDR 44, the Czech (`cs`) plural rule set can be found
> [here](https://www.unicode.org/cldr/charts/44/supplemental/language_plural_rules.html#cs).
>
> A message in Czech might be:
>
> ```
> .input {$numDays :number}
> .match $numDays
> one  {{{$numDays} den}}
> few  {{{$numDays} dny}}
> many {{{$numDays} dne}}
> *    {{{$numDays} dní}}
> ```
>
> Using the rules found above, the results of various _operand_ values might look like:
> | Operand value | Keyword | Formatted Message |
> |---|---|---|
> | 1 | `one` | 1 den |
> | 2 | `few` | 2 dny |
> | 5 | `other` | 5 dní |
> | 22 | `few` | 22 dny |
> | 27 | `other` | 27 dní |
> | 2.4 | `many` | 2,4 dne |

##### Exact Literal Match Serialization

If the numeric value of `resolvedSelector` is an integer
and none of the following options are set for `resolvedSelector`,
the serialized form of the numeric value MUST match the ABNF defined below for `integer`,
representing its decimal value:

- `minimumFractionDigits`
- `minimumIntegerDigits`
- `minimumSignificantDigits`
- `maximumSignificantDigits`

```abnf
integer = "0" / ["-"] ("1"-"9") *DIGIT
```

Otherwise, the serialized form of the numeric value is implementation-defined.

> [!IMPORTANT]
> The exact behavior of exact literal match is only well defined
> for integer values without leading zeros.
> Functions that use fraction digits or significant digits
> might work in specific implementation-defined ways.
> Users should avoid depending on these types of keys in message selection.
