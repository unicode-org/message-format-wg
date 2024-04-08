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

The MessageFormat 2 syntax uses whitespace as a required delimiter
as well as permitting the use of whitespace to make _messages_ easier to read.
In addition, a _message_ can include bidirectional text in identifiers and literals.

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
Like many templating or domain-specific languages, MF2 uses neutrally-directional symbols
to form portions of the syntax.
When the _message_ contains right-to-left (RTL) characters in translations or
in portions of the syntax,
the plain-text of the message and the Unicode Bidirectional Algorithm (UBA, UAX#9)
can interact in ways that make the _message_ unintelligible or difficult to parse visually.

Machines do not have a problem parsing _messages_ that contain RTL characters,
but users need to be able to discern what a _message_ does,
what _variant_ will be selected,
or what a _placeholder_ will evaluate to.

In addition, it is possible to construct messages that use bidi characters to spoof
users into believing that a _message_ does something different than what it actually does.

The current syntax does not permit bidi controls in _name_ tokens,
_unquoted_ literals,
or in the whitespace portions of a _message_.

Permitting the **isolate** controls and the standalone strongly-directional markers
would enable tools, including translation tools, and users who are writing in RTL languages
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

This design also allows for the use of strongly directional marker characters.
These include:
- U+200E LEFT-TO-RIGHT MARK (LRM)
- U+200F RIGHT-TO-LEFT MARK (RLM)
- U+061C ARABIC LETTER MARK (ALM)

These characters are invisible strongly-directional characters used in bidirectional
text to coerce certain directional behavior (usually to mark the end of 
a sequence of characters that would otherwise be ambiguous or interact with
neutrals or opposite direction runs in an unhelpful way).

## Use-Cases

_What use-cases do we see? Ideally, quote concrete examples._

1. Presentation of _keys_ can change if the text of the _key's_ _literal_ is not isolated:
```
.match {$م2صر :string}{$num :integer}
م2صر 0 {{The {$م2صر} is actually the first key}}
م2صر * {{This one appears okay}}
```

> [!NOTE]
> 
> The first _variant_ in the use case above is actually:
>```
> \u06452\u0635\u0631 0 {{The {$\u06452\u0635\u0631} is actually the first key}}
>```


2. Presentation in an expression can change if portions of the expression
   are not isolated or do not restore LTR order:
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

3. As a developer or translator, I want to make RTL literal or names appear correctly
   in my plain-text editing environment.
   I don't want to have to manage a lot of paired controls, when I can get the right effect using
   strongly directional mark characters (LRM, RLM, ALM)

4. As a translation tool or MF2 implementation, I want to automatically generate 
   _messages_ which display correctly when they contain RTL text or substring with minimal user intervention.

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
that is, it must be possible to distinguish these characters from the identifier,
name, option value, or literal in question.

>```
> You can use {$م1صر‎ :م2صر‎ م3صر‎=م4صر‎}
>```

To prevent RTL _namespace_ names from having spillover effects with _function_ names,
it should be possible to include "local effect" strongly directional marks in an _identifier_:
> In this example, the _namespace_ is `:م2` and the _name_ is `:ن⁩3`, but the sequence is displayed
> with a spillover effect.
> (Note that the number in each name _trails_ the Arabic letter: it appears to the left because the
> string is RTL!).
>```
> {$a1 :b2:c3}
> {$م1 :م2:ن3} spillover effects
> {⁦$م1‎ :م2‎:ن3‎⁩} with isolates and LRMs
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

Ideally we do not want RLM/LRM/ALM to be part of the parsed
`name`, `variable`, `reserved-keyword`, `unquoted`, or any other term
defined in terms of `name`.
This is complicated to do in ABNF because each of these tokens is followed either by
whitespace or by some closing marker such as `}`.
The workaround in #763 was to permit these characters _before_ or _after_ whitespace
using the various whitespace productions.
This works at the cost of allowing spurious markers.

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

Permit isolating bidi controls to be used on the **outside** of the following:
- unquoted literals
- quoted literals
- quoted patterns

This would change the ABNF as follows:
(Notice that this change includes a production `bidi` described further down
in this document)
```abnf
literal        = ( open-isolate (quoted / (unquoted [bidi])) close-isolate)
               / (quoted / (unquoted [bidi]))
