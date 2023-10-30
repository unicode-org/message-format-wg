# Unquoted Variant Patterns

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
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/503">#503</a></dd>
	</dl>
</details>

## Objective

The current syntax requires all patterns to be "quoted" in non-simple messages.

We need to determine if we should allow patterns to be unquoted and, if so,
how to determine the boundary between the pattern and any message code.

## Background

### Summary

A _pattern_ is the portion of a _message_ that will be formatted to produce
output in a call to the MessageFormat API.

Patterns include _text_ and _placeholders_.

_Placeholders_ are the parts of the pattern that are replaced during formatting.
>For example, in the following message, `{$var}` is a placeholder:
>```
>This has a {$var} placeholder.
>```

_Text_ are the string literal parts of a message.
Text consists of a sequence of Unicode characters.
This include all Unicode whitespace characters.

>[!IMPORTANT]
>When whitespace appears in (is part of) a pattern it is _always_ preserved by MessageFormat

There are three ways that patterns can appear in a message:
> 1. As a simple message:
> ```
>     Hello {$user}!   
> ```
> 2. As a pattern following declarations:
> ```
> {{
>    input {$num :number}
>    {{   This is the {$num} pattern   }}
> }}
> ```
> 3. As part of a variant (following a _key_):
> ```
> {{
>    match {$num :plural}
>    when 0   {{   This is the zero pattern   }} <- the {{}} part is a pattern
>    when one {{   This is the {$num} pattern   }}
>    when *   {{   These are the {$num} patterns   }}
> }}
> ```

With the current syntax, the boundary between pattern and the remainder of the message is always clear
because the pattern is either the entire string
or enclosed in the `{{...}}` quoting required by the syntax.


## Use-Cases

As a user, I sometimes need to include pattern-meaningful whitespace at
the start or end of a pattern and I expect that whitespace to be preserved
through the MessageFormat process. 
I understand that my choice of storage format (such as .properties, strings.xml,
ListResourceBundle, gettext `.po`, etc. etc.) may impact whitespace appearing
in my serialization format. 
However, I need to know reliably whether whitespace in a _message_ will appear
(or not appear) in my output.

As a translator, I need to determine the boundaries of the patterns easily.
I also need to be able to modify the whitespace that appears in a given
pattern, including at the front or end of the pattern.

As a developer, I want to format my MF2 patterns in ways that are easy for 
other developers, UX designers, or translators to use.
I want to be able to break longer messages 
(particularly those with match statements)
into multiple lines for readability without negatively affecting the output.

## Requirements

* [high] Whitespace that is definitely inside a pattern must be preserved by MF2 formatters.
* [high] The boundary of a pattern should be as simple to define and easy to visually detect as possible.
* [high] Message syntax should avoid as many escape sequences as possible, particularly those that
  might interfere with or require double-escaping in storage formats.
* [med] Whitespace that is permitted in a message that is not part of the pattern should be forgiving
  and not require special effort to manage.
* [med] The message syntax should be as simple and robust as possible, but no simpler.
* [med] The message syntax should avoid as many levels of nesting or character pairing
  as possible, but no more.


## Non-requirements

* We should not make things harder for users unless it is to discourage well-known i18n bad practices (ex: message concatenation).
    - There are valid non-i18n use cases in OSes for leading/trailing whitespace.
* We should not confuse the _frequency_ of a usage pattern with its _impact_.
    - The _impact_ of a user making a surprising mistake depends on the _cost to fix it_, or the value of where it is used, or other factors. The occurrence rate in a message corpus usually does not directly reflect those concerns.
	- Also, instead of frequency of mistakes, we should consider how well we make it difficult to make mistakes.
		> It should be easy to do simple things; possible to do complex things; and impossible, or at least difficult, to do wrong things.
		>
		> —<a href="https://www.infoq.com/articles/API-Design-Joshua-Bloch/">Joshua Bloch, 2008</a>, author of <i>Effective Java</i>, etc.
* Reducing the number of characters typed to the point it reduces clarity
    - Beyond a certain point, there becomes a tradeoff between clarity and concision. (ex: Perl)

## Constraints

Some of the alternatives will require changes to the syntax to produce better usability.
Similarly the current syntax could benefit from improvements if we decide to keep it.

There are a limited number of sigils available for quoting.

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

Currently the syntax uses the first alternative below.

## Alternatives Considered

There are five candidates for handling the boundaries between code and patterns:

