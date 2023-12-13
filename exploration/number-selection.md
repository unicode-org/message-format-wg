# Selection on Numerical Values

Status: **Accepted**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@eemeli</dd>
		<dt>First proposed</dt>
		<dd>2023-09-06</dd>
		<dt>Pull Request</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/471">#471</a></dd>
	</dl>
</details>

## Objective

Define how selection on numbers happens.

## Background

As discussed by the working group and explicitly identified in
<a href="https://github.com/unicode-org/message-format-wg/pull/457">discussion of #457</a>,
there is a need to support multiple types of selection on numeric values in MF2.

MF1 supported selection on either cardinal plurals or ordinal numbers,
via the `plural` and `selectordinal` selectors.
It also customized this selection beyond the capabilities of `com.ibm.icu.text.PluralRules`
by allowing for explicit value matching and an `offset` parameter.

As pointed out by <a href="https://github.com/mihnita">@mihnita</a> in particular,
category selection is not always appropriate for selection on a number:
the number may be representing some completely other quantity,
such as a four-digit year or the integer value of an enumerator.

Furthermore, as pointed out by <a href="https://github.com/ryzokuken">@ryzokuken</a>
in <a href="https://github.com/unicode-org/message-format-wg/pull/457#discussion_r1307443288">#457 (comment)</a>,
ordinal selection works similarly to plural selection, but uses a separate set of rules
for each locale.
This is visible in English, for example, where plural rules use only `one` and `other`
but ordinal rules use `one` (_1st_, _21st_, etc.), `few` (_2nd_, _22nd_, etc.), 
`many` (_3rd_, _23rd_, etc.), and `other` (_4th_, _5th_, etc.).

Additionally,
MF1 provides `ChoiceFormat` selection based on a complex rule set
(and which allows determining if a number falls into a specific range).

Both JS and ICU PluralRules implementations provide for determining the plural category
of a range based on its start and end values.
Range-based selectors are not initially considered here.

## Use-Cases

As a user, I want to write messages that use the correct plural for
my locale and enables translation to locales that use different rules.

As a user, I want to write messages that use the correct ordinal for
my locale and enables translation to locales that use different rules.

As a user, I want to write messages in which the pattern used depends on exactly matching
a numeric value.

As a user, I want to write messages that mix exact matching and 
either plural or ordinal selection in a single message. 
> For example:
>```
>.match {$numRemaining}
>0 {{You have no more chances remaining (exact match)}}
>1 {{You have one more chance remaining (exact match)}}
>one {{You have {$numRemaining} chance remaining (plural)}}
> * {{You have {$numRemaining} chances remaining (plural)}}
>```


## Requirements

- Enable cardinal plural selection.
- Enable ordinal number selection.
- Enable exact match selection.
- Enable simultaneous "exact match" and either plural or ordinal selection.
  > For example, allow variants `[1]` and `[one]` in the same message.
- Selection must support relevant formatting options, such as `minimumFractionDigits`.
  > For example, in English the value `1` matches plural rule `one` while the value `1.0`
  > matches the plural rule `other` (`*`)
- Encourage developers to provide the formatting options used in patterns to the selector
  so that proper selection can be done.

## Constraints

ICU MF1 messages using `plural` and `selectordinal` should be representable in MF2.

## Proposed Design

Given that we already have a `:number`,
it makes sense to add a `<matchSignature>` to it with an option

```xml
<option name="select" values="plural ordinal exact" default="plural" />
```

The default `plural` value is presumed to be the most common use case,
and it affords the least bad fallback when used incorrectly:
Using "plural" for "exact" still selects exactly matching cases,
whereas using "exact" for "plural" will not select LDML category matches.
This might not be noticeable in the source language,
but can cause problems in target locales that the original developer is not considering.

> For example, a naive developer might use a special message for the value `1` without
> considering other locale's need for a `one` plural:
>
> ```
> .match {$var}
> [1] {{You have one last chance}}
> [one] {{You have {$var} chance remaining}} // needed by languages such as Polish or Russian
> [*] {{You have {$var} chances remaining}}
> ```

Additional options such as `minimumFractionDigits` and others already supported by `:number`
should also be supported.

If PR [#532](https://github.com/unicode-org/message-format-wg/pull/532) is accepted,
also add the following `<alias>` definitions to `<function name="number">`:

```xml
<alias name="plural" supports="match">
	<setOption name="select" value="plural"/>
</alias>
<alias name="ordinal" supports="match">
	<setOption name="select" value="ordinal"/>
</alias>
```

## Alternatives Considered

### Completely Separate Functions

An alternative approach to this problem could be to leave the `:number` `<matchSignature>` undefined,
and to define three further functions, each with a `<matchSignature>`:

- `:plural`
- `:ordinal`
- `:exact` (actual name TBD, pending the resolution of [#433](https://github.com/unicode-org/message-format-wg/issues/433)

which would each need the same set of options as `:number`, except for `type`.

This approach would also mostly work, but it introduces new failure modes:

- If a `:number` is used directly as a selector, this should produce a runtime error.
- If a `:plural`/`:ordinal`/`:exact` is used as a formatter, this should produce a runtime error.
- Developers are less encouraged to use the same formatting and selection options.

To expand on the last of these,
consider this message:

```
.match {$count :plural minimumFractionDigits=1}
0 {{You have no apples}}
1 {{You have exactly one apple}}
* {{You have {$count :number minimumFractionDigits=1} apples}}
```

Here, because selection on `:number` is not allowed,
it's easy to duplicate the options because _some_ annotation is required on the selector.
It would also be relatively easy to leave out the `minimumFractionDigits=1` option from the selector,
as it's not required for the English source.

With the proposed design, this message would much more naturally be written as:

```
.input {$count :number minimumFractionDigits=1}
.match {$count}
0 {{You have no apples}}
1 {{You have exactly one apple}}
one {{You have {$count} apple}}
* {{You have {$count} apples}}
```

#### Pros

- None?

#### Cons

- Naïve selection on `:number` will fail, leading to user confusion and annoyance.
- No encouragement to use the same options for selection and formatting.

### Do Not Standardize Number Selection

We could leave number selection undefined in the spec, making it an implementation concern.
Each implementation could/would then provide their own selectors,
and they _might_ converge on some overlap that users could safely use across platforms.

#### Pros

- The spec is a little bit lighter, as we've left out this part.

#### Cons

- No guarantees about interoperability for a relatively core feature.
