# Formatting Percent Values

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@aphillips</dd>
		<dd>@eemeli</dd>
		<dt>First proposed</dt>
		<dd>2025-04-07</dd>
		<dt>Pull Requests</dt>
		<dd>#1068</dd>
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
> In ICU4J:
> - MessageFormat (MF1) scales.
> - MeasureFormat does not scale.
>
> In JavaScript:
> - `Intl.NumberFormat(locale, { style: 'percent' })` scales
> - `Intl.NumberFormat(locale, { style: 'unit', unit: 'percent' })` does not scale

It is also possible for Unicode MessageFormat to provide support for scaling in the message itself.
Since we've removed the `:math` function (at least for now), this would have to be through either
the re-introduction of `:math` or through a specialized scaling function.

An addition concern is whether to add a dedicated `:percent` function,
use one of the existing number-formatting functions `:number` and `:integer` with an option `type=percent`,
or use the proposed _optional_ function `:unit` with an option `unit=percent`.
Combinations of these approached might also be used.

### Unit Scaling

This section describes the scaling behavior of ICU's `NumberFormatter` class and its `unit()` method,
which is one model for how Unicode MessageFormat might implement percents and units.
There is a difference between _input_ scaling and _output_ scaling in ICU's `NumberFormatter`.

For example, an input of <3.5, `meter`> with `meter` as the output unit doesn't scale.

If one supplies <0.35 `percent`> as the input and the output unit were `percent`, 
`MeasureFormat` would format as 0.35%. 
Just like `meter` ==> `meter` doesn't scale.

However, if one supplies a different input unit, then percent does scale 
(just like `meter` ==> `foot`). 
The base unit for such dimensionless units is called 'part'.
In MF, a bare number literal, such as `.local $foo = {35}`
or an implementation-specific number type (such as an `int` in Java)
might be considered to use the input unit of `part`
unless we specified that the `percent` unit value or `:percent` function overrode the `part` unit with `percent`.
 
With <0.35 `part`> as the input and the output unit of `percent`, the format is "35%".

| Amount | Input Unit | Formatted Value with... | Unit |
|---|---|---|---|
| 0.35 | part | 0.35 | part |
| 0.35 | part | 35.0 | percent |
| 0.35 | part | 350.0 | permille |
| 0.35 | part | 3500.0 | permyriad |
| 0.35 | part | 350000.0 | part-per-1e6 |
| 0.35 | part | 3.5E8 | part-per-1e9 |

## Use-Cases

_What use-cases do we see? Ideally, quote concrete examples._

Developers wish to write messages that format a numeric value as a percentage in a locale-sensitive manner.

The numeric value of the operand is not pre-scaled because it is the result of a computation, 
e.g. `var savings = discount / price`.

The numeric value of the operant is pre-scaled, 
e.g. `var savingsPercent = 50`

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

- **Be consistent**
  - Any solution for scaling percentages should be a model for other, similar scaling operations,
     such as _per-mille_ or _per-myriad_,
     as well as other, non-percent or even non-unit scaling.
     This does not mean that a scaling mechanism or any particular scaling mechanism itself is a requirement.
  - Any solution for formatting percentages should be a model for solving related problems with:
    - per-mille
    - per-myriad
    - compact notation
    - scientific notation
    - (others??)

## Constraints

_What prior decisions and existing conditions limit the possible design?_

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

TBD

## Alternatives Considered

_What other solutions are available?_
_How do they compare against the requirements?_
_What other properties they have?_

### Combinations of Functions and Scaling

Any proposed design needs to choose one or more functions
each of which has a scaling approach
or a combination of both.
It is possible to have separate functions, one that is scaling and one that is non-scaling.

Some working group members suspect that having a function that scales and one that does not
would represent a hazard,
since users would be forced to look up which one has which behavior.

Other working group members have expressed that the use cases for pre-scaled vs. non-pre-scaled are separate
and that having separate functions for these is logically sensible.

### Function Alternatives

#### Use `:unit`

Leverage the `:unit` function by using the existing unit option value `percent`.
The ICU implementation of `MeasureFormat` does **_not_** scale the percentage,
although this does not have to be the default behavior of UMF's percent unit format.

```
You saved {$savings :unit unit=percent} on your order today!
```

The `:unit` alternative could also support other unit-like alternatives, such as
_per-mille_ and _per-myriad_ formatting.
It doesn't fit as cleanly with other notational variations left out of v47, such as
compact notation (1000000 => 1M, 1000 => 1K),
or scientific notation (1000000 => 1.0e6).

_Pros_
- Uses an existing set of functionality
- Might provide a more consistent interface for formatting "number-like" values
- Keeps percentage formatting out of `:number` and `:integer`, limiting the scope of those functions

_Cons_
- `:unit` won't be REQUIRED, so percentage format will not be guaranteed across implementations.
  Requiring `:unit unit=percent` would be complicated at best.
- Implementation of `:unit` in its entirely requires significantly more data than implementation of
  percentage formatting.
- More verbose placeholder

---

#### Use `:number`/`:integer` with `style=percent`

Use the existing functions for number formatting with a separate `style` option for `percent`.
(This was previously the design)

```
You saved {$savings :number style=percent} on your order today!
```

_Pros_
- Consistent with ICU MessageFormat

_Cons_
- It's the only special case remaining in these functions,
  unless we also restore compact, scientific, and other notational variations.

---

#### Use a dedicated `:percent` function

Use a new function `:percent` dedicated to percentages.

```
You saved {$savings :percent} on your order today!
```

> [!NOTE]
> @sffc suggested that we should consider other names for `:percent`.
> The name shown here could be considered a placeholder pending other suggestions.