1. Always quote non-simple patterns (current design)
2. ~~Never quote patterns (all whitespace is significant)~~
3. Permit non-simple patterns to be quoted and trim unquoted whitespace
4. Trim all unquoted whitespace, but do not permit quoting non-simple patterns
5. ~~Selectively trim patterns (all whitespace is otherwise significant)~~

### Always Quote

```
{{
match {$var}
when   0 {{This has no space in front of it.}}
when one
   {{This has no space or newline in front of it.}}
when few
  {{ This has one space at the start and the end. }}
when many   {{ This also has one space start and end. }}
when * {{You must quote all variant patterns.}}
}}
```

Pros:
- The boundary between pattern and code is always clear.
- The quoting reduces the number of in-pattern escapes to the open/close sequence.
  and the placeholder sequence sigils.
- Since the pattern is already quoted, translators never have to add pattern quotes
  in order to add PEWs to a given pattern.
  This also might avoid some tools forcing escaping on added quotes that are needed.

Cons:
- Requires matching open/close quotes.

### Never Quote Patterns

> [!IMPORTANT]
> This option was rejected by the working group in the 2023-10-30 call.

In this alternative, all non-code whitespace is significant. 
We have to use a slightly different syntax in the example, so that
the boundary between code and pattern works.
>```
>{{
>   match {$var}
>   {when *} This pattern has a space in front (it's between \} and This)
>   {when other}
>      This pattern has a newline and six spaces in front of it
>   {when moo}This pattern has no spaces in front of it, but an invisible space at the end
>}}
>```

Pros:
- WYSIWYG (on steroids)

Cons:
- Probably not a serious alternative: the example
  includes any number of obvious footguns that have to be addressed

### Permit pattern quoting

In this alternative, non-simple patterns are trimmed, but it is 
possible to use quoting to separate the pattern from code (and prevent trimming)
>```
>{match {$var}}
>{when   0} This has no space in front of it.
>{when one}
>    This has no space or newline in front of it.
>{when few}
>   {{ This has one space at the start and the end. }}
>{when many}   {{ This also has one space start and end. }}
>{when *}{{You can quote patterns even without whitespace.}}
>```

Pros:
- Code is special instead of text.
- Easy to use (best of both worlds?)

Cons:
- Requires one of the alternate syntaxes
- Has two ways to represent a pattern.
- May be difficult for translators to add quotes when needed.

### Trim All Unquoted

In this alternative, all non-code whitespace is trimmed
and we do not allow/provide for pattern quoting.
Instead, PEWS whitespace must be individually quoted.

> [!NOTE]
> Whitespace quoting also works in the preceeding alternatives
> because it is an inherent part of the syntax.
> We don't show it in those alternatives because it is
> distracting.

>```
>{match {$var}}
>{when   0} This has no space in front of it.
>{when one}
>    This has no space or newline in front of it.
>{when few}
>   {||} This has one space at the start and the end. {||}
>{when many}   {| |}This also has one space start and end.{| |}
>{when *}
>
>       No amount of whitespace matters before this pattern
>       but all of the whitespace at the end does.
>
>       {||}
>```

Pros:
- Code is special, whitespace is not.
- Makes PEWS into a "special event", alerting developers to the non-I18N aspects of it?

Cons:
- Weird and unattractive.

### Selective Trimming

> [!IMPORTANT]
> This option was rejected by the working group in the 2023-10-30 call.

In this alternative, only specific whitespace is automatically trimmed
and the whitespace can be omitted.
This is similar to "Never Quote Patterns" in that all whitespace
is significant **_except_** for a newline, space, or newline space
directly after code:
>```
>{match {$var}}
>{when   0} This has no space in front of it.
>{when one}
> This has no space or newline in front of it.
>{when 1}
>  This has no newline but does have one space in front of it.
>{when few}
>  This has no space or newline in front of it or at the end {when many}This has no spaces or newlines.
>{when 11}
>
> This has a newline and a space at the start and a space-newline at the end
>
>{when *}{|
>|} You can quote the newlines and spaces should you desire {|
>|}
>```

Pros:
- More foregiving in some circumstances?

Cons:
- More complicated to use.
- Users may be unclear where the boundaries are.


## Scoring matrix

TBD

## Extra Info

### Extra Info: Background

<details>

#### Formatting and templating

Existing message and template formatting languages tend to start in "text" mode,
and require special syntax like `{{` or `{%` to enter "code" mode.

ICU MessageFormat and Fluent both support inline selectors
separated from the text using `{…}` for multi-variant messages.
ICU MessageFormat is the only known format that uses `{…}` to also delimit text.

