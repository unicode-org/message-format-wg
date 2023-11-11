# Design Proposal: Choosing a Code Mode Introducer

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@aphillips</dd>
		<dt>First proposed</dt>
		<dd>2023-11-10</dd>
		<dt>Pull Requests</dt>
		<dd>#000</dd>
	</dl>
</details>

## Objective

_What is this proposal trying to achieve?_

It must be possible to reliably parse messages.

Our current syntax features unquoted patterns for simple messages
and unquoted code tokens with quoted patterns for complex messages.
Determining whether a message will have code tokens requires some
special character sequence, either part of the code itself or
prepended to the message.
This proposal examines the options for determining code mode.

## Background

_What context is helpful to understand this proposal?_

## Use-Cases

_What use-cases do we see? Ideally, quote concrete examples._

As a developer, I want to create messages with the minimal amount of special syntax.
I don't want to have to type additional characters that add no value.
I want the syntax to be logical and as consistent as possible.

As a translator, I don't want to have to learn special syntax to support features such as declarations.

As a user, I want my messages to be robust.
Minor edits and changes should not result in syntax errors.

As a user, I want to be able to see which messages are complex at a glance
and to parse messages into their component parts visually as easily as possible.

## Requirements

_What properties does the solution have to manifest to enable the use-cases above?_

## Constraints

_What prior decisions and existing conditions limit the possible design?_

Some of the options use a new sigil as part of the introducer.
For various reasons, `#` has been used recently as a placeholder for this sigil.
There are concerns that this character is not suitable, since it is used as a comment
introducer in a number of formats. 
See for example [#520](https://github.com/unicode-org/message-format-wg/issues/520).
The actual sigil used needs to be an ASCII character in the reserved or private use
set (with syntax adjustments if we use up a private-use one).
Most of the options below have been changed to use `^`, using 
Apple's experimental syntax as a model for sigil choice.

It should be noted that an introducer sigil should be as rare as possible in normal text.
This tends to run against common punctuation marks `&`, `%`, `!`, and `?`.

```abnf
reserved-start = "!" / "@" / "#" / "%" / "*" / "<" / ">" / "/" / "?" / "~"
private-start  = "^" / "&"
```

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

We need to choose one of these (or another option not yet considered).
Presentation at UTW did not produce any opinions.

Based on the pro/cons below, I would suggest Option D is possibly the best option?

## Alternatives Considered

_What other solutions are available?_
_How do they compare against the requirements?_
_What other properties they have?_

There are the following designs being considered:

### Option A. Use Pattern Quotes for Messages (current design)

Complex messages are quoted with double curly brackets.
The closing curly brackets might be optional.

Sample pattern:
```
{{
input {$var}
match {$var}
when * {{Pattern}}
}}
```
Sample quoted pattern with no declarations or match:
```
{{{{Pattern}}}}
```

Pros:
- Uses a sigil `{` already present in the syntax
- No additional escapes
- Consistent with other parts of the syntax?

Cons:
- Somewhat verbose
- Closing portion of the syntax adds no value;
  could be a source of unintentional syntax errors
- Messages commonly end with four `}}}}`

### Option B. Use a Sigil

Complex messages start with a special sigil character.

```
^input {$var}
match {$var}
when * {{Pattern}}
```
Sample quoted pattern with no declarations or match:
```
^{{Pattern}}
```

Pros:
- Requires minimum additional typing

Cons:
- Requires an additional sigil
- Requires an additional escape for simple pattern start
- Has no other purpose in the syntax

### Option C. Use a Double Sigil

Like Option B, except the sigil is doubled.

```
^^input {$var}
match {$var}
when * {{Pattern}}
```
Sample quoted pattern with no declarations or match:
```
^^{{Pattern}}
```

Pros:
- Less likely to conflict with a simple pattern

Cons:
- Requires an additional sigil
- Requires an additional escape for simple pattern start
- Has no other purpose in the syntax

### Option D. Sigilized Keywords

Instead of quoting the message, adds a sigil to keywords that
start statements, that is, `#input`, `#local` and `#match`.
The keyword `when` might be considered separately.

```
#input {$var}
#local $foo = {$bar}
#match {$var}
when * {{Pattern}}
```
Sample quoted pattern with no declarations or match:
```
{{Pattern}}
```

Pros:
- Sigil is part of the keyword, not something separate
- Requires minimum additional typing
- Adds no characters to messages that consist of only a quoted pattern;
  that is, quoting the pattern consists only of adding the `{{`/`}}` quotes
- Maybe makes single-line messages easier to parse visually???

Cons:
- Requires an additional sigil
- Requires an additional escape for simple pattern start

> [!Note] Unlike the other options, Option D is presented with `#` as the sigil.
> That doesn't mean that this should be the sigil.
> However, `#` was originally chosen for similarity in declarations to `#define` and `#import`
> in various programming languages.
> It is kept "as-is" here.

### Option E. Special Sequence

Like Option A except the sequence is closed locally (not at the end of the message).
The suggested sequence is `{#}` but might be `{}` or `{{}}` also.

```
{^}input {$var}
match {$var}
when * {{Pattern}}
```
Sample quoted pattern with no declarations or match:
```
{^}{{Pattern}}
```

Pros:
- Less likely to conflict with a simple pattern
- Requires no additional sigil
- Requires no additional escape

Cons:
- Has no other purpose in the syntax
- Looks like something should happen inside it
- Most additional typing
  
