# Design Proposal Template

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@aphillips</dd>
		<dt>First proposed</dt>
		<dd>2023-09-13</dd>
		<dt>Pull Request</dt>
		<dd>#475</dd>
	</dl>
</details>

## Objective

_What is this proposal trying to achieve?_

Implementations will provide the functions and function options
mandated by the default registry.
We expect that these functions and their options will serve many of the
core needs for MF2 developers.
However, there are many capabilities available in formatting libraries
or operating environments that could be useful to developers and translators.
In addition, we expect to provide support for markup and templating regimes.
These need to be implemented using values not found in the default registry.

An additional hope is that a robust ecosystem of function libraries are created
which can be accessed by developers and composed together to suit the needs
of various applications.

To that end, we need to define how externally authored functions
appear in message;
how externally authored function options (and their values)
can be supported;
and what, if any, affects this has the on the namespace.

## Background

_What context is helpful to understand this proposal?_

## Use-Cases

_What use-cases do we see? Ideally, quote concrete examples._

- Developers need to add options to the base functions to suit local needs.
  For example, ICU4J supports date formatting skeletons, but these are not
  included in the default version of `:datetime`.
  Support for this option needs to be specified for local implemented versions.

- Developers want to write a function and access it from messages.

- Developers want to import 3rd party formatting packages and use their
  features from within messages.

- Developers wish to import two or more formatting packages
  and these night have the same-named functions.
  For example, there might be both an HTML `p` and TTS `p`
  function.

## Requirements

_What properties does the solution have to manifest to enable the use-cases above?_

- Be able to use a variable more than once in a pattern...
- Be able to use a variable in a selector...
- Be able to reorder a variable...
- Be able to tell what a variable refers to...
- Make migration from ICU MF1 possible...

## Constraints

_What prior decisions and existing conditions limit the possible design?_

- A syntactical prefix must not collide with `nmtoken`, to avoid parsing ambiguities with unquoted literals...

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

...

## Alternatives Considered

_What other solutions are available?_
_How do they compare against the requirements?_
_What other properties they have?_

### Use unnamed placeholders...

For example: `{Hello, {$}!}`...

- **Use more than once?** No.
- **Use in selectors?** No.
- **Reorder?** No.
- **Clear what the variable refers to?** No.
- **Migration from MF1 possible?** Yes.

### Use indexed placeholders...

For example: `{Hello, {$1}!}`...

- **Use more than once?** Yes.
- **Use in selectors?** Yes.
- **Reorder?** Yes.
- **Clear what the variable refers to?** No.
- **Migration from MF1 possible?** Yes.