Formatting and templating are distinct operations with similarities.
Both take input values to replace portions of the pattern string or template, producing a new, formatted, string.
Formatting usually refers to smaller strings, usually no larger than a sentence,
whereas templating is typically used to produce larger strings (generally whole documents, such as an HTML file)

#### Templating styles and nesting levels

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

#### Templating whitespace handling

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

#### Containing Format Interaction with Messages

Other formats supporting multiple message variants tend to rely on a surrounding resource format to define variants,
such as [Rails internationalization](https://guides.rubyonrails.org/i18n.html#pluralization) in Ruby or YAML
and [Android String Resources](https://developer.android.com/guide/topics/resources/string-resource.html#Plurals) in XML.
A message author will need to resolve the combination of the rules of these formats and the rules of the containing resource formats in order to achieve a clear delineation of the beginning and end of a pattern.
For example, an Android resource string that includes leading whitespace in the message might look like
```
<string xml:space="preserve">"   Section 7.a. Attribute Types"</string>
```
In this example above, the containing XML format will collapse consecutive whitespace characters into a single space unless you provide the attribute `xml:space="preserve"`.
After the resource file gets parsed as XML, the Android resource compiler requires
[does additional whitespace collapsing and Android escaping](https://developer.android.com/guide/topics/resources/string-resource#escaping_quotes),
requiring the entire text node string to be wrapped in double quotation marks `"..."` to preserve the initial whitespace, or the inital whitespace to use Android escaping (`\u0032 \u0032 ...`).

</details>

### Extra Info: Use Cases

<details>

#### Summary of General MF Behavior

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

#### Leading and Trailing Whitespace

Rarely, messages need to include leading or trailing whitespace due to
e.g. how they will be concatenated with other text,
or as a result of being segmented from some larger volume of text.
Based on available data,
no more than 0.3% of all messages and no more than 0.1% of messages with variants
contain leading or trailing whitespace.

However, frequency of occurrence is not an indicator of the importance of leading or trailing whitespace to those authoring such messages.
For example, sometimes such messages are authored in order to achieve a [semblance of formatting in contexts that lack rich text presentation styles](https://docs.oracle.com/cd/E19957-01/817-4220/images/SetupWizWelcome2.gif),
such as operating system widgets.
Even though such messages are usually infrequent relative to the size of all user-facing / transalatable messages,
that is not an indicator of their significance.
There are valid use cases for leading or trailing whitespace in a message that are not internationalization bugs.
This means that it is not MF2's concern to enforce/discourage their usage.

Developers who have messages that include leading or trailing whitespace
want to ensure that this whitespace is included in the translatable
text portion of the message.
Which whitespace characters are displayed at runtime should not be surprising.

</details>

### Extra Info: Requirements

<details>

#### Design Around Simplicity/Correctness

It should be easy to do simple things; possible to do complex things; and impossible, or at least difficult, to do wrong things.


<blockquote>
APIs should be easy to use and hard to misuse. It should be easy to do simple things; possible to do complex things; and impossible, or at least difficult, to do wrong things. (per Joshua Bloch)

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

#### Balance Between Legibility and Nesting Levels

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

#### Ease, Escaping, Reserved Syntax, Whitespace

As MessageFormat 2 will be at best a secondary language to all its authors and editors,
it should conform to user expectations and require as little learning as possible.

The syntax should avoid footguns, in particular as it's passed through various tools during formatting or stored existing file formats, databases, etc.
Very importantly in this regard,
we should minimize the range of characters that need to be escaped in patterns.


ASCII-compatible syntax. While support for non-ASCII characters for variable names,
values, literals, options, and the like are important, the syntax itself should
be restricted to ASCII characters. This allows the message to be parsed
visually by humans even when embedded in a syntax that requires escaping.

We should be flexible with the use of whitespace in the code area of message.
This avoids the need for translators or tools to be super pedantic about
formatting.
However, we want WYSIWYG behavior as much as possible in patterns, meaning that there is minimal visual difference
between the pattern and its interpolated output,
and that there is minimal ambiguity.
This avoids chances for unwanted surprises between the message authoring time expectations and the actual runtime formatted results.
</details>

### Extra Info: Constraints

<details>

#### Current Syntax Keywords & Values

Limiting the range of characters that need to be escaped in plain text is important.

The current syntax includes some plain-ascii keywords:
`input`, `local`, `match`, and `when`.

The current syntax and active proposals include some sigil + name combinations,
such as `:number`, `$var`, `|literal|`, `+bold`, `-bold`, and possibly `@attr`.

The current syntax supports unquoted literal values as operands.

#### Message Representation When Embedding in Container Format

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
</details>
