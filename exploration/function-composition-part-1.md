# Function Composition

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@catamorphism (also see Acknowledgments)</dd>
		<dt>First proposed</dt>
		<dd>2024-03-26</dd>
		<dt>Pull Requests</dt>
		<dd>#753</dd>
	</dl>
</details>

## Objective

_What is this proposal trying to achieve?_

### Non-goal

The objective of this design document is not to make
a concrete proposal, but rather to explore a problem space.
This space is complicated enough that agreement on vocabulary
is desired before defining a solution.

Instead of objectives, we present a primary problem
and a set of subsidiary problems.

### Problem statement: defining resolved values

The problem defined in this design document is that
the meaning of function composition is ambiguous.

An obstacle to disambiguating its meaning
is the absence of a definition of "resolved value".

A necessary but not sufficient condition for specifying
the meaning of function composition
is to define the structure
of the inputs and outputs to function implementations.
These definitions must be flexible enough to accommodate
different implementation languages and design choices,
while also being concrete enough for ease of reasoning.

It's much easier to think about what it means for
one function to operate on the result of another function
if we know what the inputs and outputs to those functions
look like.

This design document primarily attempts to address
the constraints that a definition of "resolved value" must satisfy.

The spec currently leaves the term "resolved value"
undefined.
At the same time, the spec implicitly constrains
the form of a resolved value
through the operations on resolved values that it defines.
Implementing the spec requires the implementor to infer these constraints.
An indirect goal of this document
is to begin making those constraints explicit
so that the implementor can consult documentation
rather than inferring requirements.

Defining resolved values implies several subsidiary goals,
as there are several things that can be done with resolved values
at runtime:

1. Resolved values can be bound to _variables_
   (whose names arise from _declarations_ in the syntax).
2. Resolved values can be passed to function implementations.
3. Resolved values can be returned from function implementations.

This implies:

4. The resolved value returned from one function implementation
can be passed to another function implementation,
either one that implements the same function or a different function.

which is the problem of composition.

### Subsidiary problems

  1. Define the runtime meaning of `.local` (and `.input`).

