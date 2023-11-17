# Quoted Literals

Status: **Accepted**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Pull Request</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/477">#477</a></dd>
	</dl>
</details>

## Objective

Document the rationale for including quoted literals in MessageFormat
and for delimiting them with the vertical line character, `|`.

## Background

MessageFormat allows both quoted and unquoted literals.
Unquoted literals satisfy many common use-cases for literals:
they are sufficient to represent numbers
and single-word option values and variant keys.
Quoted literals are helpful in exotic use-cases.

In early drafts of the MessageFormat syntax,
quoted literals used to be delimited first with quotation marks (`"foo bar"`),
and then with round parentheses, e.g. `(foo bar)`.
See [#263](https://github.com/unicode-org/message-format-wg/issues/263).

[#414](https://github.com/unicode-org/message-format-wg/pull/414) proposed to revert these changes
and go back to using single and/or double quotes as delimiters.
The propsal was rejected.
This document is an artifact of that rejection.

## Use-Cases

_What use-cases do we see? Ideally, quote concrete examples._

In general, quoted literals are useful for:

1. encoding literals containing whitespace, like literals consisting of multiple words,
1. encoding literals containing exotic characters that do not conform to the `unquoted` production in ABNF.

More specifically:

- Message authors and translators need to be able to use the apostrophe in the message content,
  and may want to use the single quote character
  to represent it instead of the typograhic (curly) apostrophe.

  > ```
  > …{|New Year's Eve|}…
  > ```

- Message authors may want to use literals to define locale-aware dates as literals in a modified RFC 3339 format:

  > ```
  > The Unix epoch is defined as {|1970-01-01 00:00:00Z| :datetime}.
  > ```

- Message authors may want to use multiple words as values of certain options passed to custom functions and markup elements:

  > ```
  > {+button title=|Click here!|}Submit{-button}
  > ```

  > [!NOTE]
  > Quoted literals are not evaluated as part of a pattern or option sequence.
  > This means that their contents cannot be dynamic.
  > ```
  > -- The "title" contains the string "{$userName}"
  > {+button title=|Goodbye, {$userName}!|}Sign out{-button}
  > ```

- Selector function implementers might need to match different string values
  such as those present in data values.
  These might include keys containing arbitrary text, multiple words,
  or other sequences not otherwise permitted in the syntax.

  > ```
  > {{ match {$count :choice}
  >    when |<10| {{A handful.}}
  >    when |11..19| {{Umpteen.}}
  >    when * {{Lots.}}
  > }}
  >
  > {{ match {$arbitraryString}
  >    when |can't resolve| {{Can't resolve!}}
  >    when |11'233.44| {{Locale formatted number}}
  >    when |New York| {{A multi-word proper name}}
  >    when * {{Imagine more...}}
  > }}
  > ```

- Message authors may want to protect untranslatable strings:

  > ```
  > Visit {|http://www.example.com| @translate=false}.
  > ```
  >
  > See the [expression attributes design proposal](https://github.com/unicode-org/message-format-wg/blob/main/exploration/0002-expression-attributes.md).

- Message authors may want to decorate substrings as being written in a particular language,
  different from the message's language,
  for the purpose of accessibility, text-to-speech, and semantic correctness.

  > ```
  > The official native name of the Republic of Poland is {|Rzeczpospolita Polska| @lang=pl}.
  > ```
  >
  > See the [expression attributes design proposal](https://github.com/unicode-org/message-format-wg/blob/main/exploration/0002-expression-attributes.md).

- Developers may want to embed messages with quoted literals in code written in another programming language
  which uses single or double quotes to delimit strings.

  > ```js
  > let message = new MessageFormat('en', 'A message with {|a literal|}.');
  > ```

- Developers and localization engineers may want to embed messages with quoted literals in a container format, such as JSON.

  > ```json
  > {
  >   "msg": "A message with {|a literal|}."
  > }
  > ```

## Requirements

_What properties does the solution have to manifest to enable the use-cases above?_

- **[r1; high priority]** Minimize the need to escape characters inside literals.
  In particular, choose a delimiter that isn't frequently used in translation content.
  Having to escape characters inside literals is inconvenient and error-prone when done by hand,
  and it also introduces the backslash `\` into the message as the escape introducer.
  When the message is embedded in code or containers, the backslash then needs to be escaped too;
  this is how some syntaxes produce the gnarly `\\\`.

  By minimizing the need to escape characters,
  we also minimze the incentive to _avoid_ escaping by changing translation content,
  e.g. by rephrasing content or by using typographic punctuation marks.

- **[r2; medium priority]** Minimize the need to escape characters or change the host format's string delimiters when embedding messages in code or containers.
  In particular, choose a delimiter that isn't frequently used as a string delimiter in programming languages and container formats.

  This requirement is scored as _medium_, because many storage formats don't use delimiters at all (`.properties`, YAML),
  or they are meant to be primarily used by machines (JSON),
  and because many programming languages provide a way to delimit _raw strings_,
  e.g. via <code>``</code> in JavaScript and `"""` in Python.
  Also, messages including e.g. newlines or `\` escapes in their source
  will likely need those characters accounted for when dropping them into new host formats.

- **[r3; medium/high priority]** Do not surprise users with syntax that's too exotic.
  We expect quoted literals to be rare,
  which means fewer opportunities to get used to their syntax and remember it.

- **[r4; low priority]** Be able to pair the opening and the closing delimiter,
  to aid parsers recover from syntax errors,
  and to leverage IDE's ability to highlight matching pairs of delimiters,
  to visually indicate to the user editing a message the bounds of the literal under caret.
  However, quoted literals are usually short and already enclosed in a placeholder (which has its own delimiters)
  or are outside patterns (when used as variant keys).

  <details>
    <summary>How can paired delimiters improve parsing recovery?</summary>
    If both paired delimiters are made special in the literal,
    i.e. both the opening and the closing delimiter require escaping inside the literal to be part of its contents,
    then the start of another literal can be an anchor point for a parser to stop parsing and attempt to rewind and recover.

    ```
    There {:is a=|broken literal=|here|}
                        ^         ^
                        The closing delimiter is missing here.
                                  The syntax error occurs here.
    There {:is a=[broken literal=[here]}
                        ^^       ^
                        The closing delimiter is missing here.
                        |       The parser can recognize a new literal here...
                        and rewind to here.
    ```
  </details>

- **[r5; low priority]** Do not require users to choose between too many syntax options.
  > There should be one — and preferably only one — obvious way to do it.<br>
  > —_[The Zen of Python](https://peps.python.org/pep-0020/)_

## Constraints

_What prior decisions and existing conditions limit the possible design?_

- **[c1]** MessageFormat uses the backslash, `\`,
  as the escape sequence introducer.

- **[c2]** Straight quotation marks, `'` and `"`,
  are common in content across many languages,
  even if other Unicode codepoints should be used in well-formatted text.

- **[c3]** Straight quotation marks, `'` and `"`,
  are common as string delimiters in many programming languages.

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

Use the vertical line character, `|`, to delimit quoted strings.
The vertical line is rarely found in text content,
and it has sufficiently good delimitation properties.

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

By being both uncommon in text content and uncommon as a string delimiter in other programming languages,
the vertical line sidesteps the "inwards" and "outwards" problems of escaping.

- [r1 GOOD] Writing `"` and `'` in literals doesn't require escaping them via `\`.
  This means no extra `\` that need escaping.
- [r2 GOOD] Embedding messages in most code or containers doesn't require escaping the literal delimiters.
- [r3 POOR/FAIR] Vertical lines are not commonly used as string delimiters
  and thus can be harder to learn for beginners.
  Vertical bars can be used as a separator in [delimiter-separated data formats](http://www.catb.org/~esr/writings/taoup/html/ch05s02.html).
  However, typically vertical lines tend to be used as delimiters for *separating* rather than for *enclosing*.
- [r4 POOR] Vertical lines are not automatically paired by parsers nor IDEs.

## Alternatives Considered

_What other solutions are available?_
_How do they compare against the requirements?_
_What other properties they have?_

### [a1] Use quotation marks

Early drafts of the syntax specification used double quotes to delimit literals.
This changed in [#263](https://github.com/unicode-org/message-format-wg/issues/263#issue-1233590015).

- [r1 POOR] Writing `"` and `'` in literals requires escaping them via `\`,
  which then needs to be escaped itself in code
  which uses `\` as the escape character (which is common).
- [r2 FAIR] Embedding messages in certain programming languages and containers requires escaping the literal delimiters.
  Most notably, storing MF2 messages in JSON suffers from this.
  In many programming languages, however, alternatives to quotation marks exist,
  which could be used to allow unescaped quotes in messages.
  See [comment on #263](https://github.com/unicode-org/message-format-wg/issues/263#issuecomment-1430929542).
- [r3 GOOD] Quotation marks are universally recognized as string delimiters.
- [r4 FAIR] Quotation marks are not automatically paired by parsers nor IDEs,
  but many text editors provide features to make working with and around quotes easier.

### [a2] Dual quoting

PR [#414](https://github.com/unicode-org/message-format-wg/pull/414) proposes to
allow either single quotes `'` or double quotes `"` as literal delimiters,
a variant of the "Use quotation marks" solution.

- [r1 FAIR] Writing `"` and `'` in literals doesn't require escaping them via `\`,
  as long as they do not match the literal's delimiter.
  Literals containing both `'` and `"` will need to have at least one of those characters
  escaped via `\`, which may itself need escaping in the container format.
- [r2 GOOD] Embedding messages in certain container formats requires escaping the literal delimiters.
  If the container format does not itself support dual quoting,
  the embedded message's quotes may be adjusted to avoid their escaping.
- [r3 GOOD] Quotation marks are universally recognized as string delimiters.
- [r4 FAIR] Quotation marks cannot be paired by parsers nor IDEs,
  but many text editors provide features to make working with and around quotes easier.

### [a3] Use round or angle brackets

- Round parentheses are very uncommon as string delimiters [r2 GOOD],
  and thus may be surprising,
  especially given the well-established meaning in prose [r4 POOR].
  That said, there's prior art in using them for [delimiting strings in PostScript](https://en.wikipedia.org/wiki/PostScript#%22Hello_world%22).
  Furthermore, they are relatively common in text, where they'd require escaping [r1 POOR].
- Angle brackets require escaping in XML-based storage formats [r2 FAIR].
- All brackets can be easily paired by parsers and IDEs [r5 GOOD].

### [a4] Change escape introducer

Changing the escape sequence introducer from backslash [c1] to another character
could help partially mitigate the burden of first escaping literal delimiters
and then escaping the escapes themselves [r1].
However, it wouldn't address other requirements and use-cases.

### [a5] Double delimiters to escape them

This is the approach taken by ICU MessageFormat 1.0 for quotes.
It allows literals to contain quotes [r1 GOOD]
at the expense of doubling the amount of escaping required when embedding messages in code [r2 POOR].

### [a6] Accept either `|` or quotes

Allow any of the following as literal delimiters:

- the vertical line character `|`
- single quotes `'`
- double quotes `"`

This approach supports multiple different quoting styles to be used for literals.
This flexibility allows for using a familiar and common style such as `'single'` or `"double"` quotes,
while also allowing for `|pipes|` when the message's contents or embedding would otherwise require additional escaping.

```abnf
literal       = quoted / unquoted
quoted        = "|" *(quoted-char / "'" / DQUOTE / quoted-escape) "|"
              / "'" *(quoted-char / DQUOTE / "|" / quoted-escape) "'"
              / DQUOTE *(quoted-char / "'" / "|" / quoted-escape) DQUOTE
quoted-char   = %x0-21         ; omit "
              / %x23-26        ; omit '
              / %x28-5B        ; omit \
              / %x5D-7B        ; omit |
              / %x7D-D7FF      ; omit surrogates
              / %xE000-10FFFF
quoted-escape = backslash ( backslash / "|" / "'" / DQUOTE )
```

- [r1 GOOD] Writing any two of `|`, `"` and `'` in literals doesn't require escaping them via `\`.
  This means no extra `\` that need escaping.
  Message don't have to be modified otherwise before embedding them,
  unless they happen to contain conflicting quote delimiters.
- [r2 GOOD] Embedding messages in most code or containers doesn't require escaping the literal delimiters.
- [r3 GOOD] Quotation marks are universally recognized as string delimiters.
- [r4 FAIR] Using the same marks for quote-start and quote-end cannot be paired by parsers nor IDEs,
  but many text editors provide features to make working with and around quotes easier.

## Comparison table

<table>
   <tr>
      <th></th>
      <th>Priority</th>
      <th>Proposal</th>
      <th>[a1]</th>
      <th>[a2]</th>
      <th>[a3]</th>
      <th>[a4]</th>
      <th>[a5]</th>
      <th>[a6]</th>
   </tr>
   <tr>
      <th>[r1] escape inside literals</th>
      <th>HIGH</th>
      <td>++</td>
      <td>-</td>
      <td>+</td>
      <td>-</td>
      <td>++</td>
      <td>++</td>
      <td>++</td>
   </tr>
   <tr>
      <th>[r2] escape when embedding</th>
      <th>MED</th>
      <td>++</td>
      <td>+</td>
      <td>++</td>
      <td>+/++</td>
      <td></td>
      <td>-</td>
      <td>++</td>
   </tr>
   <tr>
      <th>[r3] no surprises</th>
      <th>MED/HIGH</th>
      <td>-/+</td>
      <td>++</td>
      <td>++</td>
      <td>-</td>
      <td>-</td>
      <td>+</td>
      <td>++</td>
   </tr>
   <tr>
      <th>[r4] pair delimiters</th>
      <th>LOW</th>
      <td>-</td>
      <td>+</td>
      <td>+</td>
      <td>++</td>
      <td></td>
      <td></td>
      <td>+</td>
   </tr>
   <tr>
      <th>[r5] one way</th>
      <th>LOW</th>
      <td>++</td>
      <td>++</td>
      <td>+</td>
      <td>++</td>
      <td></td>
      <td></td>
      <td>-</td>
   </tr>

</table>