quoted-pattern = ( open-isolate "{{" pattern "}}" close-isolate)
               / ("{{" pattern "}}")

open-isolate   = %x2066-2068
close-isolate  = %x2069
```

> [!IMPORTANT]
> The isolating controls go on the **_outside_** of the various _literal_ and _pattern_
> productions because characters on the **_inside_** of these are part of the _literal_'s
> or _pattern_'s textual content.
> We need to allow users to include bidi controls in the output of MF2.

Permit isolating bidi controls to be used **immediately inside** the following:
- expressions
- markup

This would change the ABNF as follows (assuming the above changes are also incorporated):
```abnf
expression            = "{" open-isolate (literal-expression / variable-expression / annotation-expression) close-isolate "}"
                      / "{" (literal-expression / variable-expression / annotation-expression) "}"
literal-expression    = [s] literal [s annotation] *(s attribute) [s]
variable-expression   = [s] variable [s annotation] *(s attribute) [s]
annotation-expression = [s] annotation *(s attribute) [s]
markup = "{" [s] "#" identifier *(s option) *(s attribute) [s] ["/"] "}"                             ; open and standalone
       / "{" [s] "/" identifier *(s option) *(s attribute) [s] "}"                                   ; close
       / "{" open-isolate [s] "#" identifier *(s option) *(s attribute) [s] ["/"] close-isolate "}"  ; open and standalone
       / "{" open-isolate [s] "/" identifier *(s option) *(s attribute) [s] close-isolate "}"        ; close
```

Permit the use of LRM, RLM, or ALM stronly directional marks immediately following any of the items that
**end** with the `name` production in the ABNF. 
This includes _identifiers_ found in the names of
_functions_ 
and _options_,
plus the names of _variables_,
as well as the contents of _unquoted_ literals.

> [!NOTE]
> Notice that _unquoted_ literals can also be surrounded by bidi isolates
> using the previous syntax modification just above.

> [!NOTE]
> Notice that `reserved-annotation` is not in the ABNF changes because it already
> permits the marks in question.
> Any syntax derived from `reserved-annotation`
> (i.e. when unreserving a new statement in a future addition)
> would need to handle bidi explicitly using the model already established here.

```abnf
variable-expression   = "{" [s] variable [bidi] [s annotation] *(s attribute) [s] "}"
function       = ":" identifier [bidi] *(s option)
option         = identifier [bidi] [s] "=" [s] (literal / (variable [bidi])
attribute      = "@" identifier [bidi] [[s] "=" [s] (literal / (variable [bidi])]
markup         = "{" [s] "#" identifier [bidi] *(s option) *(s attribute) [s] ["/"] "}"  ; open and standalone
               / "{" [s] "/" identifier [bidi] *(s option) *(s attribute) [s] "}"  ; close
identifier     = [(namespace [bidi] ":")] name
bidi           = [ %x200E-200F / %x061C ]
```

## Alternatives Considered

_What other solutions are available?_
_How do they compare against the requirements?_
_What other properties they have?_

### Nothing
We could do nothing.

A likely outcome of doing nothing is that RTL users would insert bidi controls into
_messages_ in an attempt to make the _pattern_ and/or _placeholders_ display correctly.
These controls would become part of the output of the _message_,
showing up inappropriately at runtime.
Because these characters are invisible, users might be very frustrated trying to manage
the results or debug what is wrong with their messages.

By contrast, if users insert too many or the wrong controls using the recommended design,
the _message_ would still be functional and would emit no undesired characters.

### Deeper Syntax Changes
We could alter the syntax to make it more "bidi robust", 
such as by using strongly directional instead of neutrals.

### Forbid RTL characters in `name` and/or `unquoted`
We could alter the syntax to forbid using RTL characters in names and unquoted literals.
This would make the syntax consist solely of LTR and neutral characters.
One flavor of this would be to restrict tokens to US ASCII.

Cons:
- This would break compatibility with NCName/QName; we would be back to
  defining our own idiosyncratic namespace
- Unicode could define more RTL characters in the future, making the syntax
  brittle
- This is not friendly to non-English/non-Latin users and represents a usability
  restriction in environments in which names can be non-ASCII values