> _In a declaration, the resolved value of the expression is bound to a variable, which is available for use by later expressions_
(["Expression and Markup Resolution"](https://github.com/unicode-org/message-format-wg/blob/main/spec/formatting.md#expression-and-markup-resolution)).

The term "resolved value" is left implementation-dependent, but its meaning affects the observable behavior of the formatter. (Note: Since `.input` can be treated as syntactic sugar for `.local`, we need only consider `.local` in examples.)

  2. Define the types that custom functions manipulate.

> _Call the function implementation with the following arguments... If the expression includes an operand, its resolved value.
> ....If the call succeeds, resolve the value of the expression as the result of that function call._
(["Function Resolution"](https://github.com/unicode-org/message-format-wg/blob/main/spec/formatting.md#function-resolution) )

The same term, "resolved value", is used to describe the values
that function implementations consume and produce.
An implementation that supports custom functions needs to define concrete types
(whose details depend on the underlying programming language of the implementation)
that capture all the details of "resolved values".
Implementors would benefit from guidance
on how to map the MessageFormat concept of a "resolved value"
onto a concrete type.

  3. Define the semantics of composition

A function can consume a value produced by another function,
since the language provides `.local` declarations
and any _variable_ can appear in an _expression_
that has an _annotation_.
(Functions implement _annotations_.)
The meaning of this composition depends on the definition
of "resolved value".
Even with a precise definition of "resolved value",
an additional question is raised of what the contract
with custom functions needs to be
in order to conform with the semantics of MessageFormat.
Disambiguating the composability question
affects observable behavior.

  4. Provide useful names for different kinds of functions

Currently, a given MessageFormat function can be thought of as a
formatter, a selector, or both.
Because the implementations for formatters and selectors
naturally have different type signatures
(a formatter consumes and produces a resolved value,
while a selector produces a list of keys),
a single MessageFormat function that supports both formatting and selection
is expected to symbolize multiple implementations.
It may be useful to think of some functions as "transformers"
that consume and produce resolved values,
and others as "formatters" that consume a resolved value
and produce a formatted value.
Defining these terms is another problem this document outlines.

## Use Cases

Given the breadth of the problems being addressed,
we start with a set of use cases
before generalizing them in the "Background" section.

Not all of these use cases may be desirable to enable.
Part of the process of discussing this design document
includes deciding on whether any of them should
be explicitly disallowed.

Several of the following examples use the `:number` built-in function.
However, the issues illustrated in the examples are general.
Most of the issues identified with `:number` also apply
to **any** function with multiple named options.

_This document includes examples contributed by Markus Scherer and Elango Cheran_

### Composition

The presence of local _declarations_
allows function composition.

The following is _not_ a syntactically valid
MessageFormat 2 message:

```
{{{|1| :number} :number}}
```

This string is not a syntactically correct message
because no nesting of function annotations is allowed
(see the _expression_ nonterminal in the grammar.)


However, by substitution,
one can write an observationally equivalent message:

```
.local $x = {|1| :number}
{{$x :number}}
```

This implies that the composition of two functions
(conceptually, `number . number` in this case)
has to have a meaning,
since it can be expressed syntactically,
as long as every intermediate result is named.

That doesn't mean that every possible combination
of functions has to make sense if composed.
Functions are allowed to signal errors
and return values that indicate that an error occurred.

How functions might compose depends on what they return
and what they can accept as arguments.
In turn, what they can accept as arguments
depends on what a variable name denotes.
Functions do not accept MessageFormat variable names
as arguments,
but rather the **value** denoted by a variable name.
The MessageFormat implementation must
manage the binding of variable names to values.

### Overriding options

The meaning of function composition in MessageFormat
depends on what can be assumed
about the arguments and return values
of function implementations.

Consider the following example:

Example Y1:
```
    .local $x = {$num :number maxFrac=2}
    .local $y = {$x :number maxFrac=5}
    {{$x} {$y}}
```

If the external input value of `$num` is "0.33333",
what should this message format to?

1. `0.33 0.33333`
2. `0.33 0.33`
3. It's an error, because the value bound to `$x` is
a formatted number, which `:number` does not accept.

The answer to this question is unclear.
How different values for the same options might
(or might not) combine is not straightforward.
Perhaps some do, others don't, and the details are
specific to each function.

Example A6:
Should $y be formatted as ٩٨٧٦٥ or 98765?

```
    input $num = 98765
    .local $x = {$num :number numberSystem=arab}
    .local $y = {$x :number numberSystem=latn}
```

Example A7:
Should $y be formatted as +98765 or 98765?
```


    input $num = 98765
    .local $x = {$num :number signDisplay=always}
    .local $y = {$x :number signDisplay=auto}
```

These examples raise the question
of whether functions return values
that preserve the input option names and values
that were passed in to the function.

While some use cases don't work well
(or at least work surprisingly)
if options are **not** preserved
in function outputs,
defining what it means to compose options
is not straightforward.

### Combining options

In Example Y1,
two function calls are composed
with the same set of option names
(and different option values).

A question also arises of how to combine options with different names.

Example A4:

```
    .local $x = {|1| :number minInt=3}
    .local $y = {$x :number maxFrac=5}
    {{$x} {$y}}
```

Is this message equivalent to Example A5?

Example A5:

```
    .local $x = {|1| :number maxFrac=5 minInt=3}
    {{$x} {$x}}
```

In compositions of calls to the same function,
it might make intuitive sense to union together
the option sets, letting the outermost enclosing
call take precedence if the same option is specified
multiple times.

It's less obvious what to do with compositions of
calls to different functions, which may have different
option sets.


### Computation vs. applying formatting

The previous examples conceptually return
the same value that was passed in,
annotated with formatting hints.

But functions can do other kinds of computation.

Example B1:
```
    .local $age = {$person :getAge}
    .local $y = {$age :duration skeleton=yM}
    .local $z = {$y :uppercase}
```

Although there is also a pipeline of functions
(conceptually, `uppercase . duration . getAge`),
the formatted value returned by `:getAge` is _not_
just "the argument with formatting options applied",
but rather, a piece of the argument.
Other functions can be imagined that do more general
computation on arguments.

It would not be correct to say that
`:uppercase` converts a person to uppercase,
nor would it be correct to say that `:uppercase`
converts a number to uppercase.

This example only makes sense if `:uppercase`
operates on the "formatted result"
of evaluating the _expression_ bound to `$y`.

This suggests a representation for named values
that allows functions to choose whether to
inspect the "formatted result", the "argument" and options,
or both.
Or, it may also suggest that we consider 
whether we allow composition at all when the functions differ.

## Background

In the use cases, we have seen that
the meaning of "resolved value" affects the observable behavior of formatting.
This in turn affects the semantics of MessageFormat,
particularly with respect to function composition.
The desired semantics for function composition
impose requirements on the expressivity of a "resolved value".

[The introduction to the spec](https://github.com/unicode-org/message-format-wg/blob/main/spec/formatting.md) states:

> _The form of the resolved value is implementation defined and the value might not be evaluated or formatted yet. However, it needs to be "formattable", i.e. it contains everything required by the eventual formatting._

What "everything required" means depends on the semantics of formatting.

And from the ["Expression and Markup Resolution"](https://github.com/unicode-org/message-format-wg/blob/main/spec/formatting.md#expression-and-markup-resolution) section:

> _Since a variable can be referenced in different ways later, implementations SHOULD NOT immediately fully format the value for output._

Is there a distinction between a "resolved value"
and a "fully formatted" resolved value?
This text suggests that there is.
Again, the distinction affects observable behavior.

To understand how these distinctions affect behavior,
we turn to some examples.

### Base example

The following example is unambiguous
with the current spec:

Example Z1:
```
.local $n = {|1.00123|}
.local $x = {$n: number maxFrac=2}
.local $y = {$n: number maxFrac=3}
{{$x} {$y}}
```

If this message is formatted to a string,
the output is "1.00 1.001".

If the message body is changed
(for example, to annotate `$x` and/or `$y`
with other _annotations_),
what can we assume about the resolved values
of `$x` and `$y`?

It must be possible to distinguish
the resolved value of `$x`
from the resolved value of `$y`,
as `{{$x} {$y}}` formats to "1.00 1.001"
while `{{$x} {$x}}` formats to "1.00 1.00".

The question is _when_ the two resolved values
look the same,
and when they look different.

Two possible answers:

1. The two resolved values are always different:
`$x` is bound to a resolved value
that encodes the value of the `maxFrac` option, 2;
while for `$y`, this value is 3.
2. Functions cannot distinguish the two resolved values
from each other.
However, the formatter can distinguish the two resolved values
from each other when formatting a pattern.

How would the spec need to change in order to
force either answer 1 or answer 2 to be unambiguously true?

Put a different way: does every expression
have a single resolved value
in a given formatting context?
Or does the resolved value of an expression
depend on the context
in which the expression appears?

### Custom and built-in functions

An implementation that supports custom functions
would be expected to define an interface between the message formatter
and function implementations.
An implementation is free to choose whether to use the same interface
for calling built-in functions,
or to build the implementations of those functions
directly into the message formatter.

For that reason, this document refers to custom functions
when discussing the function interface.
However, in some implementations, the same questions arise
for built-in functions.

### Formattable and formatted values

In implementing the custom function registry,
it might be natural to suppose that
conceptually, the type signature of a function implementation
is:

```
Formattable -> FormattedValue
```


The names of these two types are taken from the ICU4C
implementation. A `Formattable` is a value
tagged with a type (for example, doubles, integers,
strings, and pointers to arbitrary objects).
A `FormattedValue` represents something that
already contains all the information needed
to either render it as a string,
or convert it to a "part" according to a hypothetical
"format to parts" interface.

It would be tempting to use the existing `Formattable`
type for the input of a function implementation,
and use the existing `FormattedValue` type for the output.
However, functions with this signature
can't compose with each other.

When the following text refers to `Formattable` or
`FormattedValue`, it should be taken to refer to
abstract "input" and "output" types.

### Ambiguous examples

Returning to Example Y1, consider two possible models
of the runtime behavior of function composition.

**Model 1:**

1. Evaluate `$num` to a value and pass it to the `:number` function,
   along with named options `{"maxFrac": "2"}`
2. Let `X` be the result of the function. `X` is
   an object
   encapsulating the following fields:
     * The source value, `"0.33333"`
     * The fully-evaluated options, `{"maxFrac": "2"}`
     * The formatted result, a `FormattedNumber` object
       representing the string `"0.33"`
2. Bind the name `$x` to the value `X`.
3. Evaluate `$y` to a value, which is `X`,
   and pass it to the `:number` function,
   along with named options `{"maxFrac": "5"}`
4. Bind `$y` to the result, which is an object `Y`
   encapsulating the following fields:
     * The source value, `"0.33333"` (same as `X`'s source value)
     * The fully-evaluated options, `{"maxFrac": "5"}`
       (note: the original `maxFrac` option value has been discarded)
     * The formatted result, a `FormattedNumber` object
       representing the string `"0.33333"`

then the formatted result is "0.33 0.33333".

**Model 2:**

1. Evaluate `$num` to a value and pass it to the `:number` function,
   along with named options `{"maxFrac": "2"}`
2. Let `F` be the result of the function. `F` is
   a `FormattedNumber` object
   representing the string `"0.33"`
2. Bind the name `$x` to the value `F`.
3. Evaluate `$y` to a value, which is F,
   and pass it to the `:number` function,
   along with named options `{"maxFrac": "5"}`
4. Inside the `:number` function, check the type
   of the input, notice that it is already a
   `FormattedNumber`, and return it as-is
5. Bind `$y` to the result, which is F.

then the formatted result is "0.33 0.33".

The difference is in step 2: whether the implementation
of the `number` function returns a value encapsulating
the various options that were passed in (model 1),
or only a formatted result (model 2).

In terms of implementation, the result depends on
what the nature is of the value that is bound to
a local variable in the environment used in evaluation
within the message formatter.
The structure of this value might not be exactly the same
as the structure that is passed to functions:
for example, in a lazy implementation, unevaluated thunks
might be stored in the environment, and then evaluated
before a function call.
Still, whatever value is stored in the environment
must capture as much information as is needed by functions.

In Model 2, the value is a simple "formatted value",
analogously to MessageFormat 1.

In Model 1, it is a more structured value that captures
both the "formatted value", and everything that was used to construct it,
as in the first model.


### The structure of named values

In the current spec, the "value bound to a variable"
when processing a `.local` (or `.input`) declaration
is a "resolved value".
A "resolved value"
is also the operand of a function.

Another way to resolve the ambiguity between
Models 1 and 2 is to ask
when two resolved values are the same
and when they are different.

Example Z1 shows how two different names,
which are bound to two different resolved values,
**might** appear to be the same resolved value
when appearing as the operand of a function,
depending on how the spec is interpreted.

_The following is drawn from comments by Mark Davis._

Example A1:
```
    .local $n = {|1|}
    .local $x = {$n :number maxFrac=2}
```

The formatter processes the right-hand side
of the `.local` declaration of `$x`
and binds it to a value (a "resolved value",
per the spec.)

The use of "resolved value" implies that
the following two concepts:
* "the value of `$x` in the formatter's local environment"
and
* "the meaning of `$x` as an operand to a function"
denote the same entity.

So what is that entity? There are at least two interpretations,
corresponding to the models previously presented:

Interpretation 1: The meaning of `$x` is
a value that effectively represents the string `"1.00"`.

Consider another example:

Example A2:
```
    .local $n1 = {|1|}
    .local $n2 = {|1.00123|}
    .local $x1 = {$n1 :number maxFrac=2}
    .local $x2 = {$n2 :number maxFrac=2}
```

Under interpretation 1, `$x1` and `$x2` are
interchangeable in any further piece of the message
that follows this fragment.
No processing can distinguish the resolved values
of the two variables.
This corresponds to model 1.

Interpretation 2: The meaning of `$x` is
a value that represents
a formatted string `"1.00"`,
bundled with information about the source value (`"1"`),
formatter name, and formatter options.
If the resolved value of `$x`, V, is passed to another function,
that function can distinguish V from another value V1
that represents the same formatted string,
with different options.
This corresponds to model 2.

The choice of interpretation affects the meaning of
function composition,
since it affects which values a function implementation
can distinguish from each other.

The two interpretations affect behavior
only if `$x` is passed to another function;
if it's only used unannotated in a pattern,
then the two interpretations imply the same result.

In other words, in example A2,
functions can distinguish the resolved value of `$x1`
from the resolved value of `$x2`.

An implication of interpretation 2 is that the meaning
of `$x2` (in example A2) depends on context.
When it appears in a pattern, with no annotation,
it is interchangeable with `$x1`.
When it appears in a function annotation,
it is distinguishable from `$x1`.
If every expression has a single "resolved value"
that is determined in a context-free way,
that rules out interpretation 2.

Another way to express interpretation 2 is to
express the semantics of an unannotated variable
in a pattern in this way:

`{{$x}}` is implicitly
`{{$x :format}}`

where `:format` extracts the string (or "formatted parts")
representation of `$x`'s resolved value
and discards everything else, which is not needed for
producing the final formatting result.
If this implicit processing
(an implicit type coercion?)
is introduced into the spec,
the meaning of variable names
is once again context-independent.

Also consider:

Example A3:

```
    .local $n1 = {|1.00123|}
    .local $n2 = {|1.00|}
    .local $x0 = {$n2 :number maxFrac=2}
    .local $x = {$n1 :number maxFrac=2}
    .local $y = {$x :number maxFrac=5}
    {{$x} {$y}}
```

Interpretation 1: The result of formatting this message to a string
is `"1.00 1.00000"`.
`$x` is bound to a resolved value denoting a formatted string `1.00`,
with no metadata.
The second call to `:number`, with `$x`'s resolved value as its operand,
cannot distinguish the resolved value of `$x`
from the resolved value of `$x0`.
Therefore, its result is the same as if it was passed
the resolved value of `$x0`.

Interpretation 2: The result of formatting this message to a string
is `"1.00 1.00123"`.
Under this interpretation, the second call to `:number`
can distinguish the resolved value
of `$x` from the resolved value of `$x0`.
The original string that `$x` was constructed from
is part of the resolved value,
and can be accessed to reformat that string
with more digits of precision.

When it comes to example A3,
either interpretation might be surprising to some users.

Under interpretation 2, some users might be surprised that `$y`
has more precision than `$x`.
If their mental model is that `$y` can only depend
on the result of formatting the right-hand side
of the declaration of `$x`,
then the intuition is that the extra digits are "lost"
upon assigning a value to `$x`.

To understand why interpretation 1 might be surprising
to other users, consider an analogy.

#### Spreadsheet analogy

_This idea is from Mark Davis._

Interpretation 2 treats variables analogously to cells in a spreadsheet.
In a cell of a spreadsheet, referring to a value by name
creates a reference,
rather than copying its value.
Unlike cells in spreadsheets, variables in MessageFormat are immutable.
However, like cells in spreadsheets, the definitions of variables
can refer to other variables that are in scope.

Consider a tabular rendering of example A3 (with a pseudo-spreadsheet syntax)
(this would be the "formula" view):

|    | A       |     B   | C                |  D              |   E              |
|----|---------|---------|------------------|-----------------|------------------|
| 1  | 1.00123 | 1.00    | (=B1, maxFrac=2) | =(A1, maxFrac=2)| =(D1, maxFrac=5) |

with the following mappings between cells and variables:

| A1 | n1 |
|----|----|
| B1 | n2 |
|----|----|
| C1 | x0 |
|----|----|
| D1 | x  |
|----|----|
| E1 | y  |

And the "output" view

|    | A       |     B   | C                |  D              |   E              |
|----|---------|---------|------------------|-----------------|------------------|
1    | 1.00123 | 1.00    | 1.00             | 1.00            | 1.00123          |

In E1, the reference to D1 is a reference to the _value_ of A1,
with added formatting options that can be extended or overridden.

This is consistent with interpretation 2, in which `$x` is bound to a structure
that contains the value of `$n1`.
(This could be implemented by copying, since MessageFormat variables are immutable.)


### Semantics: return values for functions

Turning to the question of what a function returns,
this at first glance is the same question as
"what is a named value?",
as both are "resolved values" according to the spec.
But both interpretation 1 and interpretation 2 complicate that.

Alternative 1: A function returns a "formatted value".
This matches model 1, where formatted values
are bound to names.

Alternative 2: A function returns a composite value
that conceptually pairs a base value (possibly the
operand of the function, but possibly not; see Example B1)
with options.
This matches model 2.
If we preserve the single usage of "resolved value"
in the spec, this implies that the (base value, options)
representation applies to all resolved values,
not just those returned by functions.

For more details, see the "model implementations" section.

### Allowing different kinds of functions

The syntax could also distinguish multiple kinds of functions,
some of which are composable and some not.

Or, the function registry could allow functions to be declared in this way,
with incorrect uses of functions being resolution errors.

(See "Different kinds of composition" under "Alternatives to consider".)

### Summarizing use cases

There seem to be several areas of ambiguity:

* Are named values essentially `FormattedValue`s,
or do they have additional structure that is used
internally in the formatter? (Model 1 vs. Model 2)
* In Model 2, some functions "look back" for the original value,
(like `number`)
while others return a new "source value"
(like `getAge` in Example B1).

The choice of internal value influences both areas,
or rather, the desired answers to these questions
constrain the choice of internal value.

Composition might mean that "the second function operates on the output of the first",
or "the second function operates on the **input** of the first, plus 'hints' supplied by the first",
or it might mean either one depending on which function(s) are involved.

The question is how to craft the spec in a way that is consistent with expectations.

## Requirements

In the rest of this document, we assume some version of Model 2.
However, if Model 1 is more desired, the questions arise of how to
forbid compositions of functions that would do surprising things
under that model.

Even under Model 2, some instances of composition won't make sense,
so we need to define the error behavior when it doesn't make sense.

This implies that we need:

* Preservation of options
* Preservation of the original operand value, at least for some functions
* Passing through a new operand value _and_ options when appropriate, as with functions that extract fields
(see Example B1)
* (Possibly) Preservation of data about the names of functions that were previously called.

The function registry needs to be explicit about which pieces of data
a function preserves,
and what it expects in its input.

More generally than just "preservation of options",
a solution needs to specify a minimum set of requirements
for the internal value representation,
so that functions can be passed the values they need.
It also needs to provide a mechanism for declaring
when functions can compose with each other.

Other requirements:

### Identify a set of use cases that must be supported

Some use cases for composition are given in this document,
and others are yet to be identified.

One of the outcomes of the design process
should be to agree on a set of use cases involving function composition
that implementations must support in order to be spec-compliant.

This does not rule out the possibility of deciding
_not_ to support any of these use cases
(that is, a solution that heavily restricts function composition
rather than giving it meaning).

### Avoid over-constraining implementations

An implementation is free to use any types
and set of operations for coercing between types
as long as it preserves the observable behavior
of a message.

The proposed solution should not impose
unnecessary constraints on the implementation.
However, it _should_ make the requirements
for "resolved values"
clear enough so that implementors can
make a well-informed decision
on what these types and operations should be.

The proposed solution might involve normative changes to the spec,
or it might be sufficient to define a set of examples
and how they should work.

### Stay aligned with user needs

It may be that in practice, MessageFormat users will not
find it useful to compose functions in complex ways.
MessageFormat was not initially meant to be
a general-purpose programming language.
If supporting function composition in its full generality
leads to an excessively complex or restrictive spec,
and if user feedback suggests such use cases are rare in practice,
it might be more desirable to rule out ambiguous examples
by means of syntactic restrictions and/or runtime errors.

## Constraints

_What prior decisions and existing conditions limit the possible design?_

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

## Prior work

In a previous iteration of the spec,
[PR #198](https://github.com/unicode-org/message-format-wg/pull/198) (September 2021)
proposed to add a general `Formattable` interface to represent runtime values.
This proposal was not merged, and eventually, the term "resolved value"
was incorporated into the spec instead to abstract over this interface.

Currently, custom functions are passed their argument
(_operand_ in MessageFormat syntax)
and a mapping of option names to option values separately.
In PR 198, a `Formattable` would have encapsulated
both the argument and options.
A variation on this idea might make it simpler
to return values with options:
if a function implementation has type `Formattable -> Formattable`,
then it can preserve some options in the returned value,
omit them, or add new ones.

A wiki page from August 2021,
["Data and Execution Model Differences"](https://github.com/unicode-org/message-format-wg/wiki/Data-&-Execution-Model-Differences#formatting-function-dependencies),
includes a section on "Formatting Function Dependencies",
which includes the question:
"When implementing a formatting function,
what values/arguments does it need to have access to?"

A GitHub discussion also from August 2021,
["A Modular and Extensible MessageFormat 2.0"](https://github.com/unicode-org/message-format-wg/discussions/190),
includes discussion of the "runtime model" for values;
a proposed design based on this document
might also specify a runtime model for values.
At the time, "pattern element formatters"
and "formatting functions" were conceived
as separate categories of functions.
This document also suggests
introducing more categories of functions,
but split in a different way.
The August 2021 discussion suggests giving
"pattern element formatters" more access to message context.
Such a distinction might be useful again:
it might be desirable to allow function authors
to declare either simple functions that
don't compose with each other,
and more complex functions with a richer interface
that can compose with each other.

There are some common elements between those past discussions
and this document.
But in contrast with previous proposals that give functions
access to message context,
this document suggests a purely functional approach
in which values the function needs to have access to
are encapsulated in a single argument type
and values the function needs to return
are encapsulated in a single return type.

Another notable difference with some of the prior work
is that in the current spec, the data model
is completely separate from the model for values
that functions operate on.
That is, functions operate on values
without needing to know or care
whether those values were obtained from
evaluating a MessageFormat _literal_ or _variable_.
We do not propose changing that.
Hence, revisiting the extensibility of the runtime model
now that the data model is settled
may result in a more workable solution.

## Proposed design and alternatives considered

These sections are omitted from this document and will be added in
a future follow-up document,
given the length so far and need to agree on a common vocabulary.

We expect that any proposed design
would fall into one of the following categories:

1. Provide a general mechanism for custom function authors
to specify how functions compose with each other.
1. Specify composition rules for built-in functions,
but not in general, allowing custom functions
to cooperate in an _ad hoc_ way.
1. Recommend a rich representation of resolved values
without specifying any constraints on how these values
are used.
(This is the approach in [PR 645](https://github.com/unicode-org/message-format-wg/pull/645).)
1. Restrict function composition for built-in functions
(in order to prevent unintuitive behavior).

## Acknowledgments

This document incorporates comments and suggestions from Elango Cheran, Mark Davis, and Markus Scherer.
