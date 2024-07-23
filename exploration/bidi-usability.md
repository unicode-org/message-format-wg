# Bidi Usability

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@aphillips</dd>
		<dd>@eemeli</dd>
		<dt>First proposed</dt>
		<dd>2024-03-27</dd>
		<dt>Pull Requests</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/754">#754</a></dd>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/781">#781</a></dd>
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
but users need to be able to discern what a _message_ does.
For example, users need to be able to match _keys_ in a _variant_ to _selectors_
in a `.match` statement.
Or they want to know how a _pattern_ will be evaluated,
such as understanding the _options_ and _values_ in a _placeholder_.

In addition, it is possible to construct messages that use bidi characters to spoof
users into believing that a _message_ does something different than what it actually does.

The current syntax does not permit bidi controls in _name_ tokens,
_unquoted literals_,
or in the non-pattern whitespace portions of a _message_.

Permitting the Unicode bidi **isolate** characters and the standalone strongly-directional markers
would enable tools, including translation tools, and users who are writing in RTL languages
to format a _message_ so that its plain-text representation and its function
are unambiguous.

The isolates are paired invisible characters inserted around a portion of a string.
The start of an isolated sequence is one of:
- U+2066 LEFT-TO-RIGHT ISOLATE (LRI)
- U+2067 RIGHT-TO-LEFT ISOLATE (RLI)
- U+2068 FIRST-STRONG ISOLATE (FSI)

The end of an isolated sequence is U+2069 POP DIRECTIONAL ISOLATE (PDI).

The characters inside an isolated sequence have the initial string direction
corresponding to the starting character (
left-to-right for `LRI`, 
right-to-left for `RLI`, 
or <a href="https://www.w3.org/TR/i18n-glossary#auto-direction">auto</a> for `FSI`).
They are called "isolates" because the enclosed text is **isolated** from surrounding text
while being processed using the Unicode Bidirectional Algorithm (UBA).
The surrounding text treats the sequence as-if it were a single neutral character,
while the interior sequence is processed using the base direction specified by the isolate
starting character.

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

These characters are invisible strongly-directional characters.
They are used in bidirectional
text to coerce certain directional behavior (usually to mark the end of 
a sequence of characters that would otherwise be ambiguous or interact with
neutrals or opposite direction runs in an unhelpful way).

### Strictness and Abuse

We want the syntax to be somewhat permissive, particularly when it comes to paired isolates.
The isolates and strongly-directional marks are invisble except in certain specialized editing environments.
While users and tools should be strict about using well-formed isolate sequences,
we don't want to have invisible characters or whitespace generate additional syntax errors except where necessary.
Therefore, it should not be a syntax error if a user, editor, or tool fails to match opening/closing isolates.

It is possible to generate a "strict" version of the ABNF that is more restrictive about isolate pairing.
Such an ABNF might be used by message serializers to ensure high-quality message generation.

