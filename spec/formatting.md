# DRAFT MessageFormat 2.0 Formatting

## Introduction

This document defines the behaviour of a MessageFormat 2.0 implementation
when formatting a message for display in a user interface, or for some later processing.

To start, we presume that a _message_ has either been parsed from its syntax
or created from a data model description.
If the resulting _message_ is not _well-formed_, a _Syntax Error_ is emitted.
If the resulting _message_ is _well-formed_ but is not _valid_, a _Data Model Error_ is emitted.

The formatting of a _message_ is defined by the following operations:

- **_<dfn>Pattern Selection</dfn>_** determines which of a message's _patterns_ is formatted.
  For a message with no _selectors_, this is simple as there is only one _pattern_.
  With _selectors_, this will depend on their resolution.

- **_<dfn>Formatting</dfn>_** takes the _resolved values_ of
  the _text_ and _placeholder_ parts of the selected _pattern_,
  and produces the formatted result for the _message_.
  Depending on the implementation, this result could be a single concatenated string,
  an array of objects, an attributed string, or some other locally appropriate data type.

- **_<dfn>Expression and Markup Resolution</dfn>_** determines the value of an _expression_ or _markup_,
  with reference to the current _formatting context_.
  This can include multiple steps,
  such as looking up the value of a variable and calling formatting functions.
  The form of the _resolved value_ is implementation defined and the
  value might not be evaluated or formatted yet.
  However, it needs to be "formattable", i.e. it contains everything required
  by the eventual formatting.

  The resolution of _text_ is rather straightforward,
  and is detailed under _literal resolution_.

Implementations are not required to expose
the _expression resolution_ and _pattern selection_ operations to their users,
or even use them in their internal processing,
as long as the final _formatting_ result is made available to users
and the observable behavior of the _formatting_ matches that described here.

_Attributes_ MUST NOT have any effect on the formatted output of a _message_,
nor be made available to _function handlers_.

> [!IMPORTANT]
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
> _declarations_ affecting _variables_ referenced by that _expression_
> have already been evaluated in the order in which the relevant _declarations_
> appear in the _message_.
>
> Users or implementations can provide functions that have observable side effects
> or whose results depend on external mutable state (for example, a function
> that returns the current time and date.)
> Lazy evaluation might involve evaluating the same _expression_ multiple times
> (call-by-name) or evaluating every expression at most once (call-by-need).
> In the presence of custom functions with side effects, this implementation
> choice affects the result of formatting a message.
> Functions that mutate external state are not recommended.

## Formatting Context

A message's **_<dfn>formatting context</dfn>_** represents the data and procedures that are required
for the message's _expression resolution_, _pattern selection_ and _formatting_.

At a minimum, it includes:

- Information on the current **_locale_**,
  potentially including a fallback chain of locales.
  This will be passed on to formatting functions.

- Information on the base directionality of the _message_ and its _text_ tokens.
  This will be used by strategies for bidirectional isolation,
  and can be used to set the base direction of the _message_ upon display.

- An **_<dfn>input mapping</dfn>_** of string identifiers to values,
  defining variable values that are available during _variable resolution_.
  This is often determined by a user-provided argument of a formatting function call.

- The _function registry_,
  providing the _function handlers_ of the functions referred to by message _functions_.

- Optionally, a fallback string to use for the message if it is not _valid_.

Implementations MAY include additional fields in their _formatting context_.

## Resolved Values

A **_<dfn>resolved value</dfn>_** is the result of resolving a _text_, _literal_, _variable_, _expression_, or _markup_.
The _resolved value_ is determined using the _formatting context_.
The form of the _resolved value_ is implementation-defined.

In a _declaration_, the _resolved value_ of an _expression_ is bound to a _variable_,
which makes it available for use in later _expressions_ and _markup_ _options_.

> For example, in
> ```
> .input {$a :number minimumFractionDigits=3}
> .local $b = {$a :integer notation=compact}
> .match $a
> 0 {{The value is zero.}}
> * {{In compact form, the value {$a} is rendered as {$b}.}}
> ```
> the _resolved value_ bound to `$a` is used as the _operand_
> of the `:integer` _function_ when resolving the value of the _variable_ `$b`,
> as a _selector_ in the `.match` statement,
> as well as for formatting the _placeholder_ `{$a}`.

In an _input-declaration_, the _variable_ operand of the _variable-expression_
identifies not only the name of the external input value,
but also the _variable_ to which the _resolved value_ of the _variable-expression_ is bound.

