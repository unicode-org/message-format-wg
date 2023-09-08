# Capabilities for built-in registry

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@ryzokuken</dd>
		<dt>First proposed</dt>
		<dd>2023-08-22</dd>
		<dt>Pull Request</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/457">#457</a></dd>
	</dl>
</details>

## Objective

Document the set of capabilities needed by the _built-in registry_ in order to provide a reasonably complete set of
functions.
This includes ensuring sufficient compatibility with the various functions available in ICU4X, JavaScript `Intl` as well
as MessageFormat v1.

## Background

Users have the ability to specify and call arbitrary custom functions in their messages thanks to the function registry.
That said, there are a number of common i18n operations that are quite universal and there's a lot of value in
standardizing the usage of these common operations across the ecosystem.
This document aims to list down the basic capabilities that implementations need to be provide in a _built-in registry_.

## Use-Cases

From formatting date and time values to performing selection based on plural rules, the use cases for a minimal set of
common tools standardized across implementations are virtually everywhere.
While a number of applications might require more complex functions with custom logic, a well-provisioned default
registry could significantly lower the barrier of entry as well as the need to write and maintain many custom functions.

## Requirements

Implementations are required to implement and expose the entire _built-in registry_ that would provide the capabilities
in this document.

## Constraints

Like many standardized APIs out there, the biggest constraint on the resulting _built-in registry_ would be that until
we decide to make another major update to MessageFormat, we'd not be able to make breaking changes to the function
signatures since that would invalidate the promise of a consistent API across implementations and versions.

Another constraint is that since MessageFormat would be used alongside other internationalization features in many
programming environments, the final interface should be somewhat consistent to reduce developer confusion.

## Proposed Design

The **_<dfn>built-in registry</dfn>_** is the set of functions, together with their options, that are present in every
implementation.
Implementations MUST provide each of the functions defined in the _built-in registry_, including all of the options.
The ouptut of each function is implementation-defined.
They MAY include additional options, although implementers are cautioned to avoid options which might conflict with
future standardization.
These include the following capabilities:

- Formatting the following types of data in a locale-sensitive manner:
  - Dates and times
  - Numbers
  - Lists
- Selecting between pattern strings in a locale-sensitive manner based on:
  - String equality
  - Plural rules
  - Ordinality

## Alternatives Considered

The working group has considered a number of ways to address core functionality. These include:

**No default registry** Each implementation would be free to define its own set of functions and options for each.
- (+) Each implementation would be able to define functions and options according to existing I18N APIs which would be
familiar to users in that language or runtime
- (-) Messages would not be portable between implementations
- (-) Users would have to learn the variations between implementations
- (-) Tooling would have to be adjusted for each variation

**Informative registry** The default registry could be made informative with implementations allowed to pick-and-choose
(or ignore) entries.
This would provide better interoperability for implementations claiming to implement the default registry, while
allowing platform-specific variation.

**Non-extensible registry entries** Like this design, but not allowing implementation specific options.