Unfortunately, permitting a "relaxed" handling of isolates/marks, when mixed with whitespace, 
could produce the various Trojan Source effects described in [[UTS55]](https://www.unicode.org/reports/tr55/#Usability-bidi))

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

3. As a developer or translator, I want to make unquoted RTL literals or names appear correctly
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

Newlines inside of messages should not harm later syntax.

```
* * {{\u0645<br>\u0646}} 123 456 {{ No LRM==bad }}
* * {{م
ن}} 123 456 {{  No LRM==bad }}

* * {{\u0645<br>\u0646}}\u200e 123 456 {{ LRM }}
* * {{م
ن}}‎ 123 456 {{ LRM }}
```


Naive text editors, when operating in a right-to-left context, 
might display a _message_ with an RTL base direction.
While the display of the _message_ might be somewhat damaged by this,
it should still produce results that are as reasonable as possible.

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

We want isolate characters to be _outside_ of patterns.
There is an open question about how best to place them.
One option would be to place them adjacent to the "pattern quote" character sequences `{{`/`}}`.
Another option would be to place them _inside_ the pattern quotes, e.g. `{\u2066{`/`}\u2068}`.

Bidi isolates and marks are invisible characters.
Whitespace is also invisible.
Mixing these may be problematic.
Not allowing these to mix could produce annoying parse errors.

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

The syntax of a _message_ assumes a left-to-right base direction
both for the complete text of the _message_ as well as for each line (paragraph)
contained therein. 
We prefer LTR display because human understanding of a _message_ depends on LTR word tokens,
as well as token ordering (as in a placeholder or with variant keys).
Note that LTR display is **_not_** a requirement, because that is beyond the scope of MF2 itself.
However, tool and editor implementers ought to pay attention to this assumption.

Preferring LTR display is not the disadvantage to right-to-left languages that it might first appear:
- Bidi inside of _patterns_ works normally (we go to great lengths to make the interior
  of _patterns_ work as plain text)
- _Placeholders_ and _markup_ can be isolated (treated as neutrals) so that they appear
  in the correct location in an RTL _pattern_
- _Expressions_ use isolates and directional marks to display internal tokens in the
  correct order and without spillover effects
- The syntax uses paired enclosing marks that the Unicode Bidirectional Algorithm pairs
  for shaping purposes and these offer a poor person's form of isolation.

The syntax permits (but does not require) isolating bidi controls to be used on the 
**outside** of the following:
- unquoted literals
- quoted literals
- quoted patterns

We permit any of the isolate starting characters (LRI, RLI, FSI) because we want to allow
the user to set the base direction of a _literal_ or _pattern_ according to its respective 
actual contents.

> [!IMPORTANT]
> This change adds a "lookahead" to the process of determining if a given _message_ is
> "simple" or "complex", as LRI, RLI, and FSI are all valid starters for a simple message
> as well as being allowed before a quoted pattern, declaration, or selector.

This would change the ABNF as follows:
(Notice that this change includes a production `bidi` described further down
in this document)
```abnf
literal        = [open-isolate] (quoted-literal / (unquoted-literal [bidi])) [close-isolate]
quoted-pattern = [open-isolate] "{{" pattern "}}" [close-isolate]

open-isolate   = %x2066-2068
close-isolate  = %x2069
```

> [!IMPORTANT]
> The isolating characters go on the **_outside_** of the various _literal_ and _pattern_
> productions because characters on the **_inside_** of these are part of the _literal_'s
> or _pattern_'s textual content.
> We need to allow users to include bidi characters, including isolates and strongly directional marks
> in the output of MF2.

Permit **left-to-right** isolates (`U+2066` and `U+2069`) to be used **immediately inside** the following:
- expressions
- markup

Permit isolates around any token inside of an expression or markup.

We only permit the LTR isolates because the contents of an _expression_
or _markup_ must be laid out left-to-right.
_Literal_ values can be right-to-left isolated within that or use strongly
directional marks to ensure correct display.

This would change the ABNF as follows (assuming the above changes are also incorporated):
```abnf
expression            = "{" [LRI] (literal-expression / variable-expression / annotation-expression) [close-isolate] "}"
literal-expression    = [s] literal [s annotation] *(s attribute) [s]
variable-expression   = [s] variable [s annotation] *(s attribute) [s]
annotation-expression = [s] annotation *(s attribute) [s]
markup = "{" [LRI] [s] "#" identifier *(s option) *(s attribute) [s] ["/"] [close-isolate] "}"  ; open and standalone
       / "{" [LRI] [s] "/" identifier *(s option) *(s attribute) [s] [close-isolate] "}"        ; close
LRI = %x2066
```

Permit the use of LRM, RLM, or ALM stronly directional marks immediately following any of the items that
**end** with the `name` production in the ABNF. 
This includes _identifiers_ found in the names of
_functions_ 
and _options_,
plus the names of _variables_,
as well as the contents of _unquoted_ literals.

> [!NOTE]
> Notice that _unquoted literals_ can also be surrounded by bidi isolates
> using the previous syntax modification just above.
> The isolates are **not** a part of the literal!

> [!NOTE]
> Notice that `reserved-annotation` is not in the ABNF changes because it already
> permits the marks in question.
> Any syntax derived from `reserved-annotation`
> (i.e. when unreserving a new statement in a future addition)
> would need to handle bidi explicitly using the model already established here.

```abnf
variable-expression   = "{" [s] variable [bidi] [s annotation] *(s attribute) [s] "}"
function       = ":" identifier [bidi] *(s option)
option         = [LRI] identifier [bidi] [s] "=" [s] (literal / variable) [bidi] [close-isolate]
attribute      = [LRI] "@" identifier [bidi] [[s] "=" [s] ((literal / variable) [bidi])] [close-isolate]
markup         = "{" [LRI] [s] "#" identifier [bidi] *(s option) *(s attribute) [s] ["/"] [close-isolate] "}"  ; open and standalone
               / "{" [LRI] [s] "/" identifier [bidi] *(s option) *(s attribute) [s] [close-isolate] "}"  ; close
identifier     = [(namespace ns-separator)] name
ns-separator   = [bidi] ":"
bidi           = [ %x200E-200F / %x061C ]
```

### Open Issues with Proposed Design

The ABNF changes found above put isolates and strongly directional marks into specific locations,
such as directly next to `{`/`}`/`{{`/`}}` markers
or directly following "tokens" such as `name`.
This makes it a syntax error for whitespace to appear around the isolates or marks.
A more permissive design would add the isolates and strongly directional marks to required and optional
whitespace in the syntax and depend on users/editors to appropriately pair or position the marks
to get optimal display.

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

### Super-loose isolation

Add isolates and strongly directional marks to required and optional whitespace in the syntax.
This would permit users to get the effects described by the above design,
as long as they use isolates/marks in a "responsible" way.

(Omitting other changes found in #673)

```abnf
; strongly directional marks and bidi isolates
; ALM / LRM / RLM / LRI / RLI / FSI / PDI
bidi = %x061C / %x200E / %x200F / %x2066-2069

; optional whitespace
owsp = *( s / bidi )

; required whitespace
wsp = [ owsp ] 1*s [ owsp ]

; whitespace characters
s = ( SP / HTAB / CR / LF / %x3000 )
```

**Pros**
- Avoids problems with syntax errors that users and tools might find difficult to debug.
- Effective if used carefully.
- Addresses need to comply with UAX#31

**Cons**
- Syntax does not prevent poor display outcomes, including enabling some Trojan Source cases (UAX#55);
  note that tooling or linting can help ameliorate these issues.

### Strict isolation all the time

Apply bidi isolates in a strict way.
The main differences to the proposed solution is:
1. The open/close isolate characters are syntactically required to be paired.
   This introduces parse errors for unpaired invisible characters,
   which could lead to bad user experiences.

As noted above, the "strict" version of the ABNF should be adopted by serializers and for 
message normalization.

// TODO put ABNF here


Isolating rather than marking `name` helps ensure
that its directionality does not spill over to adjoining syntax.
For example, this allows for the proper rendering of the expression
```
{⁦:⁧אחת⁩:⁧שתיים⁩⁩}
```
where "אחת" is the `namespace` of the `identifier`.
Without `name` isolation, this would (misleadingly) render as
```
{⁦:אחת:שתיים⁩}
```

In the syntax, it's much simpler to include the changes to `name` in that rule,
rather than patching every place where `name` is used.
Either way, the parsed value of the name should not include the open/close isolates,
just as they're not included in the parsed values of quoted literals or quoted patterns.


### Deeper Syntax Changes
We could alter the syntax to make it more "bidi robust", 
such as by using strongly directional characters instead of neutrals.

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

### Permit LRI, RLI, and FSI inside expressions and markup

We could permit RLI/FSI to be used inside _expressions_ and _markup_.
This would be an advantage for simple _expressions_ containing only or primarily
RTL content.
For example:
```
{⁧لت-123-م...⁩} // RLI isolated
{لت-123-م...}
```

We could also permit users/editors to use RTL base direction for editing.
This is tricky, as the syntax promotes the use of left-to-right runs
that will "stick together" unless isolated.
This is most visible in _selectors_ and _variant_ _keys_.

Consider this message:
```
.match {$\u06451\u0645}{$\u06462\u0646}
one two {{normal LTR}}
\u2067one\u2069 \u2067two\u2069 {{RLI around each key}}
\u2066one\u2069 \u2066two\u2069 {{LRI around each key}}
\u0645 \u0646 {{RTL}}
* \u0646 {{star is first}}
\u0645 * {{star is second}}
```

In an LTR context the _message_ displays like this (red lines around display errors):
![image](https://github.com/unicode-org/message-format-wg/assets/69082/f19cbf99-94f2-4f36-805b-8da0750bc5f2)

In an RTL context, there is an equivalent case:
![image](https://github.com/unicode-org/message-format-wg/assets/69082/1b2e1c67-aebc-455b-98e9-99f9e620c543)

Coercing proper display in both LTR and RTL contexts requires
complex sets of controls.

**Pros**
- Can provide both LTR and RTL native editing experiences

**Cons**
- Requires complex sets of bidi controls
- RTL editing/display is mostly a special case;
  we already afford the ability to edit RTL in _patterns_ and _literals_

### Hybrid approaches

Strict syntactical requirements produce better _display_ outcomes 
that solve the various problems enumerated in this design document.
However, the strictness comes with a cost: otherwise-valid messages,
including messages that display completely as expected and are not in any way misleading,
can produce syntax errors.
These errors can be difficult to debug, since the characters are invisible.
Syntax errors are generally treated as fatal by processors.

Semi-strict or super-loose strategies can be used to avoid producing these types of syntax error.
However, valid messages using these approaches can have stray (e.g. unpaired isolates), 
malformed (e.g. PDI before LRI/RLI/FSI), 
or badly formatted character sequences (wrapping the wrong things), 
unless the user or the user's tools are careful.
This can include deliberate abuse, such as Trojan Source attacks (see UAX#55),
in which Bad Actors create messages that have a misleading appearance vs. their runtime interpretation.

A hybrid ("Postel's Law") approach would be to permit the use of isolates and strongly directional marks
in whitespace in a permissive way (see: "super-loose isolation"),
particularly in runtime formatting operations
but strongly encourage tools to implement message normalization on a strictly-defined grammar
(see: "strict isolation all the time")
and to encourage users to use the strict version of the grammar when writing or serializing messages.

The hybrid approach would include tests to allow implementations to claim 
adherence to the stricter grammar.

**Pros**
- Messages can be written that solve all display problems
- Stray, unpaired, repeated, or other invisible typos do not produce spurious
  syntax errors
- Provides a foundation for tools to claim strict conformance and message normalization
  as well as guidance to implementers to make them want to adopt it

**Cons**
- Requires additional effort to maintain the grammar
- Requires additional effort to maintain tests
- Valid messages can contain Trojan Source and other negative display consequences;
  messages can be checked, however, using the strict grammar, so tools could warn
  users of potential abuse
