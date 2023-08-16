# Design Proposal Template

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@username</dd>
		<dt>First proposed</dt>
		<dd>1970-01-01</dd>
		<dt>Pull Request</dt>
		<dd>#000</dd>
	</dl>
</details>

## Objective

*What is this proposal trying to achieve?*

Decide how to interpolate data in patterns, in order to be able to display dynamic information like numbers, dates, and names inside translatable messages.

## Background

*What context is helpful to understand this proposal?*

Translatable messages need to interpolate data...
Such data must be formatted and positioned inside translation patterns...
There's prior art in other translation and templating solutions...

## Use-Cases

*What use-cases do we see? Ideally, quote concrete examples.*

* Numbers representing counts, e.g. `{You have {$count} new messages}`...
* Strings representing usernames, e.g. `{Hello, {$userName}!}`...
* Selection based on numbers, e.g. `match {$count} when 1 {One thing} when * {Many things}`...

## Requirements

*What properties does the solution have to manifest to enable the use-cases above?*

* Be able to use a variable more than once in a pattern...
* Be able to use a variable in a selector...
* Be able to reorder a variable...
* Be able to tell what a variable refers to...
* Make migration from ICU MF1 possible...

## Constraints

*What prior decisions and existing conditions limit the possible design?*

* A syntactical prefix must not collide with `nmtoken`, to avoid parsing ambiguities with unquoted literals...

## Proposed Design

*Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange.*

...

## Alternatives Considered

*What other solutions are available?*
*How do they compare against the requirements?*
*What other properties they have?*

### Use unnamed placeholders...

For example: `{Hello, {$}!}`...

* **Use more than once?** No.
* **Use in selectors?** No.
* **Reorder?** No.
* **Clear what the variable refers to?** No.
* **Migration from MF1 possible?** Yes.

### Use indexed placeholders...

For example: `{Hello, {$1}!}`...

* **Use more than once?** Yes.
* **Use in selectors?** Yes.
* **Reorder?** Yes.
* **Clear what the variable refers to?** No.
* **Migration from MF1 possible?** Yes.
