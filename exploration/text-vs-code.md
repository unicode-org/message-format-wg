# Message Pattern Quoting

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@eemeli</dd>
		<dd>@aphillips</dd><!-- Seville and other inserted edits -->
		<dd>@mihnita</dd>
		<dd>@echeran</dd>
		<dt>First proposed</dt>
		<dd>2023-09-13</dd>
		<dt>Pull Request</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/474">#474</a></dd>
	</dl>
</details>

## Objective

Decide whether text patterns must always be quoted,
or whether we allow them to be optionally quoted,
for non-simple messages in MF2.

## Background

Existing message and template formatting languages tend to start in "text" mode,
and require special syntax like `{{` or `{%` to enter "code" mode.

ICU MessageFormat and Fluent both support inline selectors
separated from the text using `{…}` for multi-variant messages.
ICU MessageFormat is the only known format that uses `{…}` to also delimit text.

Formatting and templating are distinct operations with similarities.
Both interpolate strings by using input values,
provided as inputs alongisde the formatting pattern string or template,
to produce a new string.
Formatting usually refers to smaller strings, usually no larger than a sentence,
whereas templating are used to produce larger strings, usually for text files of various file formats, often for HTML documents.

There are two different styles of templating library design.
Some languages/libraries enable the interopolation of the template substrings through programmatic expressions in "code mode" that print expressions to the output stream 
(ex: [PHP](https://www.php.net/),
[Freemarker](https://freemarker.apache.org/index.html)):
```php
<html>
...
	<?php
		if (true) {
			echo '<p>Hello World</p>';
		}
	?>
...
</html>
```
Some libraries separate string literal values from the programmatic expressions in "code mode" by defining a set of control flow constructs within delimiters,
and all text outside the delimiters is printed to the output stream,
and subject to control flow rules of their containing constructs.
(ex: [Mustache templates](https://mustache.github.io/mustache.5.html),
[Freemarker](https://freemarker.apache.org/index.html)).
```
{{#repo}}
  <b>{{name}}</b>
{{/repo}}
```
Some templating libraries support both styles.

When considering string formatting and templating libraries,
it is important to keep the rules of pattern or template handling separate from and uninfluenced by the output format's rules.
For example, many templating languages are designed around producing HTML output, for which consecutive whitespace characters within the output are collapsed into a single ASCII space by HTML renderers.
However, if the templating language is similarly not strict on preserving whitespace,
then it would be incapable of generating Python source code,
for which whitespace is significant in determining block scope via the indentation (leading whitespace on a line).

In fact, many HTML-oriented templating libraries preserve whitespace by default in a what-you-see-is-what-you-get (WYSIWYG) manner
([Mustache](https://mustache.github.io/mustache.5.html#Sections),
[Jinja](https://jinja.palletsprojects.com/en/3.1.x/templates/#whitespace-control)),
and some perform whitespace trimming in unspecified ways ([Handlebars](https://handlebarsjs.com/guide/expressions.html#whitespace-control)).
The [whitespace behavior for Freemarker](https://freemarker.apache.org/docs/dgui_misc_whitespace.html), a general purpose templating library for multiple formats, is also WYSIWYG by default while allowing several optional trimming controls.

Other formats supporting multiple message variants tend to rely on a surrounding resource format to define variants,
such as [Rails internationalization](https://guides.rubyonrails.org/i18n.html#pluralization) in Ruby or YAML
and [Android String Resources](https://developer.android.com/guide/topics/resources/string-resource.html#Plurals) in XML.
A message author will need to resolve the combination of the rules of these formats and the rules of the containing resource formats in order to achieve a clear delineation of the beginning and end of a pattern.
For example, an Android resource string that includes leading whitespace in the message might look like
```
<string xml:space="preserve">"   Section 7.a. Attribute Types"</string>
```
In this example above, the containing XML format will collapse consecutive whitespace characters into a single space unless you provide the attribute `xml:space="preserve"`.
After the resource file gets parsed as XML, the Android string resource format 
[does additional whitespace collapsing and Android escaping](https://developer.android.com/guide/topics/resources/string-resource#escaping_quotes),
requiring the entire text node string to be wrapped in double quotation marks `"..."` to preserve the initial whitespace, or the inital whitespace to use Android escaping (`\u0032 \u0032 ...`).

## Use-Cases

Most messages in any localization system do not contain any expressions, statements or variants.

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

Rarely do messages that need to include leading or trailing whitespace do so due to
how they will be concatenated with other text,
or as a result of being segmented from some larger volume of text.
Based on available data,
no more than 0.3% of all messages and no more than 0.1% of messages with variants
contain leading or trailing whitespace.

However, frequency of occurrence is not an indicator of the importance of leading or trailing whitespace to those authoring such messages.
For example, sometimes such messages are authored in order to achieve a semblance of formatting in contexts that lack rich text presentation styles,
such as operating system widgets.
Even though such messages are usually infrequent relative to the size of all user-facing / transalatable messages,
that is not an indicator of their significance.
Also importantly, we cannot make assumptions about the validity of leading or trailing whitespace in a message,
especially since their usage may be entirely unrelated to internationalization issues (ex: sentence agreement disruption by concatenation).

---

Developers who have messages that include leading or trailing whitespace
want to ensure that this whitespace is included in the translatable
text portion of the message.
Which whitespace characters are displayed at runtime should not be surprising.

## Requirements

It should be easy to do simple things; possible to do complex things; and impossible, or at least difficult, to do wrong things.

<details>
<blockquote>
APIs should be easy to use and hard to misuse. It should be easy to do simple things; possible to do complex things; and impossible, or at least difficult, to do wrong things.

—<a href="https://www.infoq.com/articles/API-Design-Joshua-Bloch/">Joshua Bloch, 2008</a>, author of <i>Effective Java</i>, etc.
</blockquote>
<blockquote>
The Pit of Success: in stark contrast to a summit, a
peak, or a journey across a desert to find victory through many trials and
surprises, we want our customers to simply fall into winning practices by using
our platform and frameworks. To
the extent that we make it easy to get into trouble we fail.
          
—Rico Mariani, MS Research MindSwap Oct 2003. (<a href="https://learn.microsoft.com/en-us/archive/blogs/brada/the-pit-of-success">restated by Brad Adams</a>, MS CLR and .Net team cofounder)
</blockquote>
</details>

Developers and translators should be able to read and write the syntax easily in a text editor.

Translators (and their tools) are not software engineers, so we want our syntax
to be as simple and robust as possible.

Nesting level is not a requirement.
People are not parsers, and don't care about the nesting level as a primary concern when reading a message.
What matters to them is their ability to recognize where a message's pattern starts and where it ends.
In the following example, localizable text is easily recognizable (especially with syntax highlighting),
even if it occurs 3 level deep.

```java
print "{{{This is translatable}}}"
if (foo) print "{{{This is translatable}}}" else print "{{{This is NOT translatable}}}"
if (foo) if (bar) switch (baz) case 1: print "{{{This is translatable, deep}}}" break; default: print "{{{This is NOT translatable, deep}}}"
```

As MessageFormat 2 will be at best a secondary language to all its authors and editors,
it should conform to user expectations and require as little learning as possible.

The syntax should avoid footguns, in particular as it's passed through various tools during formatting or stored existing file formats, databases, etc.
Very importantly in this regard,
we should minimize the range of characters that need to be escaped in patterns.


ASCII-compatible syntax. While support for non-ASCII characters for variable names,
values, literals, options, and the like are important, the syntax itself should
be restricted to ASCII characters. This allows the message to be parsed
visually by humans even when embedded in a syntax that requires escaping.

Whitespace is forgiving, so we should be flexible with its use in the code area of message.
This avoids the need for translators or tools to be super pedantic about
formatting.
However, we want WYSIWYG behavior as much as possible in patterns, meaning that there is minimal visual difference
between the pattern and its interpolated output,
and that there is minimal ambiguity.
This avoids chances for unwanted surprises between the message authoring time expectations and the actual runtime formatted results.

## Constraints

Limiting the range of characters that need to be escaped in plain text is important.

The current syntax includes some plain-ascii keywords:
`input`, `local`, `match`, and `when`.

The current syntax and active proposals include some sigil + name combinations,
such as `:number`, `$var`, `|literal|`, `+bold`, `-bold`, and posibly `@attr`.

The current syntax supports unquoted literal values as operands.

Messages themselves are "simple strings" and must be considered to be WYSIWYG.
The WYSIWYG nature of representing a message pattern is independent of whether the message is a single line or contains multiple lines.

There is no restriction that a message must only contain a single line (that is, not contain any newline characters),
nor are there constraints about how newlines must be represented. As our [`spec/syntax.md`](../spec/syntax.md) states:

> Any Unicode code point is allowed, except for surrogate code points U+D800 through U+DFFF inclusive.

> Whitespace in _text_, including tabs, spaces, and newlines is significant and MUST be preserved during formatting.

> ... Instead, we tolerate direct use of nearly all
characters (including line breaks, control characters, etc.) and rely upon escaping
in those outer formats to aid human comprehension (e.g., depending upon container
format, a U+000A LINE FEED might be represented as `\n`, `\012`, `\x0A`, `\u000A`,
`\U0000000A`, `&#xA;`, `&NewLine;`, `%0A`, `<LF>`, or something else entirely).

## Simple Messages

In the Subcommittee meetings following Github discussions on Issues #493 and #499,
the general consensus that formed for simple messages
is that we allow them to be unquoted.

("Simple messages" refers to messages consisting solely of a pattern, and thus are not complex messages.)

Because the simple message pattern consists of the entire message,
the pattern includes any leading or trailing whitespace.

Given simple messages already being decided at a high level,
the design decisions below for the proposed and alternative designs pertain specifically to complex messages.

## Proposed Design

### Start in text, encapsulate message, always quote patterns

Description:

Since simple messages are unquoted (starting in text mode),
complex messages must also start in text mode.

Within a complex message, patterns are always quoted with `{{...}}` or other choice of delimiter.

The entire complex message is also wrapped with `{{...}}` or other choice of delimiter.
This allows interior "code mode" of message to have flexible whitespace in between tokens
and _around_ quoted patterns.

Pros

* The rule about the whether leading and trailing whitespace is included is simple and unambiguous.
* This matches the WYSIWIG behavior that simple messages preserve.
* The patterns can be detected within the pattern more easily due to the delimiters serving as a visual anchor.
* Requiring all patterns to be quoted minimizes the number of characters that need to be escaped within a pattern to 3:
the 2 pattern delimiter characters and the escape character itself.
* Because the sum of counts of declarations + `match` statement + `when` statements is always
greater than or equal to the number of patterns,
wrapping the entire message once yields less visual noise of repetitive code mode introducer symbols
when there is 1+ declarations in a `match` (selection) message,
or when there are 2+ declarations in a non-`match` complex message.

Cons:

* This comes at the cost of an inconsistency in the WYSIWYG patterns are quoted between simple and complex messages.
In the case of simple messages, the containing format itself implicitly defines the beginning and end of the pattern (example: `"..."`), which is not visible at the level of MF2,
while complex messages use the aforementioned delimiter to quote patterns (ex: `{{...}}`).
* Another potential drawback, specifically in the case of non-`match` complex messages with exactly 1 declaration,
is that this option adds 2 extra delimiters compared to an alternative syntax that doesn't require quoted patterns
and is designed to minimize delimiter usage only to code mode introducers.

Evaluation:

The pros outweigh the cons, not just in cardinality, but far more importantly, according to the relative weight
our value system places to the requirements met by the pro aspects compared to the con aspects. Namely:

* [high] Unsurprising WYSIWYG behavior from patterns
* [high] Easy recognition of patterns, even for non-developers
* [high] A minimal number of characters requiring escaping
* [high] No limitations on users with valid non-i18n concerns
* [med] Flexible whitespace outside of patterns
* [low] Number of characters typed (probably comparable with alternatives anyways)
* [low] Number of "mode levels" from a parser perspective


## Alternatives Considered

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

## Scoring matrix

TBD
