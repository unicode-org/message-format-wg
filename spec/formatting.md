# WIP DRAFT MessageFormat 2.0 Formatting Behaviour

## Introduction

This document defines the behaviour of a MessageFormat 2.0 implementation
when formatting a message for display in a user interface, or for some later processing.

The document is part of the MessageFormat 2.0 specification,
the successor to ICU MessageFormat, henceforth called ICU MessageFormat 1.0.

## Variable Resolution

To resolve the value of a Variable,
its Name is used to identify either a local variable,
or a variable defined elsewhere.
If a local variable and an externally defined one use the same name,
the local variable takes precedence.

It is an error for a local variable definition to
refer to a local variable that's defined after it in the message.

## Pattern Selection

When formatting a message with one or more selectors,
the Pattern of one of Variants must be selected for formatting.

An implementation may use any pattern selection method,
as long as its observable behaviour matches the results of the method defined here.

### Resolve Selectors

First, resolve the values of each Selector Expression:

1. Let _res_ be a new empty list of resolved values that support selection.
2. For each Expression _exp_ of the message's Selector Expressions,
   1. Let _rv_ be the resolved value of _exp_.
   2. If selection is supported for _rv_:
      1. Append _rv_ as the last element of the list _res_.
   3. Else:
      1. Let _nomatch_ be a resolved value for which selection always fails.
      2. Append _nomatch_ as the last element of the list _res_.
      3. Emit a Selection Error.

The shape of the resolved values must be determined by each implementation,
along with the manner of determining their support for selection.

### Select Pattern

Using _res_,
the Variants are iterated in source order and the following test is performed
to find one with all of its keys matching the Selector Expressions:

1. For each index _i_ in _res_:
   1. Let _key_ be the VariantKey at position _i_.
   2. If _key_ is not equal to the catch-all key `'*'`:
      1. Let _sel_ be the entry in _res_ at position _i_.
      2. Let _pass_ be the boolean result of testing _key_ against _sel_.
      3. If _pass_ is False,
         1. Return False to indicate failure.
2. Return True to indicate success.

The manner of testing _key_ against _sel_ must be defined by each implementation.

Once a Variant is found for which the test succeeds,
its Pattern is used for formatting the message.
As each valid message must have a Variant with keys all equal to the catch-all key,
this selection will always succeed.
Variants after one with all catch-all keys will never be selected.

### Examples

Presuming a minimal implementation which only supports string values
and tests keys by using string comparison,
and a formatting context in which
the variable reference `$foo` resolves to the string `'foo'` and
the variable reference `$bar` resolves to the string `'bar'`,
pattern selection proceeds as follows for this message:

```
match {$foo} {$bar}
when bar bar {All bar}
when foo foo {All foo}
when * * {Otherwise}
```

1. During setup the values of the Selector Expressions
   are resolved as `'foo'` and `'bar'`.<br>
   As these are both strings, the list _res_ is determined to be « `'foo'`, `'bar'` ».

2. Testing the first variant `bar bar`:<br>
   The first key `bar` is compared to the first resolved value `foo`,
   and the test fails.

3. Testing the second variant `foo foo`:<br>
   The first key `foo` is compared to the first resolved value `foo`,
   and as this succeeds the test continues.<br>
   The second key `foo` is compared to the second resolved value `bar`,
   and the test fails.

4. Testing the third variant `* *`:<br>
   The first key `*` is a catch-all key, so the test continues.<br>
   The second key `*` is a catch-all key, so the test continues and succeeds.

5. The Pattern `{Otherwise}` of the third variant is selected.

Alternatively, with the same implementation and formatting context,
pattern selection would proceed as follows for this message:

```
match {$foo} {$bar}
when foo * {Foo and some}
when foo bar {Foo and bar}
when * * {Otherwise}
```

1. During setup the values of the Selector Expressions
   are resolved as `'foo'` and `'bar'`.<br>
   As these are both strings, the list _res_ is determined to be « `'foo'`, `'bar'` ».

2. Testing the first variant `foo *`:<br>
   The first key `foo` is compared to the first resolved selector value `foo`,
   and as this succeeds the test continues.<br>
   The second key `*` is a catch-all key, so the test continues and succeeds.

3. The Pattern `{Foo and some}` of the first variant is selected.

## Error Handling

Errors in messages and their formatting may occur and be detected
at multiple different stages of their processing.
Where available,
the use of validation tools is recommended,
as early detection of errors makes their correction easier.

During the formatting of a message,
various errors may be encountered.
These are divided into the following categories:

- **Syntax errors** occur when the syntax representation of a message is not well-formed.

  Example invalid messages resulting in a Syntax error:

  ```
  {Missing end brace
  ```

  ```
  {Unknown {#placeholder#}}
  ```

  ```
  let $var = {(no message body)}
  ```

- **Data Model errors** occur when a message is invalid due to
  violating one of the semantic requirements on its structure:

  - **Variant Key Mismatch errors** occur when the number of keys on a Variant
    does not equal the number of Selectors.

    Example invalid messages resulting in a Variant Key Mismatch error:

    ```
    match {$one}
    when 1 2 {Too many}
    when * {Otherwise}
    ```

    ```
    match {$one} {$two}
    when 1 2 {Two keys}
    when * {Missing a key}
    when * * {Otherwise}
    ```

  - **Missing Fallback Variant errors** occur when the message
    does not include a Variant with only catch-all keys.

    Example invalid messages resulting in a Missing Fallback Variant error:

    ```
    match {$one}
    when 1 {Value is one}
    when 2 {Value is two}
    ```

    ```
    match {$one} {$two}
    when 1 * {First is one}
    when * 1 {Second is one}
    ```

