# Bidi Usability

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@aphillips</dd>
		<dt>First proposed</dt>
		<dd>2024-03-27</dd>
		<dt>Pull Requests</dt>
		<dd>#000</dd>
	</dl>
</details>

## Objective

_What is this proposal trying to achieve?_

The MessageFormat v2 syntax uses whitespace as a required delimiter
as well as permitting the use of whitespace to make _messages_ easier to read.
In addition, a _message_ can include bidirectional text in identifiers and literal values.

MessageFormat's syntax also uses a variety of "sigils" and markers to form the structure of a _message_.
These sigils are ASCII punctuation characters that have neutral directionality.
This means that the inclusion of right-to-left ("RTL") identifiers or literals in a _message_
can result in the syntax looking "scrambled" or, in extreme cases, appearing to have a different meaning
due to [spillover](https://www.w3.org/TR/i18n-glossary/#dfn-spillover-effects).

To prevent spillover effects and to allow users (particularly RTL language users)
to author _messages_ in a straightforward way, we want to allow the syntax to include appropriate
bidirectional support and to recommend to tool and translation technology implementers
mechanisms to make _messages_ that include RTL characters easy to work with
without introducing spoofing or "Trojan Source" attack vectors.

## Background

_What context is helpful to understand this proposal?_

If you are unfamiliar with bidirectional or right-to-left text, there is a basic introduction 
[here](https://www.w3.org/International/articles/inline-bidi-markup/uba-basics).

MessageFormat _message_ strings are created and edited primarily by humans.
The original _message_ is often written by a software developer or user experience designer.
Translators need to work with the target-language versions of each _message_.
Like many templating or domain-specific languages, MFv2 uses neutrally-directional symbols
to form portions of the syntax.
When the _message_ contains right-to-left (RTL) translations or uses values that are RTL,
the plain-text of the message and the Unicode Bidirectional Algorithm (UBA, UAX#9)
interact in ways that make the _message_ unintelligible or difficult to parse visually.

Machines do not have a problem parsing _messages_ that contain RTL characters,
but users need to be able to discern what a _message_ does,
what _variant_ will be selected,
or what a _placeholder_ will evaluate into.

In addition, it is possible to construct messages that use bidi characters to spoof
users into believing that a _message_ does something different than what it actually does.

The current syntax does not permit bidi controls in _name_ tokens,
_unquoted_ literal values,
or in the whitespace portions of a _message_.

Permitting the **isolate** controls and the standalone strongly-directional markers
would enable tools, including translation tools, and users who speak RTL languages
to format a _message_ so that its plain-text representation and its function
are unambiguous.

The isolate controls are paired invisible control characters inserted around a portion of a string.
The start of an isolate sequence is one of:
- U+2066 LEFT-TO-RIGHT ISOLATE (LRI)
- U+2067 RIGHT-TO-LEFT ISOLATE (RLI)
- U+2068 FIRST-STRONG ISOLATE (FSI)

The end of an isolate sequence is U+2069 POP DIRECTIONAL ISOLATE (PDI).

The characters inside an isolate sequence have the initial string (paragraph) direction
corresponding to the starting control (LTR for LRI, RTL for RLI, auto for FSI).
The isolate sequence is **isolated** from surrounding text.
This means that the surrounding text treats it as-if the sequence were a single neutral character.

> [!NOTE]
> One of the side-effects of using `{`/`}` and `{{`/`}}` to delimit _expressions_
> and _patterns_ is that these paired enclosing punctuations provide a measure of
> isolation in UBA.
> This is an additional reason not to change over to quote marks (which are not enclosing)
> around patterns.

## Use-Cases

_What use-cases do we see? Ideally, quote concrete examples._

Presentation of keys can change if values are not isolated:
```
.match {$م2صر :string}{$num :integer}
م2صر 0 {{The {$م2صر} is actually the first key}}
م2صر * {{This one appears okay}}
```

Presentation in an expression can change if values are not isolated or restore LTR order:
> In the following example, we use the same string with a number inserted into the middle of
> the string to make the bidi effects visible.
> The numbers correspond to:
> 1. operand
> 2. function
> 3. option name
> 4. option value

```
You have {$م1صر :م2صر م3صر=م4صر} <- no controls
You have {$م1صر‎ :م2صر‎ م3صر‎=م4صر‎} <- LRM after each RTL token
```

## Requirements

_What properties does the solution have to manifest to enable the use-cases above?_

To prevent RTL _literals_ from having spillover effects with surrounding syntax,
it should be possible to bidi isolate a _quoted_ or _unquoted_ _literal_.

>```
> .local $title = {|البحرين مصر الكويت!|}
> .local $egypt = {مصر :string}
>```

To prevent _patterns_ from having spillover effects with other parts of a _message_,
particularly with _keys_ in a _variant_,
it should be possible to bidi-isolate a _quoted-pattern_.

>```
> .match {$foo :string}
> isolate {{البحرين مصر الكويت!}}
>```

To prevent _markup_, _placeholders_, or _expressions_ from having spillover effects 
with other parts of a _message_
it should be possible to bidi isolate the contents of a _markup_ or an _expression_.

>```
> You can find it in {$مصر}.
>```

To prevent RTL identifiers from having spillover effects with other parts of an _expression_,
it should be possible to include "local effect" bidi controls following an _identifier_,
_name_,
_option value_,
or _literal_.
These controls must not be included into the _identifier_, _name_, _option value_, or _literal_,
that is, it must be possible to distinguish these characters from the value in question.

>```
> You can use {$م1صر‎ :م2صر‎ م3صر‎=م4صر‎}
>```

## Constraints

_What prior decisions and existing conditions limit the possible design?_

Users cannot be expected to create or manage bidirectional controls or
marks in _messages_, since the characters are invisible and can be difficult
to manage.
Tools (such as resource editors or translation editors)
and other implementations of MessageFormat 2 serialization are strongly
encouraged to provide paired isolates around any right-to-left
syntax as described in this design so that _messages_ display appropriately as plain text.

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

Permit isolating bidi controls to be used on the **outside** of the following:
- unquoted literals
- quoted literals
- quoted patterns

This would change the ABNF as follows:
```abnf
literal        = ( open-isolate (quoted / unquoted) close-isolate)
               / (quoted / unquoted)
quoted-pattern = ( open-isolate "{{" pattern "}}" close-isolate)
               / ("{{" pattern "}}")

open-isolate   = %x2066-2068
close-isolate  = %x2069
```

> [!IMPORTANT]
> The isolating controls go on the **_outside_** of the various _literal_ and _pattern_
> productions because characters on the **_inside_** of these are part of the normal text.
> We need to allow users to include bidi controls in the output of MFv2.

Permit the use of LRM or RLM controls immediately following:
- name (note that this includes _identifiers_ as well as names of
  _functions_, _variables_, and _unquoted_ literals

> The one tricky part with `name` is whether we permit it between the `namespace` and `name`
> part of an `identifier`.

This would change the ABNF as follows:
```abnf
namespace = name-start *name-char ; same as name but lacks bidi close
name      = name-start *name-char [%x200E-200F]
```

> [!NOTE]
> Ideally we do not want RLM/LRM to be part of the `name` or part of any
> production that consumes `name` (such as `variable`, `reserved-keyword`, or `unquoted`).
> This is complicated to do in ABNF because each of these tokens is followed either by
> whitespace or by some closing marker such as `}`.
> The workaround in #763 is to permit these characters _before_ or _after_ whitespace
> using the various whitespace productions.
> This works at the cost of allowing spurious markers.

## Alternatives Considered

_What other solutions are available?_
_How do they compare against the requirements?_
_What other properties they have?_

### Nothing
We could do nothing.

A likely outcome of doing nothing is that RTL users would insert bidi controls into
_messages_ in an attempt to make the _pattern_ and/or _placeholders_ to display correctly.
These controls would become part of the output of the _message_,
showing up inappropriately at runtime.
Because these characters are invisible, users might be very frustrated trying to manage
the results or debug what is wrong with their messages.

By contrast, if users insert too many or the wrong controls using the recommended design,
the _message_ would still be functional and would emit no undesired characters.

### Deeper Syntax Changes
We could alter the syntax to make it more "bidi robust", 
such as by using strongly directional instead of neutrals.
