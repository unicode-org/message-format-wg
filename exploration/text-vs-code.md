# Message Parse Mode

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@eemeli</dd>
		<dd>@aphillips</dd><!-- Seville and other inserted edits -->
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
separated from the text using `{…}` for multi-variant messages.
ICU MessageFormat is the only known format that uses `{…}` to also delimit text.

[Mustache templates](https://mustache.github.io/mustache.5.html)
and related languages wrap "code" in `{{…}}`.
In addition to placeholders that are replaced by their interpolated value during formatting,
this also includes conditional blocks using `{{#…}}`/`{{/…}}` wrappers.

[Handlebars](https://handlebarsjs.com/guide/) extends Mustache expressions
with operators such as `{{#if …}}` and `{{#each …}}`,
as well as custom formatting functions that become available as e.g. `{{bold …}}`.

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

Based on available data,
no more than 0.3% of all messages and no more than 0.1% of messages with variants
contain leading or trailing whitespace.
No more than one third of this whitespace is localizable,
and most commonly it's due to improper segmentation or other internationalization bugs.

## Use-Cases

Most messages in any localization system do not contain any expressions, statements or variants.
These should be expressible as easily as possible.

Many messages include expressions that are meant to be replaced during formatting.
For example, a greeting like "Hello, {$username}!" would be formatted with the variable
`$username` being replaced by an input variable.

In some rare cases, replacement variables might be added (or removed) in one particular
locale versus messages in other locales.

Sometimes, the replacement variables need to be formatted.
For example, formatting a message like `You have {$distance} kilometers to go`
requires that the numeric value `{$distance}` be formatted as a number according to the locale: `You have 1,234 kilometers to go`.

Formatting of replacement variables might also require tailoring.
For example, if the author wants to show fractions of a kilometer in the above example
they might include a `minimumFractionDigits` option to get a result like
`You have 1,234.5 kilometers to go`.

Some messages need to choose between multiple patterns (called "variants").
For example, this is often related to the handling of numeric values,
in which the pattern used for formatting depends on one of the data values
according to its plural category
(see [CLDR Plural Rules](https://cldr.unicode.org/index/cldr-spec/plural-rules) for more information).
So, in American English, the formatter might need to choose between formatting
`You have 1 kilometer to go` and `You have 2 kilometers to go`.

Rarely, messages needs to include leading or trailing whitespace due to
e.g. how they will be concatenated with other text,
or as a result of being segmented from some larger volume of text.

---

Developers editing a simple message and who wish to add an `input` or `local` annotiation
to the message do not wish to reformat the message extensively.

Developers who have messages that include leading or trailing whitespace
want to ensure that this whitespace is included in the translatable
text portion of the message.
Which whitespace characters are displayed at runtime should not be surprising.

## Requirements

Common things should be easy, uncommon things should be possible.

Developers and translators should be able to read and write the syntax easily in a text editor.

Translators (and their tools) are not software engineers, so we want our syntax
to be as simple, robust, and non-fussy as possible.
Multiple levels of complex nesting should be avoided,
along with any constructs that require an excessive
level of precision on the part of non-technical authors.

As MessageFormat 2 will be at best a secondary language to all its authors and editors,
it should conform to user expectations and require as little learning as possible.

The syntax should avoid footguns,
in particular as it's passed through various tools during formatting.

ASCII-compatible syntax. While support for non-ASCII characters for variable names,
values, literals, options, and the like are important, the syntax itself should
be restricted to ASCII characters. This allows the message to be parsed
visually by humans even when embedded in a syntax that requires escaping.

Whitespace is forgiving.
We _require_ the minimum amount of whitespace and allow
authors to format or change unimportant whitespace as much as they want.
This avoids the need for translators or tools to be super pedantic about
formatting.

## Constraints

Limiting the range of characters that need to be escaped in plain text is important.

The current syntax includes some plain-ascii keywords:
`input`, `local`, `match`, and `when`.

The current syntax and active proposals include some sigil + name combinations,
such as `:number`, `$var`, `|literal|`, `+bold`, and `@attr`.

The current syntax supports unquoted literal values as operands.

Messages themselves are "simple strings" and must be considered to be a single
line of text. In many containing formats, newlines will be represented as the local
equivalent of `\n`.

## Proposed Design

### Start in text, encapsulate code, trim around statements

Allow for message patterns to not be quoted.

Encapsulate with `{…}` or otherwise distinguishing statements from
the primarily unquoted translatable message contents.

For messages with multiple variants,
separate the variants using `when` statements.

Trim whitespace between and around statements such as `input` and `when`,
but do not otherwise trim any leading or trailing whitespace from a message.
This allows for whitespace such as spaces and newlines to be used outside patterns
to make a message more readable.

Allow for a pattern to be `{{…}}` quoted
such that it preserves its leading and/or trailing whitespace
even when preceded or followed by statements.

## Alternatives Considered

### Start in code, encapsulate text

This approach treats messages as something like a resource format for pattern values.
Keywords are declared directly at the top level of a message,
and patterns are always surrounded by `{{…}}` or some other delimiters.

Whitespace in patterns is never trimmed.

The `{{…}}` are required for all messages,
including ones that only consist of text.
Delimiters of the resource format are required in addition to this,
so messages may appear wrapped as e.g. `"{{…}}"`.

This option is not chosen due to adding an excessive
quoting burden on all messages.

### Start in text, encapsulate code, re-encapsulate text within code

As in the proposed design, simple patterns are unquoted.
Patterns in messages with statements, however,
are required to always be surrounded by `{{…}}` or some other delimiters.

This effectively means that some syntax will "enable" code mode for a message,
and that patterns in such a message need delimiters.

This option is not chosen due to adding an excessive
quoting burden on all multi-variant messages,
as well as introducing an unnecessary additional conceptual layer to the syntax.

### Start in text, encapsulate code, trim minimally

This is the same as the proposed design,
but with a different trimming rule:

- Trim all spaces before and between declarations.
- For single-variant messages, trim one newline after the last declaration.
- For multivariant messages,
  trim one space after a `when` statement and
  one newline followed by any spaces before a subsequent `when` statement.

This option is not chosen due to the quoting being too magical.
Even though this allows for all patterns with whitespace to not need quotes,
the cost in complexity is too great.

### Start in text, encapsulate code, trim maximally

This is the same as the proposed design,
but with a different trimming rule:

- Trim all leading and trailing whitespace for each pattern.

Expressing the trimming on patterns rather than statements
means that leading and trailing spaces are also trimmed from simple messages.
This option is not chosen due to this being somewhat surprising,
especially when messages are embedded in host formats that have predefined means
of escaping and/or trimming leading and trailing spaces from a value.

### Start in text, encapsulate code, do not trim

This is the same as the proposed design,
but with two simplifications:

- No whitespace is ever trimmed.
- Quoting a pattern with `{{…}}` is dropped as unnecessary.

With these changes,
all whitespace would need to be explicitly within the "code" part of the syntax,
and patterns could never be separated from statements
without adding whitespace to the pattern.
