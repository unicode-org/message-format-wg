# Variable Namespacing and Mutability

Status: **Accepted**

<details>
	<summary>Variable Namespacing and Mutability</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@aphillips</dd>
		<dd>@eemeli</dd>
		<dt>First proposed</dt>
		<dd>2023-09-04</dd>
		<dt>Pull Request</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/469">#469</a></dd>
	</dl>
</details>

## Objective

_What is this proposal trying to achieve?_

Describe how variables are named and how externally passed variables
and internally defined variables interact.

## Background

_What context is helpful to understand this proposal?_

- [Issue 310](https://github.com/unicode-org/message-format-wg/issues/310)

The term **local variable** refers to a value that is defined in a declaration.

The term **external variable** refers to a value that is passed to the
message formatter by name and which can be referred to in an expression.

## Use-Cases

_What use-cases do we see? Ideally, quote concrete examples._

- Users want to reference external variables in expressions.
- Users can modify external variables using declarations.
  For example, they can perform a text transformation or assign reusable formatting options.

  > ```
  > let $foo = {$bar :uppercase}
  > let $baz = {$someNumber :number groupingUsed=false}
  > ```

- Users, such as translators, want to annotate a variable
  (either local or external) without invalidating
  existing use of the variable in pattern strings.
  This saves the effort of finding and fixing all occurences
  in the various pattern strings, as well as issues that could arise from
  (for example) translation memory systems recalling the old expression.
  For example:

  > ```
  > let $foo = {$foo :transform}
  > match {$a :plural} {$b :plural}
  > when 0   0   {...{$foo}...}
  > when 0   one {...{$foo}...}
  > when 0   *   {...{$foo}...}
  > when one 0   {...{$foo}...}
  > when one one {...{$foo}...}
  > when one *   {...{$foo}...}
  > when *   0   {...{$foo}...}
  > when *   one {...{$foo}...}
  > when *   *   {...{$foo}...}
  > ```

- Users want to perform multiple transforms on a value.
  Since our syntax does not permit embedding or chaining, this requires multiple declarations.

  > ```
  > let $foo = {$foo :text-transform transform=uppercase}
  > let $foo = {$foo :trim}
  > let $foo = {$foo :sanitize target=html}
  > ```
  >
  > This can also be achieved by renaming:
  >
  > ```
  > let $foo1 = {$foo :text-transform transform=uppercase}
  > let $foo2 = {$foo1 :trim}
  > let $foo3 = {$foo2 :sanitize target=html}
  > ```

- Users want to annotate external variables or literals:

  > ```
  > let $fooAsNumber = {$foo :number}
  > let $anotherNumber = {42 :number}
  > ```

- Users may wish to provide complex annotations which are reused across mulitple patterns

  > ```
  > let $count = {$count :number}
  > let $date = {$date :datetime dateStyle=long}
  > match {$count}
  > when 1 {You received one message on {$date}}
  > when * {You received {$count} messages on {$date}}
  > ```

- Implementers need to know what value is associated with a named variable, see #299.

- Users would like their tooling to identify, perhaps via static analysis, when
  they have mistyped or used an undeclared local variable.

- Users would like to be able to create local variables without accidentially
  overwriting external values. (The inverse of this, in which the declaration
  overwrites an external value, can be difficult to debug if it occurs in,
  for example, just one of many different localized string variations.)

## Requirements

_What properties does the solution have to manifest to enable the use-cases above?_

These were taken from a comment by @stasm in #310:

- Be able to re-annotate variables without having to rename them in the message body
- Allow static analysis to detect mistakes when referencing an undefined local variable
- Be able to re-annotate variables multiple times (because we do not allow nesting)

- _more needed?_

## Constraints

_What prior decisions and existing conditions limit the possible design?_

- Variable names are potentially contrained by `Nmtoken`.
  The reason we chose Nmtoken (and Name) was to maximize compatibility with (potential)
  LDML constructs, since CLDR uses XML.
  The "carve out" for various sigils doesn't conflict with naming in LDML currently and
  future conflicts are under our (CLDR-TC's) control.

## Proposed Design

Let us introduce a new keyword `input` that allows for the annotation of external variables.
It works like this:

```
input {$count :number}
input {$date :datetime dateStyle=long}
match {$count}
when 1 {You received one message on {$date}}
when * {You received {$count} messages on {$date}}
```

This effectively replaces the current "hack" of saying `let $foo = {$foo ...}`,
and provides a way to explicitly declare that a variable is non-local:
`input {$bar}` doesn't require an annotation.

To correspond with "input",
let us also change the local variable declaration keyword to be `local` rather than `let`.

At the syntax/data model level,
`input` or `local` declarations would not be required for all selectors and placeholders,
but a user-configured validator could of course be stricter.

In the ABNF the change would look like this:

```abnf
message = [s] *(declaration [s]) body [s]
declaration = input-declaration / local-declaration

input-declaration = input [s] "{" [s] variable [s annotation] [s] "}"
input = %x69.6E.70.75.74  ; "input"

local-declaration = local s variable [s] "=" [s] expression
local = %x6C.6F.63.61.6C  ; "local"
```

The _expression_ rule can't be used directly in _input-declaration_ because the _variable_ is required.

With this approach, variables are immutable,
so each may be defined by only one _declaration_.

References to later declarations are not allowed,
so this is considered an error:

```
local $foo = {$bar :number}
local $bar = {42 :number}
{The answer is {$foo}}
```

Note that this means that `input` declarations can (and sometimes _must_)
follow `local` ones, such as when an `input` is annotated using a `local` value:

```
local $foo = {|2| :number}
input $bar :number maxFractionDigits={$foo}
```

An _input-declaration_ is not required for each external variable.
A _local-declaration_ takes precedence and does not cause an error
if an identically named external variable is passed to the formatter
_without_ a corresponding _input-declaration_ in the message.

The use case of chaining operations on a variable with a single name is not supported here,
and the `$foo1`, `$foo2` `$foo3` sorts of names would be required for that.

> The examples given above would be written as follows:
>
> ```
> local $foo = {$bar :uppercase}
> local $baz = {$someNumber :number groupingUsed=false}
> ```
>
> ```
> input {$foo :transform}
> match {$a :plural} {$b :plural}
> when 0   0   {...{$foo}...}
> when 0   one {...{$foo}...}
> when 0   *   {...{$foo}...}
> when one 0   {...{$foo}...}
> when one one {...{$foo}...}
> when one *   {...{$foo}...}
> when *   0   {...{$foo}...}
> when *   one {...{$foo}...}
> when *   *   {...{$foo}...}
> ```
>
> ```
> input {$foo :text-transform transform=uppercase}
> local $foo2 = {$foo :trim}
> local $foo3 = {$foo2 :sanitize target=html}
> ```
>
> ```
> local $fooAsNumber = {$foo :number}
> local $anotherNumber = {42 :number}
> ```
>
> ```
> input {$count :number}
> input {$date :datetime dateStyle=long}
> match {$count}
> when 1 {You received one message on {$date}}
> when * {You received {$count} messages on {$date}}
> ```

## Alternatives Considered

### Original Proposal

Separate local variables from externally passed values by altering the sigil
and by using a visually distinctive pattern for local names
(in an effort to prevent `$foo`/`@foo` confusion).

```abnf
variable     = local_var / external_var
local_var    = "#_" name
external_var = "$" name
```

> _Example_
>
> ```
> let #_local = {$external :transform}
> let #_anotherLocalVar = {|Some literal| :annotated}
> ```

To allow users to perform multiple annotations on a value,
while still allowing detection of unintentional reassignment,
introduce a new keyword `modify`:

```abnf
declaration = (let / modify) s variable [s] "=" [s] expression
...
modify = %6D.%6F.%64.%69.%66.%79
```

It is a syntax error to use `let` on a variable that has been previously
assigned through any declaration (either `let` or `modify`)

It is a variable resolution error to call `modify`
on an external variable that does not exist.

> _Example_
>
> ```
> let #_local = {$external :transform}
> modify #_local = {#_local :modification with=options}
> modify $external = {$external :transform adding=annotation}
> ```

When more than one `modify` declaration applies to the same named variable,
or when a `modify` declaration is applied to a local variable
defined in a `let` declaration,
the named variable behaves as if each declaration were called
in the sequence in which they appear in the message.
Implementations are not required (by this design, anyway)
to resolve values in a greedy manner.
They might not resolve a value unless it is actually used in a selector
or in a placeholder.

#### Sigil Choice for Local Variables

The choice here of `#_` as the local variable sigil is probably not distinctive enough.
It is probably okay to be a little inconvenient with local variable naming
as these are less common than external variables.
Alternatives to consider:

- `##foo`
- `#foo#`
- `#!foo`
- `#ONLY_UPPER_ASCII_SNAKE`

Note: if we have separate namespaces then local variables don't
require Unicode names because their namespace is not subject
to external data requirements.

A different option is to say: it is up to the user to avoid using
declared names that would confuse translators and others.
This would mean that we provide no defense on the syntax level.

### All Variables are Mutable; Shared Namespace

**This is the current design.**
A declaration can overwrite any passed in (external) value,
either by adding annotation
or by completely replacing the value.
Further, one declaration can modify or completely overwrite a previous annotation.

There are no warnings or errors produced when this occurs, even when it is unintentional.

If variables are mutable and namespaces are shared, it's easy to write a message that never
fails but does produce unintended or unexpected results (from the caller's point of view).

```
{"arg1": "10000"}
...
let $arg1 = {42}
{This always says {$arg1} == 42}
```

### All Variables are Mutable; Non-shared Namespace

If variables are mutable but namespaces are not shared, its easy for developers or translators to reference the wrong one:

```
{"arg1": "10000"}
...
let #arg1 = {42 :number maxFractionDigits=2}
{This always says {$arg1} == 10000 because it should say {#arg1}}
```

### All Variables are Immutable; Shared Namespace

If we make all variables immutable and external and local vars share a namespace,
passing an argument that shares a name with a local declaration can cause a message to fail.

```
{ "arg1": "37"}
...
let $arg1 = {|42| :number maxFractionDigits=2}  // error
```

### All Variables are Immutable; Non-shared Namespace

If we make all variables immutable but external and local vars do not share a namespace,
this problem goes away. However, a local variable cannot be used to augment or annotate an external variable.

```
{ "arg1": "42" }
...
let #arg1 = {$arg1 :number maxFractionDigits=2}
{Now I have to change {$arg} to {#arg}...}
```
