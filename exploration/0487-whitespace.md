# Pattern Exterior Whitespace

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@aphillips</dd>
		<dt>First proposed</dt>
		<dd>2023-10-02</dd>
		<dt>Pull Request</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/487">#487</a></dd>
	</dl>
</details>

## Objective

_What is this proposal trying to achieve?_

The WG is discussing how to handle "pattern exterior" whitespace,
which is ASCII whitespace (tab, newline, or U+0020) that is **_part_** of the pattern
and occurs at the start or end of the pattern.

## Background

_What context is helpful to understand this proposal?_

Pattern exterior whitespace can occur in a message
when the pattern is being used in a space-sensitive manner during output.
Its most common use is visual formatting,
usually when concatenating the output of the formatting operation.

Examples include:

- command line utilities often need to emit a newline at the end of a message
- creating bullet lists
- indenting text

## Use-Cases

_What use-cases do we see? Ideally, quote concrete examples._

- Users want to use whitespace to make their messages pretty, just like they see in our documentation.
- Users want to know which whitespace characters are part of the pattern and which will be trimmed.
- Users want to write messages without learning weird or complicated syntaxes.

## Requirements

_What properties does the solution have to manifest to enable the use-cases above?_

## Constraints

_What prior decisions and existing conditions limit the possible design?_

- Pattern interior whitespace is just a sequence of characters inside the pattern.
  Some of the escapes shown here can be used for pattern interior whitespace also,
  but this is not required.

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

Trim all whitespace.
Document solutions (1) and (2) below.

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
