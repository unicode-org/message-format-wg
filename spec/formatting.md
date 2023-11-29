# DRAFT MessageFormat 2.0 Formatting

## Introduction

This document defines the behaviour of a MessageFormat 2.0 implementation
when formatting a message for display in a user interface, or for some later processing.

To start, we presume that a _message_ has either been parsed from its syntax
or created from a data model description.
If this construction has encountered any Syntax or Data Model Errors,
their handling during formatting is specified here as well.

Formatting of a _message_ is defined by the following operations:

- **_Expression Resolution_** determines the value of an _expression_,
  with reference to the current _formatting context_.
  This can include multiple steps,
  such as looking up the value of a variable and calling formatting functions.
  The resolved value is not necessarily in the shape it will finally take,
  but is "formattable", i.e. it contains everything required by the eventual formatting.

  The resolution of _text_ is rather straighforward,
  and is detailed under _literal resolution_.

  > **Note**
  >
  > **This specification does not require either eager or lazy _expression resolution_ of _message_
  > parts; do not construe any requirement in this document as requiring either.**
  >
  > Implementations are not required to evaluate all parts of a _message_ when
  > parsing, processing, or formatting.
  > In particular, an implementation MAY choose not to evaluate or resolve the
  > value of a given _expression_ until it is actually used by a
  > selection or formatting process.
  > However, when an _expression_ is resolved, it MUST behave as if all preceding
  > _declarations_ and _selectors_ affecting _variables_ referenced by that _expression_
  > have already been evaluated in the order in which the relevant _declarations_
  > and _selectors_ appear in the _message_.

- **_Pattern Selection_** determines which of a message's _patterns_ is formatted.
  For a message with no _selectors_, this is simple as there is only one _pattern_.
  With _selectors_, this will depend on their resolution.
  
  At the start of _pattern selection_,
  if the _message_ contains any _reserved statements_,
  emit an Unsupported Statement Error.

- **_Formatting_** takes the resolved values of the selected _pattern_,
  and produces the formatted result for the _message_.
  Depending on the implementation, this result could be a single concatenated string,
  an array of objects, an attributed string, or some other locally appropriate data type.

Formatter implementations are not required to expose
the _expression resolution_ and _pattern selection_ operations to their users,
or even use them in their internal processing,
as long as the final _formatting_ result is made available to users
and the observable behavior of the formatter matches that described here.

## Formatting Context

A message's **_formatting context_** represents the data and procedures that are required
for the message's _expression resolution_, _pattern selection_ and _formatting_.

At a minimum, it includes:

- Information on the current **_locale_**,
  potentially including a fallback chain of locales.
  This will be passed on to formatting functions.

- Information on the base directionality of the message and its _text_ tokens.
  This will be used by strategies for bidirectional isolation,
  and can be used to set the base direction of the _message_ upon display.

- An **_<dfn>input mapping</dfn>_** of string identifiers to values,
  defining variable values that are available during _variable resolution_.
  This is often determined by a user-provided argument of a formatting function call.

- The _function registry_,
  providing the implementations of the functions referred to by message _functions_.

- Optionally, a fallback string to use for the message
  if it contains any Syntax or Data Model errors.

Implementations MAY include additional fields in their _formatting context_.

## Expression Resolution

_Expressions_ are used in _declarations_, _selectors_, and _patterns_.

In a _declaration_, the resolved value of the _expression_ is bound to a _variable_,
which is available for use by later _expressions_.
Since a _variable_ can be referenced in different ways later,
implementations SHOULD NOT immediately fully format the value for output.

In an _input-declaration_, the _variable_ operand of the _variable-expression_
identifies not only the name of the external input value,
but also the _variable_ to which the resolved value of the _variable-expression_ is bound.

In _selectors_, the resolved value of an _expression_ is used for _pattern selection_.

In a _pattern_, the resolved value of an _expression_ is used in its _formatting_.

The shapes of resolved values are implementation-dependent,
and different implementations MAY choose to perform different levels of resolution.

> For example, the resolved value of the _expression_ `{|0.40| :number style=percent}`
> could be an object such as
>
> ```
> { value: Number('0.40'),
>   formatter: NumberFormat(locale, { style: 'percent' }) }
> ```
>
> Alternatively, it could be an instance of an ICU4J `FormattedNumber`,
> or some other locally appropriate value.

Depending on the presence or absence of a _variable_ or _literal_ operand
and a _function_, _private-use annotation_, or _reserved annotation_,
the resolved value of the _expression_ is determined as follows:

