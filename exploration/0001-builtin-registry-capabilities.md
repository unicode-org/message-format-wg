# Capabilities for built-ins

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

Document the capabilities that the set of built-in functions would expose to the user in order to ensure it can be designed in the most minimalistic way that would still cater to the most pressing requirements, partly inspired by ICU4X and JavaScript's Intl API and backwards-compatible with MF1 in ICU4J.

## Background

Users have the ability to specify and call arbitrary custom functions in their messages thanks to the function registry.
That said, there are a number of common i18n operations that are quite universal and there's a lot of value in standardizing the usage of these common operations across the ecosystem.
This document aims to list down the basic capabilities for developers that such a set of standard built-in functions MUST provide.

## Use-Cases

From formatting date and time values to performing selection based on plural rules, the use cases for a minimal set of common tools standardized across implementations are virtually everywhere. While a number of applications might require more complex functions with custom logic, a decently designed set of built-in functions could significantly lower the barrier of entry as well as the need to write many custom functions.

## Requirements

Implementations are not required to implement and expose all the built-in functions that would result from this initiative. However, they are required to strictly stick to the standardized interface for the functions they do expose.

## Constraints

Like many standardized APIs out there, the biggest constraint on the resulting set of built-in functions would be that until we decide to make another major update to MessageFormat, we'd not be able to make breaking changes to the function interfaces since that would invalidate the promise of a consistent API across implementations and versions.

Another constraint is that since MessageFormat would be used alongside other internationalization features in many programming environments, the final interface should be somewhat consistent to reduce developer confusion.

## Proposed Design

All conforming implementations of this specification MUST provide a set of <dfn>built-in functions</dfn>, which allows the developers to perform the following operations:

- Formatting the following types of data in a locale-sensitive manner:
  - Dates and times
  - Numbers
  - Lists
- Selecting between pattern strings in a locale-sensitive manner based on:
  - String equality
  - Plural rules
  - Ordinality

## Alternatives Considered

The alternative would be to not include any built-in functions, essentially outsourcing the task of curating and maintaining commonly used functions to the ecosystem. The details of how this could work out in practice are unclear.
