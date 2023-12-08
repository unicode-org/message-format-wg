# Design Proposal Template

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@aphillips</dd>
		<dt>First proposed</dt>
		<dd>2023-12-08</dd>
	</dl>
</details>

## Objective

_What is this proposal trying to achieve?_

We need to choose a name for the default "exact match" selector function.

## Background

_What context is helpful to understand this proposal?_

This addresses issue <a href="https://github.com/unicode-org/message-format-wg/issues/433">#433</a>
and issues raised in various design documents, notably
<a href="https://github.com/unicode-org/message-format-wg/pull/471">#471</a>
(about number selection).

The default selector function is the function used when an implementation
cannot find another selector.
It is also an attribute of selectors, such as `:number` or perhaps `:date`
that need to match specific values.
ICU MF1 has a selector called `com.ibm.icu.text.SelectFormat` 
associated with the keyword `select` in the MF1 syntax.

## Use-Cases

_What use-cases do we see? Ideally, quote concrete examples._

As a developer, I would like to create matches based on arbitrary enumerated string
values in a manner similar to ICU MF1's `SelectFormat`.
This allows me to use an ordinary enum or data values already present in my data
to do pattern selection.

As a user, I would like to create numeric matches based on a specific value
not just the plural or ordinal category of the value.
This is for cases where the pattern selected is tied to the actual value
rather than just to the grammatical needs of the language.
Consider the different between the messages in:
>```
>.match {$numChances :number}
>1   {{You have one chance left}}
>one {{You have {$numChances}} chance left}}
>*   {{You have {$numChances}} chances left}}
>```

As an implementer, I want to create value matches that are not strictly
tied to the string serialization for data types that I know.
> For example, if a date value were serialized as
> `2023-12-08T12:00:00Z[America/Los_Angeles]` and the selector were
> `{$myDate :date dateStyle=long}` **_and_** I want to do select on the 
> date value, I might want a match like this:
>```
>.match {$myDate}
>2023-12-08 {{This only fires on this specific date}}
>* {{This fires some other time}}
>```
>A different example that makes this clearer might be numbers.
> In the `de-DE` locale, the number `42.3` is usually formatted
> as `42,3`. Consider the message:
> ```
> .local $myNum = {|42.3| :number minFractionDigits=1}
> .match {$myNum :equals}
> 42.3 {{This always matches}
> *    {{This never matches}}
> ```

As a user, I want to use a selector name that makes sense and feels natural to write.

## Requirements

_What properties does the solution have to manifest to enable the use-cases above?_

## Constraints

_What prior decisions and existing conditions limit the possible design?_

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

## Alternatives Considered

_What other solutions are available?_
_How do they compare against the requirements?_
_What other properties do they have?_

### Option A. `:select`

Pros:
- The same as ICU MF1's keyword. We have implementation experience.

Cons:
- Somewhat generic name.

### Option B. `:exact`

Pros:
- Says what the match does.

Cons:
- Not super specific?

### Option C. `:equals`

Pros:
- Says what the match does.

Cons:
- Implies object or value equality, which may not be correct in all implementations
  or programming languages.
  The implications might be confusing to users in those cases.

### Option D. `:string`

Pros:
- Clearer about what is being compared than `select` or `exact`:
  it's the string value?

Cons:
- Not clear about 

### Option E. Something else

It is possible that we haven't landed the best name yet. 
If you don't like any of these, what **_do_** you like?!?