If the _expression_ contains a _reserved annotation_,
an Unsupported Expression error is emitted and
a _fallback value_ is used as the resolved value of the _expression_.

Else, if the _expression_ contains a _private-use annotation_,
its resolved value is defined according to the implementation's specification.

Else, if the _expression_ contains an _annotation_,
its resolved value is defined by _function resolution_.

Else, the _expression_ will contain only either a _literal_ or a _variable_.

If the _expression_ consists of a _variable_,
its resolved value is defined by _variable resolution_.
An implementation MAY perform additional processing
when resolving the value of the _expression_.

> For example, it could apply _function resolution_ using a _function_
> and a set of _options_ chosen based on the value or type of the _variable_.
> So, given a _message_ like this:
>
> ```
> Today is {$date}
> ```
>
> If the value passed in the _variable_ were a date object,
> such as a JavaScript `Date` or a Java `java.util.Date` or `java.time.Temporal`,
> the implementation could interpret the _placeholder_ `{$date}` as if
> the pattern included the function `:datetime` with some set of default options.

Else, if the _expression_ consists of a _literal_,
its resolved value is defined by _literal resolution_.

> **Note**
> This means that a _literal_ value with no _annotation_
> is always treated as a string.
> To represent values that are not strings as a _literal_,
> an _annotation_ needs to be provided:
>
> ```
> .local $aNumber = {1234 :number}
> .local $aDate = {|2023-08-30| :datetime}
> .local $aFoo = {|some foo| :foo}
> {{You have {42 :number}}}
> ```

### Literal Resolution

The resolved value of a _text_ or a _literal_ is
the character sequence of the _text_ or _literal_
after any character escape has been converted to the escaped character.

When a _literal_ is used as an _operand_
or on the right-hand side of an _option_,
the formatting function MUST treat its resolved value the same
whether its value was originally _quoted_ or _unquoted_.

> For example,
> the _option_ `foo=42` and the _option_ `foo=|42|` are treated as identical.

The resolution of a _text_ or _literal_ MUST resolve to a string.

### Variable Resolution

To resolve the value of a _variable_,
its _name_ is used to identify either a local variable or an input variable.
If a _declaration_ exists for the _variable_, its resolved value is used.
Otherwise, the _variable_ is an implicit reference to an input value,
and its value is looked up from the _formatting context_ _input mapping_.

The resolution of a _variable_ MAY fail if no value is identified for its _name_.
If this happens, an Unresolved Variable error MUST be emitted.
If a _variable_ would resolve to a _fallback value_,
this MUST also be considered a failure.

### Function Resolution

To resolve an _expression_ with a _function_ _annotation_,
the following steps are taken:

1. If the _expression_ includes an _operand_, resolve its value.
   If this fails, use a _fallback value_ for the _expression_.
2. Resolve the _identifier_ of the _function_ and, based on the starting sigil,
   find the appropriate function implementation to call.
   If the implementation cannot find the function,
   or if the _identifier_ includes a _namespace_ that the implementation does not support,
   emit an Unknown Function error
   and use a _fallback value_ for the _expression_.

   Implementations are not required to implement _namespaces_ or installable
   _function registries_.

3. Resolve the _options_ to a mapping of string identifiers to values.
   If _options_ is missing, the mapping will be empty.
   For each _option_:
   - Resolve the _identifier_ of the _option_.
   - If the _option_'s _identifier_ already exists in the resolved mapping of _options_,
     emit a Duplicate Option Name error.
   - If the _option_'s right-hand side successfully resolves to a value,
     bind the _identifier_ of the _option_ to the resolved value in the mapping.
   - Otherwise, bind the _identifier_ of the _option_ to an unresolved value in the mapping.
     (Note that an Unresolved Variable error will have been emitted.)
4. Remove from the resolved mapping of _options_ any binding for which the value is an unresolved value.
5. Call the function implementation with the following arguments:

   - The current _locale_.
   - The resolved mapping of _options_.
   - If the _expression_ includes an _operand_, its resolved value.

   The shapes of the resolved _operand_ and _option_ values are implementation-defined.

   An implementation MAY pass additional arguments to the function,
   as long as reasonable precautions are taken to keep the function interface
   simple and minimal, and avoid introducing potential security vulnerabilities.

   An implementation MAY define its own functions.
   An implementation MAY allow custom functions to be defined by users.

   Function access to the _formatting context_ MUST be minimal and read-only,
   and execution time SHOULD be limited.
   
   Implementation-defined _functions_ SHOULD use an implementation-defined _namespace_.

