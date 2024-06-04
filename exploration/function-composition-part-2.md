# Function Composition - Part 2

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@catamorphism</dd>
		<dt>First proposed</dt>
		<dd>2024-06-xx</dd>
		<dt>Pull Requests</dt>
		<dd>#000</dd>
	</dl>
</details>

## Objective

_What is this proposal trying to achieve?_

[Part 1](https://github.com/unicode-org/message-format-wg/blob/main/exploration/function-composition-part-1.md) of this document
explained ambiguities in the existing spec
when it comes to function composition.

The goal of this document is to present a _complete_ list of
alternatives that may be considered by the working group.

Each alternative corresponds to a different concrete
definition of "resolved value".

This document is meant to logically precede
[the "Data Flow for Composable Functions" design document](https://github.com/catamorphism/message-format-wg/blob/79ceb57fa305204f26c6635fd586d0e3057cf460/exploration/dataflow-composability.md).
Once an alternative from this document is chosen,
then that document will be revised.

## Background

See https://github.com/unicode-org/message-format-wg/blob/main/exploration/function-composition-part-1.md for more details.

Depending on the chosen semantics for composition,
functions can either "pipeline the input" (preservation model) or
"operate on the output" (formatted value model),
or both.

Also, depending on the chosen functions, resolved options
might or might not be part of the value returned
by a function implementation.

This suggests several alternatives:
1. Pipeline input, but don't pass along options
2. Pipeline input and pass along options
3. Don't pipeline input (one function operates on the output of another) but do pass along options (is this useful?)
4. Don't pipeline input and don't pass along options

Options 1 and 3 do not seem useful.
This document presents options 2 and 4, and a few variations on them.

Not addressed here: the behavior of compositions of built-in functions
(but the choice here will determine what behaviors are possible).

Not addressed here: the behavior of compositions of custom functions
(which is up to the custom function implementor).

## Requirements

A message that has a valid result in one implementation
should not result in an error in a different implementation.

## Constraints

One prior decision is that the same definition of
"resolved value" appears in multiple places in the spec.
If "resolved value" is defined broadly enough
(an annotated value with rich metadata),
then this prior decision need not be changed.

A second constraint is
the difficulty of developing a precise definition of "resolved value"
that can be made specific in the interface for custom functions,
which is implementation-language-neutral.

A third constraint is the "typeless" nature of the existing MessageFormat spec.
The idea of specifying which functions are able to compose with each other
resembles the idea of specifying a type system for functions.
Specifying rules for function composition, while also remaining typeless,
seems difficult and potentially unpredictable.

## Introducing type names

It's useful to be able to refer to two types:

* `MessageValue`: The "resolved value" type; see [PR 728](https://github.com/unicode-org/message-format-wg/pull/728).
* `ValueType`: This type encompasses strings, numbers, date/time values,
all other possible implementation-specific types that input variables can be
assigned to, 
and all possible implementation-specific types that custom and built-in
functions can construct.
Conceptually it's the union of an "input type" and a "formatted value".

It's tagged with a string tag so functions can do type checks.

```
interface ValueType {
    type(): string
    value(): unknown
}
```

## Alternatives to consider

In lieu of the usual "Proposed design" and "Alternatives considered" sections,
we offer some alternatives already considered in separate discussions.

Because of our constraints, implementations are **not required**
to use the `MessageValue` interface internally as described in
any of the sections.
The purpose of defining the interface is to guide implementors.
An implementation that uses different types internally
but allows the same observable behavior for composition
is compliant with the spec.

Five alternatives are presented:
1. Typed functions
2. Formatted value model
3. Preservation model
4. Allow both kinds of composition
5. Don't allow composition

Alternatives 2 and 3 should be familiar to readers of part 1.
Alternative 4 is an idea from a prior mailing list discussion
of this problem. Alternative 1 is similar to Alternative 3
but introduces additional notation to make composition
easier to think about (which is why it's presented first).
Alternative 5 is included for completeness.

### Typed functions

The following option aims to provide a general mechanism
for custom function authors
to specify how functions compose with each other.

This is an extension of the "preservation model"
from part 1 of this document.

Here, `ValueType` is the most general type
in a system of user-defined types.
Using the function registry,
each custom function could declare its own argument type
and result type.

This does not imply the existence of any static typechecking.
A function passed the wrong type could signal a runtime error.
This does require some mechanism for dynamically inspecting
the type of a value.

Consider Example B1 from part 1 of the document:

Example B1:
```
    .local $age = {$person :getAge}
    .local $y = {$age :duration skeleton=yM}
    .local $z = {$y :uppercase}
```

Informally, we can write the type signatures for
the three custom functions in this example:

```
getAge : Person -> Number
duration : Number -> String
uppercase : String -> String
```

`Number` and `String` are assumed to be subtypes
of `MessageValue`. Thus, 

The [function registry data model](https://github.com/unicode-org/message-format-wg/blob/main/spec/registry.md)
attempts to do some of this, but does not define
the structure of the values produced by functions.

An optional static typechecking pass (linting)
would then detect any cases where functions are composed in a way that
doesn't make sense. For example:

Semantically invalid example:
```
.local $z = {$person: uppercase}
```

A person can't be converted to uppercase; or, `:uppercase` expects
a `String`, not a `Person`. So an optional tool could flag this
as an error, assuming that enough type information
was included in the registry.

The resolved value type is similar to what was proposed in
[PR 728](https://github.com/unicode-org/message-format-wg/pull/728/).

```ts
interface MessageValue {
    formatToString(): string
    formatToX(): X // where X is an implementation-defined type
    getValue(): ValueType
    properties(): { [key: string]: MessageValue }
    selectKeys(keys: string[]): string[]
}
```

The `resolvedOptions()` method is renamed to `properties`.
This is to suggest that individual function implementations
may not pass all of the options through into the resulting
`MessageValue`. 

Instead of using `unknown` as the result type of `getValue()`,
we use `ValueType`, mentioned previously.
Instead of using `unknown` as the value type for the
`properties()` object, we use `MessageValue`,
since options can also be full `MessageValue`s with their own options.

Because `ValueType` has a type tag,
custom function implementations can easily
signal dynamic errors if passed an operand of the wrong type.

The advantage of this approach is documentation:
with type names that can be used in type signatures
specified in the registry,
it's easy for users to reason about functions and
understand which combinations of functions
compose with each other.

### Formatted value model (Composition operates on output)

This is an elaboration on the "formatted model" from part 1.

A less general solution is to have a single "resolved value"
type, and specify that if function `g` consumes the resolved value
produced by function `f`,
then `g` operates on the output of `f`.

```
    .local $x = {$num :number maxFrac=2}
    .local $y = {$x :number maxFrac=5 padStart=3}
```

In this example, `$x` would be bound to the formatted result
of calling `:number` on `$num`. So the `maxFrac` option would
be "lost" and when determining the value of `$y`, the second
set of options would be used.

For built-ins, it suffices to define `ValueType`as something like:

```
FormattedNumber | FormattedDateTime | String
```

because no information about the input needs to be
incorporated into the resolved value.

However, to make it possible for custom functions to return
a wider set of types, a wider `ValueType` definition would be needed.

The `MessageValue` definition would look as in #728, but without
the `resolvedOptions()` method:

```ts
interface MessageValue {
    formatToString(): string
    formatToX(): X // where X is an implementation-defined type
    getValue(): ValueType
    selectKeys(keys: string[]): string[]
}
```

`MessageValue` is effectively a `ValueType` with methods.

Using this definition would make some of the use cases from part 1
impractical.

### Preservation model (composition can operate on input and options)

This is an extension of
the "preservation model" from part 1,
if resolved options are included in the output.
This model can also be thought of as functions "pipelining"
the input through multiple calls.

A JSON representation of an example resolved value might be:
```
{
    input: { type: "number", value: 1 },
    output: { type: "FormattedNumber", value: FN }
    properties: { "maximumFractionDigits": 2 }
}
```

(The number "2" is shown for brevity, but it would
actually be a `MessageValue` itself.)

where `FN` is an instance of an implementation-specific
`FormattedNumber` type, representing the number 1.

The resolved value interface would include both "input"
and "output" methods:

```ts
interface MessageValue {
    formatToString(): string
    formatToX(): X // where X is an implementation-defined type
    getInput(): ValueType
    getOutput(): ValueType
    properties(): { [key: string]: MessageValue }
    selectKeys(keys: string[]): string[]
}
```

Without a mechanism for type signatures,
it may be hard for users to tell which combinations
of functions compose without errors,
and for implementors to document that information
for users.

### Allow both kinds of composition (with different syntax)

By introducing new syntax, the same function could have
either "preservation" or "formatted value" behavior.

Consider (this suggestion is from Elango Cheran):

```
    .local $x = {$num :number maxFrac=2}
    .pipeline $y = {$x :number maxFrac=5 padStart=3}
    {{$x} {$y}}
```

If `$num` is `0.33333`,
then the result of formatting would be

```
0.33 000.33333
```

An extra argument to function implementations,
`pipeline`, would be added.

`.pipeline` would be a new keyword that acts like `.local`,
except that if its expression has a function annotation,
the formatter would pass in `true` for the `pipeline`
argument to the function implementation.

The `resolvedOptions()` method should be ignored if `pipeline`
is `false`.

```ts
interface MessageValue {
    formatToString(): string
    formatToX(): X // where X is an implementation-defined type
    getInput(): MessageValue
    getOutput(): unknown
    properties(): { [key: string]: MessageValue }
    selectKeys(keys: string[]): string[]
}
```

### Don't allow composition for built-in functions

Another option is to define the built-in functions this way,
notionally:

```
number : Number -> FormattedNumber
date   : Date -> FormattedDate
```

Then it would be a runtime error to pass a `FormattedNumber` into `number`
or to pass a `FormattedDate` into `date`.

The resolved value type would look like:

```ts
interface MessageValue {
    formatToString(): string
    formatToX(): X // where X is an implementation-defined type
    getValue(): ValueType
    selectKeys(keys: string[]): string[]
}
```

As with the formatted value model, this restricts the
behavior of custom functions.

### Non-alternative: Allow composition in some implementations

Allow composition only if the implementation requires functions to return a resolved value as defined in [PR 728](https://github.com/unicode-org/message-format-wg/pull/728).

This violates the portability requirement.
