# Pattern Exterior Whitespace

Status: **Accepted**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@aphillips</dd>
		<dd>@eemeli</dd>
		<dt>First proposed</dt>
		<dd>2023-10-02</dd>
		<dt>Pull Request</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/487">#487</a></dd>
	</dl>
</details>

## Objective

_What is this proposal trying to achieve?_

The Working Group has identified a need for users to be able to specify the inclusion of
whitespace at the start or end of the pattern that is **_part_** of the pattern.

The definition of `whitespace` in this design is based on the `s` production in the ANBF.
Currently this includes the characters U+0009 TAB, U+000D CARRIAGE RETURN, U+000A LINE FEED, and U+0020 SPACE.
This definition of whitespace is subject to modification as part of the syntax;
the exact definition is not important to this design.

Note that this definition of whitespace does not include some ASCII whitespace characters,
such as vertical tab or form feed.

## Background

_What context is helpful to understand this proposal?_

**_<dfn>Pattern exterior whitespace</dfn>_** is syntax-meaningful whitespace 
(that is, it matches the `s` production in the ABNF for `message`) that appears
at the start or end of an **unquoted** _pattern_ in a _message_.

_Pattern exterior whitespace_ is usually found in a _message_
when the _pattern_ is being used in a space-sensitive manner during output.
Its most common use is visual formatting,
usually when concatenating the output of the formatting operation.

Sometimes _pattern exterior whitespace_ is localizable,
such as when segmentation results in a _message_ with a leading or trailing space
used to separate the _message_ from other clauses or phrases.
When such a _message_ is translated to a locale using a CJK or other script
that does not use spaces to separate clauses,
the space needs to be dropped.

Examples include:

- command line utilities often need to emit a newline at the end of a message
- creating bullet lists
- indenting text
- manually aligning multi-line text that is rendered with a monospace font

### Other whitespace characters

Note that there are many whitespace characters in Unicode, such as U+3000,
U+200A, U+200B, U+2025, etc. which are not included in the `s` production.
These whitespace characters are part of the _pattern_ and are not subject to being
trimmed in syntaxes that support unquoted patterns.
Because these whitespace characters look like spaces (or nothing)
and can be followed by characters that would be pattern exterior whitespace,
in some _messages_ users might be surprised by the lack of trimming.
Note that this is true of any non-ASCII whitespace characters,
when viewed as plain text.

For example:
>```
> %match {$foo}
> %{when *} \u200a  Hello {$foo}
>```
>The `*`-keyed _pattern_ starts with a `HAIRSPACE` followed by two ASCII spaces.
>The ASCII space (U+0020) before the `\u200a` character is _pattern exterior whitespace_.
>The `\u` escapes are not part of MF2 syntax and are for visibility.
>What this message actually looks like is:
>```
>%match {$foo}
>%{when *}    Hello {$foo}
>```

### Why would we allow unquoted patterns?

Most _messages_ are expected to be simple. 
The most frequent messages will have no placeholders or be simple replacements:
```
Hello, world!
Hello, {$user}!
```

The need to quote these patterns is undesirable because it is unnatural.

The ability to have unquoted patterns depends, to some degree, on the syntax we choose
for _messages_ as a whole.
Allowing unquoted patterns would make it simpler for authors and translators
by reducing the overall message complexity
(i.e. needing to balance open and close "quote" characters)

### Why would we want to trim pattern exterior whitespace?

Messages with _selectors_ (`match`) represent the primary case for quoted patterns.
Each _variant_ consists of a set of _keys_ and a _pattern_ being selected.
In the examples in our specification and documentation, it is common to 
represent each _message_ as a multi-line construct.

Some users may wish to incorporate this formatting or additional spaces/indentation
for the purposes of simplifying authoring.
The leads to the inclusion of additional whitespace inside the _message_
which the user does not intend to be part of the _pattern_.

Quoted patterns make the division between _key_ and _pattern_ clear
at the cost of addition syntax for quoting the pattern.

Unquoted patterns could consume all whitespace verbatim from the _message_.
However, we believe that, while software developers might understand the need for the
_pattern_ to start directly after the _key_, 
it seems likely that accidental whitespace will be a common error:

> Unintended spaces:
>```
>%match {$foo} %when {*} I should not have a space.
>%match {$foo} %when {*}
>   I should not have space or a newline.
>```
> Corrected:
> ```
> %match {$foo} %when {*}I have no space.
> %match {$foo} %when {*} {{ I have a space before and after }}
> %match {$foo} %when {*}
>     {{ I have a space before and after }}
> ```

