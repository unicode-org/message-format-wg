# Design Proposal Template

Status: **Accepted**

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

We need to choose a name for the selector function used to match keys to the string value of an operand.

## Background

_What context is helpful to understand this proposal?_

This addresses issue <a href="https://github.com/unicode-org/message-format-wg/issues/433">#433</a>
and issues raised in various design documents, notably
<a href="https://github.com/unicode-org/message-format-wg/pull/471">#471</a>
(about number selection).

The exact match selector function is an "all-purpose" built-in selector
for use in messages when a more specific selector (such as for numbers or
dates) is not available.
Other selectors, such as `:number` or `:datetime`
that need to match specific values provide similar functionality.
Custom selectors should model their exact-match on this selector.

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

ICU MF1 has a selector called `com.ibm.icu.text.SelectFormat` 
associated with the keyword `select` in the MF1 syntax. 
Our design should be compatible with this selector when used for the same use case,
but it not constrained to use the same name or terminology.

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

The exact match selector is named `:string`.
The exact match selector matches the string literal value of its operand against
any sets of keys in a case-sensitive, encoding-sensitive manner.
No Unicode normalization is performed.

> [!NOTE]
> In this context "encoding-sensitive" does not mean "character encoding"
> but rather "sensitive to the sequence of code points used by the string".
> See [Character Model for the World Wide Web: String Matching](https://www.w3.org/TR/charmod-norm)

The `:string` selector is also a verbatim formatting function.
That is, the message "{$var :string}" when formatted contains the resolved string
value of the variable `$var`.

Other selectors may follow the example of `:number`,
which includes an option `select` that may take a value `exact`.

## Alternatives Considered

_What other solutions are available?_
_How do they compare against the requirements?_
_What other properties do they have?_

### Option A. `:select`

Pros:
- The same as ICU MF1's keyword. Users have implementation experience.
  Might fascilitate easier migration from MF1?
- Not overly specific, so can conceptually fit with "non-exact" matching.

Cons:
- Somewhat generic name.

### Option B. `:exact`

Pros:
- Says what the match does.

Cons:
- Unclear whether it refers to the serialization form or the imputed value.
  There may be some cases where the match depends on options,
  such as with `{|42.3| :integer}` and a key `42`

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
- Might confuse users who are comparing e.g. two numbers or two dates.
  In typed languages, the values being compared might not actually be strings.
- Depends on the serialization.


### Option E. Something else

It is possible that we haven't landed the best name yet. 
If you don't like any of these, what **_do_** you like?!?
