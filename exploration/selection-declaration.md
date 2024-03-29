# Effect of Selectors on Subsequent Placeholders

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@aphillips</dd>
		<dt>First proposed</dt>
		<dd>2024-03-27</dd>
		<dt>Pull Requests</dt>
		<dd>#000</dd>
	</dl>
</details>

## Objective

_What is this proposal trying to achieve?_

Define what effect (if any) the _annotation_ of a _selector_ has on subsequent _placeholders_
that access the same _operand_ value.

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

**Multiple Selection Conflicts**
If a user writes multiple selectors for the same operand, which one formats the placeholder?

```
.match {$num :integer} {$num :number minimumFractionDigits=2}
* * {{Which selector formats {$num}?}}

.match {$num :number minimumFractionDigits=2} {$num :integer}
* * {{Which selector formats {$num}?}}
```

If both formats are needed in the message, how does one reference one or the other?

**Selection Different From Format**
We don't support selection on dates in LDML45, but it's easy to conceptualize.
How can a user write a _selector_ that doesn't mess up a _formatter_?

```
.input {$d :datetime skeleton=yMMMdjm}
.match {$d :datetime month=numeric}
1 {{Today is {$d} in cold cold January}}
* {{Today is {$d}}}
```

## Requirements

_What properties does the solution have to manifest to enable the use-cases above?_

## Constraints

_What prior decisions and existing conditions limit the possible design?_

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

## Alternatives Considered

_What other solutions are available?_
_How do they compare against the requirements?_
_What other properties they have?_
