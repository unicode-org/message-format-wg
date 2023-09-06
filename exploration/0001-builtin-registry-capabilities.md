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

Document the capabilities that the set of _built-in functions_ included in the default _built-in registry_ would expose to the user in order to ensure it can be designed in the most minimalistic way that would still cater to the most pressing requirements, partly inspired by ICU4X and JavaScript's Intl API and backwards-compatible with MF1 in ICU4J.

## Background

Users have the ability to specify and call arbitrary custom functions in their messages thanks to the function registry.
That said, there are a number of common i18n operations that are quite universal and there's a lot of value in standardizing the usage of these common operations across the ecosystem.
This document aims to list down the basic capabilities that need to be provided to developers by a _built-in registry_.

## Use-Cases

From formatting date and time values to performing selection based on plural rules, the use cases for a minimal set of common tools standardized across implementations are virtually everywhere.
While a number of applications might require more complex functions with custom logic, a decently designed set of _built-in functions_ could significantly lower the barrier of entry as well as the need to write and maintain many custom functions.

## Requirements

Implementations are required to implement and expose the entire _built-in registry_ that would provide the capabilities in this document.

## Constraints

Like many standardized APIs out there, the biggest constraint on the resulting set of _built-in functions_ would be that until we decide to make another major update to MessageFormat, we'd not be able to make breaking changes to the function signatures since that would invalidate the promise of a consistent API across implementations and versions.

Another constraint is that since MessageFormat would be used alongside other internationalization features in many programming environments, the final interface should be somewhat consistent to reduce developer confusion.

## Proposed Design

The **_<dfn>built-in registry</dfn>_** is the set of _functions_, together with their options, that are present in every implementation.
Implementations MUST provide each of the built-in functions defined in the _built-in registry_, including all of the options.
They MAY include additional options, although implementers are cautioned to avoid options which might conflict with future standardization.
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

The alternative would be to not include any _built-in functions_, essentially outsourcing the task of curating and maintaining commonly used functions to the ecosystem.