Allowing the _pattern_ to be unquoted simplifies authoring, since most _messages_
do not require pattern exterior whitespace.

There is also no uniformity in where a _message_ will be embedded.
If it is in a `.properties` file, then the host format will trim the whitespace anyway.
If it is in JSON, the `"..."` will make it explicit.

If 20% of messages require MFv2 patterns...

And 20% of those require a selector...

And 1% of require pattern exterior whitespace...

That's 0.4% of strings that require quoting the pattern.

This appears to exaggerate the number of strings requiring PEWS.

## Use-Cases

_What use-cases do we see? Ideally, quote concrete examples._

- Users want to use whitespace to make their messages pretty, just like they see in our documentation.
- Users want to know which whitespace characters are part of the pattern and which will be trimmed.
- Users want to write messages without learning weird or complicated syntaxes.

## Requirements

_What properties does the solution have to manifest to enable the use-cases above?_

- It **_MUST_** be possible to include _message_-meaningful whitespace at the start or end of
  a _pattern_.

## Constraints

_What prior decisions and existing conditions limit the possible design?_

- Pattern interior whitespace is just a sequence of characters inside the pattern.
  Some of the escapes shown here can be used for pattern interior whitespace also,
  but this is not required.

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

- All unquoted whitespace on the exterior of a pattern is not meaningful and is removed
  during formatting.
- Patterns MAY be quoted (solution 4). Whitespace inside the quoting syntax is meaningful.
  > ```
  > when foo bar {{   This pattern has exactly two spaces at the start and two at the end  }}  when * *
  > ```
- A pattern can begin or end with a quoted literal containing whitespace (or any other allowed characters).
  All whitespace within a pattern is meaningful.
  The quoted literal may be empty.
  > ```
  > when foo bar  {|  |}  This pattern has four spaces at the start and two at the end{|  |} when * *
  > when foo bar  {||}    This pattern also has four spaces at the start and two at the end  {||} when * *
  > ```

Still being discussed:

- Whether unquoted "simple" patterns are trimmed.
  This will be dealt with in the syntax spec.
  > ```
  >    Does this message have spaces at the start/end or not? {$user} wants to know.
  > ```

## Alternatives Considered

In our call of 2023-10-02 we discussed options for whitespace handling.
In this section we will look at different mechanisms for including pattern exterior whitespace.

```
{|   |}Quoted literals{|   |}    // 1. verbose, might interfere with translation?
{||}   Empty literals   {||}     // 2. variation that might be adopted by some?
{   Quoted pattern   }           // 3. hard to parse?
{{   Quoted pattern   }}         // 4. easier to parse but harder to use
\ \ \ Quote exterior spaces\ \ \ // 5. pattern ends with the start of this comment
\   Quote outside space  \       // 6. variation that some will discover is valid
   No trimming   |               // 7. Whitespace is always significant, | only for visibility
```

Note that (1) and (2) will be valid options regardless of what else we do.

---

#### Examples of the above in a selector

1. Quoted literals

   ```
   #match {$user}
   #when [*] {|  |}Hello {$user}{|  |}
   ```

2. Empty literals

   ```
   #match {$user}
   #when [*] {||}  Hello {$user}  {||}
   ```

3. {Quoted} pattern

   ```
   #match {$user}
   #when [*] {  Hello {$user}  }
   ```

4. {{Quoted}} pattern

   ```
   #match {$user}
   #when [*] {{ Hello {$user}  }}
   ```

5. Quote exterior spaces

   ```
   #match {$user}
   #when [*] \ \ Hello {$user}\ \
   ```

6. Quote outside space

   ```
   #match {$user}
   #when [*] \  Hello {$user} \
   ```

7. No trimming

   ```
   #match {$user}
   #when [*]  Hello {$user}
   ```

#### Examples of the above with newlines and tabs in a variant

1. Quoted literals

   ```
   #when [*] {|
     |}Newline and tab quoted
   ```

2. Empty literals

   ```
   #when [*] {||}
     Newline and tab after empty literal
   ```

3. {Quoted} pattern

   ```
   #when [*] {
     Newline and tab inside pattern}
   ```

4. {{Quoted}} pattern

   ```
   #when [*] {{
     Newline and tab inside pattern}}
   ```

5. Quote exterior spaces

   ```
   #when [*] \
   \  Newline and tab escaped
   ```

6. Quote outside space

   ```
   #when [*] \
     Newline escaped and tab naked
   ```

7. No trimming

   ```
   #when [*]
     Newline and tab are significant whitespace
   ```
