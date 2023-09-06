# Selection on Numerical Values

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@eemeli</dd>
		<dt>First proposed</dt>
		<dd>2023-09-06</dd>
		<dt>Pull Request</dt>
		<dd>#000</dd>
	</dl>
</details>

## Objective

Define how selection on numbers happens.

## Background

As discussed on numerous past occasions and explicitly identified in
<a href="https://github.com/unicode-org/message-format-wg/pull/457">#457</a>,
it would be good for both plural and non-plural match selection to be supported in MF2.

MF1 supported selection on either cardinal plurals or ordinal numbers,
via the `plural` and `selectordinal` selectors.
It also customized this selection beyond the capabilities of `com.ibm.icu.text.PluralRules`
by allowing for an `offset` parameter.

As pointed out by <a href="https://github.com/mihnita">@mihnita</a> in particular,
category selection is not always appropriate for selection on a number:
the number may be representing some completely other quantity,
such as a four-digit year or the integer value of an enumerator.

Furthermore, as pointed out by <a href="https://github.com/ryzokuken">@ryzokuken</a>
in <a href="https://github.com/unicode-org/message-format-wg/pull/457#discussion_r1307443288">#457 (comment)</a>,
ordinal values are not truly "plural",
even if they use categories with similar names and are determined by similar rules.

## Use-Cases

Put together, we have thus identified three different types of selection
we would like to support on numeric values:

- cardinal plural selection
- ordinal selection
- exact match selection

## Requirements

- Enable cardinal plural selection.
- Enable ordinal number selection.
- Enable exact match selection.
- Support relevant formatting options, such as `minimumFractionDigits`.
- Encourage developers to use the same options for formatting and selection.

## Constraints

ICU MF1 messages using `plural` and `selectordinal` should be representable in MF2.

## Proposed Design

Given that we already have a `:number`,
it makes sense to add a `<matchSignature>` to it with an option

```xml
<option name="type" values="plural ordinal exact" default="plural" />
```

The default `plural` value is presuming that to be the most common use case,
and it affords the least bad fallback when used incorrectly:
Using "plural" for "exact" still selects exactly matching cases,
whereas using "exact" for "plural" will not select LDML category matches.
This might not be noticeable in the source language,
but may cause problems in target languages that the original developer is not considering.

Additional options such as `minimumFractionDigits` and others already supported by `:number`
should also be supported.

## Alternatives Considered

An alternative approach to this problem could be to leave the `:number` `<matchSignature>` undefined,
and to define three further functions, each with a `<matchSignature>`:

- `:plural`
- `:ordinal`
- `:exact`

which would each need the same set of options as `:number`, except for `type`.

This approach would also mostly work, but it introduces new failure modes:

- If a `:number` is used directly as a selector, this should produce a runtime error.
- If a `:plural`/`:ordinal`/`:exact` is used as a formatter, this should produce a runtime error.
- Developers are less encouraged to use the same formatting and selection options.

To expand on the last of these,
consider this message:

```
match {$count :plural minimumFractionDigits=1}
when 0 {You have no apples}
when 1 {You have exactly one apple}
when * {You have {$count :number minimumFractionDigits=1} apples}
```

Here, because selection on `:number` is not allowed,
it's easy to duplicate the options because _some_ annotation is required on the selector.
It would also be relatively easy to leave out the `minimumFractionDigits=1` option from the selector,
as it's not required for the English source.

With the proposed design, this message would much more naturally be written as:

```
let $count = {$count :number minimumFractionDigits=1}
match {$count}
when 0 {You have no apples}
when 1 {You have exactly one apple}
when * {You have {$count} apples}
```

The proposed design is more robust than this alternative,
leading to fewer user mistakes and removing rather than adding new error conditions.
It guides users to making better choices without needing to be actively aware
of all the complexities different languages have.