_Pros_
- Least verbose placeholder
- Clear what the placeholder does; self-documenting
- Consistent with separating specialized formats from `:number`/`:integer`
  as was done with `:currency`
- Makes it possible to apply a `scaling` option to only percent formatting.

_Cons_
- Adds to a (growing) list of functions
- Not "special enough" to warrant its own formatter?
- Adds yet another numeric function, with its own subset of numeric function options.

---

#### Use a generic scaling function

Use a new function with a more generic name so that it can be used to format other scaled values.
For example, it might use an option `unit` to select `percent`/`permille`/etc.

```
You saved {$savings :dimensionless unit=percent} on your order today!
You saved {$savings :scaled per=100} on your order today!
```

_Pros_
- Could be used to support non-percent/non-permille scales that might exist in other cultures
- Somewhat generic
- Unlike currency or unit values, "per" units do not have to be stored with the value to prevent loss of fidelity,
  since the scaling is done to a plain old number.
  This would not apply if the values are not scaled.

_Cons_
- Only percent and permille are backed with CLDR data and symbols.
  Other scales would impose an implementation burden.
- More verbose. Might be harder for users to understand and use.

### Scaling Alternatives

#### No Scaling
User has to scale the number. 
The value `0.5` formats as `0.5%`

> Example.
> ```
> .local $pctSaved = {50}
> {{{$pctSaved :percent}}}
> ```
> Prints as `50%`.

#### Always Scale
Implementation always scales the number. 
The value `0.5` formats as `50%`

> Example.
> ```
> .local $pctSaved = {50}
> {{{$pctSaved :percent}}}
> ```
> Prints as `5,000%`.

#### Optional Scaling
Function automatically does (or does not) scale,
but there is an option to switch to the non-default behavior.
Such an option might be:
- An option with a name like `scaling` with boolean-like values `true` and `false`
- An option with a name like `scale` with 
  digit size option values
  limited to a small set of supported values (possibly only `1` and `100`)

> Example. Note that `scale=false` is only to demonstrate switching.
>```
> .local $pctSaved = {50}
> {{{$pctSaved :percent} {$pctSaved :percent scale=false}}}
>```
> Prints as `5,000% 50%` if `:percent` is autoscaling by default

#### Provide scaling via a function
Regardless of the scaling done by the percent formatting function, 
there might need to be an in-message mechanism for scaling/descaling values.
The function `:math` was originally proposed to support offsets in number matching/formatting,
although the WG removed this proposal and replaced with with an `:offset` function in May 2025.
Reintroducing `:math` to support scaling
or the proposal of a new function dedicated to scaling might address the need for value adjustment.

> Example using `:math` as a hypothetical function name
>```
> .local $pctSaved = {0.5}
> .local $pctScaled = {$pctSaved :math exp=2}
> {{{$pctSaved :percent} {$pctScaled :unit unit=percent}}}
>```
> Prints as `50% 50%` if `:percent` is autoscaling by default and `:unit` is not.

_Pros_
- Users may find utility in performing math transforms in messages rather than in business logic.
- Should be easy to implement, given that basic math functionality is common
 
_Cons_
- Implementation burden, especially when providing generic mathematical operations
- Designs should be generic and extensible, not tied to short term needs of a given formatter.
- Potential for abuse and misuse is higher.
- "Real" math utilities or classes tend to have a long list of functions with many capabilities.
  A complete implementation would require a lot of design work and effort or introduce
  instability into the message regime as new options are introduced over time.
  Compare with `java.lang.Math`

Two proposals exist for `:math`-like scaling:

##### Use `:math exp` (`:exp`??) to scale
Provide functionality to scale numbers with integer powers of 10 using the `:math` function.

Examples using `:unit`, each of which would format as "Completion: 50%.":
```
.local $n = {50}
{{Completion: {$n :unit unit=percent}.}}

.local $n = {0.5 :math exp=2}
{{Completion: {$n :unit unit=percent}.}}
```

_Pros_
- Avoids multiplication of random values
- Useful for other scaling operations

_Cons_
- Cannot use _digit size option_ as the `exp` option value type, since negative exponents are a Thing


##### Use `:math multiply` (`:multiply`??) to scale
Provide arbitrary integer multiplication functionality using the `:math` function.

Examples using `:unit`, each of which would format as "Completion: 50%.":
```
.local $n = {50}
{{Completion: {$n :unit unit=percent}.}}

.local $n = {0.5 :math multiply=100}
{{Completion: {$n :unit unit=percent}.}}
```

_Pros_
- Can be used for other general purpose math

_Cons_
- Increases implementation burden: multiplication must be handled on arbitrary numeric input types

---

### Why not both?

Rather than choosing only one option, choose multiple parallel solutions:

- REQUIRE the `:unit` function for all implementations
  - Only specific `unit` option values are required, initially the unit `percent`.
  - The function `:unit unit=percent` does not scale the operand, e.g. `{5 :unit unit=percent}` formats as `5%`.
- REQUIRE the `:number` function to support `style=percent` as an option
  - The function `:number`scales the operand, e.g. `{5 :number style=percent}` formats as `500%`.
    Note that the selector selects on the scaled value
    (selectors currently cannot select fractional parts)

> Examples. These are equivalent **except** that `:unit` does NOT scale.
>```
> {{You have {$pct :number style=percent} remaining.}}
> {{You have {$scaledPct :unit unit=percent} remaining.}}
>```
> Selector example:
>```
> .local $pct = {0.05 :number style=percent}
> .match $pct
> 5   {{This pattern is selected}}
> one {{You have {$pct} left.}}
> *   {{You have {$pct} left.}}
>``` 