In a _pattern_, the _resolved value_ of an _expression_ or _markup_ is used in its _formatting_.

The form that _resolved values_ take is implementation-dependent,
and different implementations MAY choose to perform different levels of resolution.

> While this specification does not require it,
> a _resolved value_ could be implemented by requiring each _function handler_ to
> return a value matching the following interface:
>
> ```ts
> interface MessageValue {
>   formatToString(): string
>   formatToX(): X // where X is an implementation-defined type
>   getValue(): unknown
>   resolvedOptions(): { [key: string]: MessageValue }
>   selectKeys(keys: string[]): string[]
> }
> ```
>
> With this approach:
> - An _expression_ could be used as a _placeholder_ if
>   calling the `formatToString()` or `formatToX()` method of its _resolved value_
>   did not emit an error.
> - A _variable_ could be used as a _selector_ if
>   calling the `selectKeys(keys)` method of its _resolved value_
>   did not emit an error.
> - Using a _variable_, the _resolved value_ of an _expression_
>   could be used as an _operand_ or _option_ value if
>   calling the `getValue()` method of its _resolved value_ did not emit an error.
>   In this use case, the `resolvedOptions()` method could also
>   provide a set of option values that could be taken into account by the called function.
>
> Extensions of the base `MessageValue` interface could be provided for different data types,
> such as numbers or strings,
> for which the `unknown` return type of `getValue()` and
> the generic `MessageValue` type used in `resolvedOptions()`
> could be narrowed appropriately.
> An implementation could also allow `MessageValue` values to be passed in as input variables,
> or automatically wrap each variable as a `MessageValue` to provide a uniform interface
> for custom functions.

## Expression and Markup Resolution

_Expressions_ are used in _declarations_ and _patterns_.
_Markup_ is only used in _patterns_.

Depending on the presence or absence of a _variable_ or _literal_ operand and a _function_,
the _resolved value_ of the _expression_ is determined as follows:

If the _expression_ contains a _function_,
its _resolved value_ is defined by _function resolution_.

Else, if the _expression_ consists of a _variable_,
its _resolved value_ is defined by _variable resolution_.
An implementation MAY perform additional processing
when resolving the value of an _expression_
that consists only of a _variable_.

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

Else, the _expression_ consists of a _literal_.
Its _resolved value_ is defined by _literal resolution_.

> [!NOTE]
> This means that a _literal_ value with no _function_
> is always treated as a string.
> To represent values that are not strings as a _literal_,
> a _function_ needs to be provided:
>
> ```
> .local $aNumber = {1234 :number}
> .local $aDate = {|2023-08-30| :datetime}
> .local $aFoo = {|some foo| :foo}
> {{You have {42 :number}}}
> ```

### Literal Resolution

The _resolved value_ of a _text_ or a _literal_ contains
the character sequence of the _text_ or _literal_
after any character escape has been converted to the escaped character.

When a _literal_ is used as an _operand_
or on the right-hand side of an _option_,
the formatting function MUST treat its _resolved value_ the same
whether its value was originally a _quoted literal_ or an _unquoted literal_.

> For example,
> the _option_ `foo=42` and the _option_ `foo=|42|` are treated as identical.


> For example, in a JavaScript formatter
> the _resolved value_ of a _text_ or a _literal_ could have the following implementation:
>
> ```ts
> class MessageLiteral implements MessageValue {
>   constructor(value: string) {
>     this.formatToString = () => value;
>     this.getValue = () => value;
>   }
>   resolvedOptions: () => ({});
>   selectKeys(_keys: string[]) {
>     throw Error("Selection on unannotated literals is not supported");
>   }
> }
> ```

### Variable Resolution

To resolve the value of a _variable_,
its _name_ is used to identify either a local variable or an input variable.
If a _declaration_ exists for the _variable_, its _resolved value_ is used.
Otherwise, the _variable_ is an implicit reference to an input value,
and its value is looked up from the _formatting context_ _input mapping_.

The resolution of a _variable_ fails if no value is identified for its _name_.
If this happens, an _Unresolved Variable_ error is emitted.
If a _variable_ would resolve to a _fallback value_,
this MUST also be considered a failure.

### Function Resolution

To resolve an _expression_ with a _function_,
the following steps are taken:

1. If the _expression_ includes an _operand_, resolve its value.
   If this fails, use a _fallback value_ for the _expression_.
