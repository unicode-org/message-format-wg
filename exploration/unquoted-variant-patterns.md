# Unquoted Variant Patterns

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@aphillips</dd>
		<dt>First proposed</dt>
		<dd>2023-10-27</dd>
		<dt>Pull Requests</dt>
		<dd>#</dd>
	</dl>
</details>

## Objective

The current syntax requires all patterns to be "quoted" in non-simple messages.

We need to determine if we should allow patterns to be unquoted and, if so,
how to determine the boundary between the pattern and any message code.

## Background

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

As a translator, I need to be able to modify the whitespace that appears in a given
pattern, including at the front or end of the pattern.

As a developer, I want to format my MF2 patterns in ways that are easy for 
other developers, UX designers, or translators to use.
I want to be able to break longer messages 
(particularly those with match statements)
into multiple lines for readability without negatively affecting the output.

## Requirements

* Whitespace that is definitely inside a pattern must be preserved by MF2 formatters.
* Whitespace that is permitted in a message that is not part of the pattern should be forgiving
  and not require special effort to manage.
* Message syntax should avoid as many escape sequences as possible, particularly those that
  might interfere with or require double-escaping in storage formats.
* The message syntax should be as simple and robust as possible, but no simpler.
* The message syntax should avoid as many levels of nesting or character pairing
  as possible, but no more.

## Constraints

Some of the alternatives will require changes to the syntax to produce better usability.
Similarly the current syntax could benefit from improvements if we decide to keep it.

There are a limited number of sigils available for quoting.

## Proposed Design

Currently the syntax uses the first alternative below.

## Alternatives Considered

There are five candidates for handling the boundaries between code and patterns:

1. Always quote non-simple patterns (current design)
2. Never quote patterns (all whitespace is significant)
3. Permit non-simple patterns to be quoted and trim unquoted whitespace
4. Trim all unquoted whitespace, but do not permit quoting non-simple patterns
5. Selectively trim patterns (all whitespace is otherwise significant)

### Always Quote

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

Cons:
- Requires one of the alternate syntaxes
- Has two ways to represent a pattern.

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
>>{when *}{|
>|} You can quote the newlines and spaces should you desire {|
|}
>```

Pros:
- More foregiving in some circumstances?

Cons:
- More complicated to use.
- Users may be unclear where the boundaries are.
