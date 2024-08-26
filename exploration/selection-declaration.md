# Effect of Selectors on Subsequent Placeholders

Status: **Accepted**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@aphillips</dd>
		<dt>First proposed</dt>
		<dd>2024-03-27</dd>
		<dt>Pull Requests</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/755">#755</a></dd>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/824">#824</a></dd>
	</dl>
</details>

## Objective

_What is this proposal trying to achieve?_

Define what effect (if any) the _annotation_ of a _selector_ has on subsequent _placeholders_
that access the same _variable_.

## Background

_What context is helpful to understand this proposal?_

In MF2, we require that all _selectors_ have an _annotation_.
The purpose of this requirement is to help ensure that a _selector_ on a given _operand_
is working with the same value as the _formatter_ eventually used for presentation
of that _operand_.
This is needed because the format of a value can have an effect on the grammar used
in the localized _message_.

For example, in English:

> You have 1 mile to go.
> You have 1.0 miles to go.

These messages might be written as:

```
.input {$togo :integer}
.match {$togo}
0   {{You have arrived.}}
one {{You have {$togo} mile to go.}}
*   {{You have {$togo} miles to go.}}

.input {$togo :number minimumFractionDigits=1}
.match {$togo}
0   {{You have arrived.}}
one {{Unreachable in an English locale.}}
*   {{You have {$togo} miles to go.}}
```

It is tempting to want to write these as a shorthand, with the _annotation_ in the _selector_:

```
.match {$togo :integer}
0   {{You have arrived.}}
one {{You have {$togo} mile to go.}}
*   {{You have {$togo} miles to go.}}
```

## Use-Cases

_What use-cases do we see? Ideally, quote concrete examples._

1. As a user, I want my formatting to match my selector.
   This is one of the reasons why MF2 requires that selectors be annotated.
   When I write a selector, the point is to choose the pattern to use as a template
   for formatting the value being selected on.
   Mismatches between these are undesirable.

   ```
   .match {$num :number minimumFractionDigits=1}
   one {{This case can never happen in an English locale}}
   *   {{I expect this formats num with one decimal place: {$num}}}
   ```

2. As a user, I want to use the least amount of MF special syntax possible.
3. As a user, I don't want to repeat formatting, particularly in large selection matrices.
   ```
   .match {$num1 :integer} {$num2 :number minimumFractionDigits=1}
   0    0    {{You have {$num1 :integer} ({$num2 :number minimumFractionDigits=1}) wildebeest.}}
   0    one  {{You have {$num1 :integer} ({$num2 :number minimumFractionDigits=1}) wildebeest.}}
   0    *    {{You have {$num1 :integer} ({$num2 :number minimumFractionDigits=1}) wildebeest.}}
   one  0    {{ }}
   one  one  {{ }}
   one  *    {{ }}
   // more cases for other locales that use two/few/many
   *    0    {{ }}
   *    one  {{ }}
   *    *    {{ }}
   ```

4. As a user (especially as a translator), I don't want to have to modify
   declarations and selectors to keep them in sync.
   ```
   .input {$num :number minimumFractionDigits=1}
   .match {$num}
   * {{Shouldn't have to modify the selector}}
   ```
   > Note that this is currently provided for by the spec.

5. As a user, I want to write multiple selectors using the same variable with different annotations.
   How do I know which one will format the placeholder later?
   ```
   .match {$num :integer} {$num :number minimumFractionDigits=2}
   * * {{Which selector formats {$num}?}}

   .match {$num :number minimumFractionDigits=2} {$num :integer}
   * * {{Which selector formats {$num}?}}
   ```

   If both formats are needed in the message (presumably they are or why the selector), 
   how does one reference one or the other?


6. As a user I want to use the same operand for both formatting and selection,
   but use different functions or options for each.
   I don't want the options used for selection to mess up the formatting.

   For example, while LDML45 doesn't support selection on dates, 
   it's easy to conceptualize a date selector at odds with the formatter:
   ```
   .input {$d :datetime skeleton=yMMMdjm}
   .match {$d :datetime month=numeric}
   1 {{Today is {$d} in cold cold {$d :datetime month=long} (trying to select on month)}}
   * {{Today is {$d}}}
   ```

   Note that users can achieve this effect using a `.local`:
   ```
   .input {$d :datetime skeleton=yMMMdjm}
   .local $monthSelect = {$d :datetime month=numeric}
   .match {$monthSelect}
   1 {{No problem getting January and formatting {$d}}}
   * {{...}}
   ```

