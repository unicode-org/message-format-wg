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

In MFv2, we require that all _selectors_ have an _annotation_.

Ideally, a _selector_ and a _formatter_ for the same _function_ operating on the same _operand_ 
use the same options.

```
.input {$num :number minimumFractionDigits=2}
.match {$num}
one {{Unreachable in English locale}}
*   {{This prints {$num} with two decimal places.}}
```

It is tempting to want to write this as a shorthand:

```
.match {$num :number minimumFractionDigits=2}
one {{Unreachable...}}
*   {{This prints {$num} with two decimal places.}}
```

## Use-Cases

_What use-cases do we see? Ideally, quote concrete examples._

**Multiple Selection Conflicts**
If a user writes multiple selectors for the same operand, which one formats the placeholder?

```
.match {$num :integer} {$num :number minimumFractionDigits=2}
* * {{What is printed for {$num}?}}

.match {$num :number minimumFractionDigits=2} {$num :integer}
* * {{What is printed for {$num}?}}
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
