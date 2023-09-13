# Message Parse Mode

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@eemeli</dd>
		<dt>First proposed</dt>
		<dd>2023-09-13</dd>
		<dt>Pull Request</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/474">#474</a></dd>
	</dl>
</details>

## Objective

Decide whether text patterns or code statements should be enclosed in MF2.

## Background

Existing message and template formatting languages tend to start in "text" mode,
and require special syntax like `{{` or `{%` to enter "code" mode.

ICU MessageFormat and Fluent both support inline selectors
separated from the text using `{ ... }` for multi-variant messages.

[Mustache templates](https://mustache.github.io/mustache.5.html)
and related languages wrap "code" in `{{ ... }}`.
In addition to placeholders that are replaced by their interpolated value during formatting,
this also includes conditional blocks using `{{#...}}`/`{{/...}}` wrappers.

[Handlebars](https://handlebarsjs.com/guide/) extends Mustache expressions
with operators such as `{{#if ...}}` and `{{#each ...}}`,
as well as custom formatting functions that become available as e.g. `{{bold ...}}`.

[Jinja templates](https://jinja.palletsprojects.com/en/3.1.x/templates/) separate
`{% statements %}` and `{{ expressions }}` from the base text.
The former may define tests that determine the inclusion of subsequent text blocks in the output.

A cost that the message formatting and templating languages mentioned above need to rely on
is some rule or behaviour that governs how to deal with whitespace at the beginning and end of a pattern,
as statements may be separated from each other by newlines or other constructs for legibility.

Other formats supporting multiple message variants tend to rely on a surrounding resource format to define variants,
such as [Rails internationalization](https://guides.rubyonrails.org/i18n.html#pluralization) in Ruby or YAML
and [Android String Resources](https://developer.android.com/guide/topics/resources/string-resource.html#Plurals) in XML.
These formats rely on the resource format providing clear delineation of the beginning and end of a pattern.

## Use-Cases

Most messages in any localization system do not contain any expressions, statements or variants.
These should be expressible as easily as possible.

Many messages include expressions that are to be interpolated during formatting.
For example, a greeting like "Hello, user!" may be formatted in many locales with the `user`
being directly set by an input variable.

Sometimes, interpolated values need explicit formatting within a message.
For example, formatting a message like "You have eaten 3.2 apples"
may require the input numerical value
to be formatted with an explicit `minimumFractionDigits` option.

Some messages require multiple variants.
This is often related to plural cases, such as "You have 3 new messages",
where the value `3` is an input and the "messages" needs to correspond with its plural category.

Rarely, messages needs to include leading or trailing whitespace due to
e.g. how they will be concatenated with other text,
or as a result of being segmented from some larger volume of text.

## Requirements

Easy things should be easy, and hard things should be possible.

Developers and translators should be able to read and write the syntax easily in a text editor.

As MessageFormat 2 will be at best a secondary language to all its users,
it should conform to user expectations and require as little learning as possible.

The syntax should avoid footguns,
in particular as it's passed through various tools during formatting.

## Constraints

Limiting the range of characters that need to be escaped in plain text is important.
Following past precedent,
this design doc will only consider encapsulation styles which
start with `{` and end with `}`.

The current syntax includes some plain-ascii keywords:
`input`, `local`, `match`, and `when`.

The current syntax and active proposals include some sigil + name combinations,
such as `:number`, `$var`, `|literal|`, `+bold`, and `@attr`.

The current syntax supports unquoted literal values as operands.

## Proposed Design

TBD

## Alternatives Considered

### Start in code, encapsulate text

This approach treats messages as something like a resource format for pattern values.
Keywords are declared directly at the top level of a message,
and patterns are surrounded by `{...}`.

Whitespace in patterns is never trimmed.

Some code statements (variable declarations and match statements)
also use `{...}` to surround values at the top level,
so counting `{` instances is not sufficient to identify if a value is "code" or "text".

The `{...}` are required for all messages,
including ones that only consist of text.
Delimiters of the resource format are required in addition to this,
so messages may appear wrapped as e.g. `"{...}"`.

Examples:

```
{Hello world}
```

```
{Hello {$user}}
```

```
input {$count :number minimumFractionDigits=1}
{You have eaten {$count} apples}
```

```
input {$count :number}
match {$count}
when 0 {You have no new message}
when one {You have {$count} new message}
when * {You have {$count} new messages}
```

```
{ and some more}
```

### Start in text, encapsulate code

The approach treats messages as template strings,
which may include statements and expressions surrounded by `{...}`.
Multi-variant messages require `match` and `when` statements that are followed by text at the top level.

Whitespace around statements may need to be trimmed
as e.g. `input` statements may be more readable when placed on a separate line,
where they would be followed by a newline.
At least the following trimming strategies may be considered:

1. Do not trim any whitespace.
1. Trim a minimal set of defined spaces:
   - All spaces before and between variable statements.
   - For single-variant messages, one newline after the last variable statement.
   - For multivariant messages,
     one space after a `when` statement and
     one newline followed by any spaces before a subsequent `when` statement.
1. Trim all leading and trailing whitespace.

All "code" statements are surrounded by `{...}`,
and all "text" is outside them.

Simple messages are not surrounded by any delimiters
other that what may be required by the resource format.

Examples using either "minimal" or "all" trimming:

```
Hello world
```

```
Hello {$user}
```

```
{input $count :number minimumFractionDigits=1}
You have eaten {$count} apples
```

```
{input $count :number}
{match {$count}}
{when 0} You have no new message
{when one} You have {$count} new message
{when *} You have {$count} new messages
```

```
{| |}and some more
```
