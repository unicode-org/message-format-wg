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

Pattern exterior whitespace can occur in a message
when the pattern is being used in a space-sensitive manner during output.
Its most common use is visual formatting,
usually when concatenating the output of the formatting operation.

Sometimes, pattern exterior whitespace is localizable,
such as when segmentation results in a message with a leading or trailing space
used to separate the message from other clauses or phrases.
When such a message is translated to a locale using a CJK or other script
that does not use spaces to separate clauses,
the space needs to be dropped.

Examples include:

- command line utilities often need to emit a newline at the end of a message
- creating bullet lists
- indenting text
- manually aligning multi-line text that is rendered with a monospace font

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
