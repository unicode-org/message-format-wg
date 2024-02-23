# WIP DRAFT MessageFormat 2.0 Registry

Implementations and tooling can greatly benefit from a
structured definition of formatting and matching functions available to messages at runtime.
This specification is intended to provide a mechanism for storing such declarations in a portable manner.

## Goals

_This section is non-normative._

The registry provides a machine-readable description of MessageFormat 2 extensions (custom functions),
in order to support the following goals and use-cases:

- Validate semantic properties of messages. For example:
  - Type-check values passed into functions.
  - Validate that matching functions are only called in selectors.
  - Validate that formatting functions are only called in placeholders.
  - Verify the exhaustiveness of variant keys given a selector.
- Support the localization roundtrip. For example:
  - Generate variant keys for a given locale during XLIFF extraction.
- Improve the authoring experience. For example:
  - Forbid edits to certain function options (e.g. currency options).
  - Autocomplete function and option names.
  - Display on-hover tooltips for function signatures with documentation.
  - Display/edit known message metadata.
  - Restrict input in GUI by providing a dropdown with all viable option values.

## Conformance and Use

_This section is normative._

To be conformant with MessageFormat 2.0, an implementation MUST implement
the _functions_, _options_ and _option_ values, _operands_ and outputs
described in the section [Default Registry](#default-registry) below.

Implementations MAY implement additional _functions_ or additional _options_.
In particular, implementations are encouraged to provide feedback on proposed
_options_ and their values.

> [!IMPORTANT]
> In the Tech Preview, the [registry data model](#registry-data-model) should
> be regarded as experimental.
> Changes to the format are expected during this period.
> Feedback on the registry's format and implementation is encouraged!

Implementations are not required to provide a machine-readable registry 
nor to read or interpret the registry data model in order to be conformant.

The MessageFormat 2.0 Registry was created to describe
the core set of formatting and selection _functions_,
including _operands_, _options_, and _option_ values.
This is the minimum set of functionality needed for conformance.
By using the same names and values, _messages_ can be used interchangeably
by different implementations,
regardless of programming language or runtime environment.
This ensures that developers do not have to relearn core MessageFormat syntax
and functionality when moving between platforms
and that translators do not need to know about the runtime environment for most
selection or formatting operations.

The registry provides a machine-readable description of _functions_
suitable for tools, such as those used in translation automation, so that
variant expansion and information about available _options_ and their effects
are available in the translation ecosystem.
To that end, implementations are strongly encouraged to provide appropriately
tailored versions of the registry for consumption by tools
(even if not included in software distributions)
and to encourage any add-on or plug-in functionality to provide
a registry to support localization tooling.

## Registry Data Model

_This section is non-normative._

> [!IMPORTANT]
> This part of the specification is not part of the Tech Preview.

The registry contains descriptions of function signatures.
[`registry.dtd`](./registry.dtd) describes its data model.

The main building block of the registry is the `<function>` element.
It represents an implementation of a custom function available to translation at runtime.
A function defines a human-readable `<description>` of its behavior
and one or more machine-readable _signatures_ of how to call it.
Named `<validationRule>` elements can optionally define regex validation rules for
literals, option values, and variant keys.

MessageFormat 2 functions can be invoked in two contexts:

- inside placeholders, to produce a part of the message's formatted output;
  for example, a raw value of `|1.5|` may be formatted to `1,5` in a language which uses commas as decimal separators,
- inside selectors, to contribute to selecting the appropriate variant among all given variants.

A single _function name_ may be used in both contexts,
regardless of whether it's implemented as one or multiple functions.

A _signature_ defines one particular set of at most one argument and any number of named options
that can be used together in a single call to the function.
`<formatSignature>` corresponds to a function call inside a placeholder inside translatable text.
`<matchSignature>` corresponds to a function call inside a selector.

A signature may define the positional argument of the function with the `<input>` element.
If the `<input>` element is not present, the function is defined as a nullary function.
A signature may also define one or more `<option>` elements representing _named options_ to the function.
An option can be omitted in a call to the function,
unless the `required` attribute is present.
They accept either a finite enumeration of values (the `values` attribute)
or validate their input with a regular expression (the `validationRule` attribute).
Read-only options (the `readonly` attribute) can be displayed to translators in CAT tools, but may not be edited.

As the `<input>` and `<option>` rules may be locale-dependent,
each signature can include an `<override locales="...">` that extends and overrides
the corresponding input and options rules.
If multiple `<override>` elements would match the current locale,
only the first one is used.

Matching-function signatures additionally include one or more `<match>` elements
to define the keys against which they can match when used as selectors.

Functions may also include `<alias>` definitions,
which provide shorthands for commonly used option baskets.
An _alias name_ may be used equivalently to a _function name_ in messages.
Its `<setOption>` values are always set, and may not be overridden in message annotations.

If a `<function>`, `<input>` or `<option>` includes multiple `<description>` elements,
each SHOULD have a different `xml:lang` attribute value.
This allows for the descriptions of these elements to be themselves localized
according to the preferred locale of the message authors and editors.

## Example

The following `registry.xml` is an example of a registry file
which may be provided by an implementation to describe its built-in functions.
For the sake of brevity, only `locales="en"` is considered.

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE registry SYSTEM "./registry.dtd">

<registry xml:lang="en">
    <function name="platform">
        <description>Match the current OS.</description>
        <matchSignature>
            <match values="windows linux macos android ios"/>
        </matchSignature>
    </function>

    <validationRule id="anyNumber" regex="-?[0-9]+(\.[0-9]+)"/>
    <validationRule id="positiveInteger" regex="[0-9]+"/>
    <validationRule id="currencyCode" regex="[A-Z]{3}"/>

    <function name="number">
        <description>
            Format a number.
            Match a **formatted** numerical value against CLDR plural categories or against a number literal.
        </description>

        <matchSignature>
            <input validationRule="anyNumber"/>
            <option name="type" values="cardinal ordinal"/>
            <option name="minimumIntegerDigits" validationRule="positiveInteger"/>
            <option name="minimumFractionDigits" validationRule="positiveInteger"/>
            <option name="maximumFractionDigits" validationRule="positiveInteger"/>
            <option name="minimumSignificantDigits" validationRule="positiveInteger"/>
            <option name="maximumSignificantDigits" validationRule="positiveInteger"/>
            <!-- Since this applies to both cardinal and ordinal, all plural options are valid. -->
            <match locales="en" values="one two few other" validationRule="anyNumber"/>
            <match values="zero one two few many other" validationRule="anyNumber"/>
        </matchSignature>

        <formatSignature>
            <input validationRule="anyNumber"/>
            <option name="minimumIntegerDigits" validationRule="positiveInteger"/>
            <option name="minimumFractionDigits" validationRule="positiveInteger"/>
            <option name="maximumFractionDigits" validationRule="positiveInteger"/>
            <option name="minimumSignificantDigits" validationRule="positiveInteger"/>
            <option name="maximumSignificantDigits" validationRule="positiveInteger"/>
            <option name="style" readonly="true" values="decimal currency percent unit" default="decimal"/>
            <option name="currency" readonly="true" validationRule="currencyCode"/>
        </formatSignature>

        <alias name="integer">
          <description>Locale-sensitive integral number formatting</description>
          <setOption name="maximumFractionDigits" value="0" />
          <setOption name="style" value="decimal" />
        </alias>
    </function>
</registry>
```

Given the above description, the `:number` function is defined to work both in a selector and a placeholder:

```
.match {$count :number}
1 {{One new message}}
* {{{$count :number} new messages}}
```

Furthermore,
`:number`'s `<matchSignature>` contains two `<match>` elements
which allow the validation of variant keys.
The element whose `locales` best matches the current locale
using resource item [lookup](https://unicode.org/reports/tr35/#Lookup) from LDML is used.
An element with no `locales` attribute is the default
(and is considered equivalent to the `root` locale).

- `<match locales="en" values="one two few other" .../>` can be used in locales like `en` and `en-GB`
  to validate the `when other` variant by verifying that the `other` key is present
  in the list of enumarated values: `one other`.
- `<match ... validationRule="anyNumber"/>` can be used to valide the `when 1` variant
  by testing the `1` key against the `anyNumber` regular expression defined in the registry file.

---

A localization engineer can then extend the registry by defining the following `customRegistry.xml` file.

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE registry SYSTEM "./registry.dtd">

<registry xml:lang="en">
    <function name="noun">
        <description>Handle the grammar of a noun.</description>
        <formatSignature>
            <override locales="en">
                <input/>
                <option name="article" values="definite indefinite"/>
                <option name="plural" values="one other"/>
                <option name="case" values="nominative genitive" default="nominative"/>
            </override>
        </formatSignature>
    </function>

    <function name="adjective">
        <description>Handle the grammar of an adjective.</description>
        <formatSignature>
            <override locales="en">
                <input/>
                <option name="article" values="definite indefinite"/>
                <option name="plural" values="one other"/>
                <option name="case" values="nominative genitive" default="nominative"/>
            </override>
        </formatSignature>
        <formatSignature>
            <override locales="en">
                <input/>
                <option name="article" values="definite indefinite"/>
                <option name="accord"/>
            </override>
        </formatSignature>
    </function>
</registry>
```

Messages can now use the `:noun` and the `:adjective` functions.
The following message references the first signature of `:adjective`,
which expects the `plural` and `case` options:

> ```
> You see {$color :adjective article=indefinite plural=one case=nominative} {$object :noun case=nominative}!
> ```

The following message references the second signature of `:adjective`,
which only expects the `accord` option:

>```
> .input {$object :noun case=nominative}
> {{You see {$color :adjective article=indefinite accord=$object} {$object}!}}
>```

# Default Registry

> [!IMPORTANT]
> This part of the specification is part of the Tech Preview
> and is **_NORMATIVE_**.

This section describes the functions which each implementation MUST provide
to be conformant with this specification.

## String Value Selection and Formatting

### The `:string` function

The function `:string` provides string selection and formatting.

#### Operands

The _operand_ of `:string` is either any implementation-defined type
that is a string or for which conversion to a string is supported,
or any _literal_ value.
All other values produce an _Invalid Expression_ error.

> For example, in Java, implementations of the `java.lang.CharSequence` interface
> (such as `java.lang.String` or `java.lang.StringBuilder`),
> the type `char`, or the class `java.lang.Character` might be considered
> as the "implementation-defined types".
> Such an implementation might also support other classes via the method `toString()`.
> This might be used to enable selection of a `enum` value by name, for example.
>
> Other programming languages would define string and character sequence types or
> classes according to their local needs, including, where appropriate,
> coercion to string.

#### Options

The function `:string` has no options.

> [!NOTE]
> Proposals for string transformation options or implementation
> experience with user requirements is desired during the Tech Preview.

#### Selection

When implementing [`MatchSelectorKeys(resolvedSelector, keys)`](/spec/formatting.md#resolve-preferences)
where `resolvedSelector` is the resolved value of a _selector_ _expression_
and `keys` is a list of strings,
the `:string` selector performs as described below.

1. Let `compare` be the string value of `resolvedSelector`.
1. Let `result` be a new empty list of strings.
1. For each string `key` in `keys`:
   1. If `key` and `compare` consist of the same sequence of Unicode code points, then
      1. Append `key` as the last element of the list `result`.
1. Return `result`.

> [!NOTE]
> Matching of `key` and `compare` values is sensitive to the sequence of code points
> in each string.
> As a result, variations in how text can be encoded can affect the performance of matching.
> The function `:string` does not perform case folding or Unicode Normalization of string values.
> Users SHOULD encode _messages_ and their parts (such as _keys_ and _operands_),
> in Unicode Normalization Form C (NFC) unless there is a very good reason
> not to.
> See also: [String Matching](https://www.w3.org/TR/charmod-norm)

> [!NOTE]
> Unquoted string literals in a _variant_ do not include spaces.
> If users wish to match strings that include whitespace
> (including U+3000 `IDEOGRAPHIC SPACE`)
> to a key, the `key` needs to be quoted.
>
> For example:
> ```
> .match {$string :string}
> | space key | {{Matches the string " space key "}}
> *             {{Matches the string "space key"}}
> ```

#### Formatting

The `:string` function returns the string value of the resolved value of the _operand_.

## Numeric Value Selection and Formatting

### The `:number` function

The function `:number` is a selector and formatter for numeric values.

#### Operands

The function `:number` requires a [Number Operand](#number-operands) as its _operand_.

#### Options

Some options do not have default values defined in this specification.
The defaults for these options are implementation-dependent.
In general, the default values for such options depend on the locale, 
the value of other options, or both.

The following options and their values are required to be available on the function `:number`:
- `select`
   -  `plural` (default; see [Default Value of `select` Option](#default-value-of-select-option) below)
   -  `ordinal`
   -  `exact`
- `compactDisplay` (this option only has meaning when combined with the option `notation=compact`)
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
- `minimumFractionDigits`
  - (non-negative integer)
- `maximumFractionDigits`
  - (non-negative integer)
- `minimumSignificantDigits`
  - (non-negative integer)
- `maximumSignificantDigits`
  - (non-negative integer)

> [!NOTE]
> The following options and option values are being developed during the Technical Preview
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

##### Default Value of `select` Option

The value `plural` is the default for the option `select` 
because it is the most common use case for numeric selection.
It can be used for exact value matches but also allows for the grammatical needs of 
languages using CLDR's plural rules.
This might not be noticeable in the source language (particularly English), 
but can cause problems in target locales that the original developer is not considering.

> For example, a naive developer might use a special message for the value `1` without
> considering a locale's need for a `one` plural:
> ```
> .match {$var :number}
> 1   {{You have one last chance}}
> one {{You have {$var} chance remaining}}
> *   {{You have {$var} chances remaining}}
> ```
>
> The `one` variant is needed by languages such as Polish or Russian.
> Such locales typically also require other keywords such as `two`, `few`, and `many`.

##### Percent Style
When implementing `style=percent`, the numeric value of the _operand_ 
MUST be multiplied by 100 for the purposes of formatting.

> For example,
> ```
> The total was {0.5 :number style=percent}.
> ```
> should format in a manner similar to:
> > The total was 50%.

#### Selection

The _function_ `:number` performs selection as described in [Number Selection](#number-selection) below.

### The `:integer` function

The function `:integer` is a selector and formatter for matching or formatting numeric 
values as integers.

#### Operands

The function `:integer` requires a [Number Operand](#number-operands) as its _operand_.


#### Options

Some options do not have default values defined in this specification.
The defaults for these options are implementation-dependent.
In general, the default values for such options depend on the locale, 
the value of other options, or both.

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
  - `always`
  - `min2`
- `minimumIntegerDigits`
  - (non-negative integer, default: `1`)
- `maximumSignificantDigits`
  - (non-negative integer)

> [!NOTE]
> The following options and option values are being developed during the Technical Preview
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

##### Default Value of `select` Option

The value `plural` is the default for the option `select` 
because it is the most common use case for numeric selection.
It can be used for exact value matches but also allows for the grammatical needs of 
languages using CLDR's plural rules.
This might not be noticeable in the source language (particularly English), 
but can cause problems in target locales that the original developer is not considering.

> For example, a naive developer might use a special message for the value `1` without
> considering a locale's need for a `one` plural:
> ```
> .match {$var :integer}
> 1   {{You have one last chance}}
> one {{You have {$var} chance remaining}}
> *   {{You have {$var} chances remaining}}
> ```
>
> The `one` variant is needed by languages such as Polish or Russian.
> Such locales typically also require other keywords such as `two`, `few`, and `many`.

##### Percent Style
When implementing `style=percent`, the numeric value of the _operand_ 
MUST be multiplied by 100 for the purposes of formatting.

> For example,
> ```
> The total was {0.5 :number style=percent}.
> ```
> should format in a manner similar to:
> > The total was 50%.

#### Selection

The _function_ `:integer` performs selection as described in [Number Selection](#number-selection) below.

### Number Operands

The _operand_ of a number function is either an implementation-defined type or
a literal whose contents match the `number-literal` production in the [ABNF](/spec/message.abnf).
All other values produce an _Invalid Expression_ error.

> For example, in Java, any subclass of `java.lang.Number` plus the primitive
> types (`byte`, `short`, `int`, `long`, `float`, `double`, etc.) 
> might be considered as the "implementation-defined numeric types".
> Implementations in other programming languages would define different types
> or classes according to their local needs.

> [!NOTE]
> String values passed as variables in the _formatting context_'s
> _input mapping_ can be formatted as numeric values as long as their
> contents match the `number-literal` production in the [ABNF](/spec/message.abnf).
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
> a value that includes a unit
> or the type `com.ibm.icu.util.CurrencyAmount` can be used to set the currency and related
> options (such as the number of fraction digits).



### Number Selection

Number selection has three modes:
- `exact` selection matches the operand to explicit numeric keys exactly
- `plural` selection matches the operand to explicit numeric keys exactly
  or to plural rule categories if there is no explicit match
- `ordinal` selection matches the operand to explicit numeric keys exactly
  or to ordinal rule categories if there is no explicit match

When implementing [`MatchSelectorKeys(resolvedSelector, keys)`](/spec/formatting.md#resolve-preferences)
where `resolvedSelector` is the resolved value of a _selector_ _expression_
and `keys` is a list of strings,
numeric selectors perform as described below.

1. Let `exact` be the JSON string representation of the numeric value of `resolvedSelector`.
   (See [Determining Exact Literal Match](#determining-exact-literal-match) for details)
1. Let `keyword` be a string which is the result of [rule selection](#rule-selection) on `resolvedSelector`.
1. Let `resultExact` be a new empty list of strings.
1. Let `resultKeyword` be a new empty list of strings.
1. For each string `key` in `keys`:
   1. If the value of `key` matches the production `number-literal`, then
      1. If `key` and `exact` consist of the same sequence of Unicode code points, then
         1. Append `key` as the last element of the list `resultExact`.
   1. Else if `key` is one of the keywords `zero`, `one`, `two`, `few`, `many`, or `other`, then
      1. If `key` and `keyword` consist of the same sequence of Unicode code points, then
         1. Append `key` as the last element of the list `resultKeyword`.
   1. Else, emit a _Selection Error_.
1. Return a new list whose elements are the concatenation of the elements (in order) of `resultExact` followed by the elements (in order) of `resultKeyword`.

> [!NOTE]
> Implementations are not required to implement this exactly as written.
> However, the observed behavior must be consistent with what is described here.

#### Rule Selection

If the option `select` is set to `exact`, rule-based selection is not used.
Return the empty string.

> [!NOTE]
> Since valid keys cannot be the empty string in a numeric expression, returning the
> empty string disables keyword selection.

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
> Using the rules found above, the results of various _operand_ values might look like:
> | Operand value | Keyword | Formatted Message |
> |---|---|---|
> | 1 | `one` | 1 den |
> | 2 | `few` | 2 dny |
> | 5 | `other` | 5 dní |
> | 22 | `few` | 22 dny |
> | 27 | `other` | 27 dní |
> | 2.4 | `many` | 2,4 dne |

#### Determining Exact Literal Match

> [!IMPORTANT]
> The exact behavior of exact literal match is only defined for non-zero-filled
> integer values.
> Annotations that use fraction digits or significant digits might work in specific
> implementation-defined ways.
> Users should avoid depending on these types of keys in message selection.


Number literals in the MessageFormat 2 syntax use the 
[format defined for a JSON number](https://www.rfc-editor.org/rfc/rfc8259#section-6).
A `resolvedSelector` exactly matches a numeric literal `key`
if, when the numeric value of `resolvedSelector` is serialized using the format for a JSON number,
the two strings are equal.

> [!NOTE]
> Only integer matching is required in the Technical Preview.
> Feedback describing use cases for fractional and significant digits-based
> selection would be helpful.
> Otherwise, users should avoid using matching with fractional numbers or significant digits.

## Date and Time Value Formatting

This subsection describes the functions and options for date/time formatting.
Selection based on date and time values is not required in this release.

> [!NOTE]
> Selection based on date/time types is not required by MF2.
> Implementations should use care when defining selectors based on date/time types.
> The types of queries found in implementations such as `java.time.TemporalAccessor`
> are complex and user expectations may be inconsistent with good I18N practices.

### The `:datetime` function

The function `:datetime` is used to format format date/time values, including 
the ability to compose user-specified combinations of fields.

If no options are specified, this function defaults to the following:
- `{$d :datetime}` is the same as `{$d :datetime dateStyle=short timeStyle=short}`

> [!NOTE]
> The default formatting behavior of `:datetime` is inconsistent with `Intl.DateTimeFormat`
> in JavaScript and with `{d,date}` in ICU MessageFormat 1.0.
> This is because, unlike those implementations, `:datetime` is distinct from `:date` and `:time`.

#### Operands

The _operand_ of the `:datetime` function is either 
an implementation-defined date/time type
or a _date/time literal value_, as defined in [Date and Time Operand](#date-and-time-operands).
All other _operand_ values produce an _Invalid Expression_ error.

#### Options

The `:datetime` function can use either the appropriate _style options_ 
or can use a collection of _field options_ (but not both) to control the formatted 
output.

If both are specified, an _Invalid Expression_ error MUST be emitted
and a _fallback value_ used as the resolved value of the _expression_.

##### Style Options

The function `:datetime` has these _style options_.
- `dateStyle`
  - `full`
  - `long`
  - `medium`
  - `short`
- `timeStyle`
  - `full`
  - `long`
  - `medium`
  - `short`

##### Field Options

_Field options_ describe which fields to include in the formatted output
and what format to use for that field.
The implementation may use this _annotation_ to configure which fields
appear in the formatted output.

> [!NOTE]
> _Field options_ do not have default values because they are only to be used
> to compose the formatter.

The _field options_ are defined as follows:

The function `:datetime` has the following options:
- `weekday`
  - `long`
  - `short`
  - `narrow`
- `era`
  - `long`
  - `short`
  - `narrow`
- `year`
  - `numeric`
  - `2-digit`
- `month`
  - `numeric`
  - `2-digit`
  - `long`
  - `short`
  - `narrow`
- `day`
  - `numeric`
  - `2-digit`
- `hour`
  - `numeric`
  - `2-digit`
- `minute`
  - `numeric`
  - `2-digit`
- `second`
  - `numeric`
  - `2-digit`
- `fractionalSecondDigits`
  - `1`
  - `2`
  - `3`
- `hourCycle` (default is locale-specific)
  - `h11`
  - `h12`
  - `h23`
  - `h24`
- `timeZoneName`
  - `long`
  - `short`
  - `shortOffset`
  - `longOffset`
  - `shortGeneric`
  - `longGeneric`

> [!NOTE]
> The following options do not have default values because they are only to be used
> as overrides for locale-and-value dependent implementation-defined defaults.

The following date/time options are **not** part of the default registry.
Implementations SHOULD avoid creating options that conflict with these, but
are encouraged to track development of these options during Tech Preview:
- `calendar` (default is locale-specific)
  - valid [Unicode Calendar Identifier](https://cldr-smoke.unicode.org/spec/main/ldml/tr35.html#UnicodeCalendarIdentifier)
- `numberingSystem` (default is locale-specific)
   - valid [Unicode Number System Identifier](https://cldr-smoke.unicode.org/spec/main/ldml/tr35.html#UnicodeNumberSystemIdentifier)
- `timeZone` (default is system default time zone or UTC)
  - valid identifier per [BCP175](https://www.rfc-editor.org/rfc/rfc6557)
 
### The `:date` function

The function `:date` is used to format format the date portion of date/time values.

If no options are specified, this function defaults to the following:
- `{$d :date}` is the same as `{$d :date style=short}`

#### Operands

The _operand_ of the `:date` function is either 
an implementation-defined date/time type
or a _date/time literal value_, as defined in [Date and Time Operand](#date-and-time-operands).
All other _operand_ values produce an _Invalid Expression_ error.

#### Options

The function `:time` has these _options_:
- `style`
  - `full`
  - `long`
  - `medium`
  - `short` (default)

### The `:time` function

The function `:time` is used to format format the time portion of date/time values.

If no options are specified, this function defaults to the following:
- `{$t :time}` is the same as `{$t :time style=short}`

#### Operands

The _operand_ of the `:time` function is either 
an implementation-defined date/time type
or a _date/time literal value_, as defined in [Date and Time Operand](#date-and-time-operands).
All other _operand_ values produce an _Invalid Expression_ error.

#### Options

The function `:time` has these _options_:
- `style`
  - `full`
  - `long`
  - `medium`
  - `short` (default)


### Date and Time Operands

The _operand_ of a date/time function is either 
an implementation-defined date/time type
or a _date/time literal value_, as defined below.
All other _operand_ values produce an _Invalid Expression_ error.

A **_<dfn>date/time literal value</dfn>_** is a non-empty string consisting of 
one of the following:
- an XMLSchema 1.1 [dateTime](https://www.w3.org/TR/xmlschema11-2/#dateTime)
- an XMLSchema 1.1 [time](https://www.w3.org/TR/xmlschema11-2/#time)
- an XMLSchema 1.1 [date](https://www.w3.org/TR/xmlschema11-2/#date)

The `timezoneOffset` of each of these formats is optional. 
When the offset is not present, implementations should use a floating time type
(such as Java's `java.time.LocalDateTime`) to represent the time value.
For more information, see [Working with Timezones](https://w3c.github.io/timezone).

> [!IMPORTANT]
> The [ABNF](/spec/message.abnf) and [syntax](/spec/syntax.md) of MF2
> do not formally define date/time literals. 
> This means that a _message_ can be syntactically valid but produce
> an _Operand Mismatch Error_ at runtime.

> [!NOTE]
> String values passed as variables in the _formatting context_'s
> _input mapping_ can be formatted as date/time values as long as their
> contents are date/time literals.
>
> For example, if the value of the variable `now` were the string
> `2024-02-06T16:40:00Z`, it would behave identically to the local
> variable in this example:
> ```
> .local $example = {|2024-02-06T16:40:00Z| :datetime}
> {{{$now :datetime} == {$example}}}
> ```

> [!NOTE]
> True time zone support in serializations is expected to coincide with the adoption
> of Temporal in JavaScript.
> The form of these serializations is known and is a de facto standard.
> Support for these extensions is expected to be required in the post-tech preview.
> See: https://datatracker.ietf.org/doc/draft-ietf-sedate-datetime-extended/