## Requirements

_What properties does the solution have to manifest to enable the use-cases above?_

## Constraints

_What prior decisions and existing conditions limit the possible design?_

## Proposed Design

The design alternative [Match on variables instead of expressions](#match-on-variables-instead-of-expressions)
described below is selected.

## Alternatives Considered

### Do nothing

In this alternative, selectors are independent of declarations.
Selectors also do not affect the resolved value.

Examples:
```
.input {$n :integer}
.match {$n :number minimumFractionDigits=2}
* {{Formats '$n' as an integer: {$n}}}

.match {$n :integer}
* {{If $n==1.2 formats {$n} as 1.2 in en-US}}
```

**Pros**
- No changes required.
- `.local` can be used to solve problems with variations in selection and formatting
- Supports multiple selectors on the same operand

**Cons**
- May require the user to annotate the operand for both formatting and selection.
- Can produce a mismatch between formatting and selection, since the operand's formatting
  isn't visible to the selector.

### Allow both local and input declarative selectors with immutability

In this alternative, we modify the syntax to allow selectors to 
annotate an input variable (as with `.input`)
or bind a local variable (as with `.local`).
Either variable binding is immutable and results in a Duplicate Declaration error
if it attempts to annotate a variable previously annotated.

Example:
```
.match {$input :function} $local = {$input :function}
* * {{This annotates {$input} and assigns {$local} a value.}}

.match $local1 = {$input :function} $local2 = {$input :function2}
* * {{This assigns two locals}}

.input {$input :function}
.local $local = {$input :function}
.match {$input :function} {$local :function}
* * {{This produces two duplicate declaration errors.}}
```

The ABNF change looks like:
```abnf
selector          = expression / declaration
declaration       = s variable [s] "=" [s] expression
```

**Pros**
- Shorthand is consistent with the rest of the syntax
- Shorthand version works intuitively with minimal input
- Preserves immutability
- Produces an error when users inappropriately annotate some items

**Cons**
- Selectors can't provide additional selection-specific options
  if the variable name is already in scope
- Doesn't allow multiple selection on the same operand, e.g.
  ```
  .input {$date :datetime skeleton=yMdjm}
  .match {$date :datetime field=month} {$date :datetime field=dayOfWeek}
  * * {{This message produces a Duplicate Declaration error
        even though selection is separate from formatting.}}
  ```
  However, this design does allow for a local variable to be easily created
  for the purpose of selection.

### Allow _immutable_ input declarative selectors

In this alternative, selectors are treated as declaration-selectors.
That is, an annotation in a selector works like a `.input`.
This permits `.match` selectors to be a shorthand when no declarations exist.
The option does not permit local variable declaration.

It is not an error to re-declare a variable that is in scope.
Instead the selector's annotation replaces what came before.

```
.input {$num :integer}
.match {$num :number minimumFractionDigits=1}
* {{Formats {$num} like 1.0}}
```

**Pros**
- Shorthand version works intuitively with minimal typing.

**Cons**
- Violates immutability that we've established everywhere else

### Allow _mutable_ input declarative selectors

In this alternative, selectors are treated as declaration-selectors.
That is, an annotation in a selector works like a `.input`.
However, it is an error for the selector to try to modify a previous declaration
(just as it is an error for a declaration to try to modify a previous declaration).
This permits `.match` selectors to be a shorthand when no declarations exist.

It is also an error for a selector to modify a previous selector.
This implies that multiple selecton on the same operand is pointless.

```
.match {$num :integer}
* {{Formats {$num} as integer}}

.input {$num :integer}
.match {$num :number maximumFractionDigits=0}
* {{This message produces a Duplicate Declaration error}}

.input {$num :integer} {$num :number}
* * {{This message produces a Duplicate Declaration error}}
```

**Pros**
- Shorthand version works intuitively with minimal typing
- Preserves immutability
- Produces an error when users inappropriately annotate some items

**Cons**
- Selectors can't provide additional selection-specific options
  if the value has already been annotated
- Doesn't allow multiple selection on the same operand, e.g.
  ```
  .input {$date :datetime skeleton=yMdjm}
  .match {$date :datetime field=month} {$date :datetime field=dayOfWeek}
  * * {{This message produces a Duplicate Declaration error
        even though selection is separate from formatting.}}
  ```

### Match on variables instead of expressions

In this alternative, the `.match` syntax is simplified
to work on variable references rather than expressions.
This requires users to declare any selector using a `.input` or `.local` declaration
before writing the `.match`:

```
.input {$count :number}
.match $count
one {{You have {$count} apple}}
* {{You have {$count} apples}}

.local $empty = {$theList :isEmpty}
.match $empty
true {{You bought nothing}}
* {{You bought {$theList}!}}
```

The ABNF change would look like:
```diff
 match-statement   = match 1*([s] selector)
-selector          = expression
+selector          = variable
```

**Pros**
- Overall the syntax is simplified.
- Preserves immutability.

**Cons**
- A separate declaration is required for each selector.

### Provide a `#`-like Feature

(Copy-pasta adapted from @eemeli's proposal in #736)

Make the `.match` expression also act as implicit declarations accessed by index position:

```
.match {$count :number}
one {{You have {$0} apple}}
* {{You have {$0} apples}}
```

Assigning values to `$0`, `$1`, ... would not conflict with any input values, 
as numbers are invalid `name-start` characters.
That's by design so that we encourage at least _some_ name for each variable; 
here that's effectively provided by the `.match` expressions.

ABNF would be modified:
```diff
-variable = "$" name
+variable = "$" (name / %x30-39)
```

...with accompanying spec language making numeric variables resolve to the `.match` selectors in placeholders, 
and a data model error otherwise.

**Pros**
- More ergonomic for most `.input` cases
- Enables representation of many messages without any declarations

### Hybrid approach: Match may mutate, no duplicates

In this alternative, in a `.match` statement:

1. variables are mutated by options
2. no variable can occur twice

This keeps most message more concise, producing the expected results in Example 1.

#### Example1.

```
.match {$count :integer}
one {{You have {$count} whole apple.}}
* {{You have {$count} whole apples.}}
```
is precisely equivalent to:
```
.local $count2 {$count :integer}
.match {$count2}
one {{You have {$count2} whole apple.}}
* {{You have {$count2} whole apples.}}
```

This avoids the serious problems with mismatched selection and formats
as in Example 2, whereby the input of `count = 1.2`, 
results the malformed "You have 1.2 whole apple."

#### Example 2.

```.match {$count :integer}
one {{You have {$count} whole apple.}}
* {{You have {$count} whole apples.}}
```

Due to clause 2, this requires users to declare any selector using a `.input` or `.local` declaration
before writing the `.match`. That is, the following is illegal.
```
.match {$count <anything>}{$count <anything>}
The message author is required to rewrite it explicitly, eg to:
```
It would need to be rewritten as something along the lines of:
```
.local $count3 {$count}
.match {$count <anything1>}{$count3 <anything2>}
```
The number of times the same variable is used twice in a match (or the older Select) is vanishingly small. Since it is an error — and the advice to fix is easy — that will prevent misbehavior.

There would be no change to the ABNF; but there would be an additional constraint in the spec.

**Pros**
- No new syntax is required
- Preserves immutability before and after the .match statement
- Avoids the serious problem of mismatch of selector and format of option "Do Nothing"
- Avoids the extra syntax of option "Allow both local and input declarative selectors with immutability"
- Avoids the problem of multiple variables in "Allow immutable input declarative selectors"
- Is much more consise than "Match on variables instead of expressions", since it doesn't require a .local or .input for every variable with options
- Avoids the readability issues with "Provide a #-like Feature"

**Cons**
- Requires additional .local in cases where a variable would occur twice, such as .match {$date option=monthOnly}{$date option=full} 