2. Resolve the _identifier_ of the _function_ and, based on the starting sigil,
   find the appropriate _function handler_ to call.
   If the implementation cannot find the _function handler_,
   or if the _identifier_ includes a _namespace_ that the implementation does not support,
   emit an _Unknown Function_ error
   and use a _fallback value_ for the _expression_.

   Implementations are not required to implement _namespaces_ or installable
   _function registries_.

3. Perform _option resolution_.

4. Call the _function handler_ with the following arguments:

   - The current _locale_.
   - The resolved mapping of _options_.
   - If the _expression_ includes an _operand_, its _resolved value_.

   The form that resolved _operand_ and _option_ values take is implementation-defined.

   An implementation MAY pass additional arguments to the _function handler_,
   as long as reasonable precautions are taken to keep the function interface
   simple and minimal, and avoid introducing potential security vulnerabilities.

5. If the call succeeds,
   resolve the value of the _expression_ as the result of that function call.

   If the call fails or does not return a valid value,
   emit the appropriate _Message Function Error_ for the failure.

   Implementations MAY provide a mechanism for the _function handler_ to provide
   additional detail about internal failures.
   Specifically, if the cause of the failure was that the datatype, value, or format of the
   _operand_ did not match that expected by the _function_,
   the _function_ SHOULD cause a _Bad Operand_ error to be emitted.
  
   In all failure cases, use the _fallback value_ for the _expression_ as its _resolved value_.

#### Function Handler

A **_<dfn>function handler</dfn>_** is an implementation-defined process
such as a function or method
which accepts a set of arguments and returns a _resolved value_.
A _function handler_ is required to resolve a _function_.

An implementation MAY define its own functions and their handlers.
An implementation MAY allow custom functions to be defined by users.

Implementations that provide a means for defining custom functions
MUST provide a means for _function handlers_
to return _resolved values_ that contain enough information
to be used as _operands_ or _option_ values in subsequent _expressions_.

The _resolved value_ returned by a _function handler_
MAY be different from the value of the _operand_ of the _function_.
It MAY be an implementation specified type.
It is not required to be the same type as the _operand_.

A _function handler_ MAY include resolved options in its _resolved value_.
The resolved options MAY be different from the _options_ of the function.

A _function handler_ SHOULD emit a
_Bad Operand_ error for _operands_ whose _resolved value_
or type is not supported.

_Function handler_ access to the _formatting context_ MUST be minimal and read-only,
and execution time SHOULD be limited.

Implementation-defined _functions_ SHOULD use an implementation-defined _namespace_.

#### Option Resolution

The result of resolving _option_ values is an unordered mapping of string identifiers to values.

For each _option_:

- Resolve the _identifier_ of the _option_.
- If the _option_'s right-hand side successfully resolves to a value,
   bind the _identifier_ of the _option_ to the _resolved value_ in the mapping.
- Otherwise, bind the _identifier_ of the _option_ to an unresolved value in the mapping.
   Implementations MAY later remove this value before calling the _function_.
   (Note that an _Unresolved Variable_ error will have been emitted.)

Errors MAY be emitted during _option resolution_,
but it always resolves to some mapping of string identifiers to values.
This mapping can be empty.

### Markup Resolution

Unlike _functions_, the resolution of _markup_ is not customizable.

The _resolved value_ of _markup_ includes the following fields:

- The type of the markup: open, standalone, or close
- The _identifier_ of the _markup_
- The resolved _options_ values after _option resolution_.

The resolution of _markup_ MUST always succeed.

### Fallback Resolution

A **_<dfn>fallback value</dfn>_** is the _resolved value_ for an _expression_ that fails to resolve.

An _expression_ fails to resolve when:

- A _variable_ used as an _operand_ (with or without a _function_) fails to resolve.
  * Note that this does not include a _variable_ used as an _option_ value.
- A _function_ fails to resolve.

The _fallback value_ depends on the contents of the _expression_:

- _expression_ with a _literal_ _operand_ (either quoted or unquoted)
  U+007C VERTICAL LINE `|`
  followed by the value of the _literal_
  with escaping applied to U+005C REVERSE SOLIDUS `\` and U+007C VERTICAL LINE `|`,
  and then by U+007C VERTICAL LINE `|`.

  > Examples:
  > In a context where `:func` fails to resolve,
  > `{42 :func}` resolves to the _fallback value_ `|42|` and
  > `{|C:\\| :func}` resolves to the _fallback value_ `|C:\\|`.

- _expression_ with _variable_ _operand_ referring to a local _declaration_ (with or without a _function_):
  the _value_ to which it resolves (which may already be a _fallback value_)

  > Examples:
  > In a context where `:func` fails to resolve,
  > the _pattern_'s _expression_ in `.local $var={|val|} {{{$var :func}}}`
  > resolves to the _fallback value_ `|val|` and the message formats to `{|val|}`.
  > In a context where `:now` fails to resolve but `:datetime` does not,
  > the _pattern_'s _expression_ in
  > ```
  > .local $t = {:now format=iso8601}
  > .local $pretty_t = {$t :datetime}
  > {{{$pretty_t}}}
  > ```
  > (transitively) resolves to the _fallback value_ `:now` and
  > the message formats to `{:now}`.

- _expression_ with _variable_ _operand_ not referring to a local _declaration_ (with or without a _function_):
  U+0024 DOLLAR SIGN `$` followed by the _name_ of the _variable_

  > Examples:
  > In a context where `$var` fails to resolve, `{$var}` and `{$var :number}`
  > both resolve to the _fallback value_ `$var`.
  > In a context where `:func` fails to resolve,
  > the _pattern_'s _expression_ in `.input $arg {{{$arg :func}}}`
  > resolves to the _fallback value_ `$arg` and
  > the message formats to `{$arg}`.

- _function_ _expression_ with no _operand_:
  U+003A COLON `:` followed by the _function_ _identifier_

  > Examples:
  > In a context where `:func` fails to resolve, `{:func}` resolves to the _fallback value_ `:func`.
  > In a context where `:ns:func` fails to resolve, `{:ns:func}` resolves to the _fallback value_ `:ns:func`.

- Otherwise: the U+FFFD REPLACEMENT CHARACTER `�`

  This is not currently used by any expression, but may apply in future revisions.

_Option_ _identifiers_ and values are not included in the _fallback value_.

_Pattern selection_ is not supported for _fallback values_.

> For example, in a JavaScript formatter
> the _fallback value_ could have the following implementation,
> where `source` is one of the above-defined strings:
>
> ```ts
> class MessageFallback implements MessageValue {
>   constructor(source: string) {
>     this.formatToString = () => `{${source}}`;
>     this.getValue = () => undefined;
>   }
>   resolvedOptions: () => ({});
>   selectKeys(_keys: string[]) {
>     throw Error("Selection on fallback values is not supported");
>   }
> }
> ```

## Pattern Selection

If the _message_ being formatted is not _well-formed_ and _valid_,
the result of pattern selection is a _pattern_ consisting of a single _fallback value_
using the _message_'s fallback string defined in the _formatting context_
or if this is not available or empty, the U+FFFD REPLACEMENT CHARACTER `�`.

If the _message_ being formatted does not contain a _matcher_,
the result of pattern selection is its _pattern_ value.

When a _message_ contains a _matcher_ with one or more _selectors_,
the implementation needs to determine which _variant_ will be used
to provide the _pattern_ for the formatting operation.
This is done by ordering and filtering the available _variant_ statements
according to their _key_ values and selecting the first one.

> [!NOTE]
> At least one _variant_ is required to have all of its _keys_ consist of
> the fallback value `*`.
> Some _selectors_ might be implemented in a way that the key value `*`
> cannot be selected in a _valid_ _message_.
> In other cases, this key value might be unreachable only in certain locales.
> This could result in the need in some locales to create
> one or more _variants_ that do not make sense grammatically for that language.
> > For example, in the `pl` (Polish) locale, this _message_ cannot reach
> > the `*` _variant_:
> > ```
> > .input {$num :integer}
> > .match $num
> > 0    {{ }}
> > one  {{ }}
> > few  {{ }}
> > many {{ }}
> > *    {{Only used by fractions in Polish.}}
> > ```
>
> In the Tech Preview, feedback from users and implementers is desired about
> whether to relax the requirement that such a "fallback _variant_" appear in
> every message, versus the potential for a _message_ to fail at runtime
> because no matching _variant_ is available.

The number of _keys_ in each _variant_ MUST equal the number of _selectors_.

Each _key_ corresponds to a _selector_ by its position in the _variant_.

> For example, in this message:
>
> ```
> .input {$one :number}
> .input {$two :number}
> .input {$three :number}
> .match $one $two $three
> 1 2 3 {{ ... }}
> ```
>
> The first _key_ `1` corresponds to the first _selector_ (`$one`),
> the second _key_ `2` to the second _selector_ (`$two`),
> and the third _key_ `3` to the third _selector_ (`$three`).

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

### Resolve Selectors

First, resolve the values of each _selector_:

1. Let `res` be a new empty list of _resolved values_ that support selection.
1. For each _selector_ `sel`, in source order,
   1. Let `rv` be the _resolved value_ of `sel`.
   1. If selection is supported for `rv`:
      1. Append `rv` as the last element of the list `res`.
   1. Else:
      1. Let `nomatch` be a _resolved value_ for which selection always fails.
      1. Append `nomatch` as the last element of the list `res`.
      1. Emit a _Bad Selector_ error.

The form of the _resolved values_ is determined by each implementation,
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
         1. Let `ks` be the _resolved value_ of `key` in Unicode Normalization Form C.
         1. Append `ks` as the last element of the list `keys`.
   1. Let `rv` be the _resolved value_ at index `i` of `res`.
   1. Let `matches` be the result of calling the method MatchSelectorKeys(`rv`, `keys`)
   1. Append `matches` as the last element of the list `pref`.

The method MatchSelectorKeys is determined by the implementation.
It takes as arguments a resolved _selector_ value `rv` and a list of string keys `keys`,
and returns a list of string keys in preferential order.
The returned list MUST contain only unique elements of the input list `keys`.
The returned list MAY be empty.
The most-preferred key is first,
with each successive key appearing in order by decreasing preference.

The resolved value of each _key_ MUST be in Unicode Normalization Form C ("NFC"),
even if the _literal_ for the _key_ is not.

If calling MatchSelectorKeys encounters any error,
a _Bad Selector_ error is emitted
and an empty list is returned.

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
      1. Let `ks` be the _resolved value_ of `key`.
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
         1. Let `ks` be the _resolved value_ of `key`.
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

Presuming a minimal implementation which only supports `:string` _function_
which matches keys by using string comparison,
and a formatting context in which
the variable reference `$foo` resolves to the string `'foo'` and
the variable reference `$bar` resolves to the string `'bar'`,
pattern selection proceeds as follows for this message:

```
.input {$foo :string}
.input {$bar :string}
.match $foo $bar
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
.input {$foo :string}
.input {$bar :string}
.match $foo $bar
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
Suppose that this API is represented here by the function `:number`.
This `:number` function can match a given numeric value to a specific number _literal_
and **_also_** to a plural category (`zero`, `one`, `two`, `few`, `many`, `other`)
according to locale rules defined in CLDR.