5. If the call succeeds,
   resolve the value of the _expression_ as the result of that function call.
   If the call fails or does not return a valid value,
   emit a Resolution error and use a _fallback value_ for the _expression_.


### Fallback Resolution

A **_fallback value_** is the resolved value for an _expression_ that fails to resolve.

An _expression_ fails to resolve when:

- A _variable_ used as an _operand_ (with or without an _annotation_) fails to resolve.
  * Note that this does not include a _variable_ used as an _option_ value.
- A _function_ _annotation_ fails to resolve.
- A _private-use annotation_ is unsupported by the implementation or if
  a _private-use annotation_ fails to resolve.
- The _expression_ has a _reserved annotation_.

The _fallback value_ depends on the contents of the _expression_:

- _expression_ with _annotation_ and no _operand_:
  the _annotation_ starting sigil followed by its _identifier_

  > Examples:
  > In a context where `:func` fails to resolve, `{:func}` resolves to the _fallback value_ `:func`.
  > `{@reserved |...|}` always resolves to the _fallback value_ `@reserved`.

- _expression_ with _literal_ _operand_:
  U+007C VERTICAL LINE `|`
  followed by the value of the _literal_
  with escaping applied to U+005C REVERSE SOLIDUS `\` and U+007C VERTICAL LINE `|`,
  and then by U+007C VERTICAL LINE `|`.
  The same representation is used for both _quoted_ and _unquoted_ values.

  > Examples:
  > In a context where `:func` fails to resolve,
  > `{42 :func}` resolves to the _fallback value_ `|42|` and
  > `{|C:\\| :func}` resolves to the _fallback value_ `|C:\\|`.
  > `{|| @reserved}` always resolves to the _fallback value_ `||`.

- _expression_ with _variable_ _operand_ (with or without an _annotation_):
  - If the _variable_ fails to resolve, or resolves to a value that is not a _fallback value_:
    U+0024 DOLLAR SIGN `$` followed by the _name_ of the _variable_

    > Examples:
    > In a context where `$var` fails to resolve, `{$var}` and `{$var :number}` and `{$var @reserved}`
    > all resolve to the _fallback value_ `$var`.
    > In a context where `:func` fails to resolve, `.input $arg {{{$arg :func}}}` resolves to the _fallback value_ `$arg`.

  - If the _variable_ resolves to a _fallback value_: the _fallback value_ to which it resolves

    > In a context where `:now` fails to resolve but `:datetime` does not,
    > `.local $t = {:now format=iso8601} .local $pretty_t = {$t :datetime} {{{$pretty_t}}}` resolves to the _fallback value_ `:now`.

_Option_ _identifiers_ and values are not included in the _fallback value_.

_Pattern selection_ is not supported for _fallback values_.

## Pattern Selection

When a _message_ contains a _matcher_ with one or more _selectors_,
the implementation needs to determine which _variant_ will be used
to provide the _pattern_ for the formatting operation.
This is done by ordering and filtering the available _variant_ statements
according to their _key_ values and selecting the first one.

The number of _keys_ in each _variant_ MUST equal the number of _selectors_.

Each _key_ corresponds to a _selector_ by its position in the _variant_.

> For example, in this message:
>
> ```
> .match {:one} {:two} {:three}
> 1 2 3 {{ ... }}
> ```
>
> The first _key_ `1` corresponds to the first _selector_ (`{:one}`),
> the second _key_ `2` to the second _selector_ (`{:two}`),
> and the third _key_ `3` to the third _selector_ (`{:three}`).

To determine which _variant_ best matches a given set of inputs,
each _selector_ is used in turn to order and filter the list of _variants_.

Each _variant_ with a _key_ that does not match its corresponding _selector_
is omitted from the list of _variants_.
The remaining _variants_ are sorted according to the _selector_'s _key_-ordering preference.
Earlier _selectors_ in the _matcher_'s list of _selectors_ have a higher priority than later ones.

When all of the _selectors_ have been processed,
the earliest-sorted _variant_ in the remaining list of _variants_ is selected.

This selection method is defined in more detail below.
An implementation MAY use any pattern selection method,
as long as its observable behavior matches the results of the method defined here.

If the message being formatted has any Syntax or Data Model errors,
the result of pattern selection MUST be a pattern resolving to a single _fallback value_
using the message's fallback string defined in the _formatting context_
or if this is not available or empty, the U+FFFD REPLACEMENT CHARACTER `�`.

### Resolve Selectors

First, resolve the values of each _selector_:

1. Let `res` be a new empty list of resolved values that support selection.
1. For each _selector_ `sel`, in source order,
   1. Let `rv` be the resolved value of `sel`.
   1. If selection is supported for `rv`:
      1. Append `rv` as the last element of the list `res`.
   1. Else:
      1. Let `nomatch` be a resolved value for which selection always fails.
      1. Append `nomatch` as the last element of the list `res`.
      1. Emit a Selection Error.

The shape of the resolved values is determined by each implementation,
along with the manner of determining their support for selection.

### Resolve Preferences

Next, using `res`, resolve the preferential order for all message keys:

1. Let `pref` be a new empty list of lists of strings.
1. For each index `i` in `res`:
   1. Let `keys` be a new empty list of strings.
   1. For each _variant_ `var` of the message:
      1. Let `key` be the `var` key at position `i`.
      1. If `key` is not the catch-all key `'*'`:
         1. Assert that `key` is a _literal_.
         1. Let `ks` be the resolved value of `key`.
         1. Append `ks` as the last element of the list `keys`.
   1. Let `rv` be the resolved value at index `i` of `res`.
   1. Let `matches` be the result of calling the method MatchSelectorKeys(`rv`, `keys`)
   1. Append `matches` as the last element of the list `pref`.

The method MatchSelectorKeys is determined by the implementation.
It takes as arguments a resolved _selector_ value `rv` and a list of string keys `keys`,
and returns a list of string keys in preferential order.
The returned list MUST contain only unique elements of the input list `keys`.
The returned list MAY be empty.
The most-preferred key is first,
with each successive key appearing in order by decreasing preference.

### Filter Variants

Then, using the preferential key orders `pref`,
filter the list of _variants_ to the ones that match with some preference:

1. Let `vars` be a new empty list of _variants_.
1. For each _variant_ `var` of the message:
   1. For each index `i` in `pref`:
      1. Let `key` be the `var` key at position `i`.
      1. If `key` is the catch-all key `'*'`:
         1. Continue the inner loop on `pref`.
      1. Assert that `key` is a _literal_.
      1. Let `ks` be the resolved value of `key`.
      1. Let `matches` be the list of strings at index `i` of `pref`.
      1. If `matches` includes `ks`:
         1. Continue the inner loop on `pref`.
      1. Else:
         1. Continue the outer loop on message _variants_.
   1. Append `var` as the last element of the list `vars`.

### Sort Variants

Finally, sort the list of variants `vars` and select the _pattern_:

1. Let `sortable` be a new empty list of (integer, _variant_) tuples.
1. For each _variant_ `var` of `vars`:
   1. Let `tuple` be a new tuple (-1, `var`).
   1. Append `tuple` as the last element of the list `sortable`.
1. Let `len` be the integer count of items in `pref`.
1. Let `i` be `len` - 1.
1. While `i` >= 0:
   1. Let `matches` be the list of strings at index `i` of `pref`.
   1. Let `minpref` be the integer count of items in `matches`.
   1. For each tuple `tuple` of `sortable`:
      1. Let `matchpref` be an integer with the value `minpref`.
      1. Let `key` be the `tuple` _variant_ key at position `i`.
      1. If `key` is not the catch-all key `'*'`:
         1. Assert that `key` is a _literal_.
         1. Let `ks` be the resolved value of `key`.
         1. Let `matchpref` be the integer position of `ks` in `matches`.
      1. Set the `tuple` integer value as `matchpref`.
   1. Set `sortable` to be the result of calling the method `SortVariants(sortable)`.
   1. Set `i` to be `i` - 1.
1. Let `var` be the _variant_ element of the first element of `sortable`.
1. Select the _pattern_ of `var`.

`SortVariants` is a method whose single argument is
a list of (integer, _variant_) tuples.
It returns a list of (integer, _variant_) tuples.
Any implementation of `SortVariants` is acceptable
as long as it satisfies the following requirements:

1. Let `sortable` be an arbitrary list of (integer, _variant_) tuples.
1. Let `sorted` be `SortVariants(sortable)`.
1. `sorted` is the result of sorting `sortable` using the following comparator:
   1. `(i1, v1)` <= `(i2, v2)` if and only if `i1 <= i2`.
1. The sort is stable (pairs of tuples from `sortable` that are equal
   in their first element have the same relative order in `sorted`).

### Examples

_This section is non-normative._

#### Example 1

Presuming a minimal implementation which only supports `:string` annotation
which matches keys by using string comparison,
and a formatting context in which
the variable reference `$foo` resolves to the string `'foo'` and
the variable reference `$bar` resolves to the string `'bar'`,
pattern selection proceeds as follows for this message:

```
.match {$foo :string} {$bar :string}
bar bar {{All bar}}
foo foo {{All foo}}
* * {{Otherwise}}
```

1. For the first selector:<br>
   The value of the selector is resolved to be `'foo'`.<br>
   The available keys « `'bar'`, `'foo'` » are compared to `'foo'`,<br>
   resulting in a list « `'foo'` » of matching keys.

2. For the second selector:<br>
   The value of the selector is resolved to be `'bar'`.<br>
   The available keys « `'bar'`, `'foo'` » are compared to `'bar'`,<br>
   resulting in a list « `'bar'` » of matching keys.

3. Creating the list `vars` of variants matching all keys:<br>
   The first variant `bar bar` is discarded as its first key does not match the first selector.<br>
   The second variant `foo foo` is discarded as its second key does not match the second selector.<br>
   The catch-all keys of the third variant `* *` always match, and this is added to `vars`,<br>
   resulting in a list « `* *` » of variants.

4. As the list `vars` only has one entry, it does not need to be sorted.<br>
   The pattern `Otherwise` of the third variant is selected.

#### Example 2

Alternatively, with the same implementation and formatting context as in Example 1,
pattern selection would proceed as follows for this message:

```
.match {$foo :string} {$bar :string}
* bar {{Any and bar}}
foo * {{Foo and any}}
foo bar {{Foo and bar}}
* * {{Otherwise}}
```

1. For the first selector:<br>
   The value of the selector is resolved to be `'foo'`.<br>
   The available keys « `'foo'` » are compared to `'foo'`,<br>
   resulting in a list « `'foo'` » of matching keys.

2. For the second selector:<br>
   The value of the selector is resolved to be `'bar'`.<br>
   The available keys « `'bar'` » are compared to `'bar'`,<br>
   resulting in a list « `'bar'` » of matching keys.

3. Creating the list `vars` of variants matching all keys:<br>
   The keys of all variants either match each selector exactly, or via the catch-all key,<br>
   resulting in a list « `* bar`, `foo *`, `foo bar`, `* *` » of variants.

4. Sorting the variants:<br>
   The list `sortable` is first set with the variants in their source order
   and scores determined by the second selector:<br>
   « ( 0, `* bar` ), ( 1, `foo *` ), ( 0, `foo bar` ), ( 1, `* *` ) »<br>
   This is then sorted as:<br>
   « ( 0, `* bar` ), ( 0, `foo bar` ), ( 1, `foo *` ), ( 1, `* *` ) ».<br>
   To sort according to the first selector, the scores are updated to:<br>
   « ( 1, `* bar` ), ( 0, `foo bar` ), ( 0, `foo *` ), ( 1, `* *` ) ».<br>
   This is then sorted as:<br>
   « ( 0, `foo bar` ), ( 0, `foo *` ), ( 1, `* bar` ), ( 1, `* *` ) ».<br>

5. The pattern `Foo and bar` of the most preferred `foo bar` variant is selected.

#### Example 3

A more-complex example is the matching found in selection APIs
such as ICU's `PluralFormat`.
Suppose that this API is represented here by the function `:plural`.
This `:plural` function can match a given numeric value to a specific number _literal_
and **_also_** to a plural category (`zero`, `one`, `two`, `few`, `many`, `other`)
according to locale rules defined in CLDR.

Given a variable reference `$count` whose value resolves to the number `1`
and an `en` (English) locale,
the pattern selection proceeds as follows for this message:

```
.match {$count :plural}
one {{Category match}}
1   {{Exact match}}
*   {{Other match}}
```

1. For the selector:<br>
   The value of the selector is resolved to an implementation-defined value
   that is capable of performing English plural category selection on the value `1`.<br>
   The available keys « `'one'`, `'1'` » are passed to
   the implementation's MatchSelectorKeys method,<br>
   resulting in a list « `'1'`, `'one'` » of matching keys.

2. Creating the list `vars` of variants matching all keys:<br>
   The keys of all variants are included in the list of matching keys, or use the catch-all key,<br>
   resulting in a list « `one`, `1`, `*` » of variants.

3. Sorting the variants:<br>
   The list `sortable` is first set with the variants in their source order
   and scores determined by the selector key order:<br>
   « ( 1, `one` ), ( 0, `1` ), ( 2, `*` ) »<br>
   This is then sorted as:<br>
   « ( 0, `1` ), ( 1, `one` ), ( 2, `*` ) »<br>

4. The pattern `Exact match` of the most preferred `1` variant is selected.

## Formatting

After _pattern selection_,
each _text_ and _expression_ part of the selected _pattern_ is resolved and formatted.

_Formatting_ is a mostly implementation-defined process,
as it depends on the implementation's shape for resolved values
and the result type of the formatting.

Resolved values cannot always be formatted by a given implementation.
When such an error occurs during _formatting_,
an implementation SHOULD emit a _formatting error_ and produce a
_fallback value_ for the _placeholder_ that produced the error.
A formatting function MAY substitute a value to use instead of a _fallback value_.

Implementations MAY represent the result of _formatting_ using the most
appropriate data type or structure. Some examples of these include:

- A single string concatenated from the parts of the resolved _pattern_.
- A string with associated attributes for portions of its text.
- A flat sequence of objects corresponding to each resolved value.
- A hierarchical structure of objects that group spans of resolved values,
  such as sequences delimited by "open" and "close" _function_ _annotations_.

Implementations SHOULD provide _formatting_ result types that match user needs,
including situations that require further processing of formatted messages.
Implementations SHOULD encourage users to consider a formatted localised string
as an opaque data structure, suitable only for presentation.

### Examples

_This section is non-normative._

1. An implementation might choose to return an interstitial object
   so that the caller can "decorate" portions of the formatted value.
   In ICU4J, the `NumberFormatter` class returns a `FormattedNumber` object,
   so a _pattern_ such as `This is my number {42 :number}` might return
   the character sequence `This is my number `
   followed by a `FormattedNumber` object representing the value `42` in the current locale.

2. A formatter in a web browser could format a message as a DOM fragment
   rather than as a representation of its HTML source.

### Formatting Fallback Values

If the resolved _pattern_ includes any _fallback values_
and the formatting result is a concatenated string or a sequence of strings,
the string representation of each _fallback value_ MUST be the concatenation of
a U+007B LEFT CURLY BRACKET `{`,
the _fallback value_ as a string,
and a U+007D RIGHT CURLY BRACKET `}`.

> For example,
> a message with a Syntax Error and no fallback string
> defined in the _formatting context_ would format to a string as `{�}`.

### Handling Bidirectional Text

_Messages_ contain text which can be bidirectional,
consisting of a mixture of left-to-right and right-to-left spans of text.

When concatenating formatted values,
the [Unicode Bidirectional Algorithm](http://www.unicode.org/reports/tr9/) [UAX9]
can produce unexpected or undesirable effects, such as "spillover".
Formatted values SHOULD be bidirectionally isolated
so that the directionality of a formatted _expression_
does not negatively affect the presentation of the overall formatted result.

An implementation MUST define methods for
determining the directionality of each formatted _expression_.
The method of determining the directionality of a formatted _expression_
MAY rely on the introspection of its contents, or on other means.
The directionality of the message as a whole is provided by the _formatting context_.

If a formatted _expression_ itself contains spans with differing directionality,
its formatter SHOULD isolate such parts to avoid
negatively affecting the presentation of the overall formatted result.

> For example, an implementation could provide a `:number` formatting function
> which would always produce output matching the message's locale,
> allowing for its formatted string representation to never need isolation.

Implementations formatting messages as a concatenated string or a sequence of strings
MUST provide one or more strategies for bidirectional isolation.
One such strategy MUST behave as follows:

1. Let `msgdir` be the directionality of the whole message,
   one of « `'LTR'`, `'RTL'`, `'unknown'` ».
   These correspond to the message having left-to-right directionality,
   right-to-left directionality, and to the message's directionality not being known.
1. For each _expression_ `exp` in _pattern_:
   1. Let `fmt` be the formatted string representation of the resolved value of `exp`.
   1. Let `dir` be the directionality of `fmt`,
      one of « `'LTR'`, `'RTL'`, `'unknown'` », with the same meanings as for `msgdir`.
   1. If `dir` is `'unknown'`:
      1. In the formatted output,
         prefix `fmt` with U+2068 FIRST STRONG ISOLATE
         and postfix it with U+2069 POP DIRECTIONAL ISOLATE.
   1. Else, if `dir` is `'LTR'` and `msgdir` is not `'LTR'`:
      1. In the formatted output,
         prefix `fmt` with U+2066 LEFT-TO-RIGHT ISOLATE
         and postfix it with U+2069 POP DIRECTIONAL ISOLATE.
   1. Else, if `dir` is `'RTL'` and `msgdir` is not `'RTL'`:
      1. In the formatted output,
         prefix `fmt` with U+2067 RIGHT-TO-LEFT ISOLATE
         and postfix it with U+2069 POP DIRECTIONAL ISOLATE.

Alternatives to this "compatibility" strategy MAY be provided by implementations,
which MAY also introspect the _pattern_'s _text_ values
and identify situations where isolate characters are not needed
or where additional or different isolation would produce better results.

If an implementation provides formatting to non-string result types,
it SHOULD provide similar strategies for enabling bidirectional isolation,
where appropriate.

## Error Handling

Errors in messages and their formatting MAY occur and be detected
at multiple different stages of their processing.
Where available,
the use of validation tools is recommended,
as early detection of errors makes their correction easier.

During the formatting of a message,
various errors MAY be encountered.
These are divided into the following categories:

- **Syntax errors** occur when the syntax representation of a message is not well-formed.

  > Example invalid messages resulting in a Syntax error:
  >
  > ```
  > {{Missing end braces
  > ```
  >
  > ```
  > {{Missing one end brace}
  > ```
  >
  > ```
  > Unknown {{expression}}
  > ```
  >
  > ```
  > .local $var = {|no message body|}
  > ```

- **Data Model errors** occur when a message is invalid due to
  violating one of the semantic requirements on its structure:

  - **Variant Key Mismatch errors** occur when the number of keys on a _variant_
    does not equal the number of _selectors_.

    > Example invalid messages resulting in a Variant Key Mismatch error:
    >
    > ```
    > .match {$one :func}
    > 1 2 {{Too many}}
    > * {{Otherwise}}
    > ```
    >
    > ```
    > .match {$one :func} {$two :func}
    > 1 2 {{Two keys}}
    > * {{Missing a key}}
    > * * {{Otherwise}}
    > ```

  - **Missing Fallback Variant errors** occur when the message
    does not include a _variant_ with only catch-all keys.

    > Example invalid messages resulting in a Missing Fallback Variant error:
    >
    > ```
    > .match {$one :func}
    > 1 {{Value is one}}
    > 2 {{Value is two}}
    > ```
    >
    > ```
    > .match {$one :func} {$two :func}
    > 1 * {{First is one}}
    > * 1 {{Second is one}}
    > ```

  - A **_Missing Selector Annotation error_** is an error that occurs when the _message_
    contains a _selector_ that does not have an _annotation_,
    or contains a _variable_ that does not directly or indirectly reference a _declaration_ with an _annotation_.

    > Examples of invalid messages resulting in a _Missing Selector Annotation error_:
    >
    > ```
    > .match {$one}
    > 1 {{Value is one}}
    > * {{Value is not one}}
    > ```
    >
    > ```
    > .local $one = {|The one|}
    > .match {$one}
    > 1 {{Value is one}}
    > * {{Value is not one}}
    > ```
    >
    > ```
    > .input {$one}
    > .match {$one}
    > 1 {{Value is one}}
    > * {{Value is not one}}
    > ```

  - A **Duplicate Declaration error** occurs when a _variable_ appears in two _declarations_.
    This includes when an _input-declaration_ binds a _variable_ that appears in a previous _declaration_,
    when a _local-declaration_ binds a _variable_ that appears in a previous _declaration_,
    or when a _local-declaration_ refers to its bound _variable_ in its _expression_.

    > Examples of invalid messages resulting in a Duplicate Declaration error:
    >
    > ```
    > .input {$var :number maxFractionDigits=0}
    > .input {$var :number minFractionDigits=0}
    > {{Redeclaration of the same variable}}
    >
    > .local $var = {$ext :number maxFractionDigits=0}
    > .input {$var :number minFractionDigits=0}
    > {{Redeclaration of a local variable}}
    >
    > .input {$var :number minFractionDigits=0}
    > .local $var = {$ext :number maxFractionDigits=0}
    > {{Redeclaration of an input variable}}
    >
    > .local $var = {$ext :someFunction}
    > .local $var = {$error}
    > .local $var2 = {$var2 :error}
    > {{{$var} cannot be redefined. {$var2} cannot refer to itself}}
    > ```

  - A **Duplicate Option Name error** occurs when the same _identifier_
    appears on the left-hand side
    of more than one _option_ in the same _expression_.

    > Examples of invalid messages resulting in a Duplicate Option Name error:
    >
    > ```
    > Value is {42 :number style=percent style=decimal}
    > ```
    >
    > ```
    > .local $foo = {horse :func one=1 two=2 one=1}
    > {{This is {$foo}}}
    > ```

- **Resolution errors** occur when the runtime value of a part of a message
  cannot be determined.

  - **Unresolved Variable errors** occur when a variable reference cannot be resolved.

    > For example, attempting to format either of the following messages
    > would result in an Unresolved Variable error if done within a context that
    > does not provide for the variable reference `$var` to be successfully resolved:
    >
    > ```
    > The value is {$var}.
    > ```
    >
    > ```
    > .match {$var :func}
    > 1 {{The value is one.}}
    > * {{The value is not one.}}
    > ```

  - **Unknown Function errors** occur when an _expression_ includes
    a reference to a function which cannot be resolved.

    > For example, attempting to format either of the following messages
    > would result in an Unknown Function error if done within a context that
    > does not provide for the function `:func` to be successfully resolved:
    >
    > ```
    > The value is {horse :func}.
    > ```
    >
    > ```
    > .match {|horse| :func}
    > 1 {{The value is one.}}
    > * {{The value is not one.}}
    > ```

  - **Unsupported Expression errors** occur when an expression uses
    syntax reserved for future standardization,
    or for private implementation use that is not supported by the current implementation.

    > For example, attempting to format this message
    > would always result in an Unsupported Expression error:
    >
    > ```
    > The value is {@horse}.
    > ```
    >
    > Attempting to format this message would result in an Unsupported Expression error
    > if done within a context that does not support the `^` private use sigil:
    >
    > ```
    > .match {|horse| ^private}
    > 1 {{The value is one.}}
    > * {{The value is not one.}}
    > ```

  - **Unsupported Statement errors** occur when a message includes a _reserved statement_.

    > For example, attempting to format this message
    > would always result in an Unsupported Statement error:
    >
    > ```
    > .some {|horse|}
    > {{The message body}}
    > ```

- **Selection errors** occur when message selection fails.

  - **Selector errors** are failures in the matching of a key to a specific selector.

    > For example, attempting to format either of the following messages
    > might result in a Selector error if done within a context that
    > uses a `:plural` selector function which requires its input to be numeric:
    >
    > ```
    > .match {|horse| :plural}
    > 1 {{The value is one.}}
    > * {{The value is not one.}}
    > ```
    >
    > ```
    > .local $sel = {|horse| :plural}
    > .match {$sel}
    > 1 {{The value is one.}}
    > * {{The value is not one.}}
    > ```

- **Formatting errors** occur during the formatting of a resolved value,
  for example when encountering a value with an unsupported type
  or an internally inconsistent set of options.

  > For example, attempting to format any of the following messages
  > might result in a Formatting error if done within a context that
  >
  > 1. provides for the variable reference `$user` to resolve to
  >    an object `{ name: 'Kat', id: 1234 }`,
  > 2. provides for the variable reference `$field` to resolve to
  >    a string `'address'`, and
  > 3. uses a `:get` formatting function which requires its argument to be an object and
  >    an option `field` to be provided with a string value,
  >
  > ```
  > Hello, {horse :get field=name}!
  > ```
  >
  > ```
  > Hello, {$user :get}!
  > ```
  >
  > ```
  > .local $id = {$user :get field=id}
  > {{Hello, {$id :get field=name}!}}
  > ```
  >
  > ```
  > Your {$field} is {$id :get field=$field}
  > ```

Syntax and Data Model errors MUST be emitted as soon as possible.

During selection, an _expression_ handler MUST only emit Resolution and Selection errors.
During formatting, an _expression_ handler MUST only emit Resolution and Formatting errors.

Resolution and Formatting errors in _expressions_ that are not used
in _pattern selection_ or _formatting_ MAY be ignored,
as they do not affect the output of the formatter.

In all cases, when encountering an error,
a message formatter MUST provide some representation of the message.
An informative error or errors MUST also be separately provided.

When a message contains more than one error,
or contains some error which leads to further errors,
an implementation which does not emit all of the errors
SHOULD prioritise Syntax and Data Model errors over others.

When an error occurs in the resolution of an _option_,
the surrounding _expression_ MUST be processed as if the _option_ were not present.
This MAY allow the _expression_ to resolve to a value that is not a _fallback value_,
though an error MUST still be emitted.

When an error occurs within a _selector_,
the _selector_ MUST NOT match any _variant_ _key_ other than the catch-all `*`
and a Resolution or Selector error MUST be emitted.
