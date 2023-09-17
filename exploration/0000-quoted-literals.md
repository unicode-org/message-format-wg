# Quoted Literals

## Objective

Document the rationale for including quoted literals in MessageFormat and for delimiting them with the vertical line character, `|`.

## Background

MessageFormat allows both quoted and unquoted literals. Unquoted literals satisfy many common use-cases for literals: they are sufficient to represent numbers and single-word option values and variant keys. Quoted literals are helpful in exotic use-cases.

In early drafts of the MessageFormat syntax, quoted literals used to be delimited first with quotation marks (`"foo bar"`), and then with round parentheses, e.g. `(foo bar)`. See [#263](https://github.com/unicode-org/message-format-wg/issues/263).

In [#414](https://github.com/unicode-org/message-format-wg/pull/414) proposed to revert these changes and go back to using single and/or double quotes as delimiters. The propsal was rejected. This document is an artifact of that rejection.

## Use-Cases

_What use-cases do we see? Ideally, quote concrete examples._

In general, quoted literals are useful for:

1. encoding literals containing whitespace, like literals consisting of multiple words,
1. encoding literals containing exotic characters that do not conform to the `unquoted` production in ABNF.

More specifically:

* Message authors and translators need to be able to use the apostrophe in the message content, and may want to use the single quote character to represent it instead of the typograhic (curly) apostrophe.

	> ```
	> {…{|New Year's Eve|}…}
	> ```

* Message authors may want to use literals to define locale-aware dates as literals in the RFC 7231 format:

	> ```
	> {The Unix epoch is defined as {|Thu, 01 Jan 1970 00:00:00 GMT| :datetime}.}
	> ```

* Message authors may want to use multiple words as values of certain options passed to custom functions and markup elements:

	> ```
	> {{+button title=|Click here!|}Submit{-button}}
	> ```
	>
	> Note that quoted literals cannot contain placeholders, making interpolating data into them impossible.
	>
	> ```
	> -- This is impossible in MessageFormat 2.0.
	> {{+button title=|Goodbye, {$userName}!|}Sign out{-button}}
	> ```

* Selector function implementers may want to support exotic characters in variant keys to effectively create "mini-DSLs" for the matching logic:

	> ```
	> match {$count :myNumber}
	> when |<10| {A handful.}
	> when * {Lots.}
	> ```

* Message authors may want to protect untranslatable strings:

	> ```
	> {Visit {|http://www.example.com| @translate=false}.}
	> ```
	>
	> See [design proposal 0002](https://github.com/unicode-org/message-format-wg/blob/main/exploration/0002-expression-attributes.md).

* Message authors may want to decorate substrings as being written in a particular language, different from the message's language, for the purpose of accessibility, text-to-speech, and semantic correctness.

	> ```
	> {The official native name of the Republic of Poland is {|Rzeczpospolita Polska| @lang=pl}.}
	> ```
	>
	> See [design proposal 0002](https://github.com/unicode-org/message-format-wg/blob/main/exploration/0002-expression-attributes.md).

* Developers may want to embed messages with quoted literals in code written in another programming language which uses single or double quotes to delimit strings.

	> ```js
	> let message = new MessageFormat(
	> 		"en", "{A message with {|a literal|}.}");
	> ```

* Developers and localization engineers may want to embed messages with quoted literals in a container format, such as JSON.

	> ```json
	> {
	> 	"msg": "{A message with {|a literal|}.}"
	> }
	> ```

## Requirements

_What properties does the solution have to manifest to enable the use-cases above?_

* **[r1; high priority]** Minimize the need to escape characters inside literals. In particular, choose a delimiter that isn't frequently used in translation content. Having to escape characters inside literals is inconvenient and error-prone when done by hand, and it also introduces the backslash into the message, `\`, which is the escape introducer. The backslash then needs to be escaped too, when the message is embedded in code or containers. (This is how some syntaxes produce the gnarly `\\\`.)
* **[r2; high priority]** Minimize the need to escape characters when embedding messages in code or containers. In particular, choose a delimiter that isn't frequently used as a string delimiter in programming languages and container formats. However, note that many programming languages also provide alternative ways of delimiting strings, e.g. *raw strings* or triple-quoted literals.
* **[r3; high priority]** Minimize the need to change the message in other ways than to escape some of its characters (e.g. rephrase content or change syntax).
* **[r4; medium priority]** Don't surprise users with syntax that's too exotic. We expect quoted literals to be rare, which means fewer opportunities to get used to their syntax and remember it.
* **[r5; low priority]** Be able to pair the opening and the closing delimiter, to aid parsers recover from syntax errors, and to leverage IDE's ability to highlight matching pairs of delimiters, to visually indicate to the user editing a message the bounds of the literal under caret. However, quoted literals are usually short and already enclosed in a placeholder (which has its own delimiters) or are outside patterns (when used as variant keys).

## Constraints

_What prior decisions and existing conditions limit the possible design?_

* **[c1]** MessageFormat uses the backslash, `\`, as the escape sequence introducer.
* **[c2]** Straight quotation marks, `'` and `"`, are common in content across many languages, even if other Unicode codepoints should be used in well-formatted text.
* **[c3]** Straight quotation marks, `'` and `"`, are common as string delimiters in many programming languages.

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

Use the vertical line character, `|`, to delimit quoted strings. For example:

> ```
> {The Unix epoch is defined as {|Thu, 01 Jan 1970 00:00:00 GMT| :datetime}.}
> ```

```abnf
literal       = quoted / unquoted
quoted        = "|" *(quoted-char / quoted-escape) "|"
quoted-char   = %x0-5B         ; omit \
              / %x5D-7B        ; omit |
              / %x7D-D7FF      ; omit surrogates
              / %xE000-10FFFF
quoted-escape = backslash ( backslash / "|" )
```

By being both uncommon in text content and uncommon as a string delimiter in other programming languages, the vertical line sidesteps the "inwards" and "outwards" problems of escaping.

* [r1 GOOD] Writing `"` and `'` in literals doesn't require escaping them via `\`. This means no extra `\` that need escaping.
* [r2 GOOD] Embedding messages in most code or containers doesn't require escaping the literal delimiters.
* [r3 GOOD] Message don't have to be modified otherwise before embedding them.
* [r4 FAIR] Vertical lines are not commonly used as string delimiters and thus can be harder to learn for beginners. There's prior art in a practice of using vertical lines as delimiters for inline code literals.
* [r5 POOR] Vertical lines cannot be paired by parsers nor IDEs.

## Alternatives Considered

_What other solutions are available?_
_How do they compare against the requirements?_
_What other properties they have?_

### Use quotation marks

Early drafts of the syntax specification used double quotes to delimit literals. This changed in [#263](https://github.com/unicode-org/message-format-wg/issues/263#issue-1233590015), and was later proposed back in [#414](https://github.com/unicode-org/message-format-wg/pull/414).

* [r1 POOR] Writing `"` and `'` in literals requires escaping them via `\`, which then needs to be escaped itself in code which uses `\` as the escape character (which is common).
* [r2 FAIR] Embedding messages in certain programming languages and containers requires escaping the literal delimiters. Most notably, storing MF2 messages in JSON suffers from this. In many programming languages, however, alternatives to quotation marks exist, which could be used to allow unescaped quotes in messages. See [comment on #263](https://github.com/unicode-org/message-format-wg/issues/263#issuecomment-1430929542).
* [r3 FAIR] One of the suggestions proposed to allow for both single and double quotation marks, and make them interchangeable in case one set was used by the inner content or surrounding code. This, however, requires directed modification of the message's body.
* [r4 GOOD] Quotation marks are universally recognized as string delimiters.
* [r5 POOR] Quotation marks cannot be paired by parsers nor IDEs.

### Use round or angle brackets

* Round parentheses are very uncommon as string delimiters [r2 GOOD], and thus may be surprising [r4 POOR]. Furthermore, they are relatively common in text, where they'd require escaping [r1 POOR].
* Angle brackets require escaping in XML-based storage formats [r2 POOR].

### Change escape introducer

Changing the escape sequence introducer from backslash [c1] to another character could help partially mitigate the burden of first escaping literal delimiters and then escaping the escapes themselves [r1]. However, it wouldn't address other requirements and use-cases.

### Double delimiters to escape them

This is the approach taken by ICU MessageFormat 1.0 for quotes. It allows literals to contain quotes [r1 GOOD] at the expense of doubling the amount of escaping required when embedding messages in code [r2 POOR].