Given a variable reference `$count` whose value resolves to the number `1`
and an `en` (English) locale,
the pattern selection proceeds as follows for this message:

```
.input {$count :number}
.match $count
one {{Category match for {$count}}}
1   {{Exact match for {$count}}}
*   {{Other match for {$count}}}
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

4. The pattern `Exact match for {$count}` of the most preferred `1` variant is selected.

## Formatting

After _pattern selection_,
each _text_ and _placeholder_ part of the selected _pattern_ is resolved and formatted.

_Resolved values_ cannot always be formatted by a given implementation.
When such an error occurs during _formatting_,
an appropriate _Message Function Error_ is emitted and
a _fallback value_ is used for the _placeholder_ with the error.

Implementations MAY represent the result of _formatting_ using the most
appropriate data type or structure. Some examples of these include:

- A single string concatenated from the parts of the resolved _pattern_.
- A string with associated attributes for portions of its text.
- A flat sequence of objects corresponding to each _resolved value_.
- A hierarchical structure of objects that group spans of _resolved values_,
  such as sequences delimited by _markup-open_ and _markup-close_ _placeholders_.

Implementations SHOULD provide _formatting_ result types that match user needs,
including situations that require further processing of formatted messages.
Implementations SHOULD encourage users to consider a formatted localised string
as an opaque data structure, suitable only for presentation.

When formatting to a string, the default representation of all _markup_
MUST be an empty string.
Implementations MAY offer functionality for customizing this,
such as by emitting XML-ish tags for each _markup_.

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
> a _message_ that is not _well-formed_ would format to a string as `{�}`,
> unless a fallback string is defined in the _formatting context_,
> in which case that string would be used instead.

### Handling Bidirectional Text

_Messages_ contain text. Any text can be 
[bidirectional text](https://www.w3.org/TR/i18n-glossary/#dfn-bidirectional-text).
That is, the text can can consist of a mixture of left-to-right and right-to-left spans of text.
The display of bidirectional text is defined by the
[Unicode Bidirectional Algorithm](http://www.unicode.org/reports/tr9/) [UAX9].

The directionality of the formatted _message_ as a whole is provided by the _formatting context_.

> [!NOTE]
> Keep in mind the difference between the formatted output of a _message_,
> which is the topic of this section,
> and the syntax of _message_ prior to formatting.
> The processing of a _message_ depends on the logical sequence of Unicode code points,
> not on the presentation of the _message_.
> Affordances to allow users appropriate control over the appearance of the
> _message_'s syntax have been provided.

When a _message_ is formatted, _placeholders_ are replaced
with their formatted representation.
Applying the Unicode Bidirectional Algorithm to the text of a formatted _message_ 
(including its formatted parts)
can result in unexpected or undesirable 
[spillover effects](https://www.w3.org/TR/i18n-glossary/#dfn-spillover-effects).
Applying [bidi isolation](https://www.w3.org/TR/i18n-glossary/#dfn-bidi-isolation)
to each affected formatted value helps avoid this spillover in a formatted _message_.

Note that both the _message_ and, separately, each _placeholder_ need to have
direction metadata for this to work.
If an implementation supports formatting to something other than a string
(such as a sequence of parts),
the directionality of each formatted _placeholder_ needs to be available to the caller.

If a formatted _expression_ itself contains spans with differing directionality,
its formatter SHOULD perform any necessary processing, such as inserting controls or
isolating such parts to ensure that the formatted value displays correctly in a plain text context.

> For example, an implementation could provide a `:currency` formatting function
> which inserts strongly directional characters, such as U+200F RIGHT-TO-LEFT MARK (RLM),
> U+200E LEFT-TO-RIGHT MARK (LRM), or U+061C ARABIC LETTER MARKER (ALM), 
> to coerce proper display of the sign and currency symbol next to a formatted number.
> An example of this is formatting the value `-1234.56` as the currency `AED`
> in the `ar-AE` locale. The formatted value appears like this:
> ```
> ‎-1,234.56 د.إ.‏
> ```
> The code point sequence for this string, as produced by the ICU4J `NumberFormat` function,
> includes **U+200F U+200E** at the start and **U+200F** at the end of the string.
> If it did not do this, the same string would appear like this instead:
> 
> ![image](https://github.com/unicode-org/message-format-wg/assets/69082/6cc7f16f-8d9b-400b-a333-ae2ddb316edb)

A **_<dfn>bidirectional isolation strategy<dfn>_** is functionality in the formatter's
processing of a _message_ that produces bidirectional output text that is ready for display.

The **_<dfn>Default Bidi Strategy<dfn>_** is a _bidirectional isolation strategy_ that uses
isolating Unicode control characters around _placeholder_'s formatted values.
It is primarily intended for use in plain-text strings, where markup or other mechanisms
are not available.
Implementations MUST provide the _Default Bidi Strategy_ as one of the 
_bidirectional isolation strategies_.

Implementations MAY provide other _bidirectional isolation strategies_.

Implementations MAY supply a _bidirectional isolation strategy_ that performs no processing.

The _Default Bidi Strategy_ is defined as follows:

1. Let `msgdir` be the directionality of the whole message,
   one of « `'LTR'`, `'RTL'`, `'unknown'` ».
   These correspond to the message having left-to-right directionality,
   right-to-left directionality, and to the message's directionality not being known.
1. For each _expression_ `exp` in _pattern_:
   1. Let `fmt` be the formatted string representation of the _resolved value_ of `exp`.
   1. Let `dir` be the directionality of `fmt`,
      one of « `'LTR'`, `'RTL'`, `'unknown'` », with the same meanings as for `msgdir`.
   1. If `dir` is `'LTR'`:
      1. If `msgdir` is `'LTR'`
         in the formatted output, let `fmt` be itself
      1. Else, in the formatted output,
         prefix `fmt` with U+2066 LEFT-TO-RIGHT ISOLATE
         and postfix it with U+2069 POP DIRECTIONAL ISOLATE.
   1. Else, if `dir` is `'RTL'`:
      1. In the formatted output,
         prefix `fmt` with U+2067 RIGHT-TO-LEFT ISOLATE
         and postfix it with U+2069 POP DIRECTIONAL ISOLATE.
   1. Else:
      1. In the formatted output,
         prefix `fmt` with U+2068 FIRST STRONG ISOLATE
         and postfix it with U+2069 POP DIRECTIONAL ISOLATE.


