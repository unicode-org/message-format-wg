# Formatting Percent Values

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@aphillips</dd>
		<dt>First proposed</dt>
		<dd>2025-04-07</dd>
		<dt>Pull Requests</dt>
		<dd>#000</dd>
	</dl>
</details>

## Objective

_What is this proposal trying to achieve?_

One the capabilities present in ICU MessageFormat is the ability to format a number as a percentage.
This design enumerates the approaches considered for adding this ability as a _default function_
in Unicode MessageFormat.

## Background

_What context is helpful to understand this proposal?_

> [!NOTE]
> This design is an outgrowth of discussions in #956 and various teleconferences.

Developers and translators often need to insert a numeric value into a formatted message as a percentage.
The format of a percentage can vary by locale including
the symbol used,
the presence or absence of spaces,
the shaping of digits,
the position of the symbol,
and other variations.

One of the key problems is whether the value should be "scaled".
That is, does the value `0.5` format as `50%` or `0.5%`?
Developers need to know which behavior will occur so that they can adjust the value passed appropriately.

> [!NOTE]
> MessageFormat (MF1) in ICU4J scales.
> MeasureFormat in ICU4J does not scale.

It is also possible for Unicode MessageFormat to provide support for scaling in the message itself,
perhaps by extending the `:math` function.

An addition concern is whether to add a dedicated `:percent` function,
use one of the existing number-formatting functions `:number` and `:integer` with an option `type=percent`,
or use the proposed _optional_ function `:unit` with an option `unit=percent`.
Combinations of these approached might also be used.

## Use-Cases

_What use-cases do we see? Ideally, quote concrete examples._

Developers wish to write messages that format a numeric value as a percentage in a locale-sensitive manner.

The numeric value is not scaled because it is the result of a computation, e.g. `var savings = discount / price`.

The numeric value is scaled, e.g. `var savingsPercent = 50`

Users need control over most formatting details, identical to general number formatting:
- negative number sign display
- digit shaping
- minimum number of fractional digits
- maximum number of fractional digits
- minimum number of decimal digits
- group used (for very large percentages, i.e. > 999%)
- etc.

## Requirements

_What properties does the solution have to manifest to enable the use-cases above?_



## Constraints

_What prior decisions and existing conditions limit the possible design?_

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

- Use a dedicated function `:percent` that scales by default.
- Provide an option `scaling` with values `true` and `false` and defaulting to `true`.
- Provide all options identical to `:number` _except_ that `select` does not provide `ordinal` value.
- Allow `unit=percent` in `:unit` that is identical to `:percent` in formatting performance,
  for compatibility with CLDR units,
  but document that this usage is not preferred.

## Alternatives Considered

_What other solutions are available?_
_How do they compare against the requirements?_
_What other properties they have?_

### Function Alternatives

#### Use `:unit`

Leverage the `:unit` function by using the existing unit option value `percent`.
The ICU implementation of `MeasureFormat` does **_not_** scale the percentage,
although this does not have to be the default behavior of UMF's percent unit format.

```
You saved {$savings :unit unit=percent} on your order today!
```

**Pros**
- Uses an existing set of functionality
- Removes percentages from `:number` and `:integer`, making those functions more "pure"

**Cons**
- `:unit` won't be REQUIRED, so percentage format will not be guaranteed across implementations.
  Requiring `:unit type=percent` would be complicated at best.
- More verbose placeholder
- Could require a scaling mechanism

#### Use `:number`/`:integer` with `type=percent`

Use the existing functions for number formatting with a separate `type` option for `percent`.
(This was previously the design)

```
You saved {$savings :number type=percent} on your order today!
```

**Pros**
- Consistent with ICU MessageFormat

**Cons**
- It's the only special case remaining in these functions. Why?

#### Use a dedicated `:percent` function

Use a new function `:percent` dedicated to percentages.

```
You saved {$savings :percent} on your order today!
```

**Pros**
- Least verbose placeholder
- Clear what the placeholder does; self-documenting?

**Cons**
- Adds to a (growing) list of functions
- Not "special enough" to warrant its own formatter?

### Scaling Alternatives

#### No Scaling
User has to scale the number. The value `0.5` formats as `0.5%`

#### Scaling
Implementation always scales the number. The value `0.5` formats as `50%`

#### Optional Scaling
Implementation automatically does (or does not) scale.
There is an option to switch to the other behavior.

#### Use `:math` to scale
Provide functionality to scale numbers arbitrarily using the `:math` function.
This alternative can be used with scaling/no scaling to fix the passed value appropriately without altering userland code.