- **Resolution errors** occur when the runtime value of a part of a message
  cannot be determined.

  - **Unresolved Variable errors** occur when a variable reference cannot be resolved.

    For example, attempting to format either of the following messages
    must result in an Unresolved Variable error if done within a context that
    does not provide for the variable reference `$var` to be successfully resolved:

    ```
    {The value is {$var}.}
    ```

    ```
    match {$var}
    when 1 {The value is one.}
    when * {The value is not one.}
    ```

  - **Unknown Function errors** occur when an Expression includes
    a reference to a function which cannot be resolved.

    For example, attempting to format either of the following messages
    must result in an Unknown Function error if done within a context that
    does not provide for the function `:func` to be successfully resolved:

    ```
    {The value is {(horse) :func}.}
    ```

    ```
    match {(horse) :func}
    when 1 {The value is one.}
    when * {The value is not one.}
    ```

- **Selection errors** occur when message selection fails.

  - **Selector errors** are failures in the matching of a key to a specific selector.

    For example, attempting to format either of the following messages
    might result in a Selector error if done within a context that
    uses a `:plural` selector function which requires its input to be numeric:

    ```
    match {(horse) :plural}
    when 1 {The value is one.}
    when * {The value is not one.}
    ```

    ```
    let $sel = {(horse) :plural}
    match {$sel}
    when 1 {The value is one.}
    when * {The value is not one.}
    ```

- **Formatting errors** occur during the formatting of a resolved value,
  for example when encountering a value with an unsupported type
  or an internally inconsistent set of options.

  For example, attempting to format any of the following messages
  might result in a Formatting error if done within a context that

  1. provides for the variable reference `$user` to resolve to
     an object `{ name: 'Kat', id: 1234 }`,
  2. provides for the variable reference `$field` to resolve to
     a string `'address'`, and
  3. uses a `:get` formatting function which requires its argument to be an object and
     an option `field` to be provided with a string value,

  ```
  {Hello, {(horse) :get field=name}!}
  ```

  ```
  {Hello, {$user :get}!}
  ```

  ```
  let $id = {$user :get field=id}
  {Hello, {$id :get field=name}!}
  ```

  ```
  {Your {$field} is {$id :get field=$field}}
  ```

Syntax and Data Model errors must be emitted as soon as possible.

During selection, an Expression handler must only emit Resolution and Selection errors.
During formatting, an Expression handler must only emit Resolution and Formatting errors.

In all cases, when encountering an error,
a message formatter must provide some representation of the message.
An informative error or errors must also be separately provided.
When a message contains more than one error,
or contains some error which leads to further errors,
an implementation which does not emit all of the errors
should prioritise Syntax and Data Model errors over others.

When an error occurs in the resolution of an Expression or Markup Option,
the Expression or Markup in question is processed as if the option were not defined.
This may allow for the fallback handling described below to be avoided,
though an error must still be emitted.

When an error occurs within a Selector,
the selector must not match any VariantKey other than the catch-all `*`
and a Resolution or Selector error is emitted.

## Fallback String Representations

The formatted string representation of a message with a Syntax or Data Model error
is the concatenation of U+007B LEFT CURLY BRACKET `{`,
a fallback string,
and U+007D RIGHT CURLY BRACKET `}`.
If a fallback string is not defined,
the U+FFFD REPLACEMENT CHARACTER `�` character is used,
resulting in the string `{�}`.

When an error occurs in a Placeholder that is being formatted,
the fallback string representation of the Placeholder
always starts with U+007B LEFT CURLY BRACKET `{`
and ends with U+007D RIGHT CURLY BRACKET `}`.
Between the brackets, the following contents are used:

- Expression with Literal Operand: U+0028 LEFT PARENTHESIS `(`
  followed by the value of the Literal,
  and then by U+0029 RIGHT PARENTHESIS `)`

  Examples: `{(horse)}`, `{(42)}`

- Expression with Variable Operand: U+0024 DOLLAR SIGN `$`
  followed by the Variable Name of the Operand

  Example: `{$user}`

- Expression with no Operand: U+003A COLON `:` followed by the Expression Name

  Example: `{:platform}`

- Markup start: U+002B PLUS SIGN `+` followed by the MarkupStart Name

  Example: `{+tag}`

- Markup end: U+002D HYPHEN-MINUS `-` followed by the MarkupEnd Name

  Example: `{-tag}`

- Otherwise: The U+FFFD REPLACEMENT CHARACTER `�` character

  Example: `{�}`

Option names and values are not included in the fallback string representations.

When an error occurs in an Expression with a Variable Operand
and the Variable refers to a local variable Declaration,
the fallback string is formatted based on the Expression of the Declaration,
rather than the Expression of the Placeholder.

For example, attempting to format either of the following messages within a context that
does not provide for the function `:func` to be successfully resolved:

```
let $var = {(horse) :func}
{The value is {$var}.}
```

```
let $var = {(horse)}
{The value is {$var :func}.}
```

would result in both cases with this formatted string representation:

```
The value is {(horse)}.
```
