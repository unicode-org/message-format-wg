# DRAFT MessageFormat 2.0 Syntax

## Table of Contents

\[TBD\]

### Introduction

This section defines the formal grammar describing the syntax of a single message.

### Design Goals

_This section is non-normative._

The design goals of the syntax specification are as follows:

1. The syntax should leverage the familiarity with ICU MessageFormat 1.0
   in order to lower the barrier to entry and increase the chance of adoption.
   At the same time,
   the syntax should fix the [pain points of ICU MessageFormat 1.0](../docs/why_mf_next.md).

   - _Non-Goal_: Be backwards-compatible with the ICU MessageFormat 1.0 syntax.

1. The syntax inside translatable content should be easy to understand for humans.
   This includes making it clear which parts of the message body _are_ translatable content,
   which parts inside it are placeholders for expressions,
   as well as making the selection logic predictable and easy to reason about.

   - _Non-Goal_: Make the syntax intuitive enough for non-technical translators to hand-edit.
     Instead, we assume that most translators will work with MessageFormat 2
     by means of GUI tooling, CAT workbenches etc.

1. The syntax surrounding translatable content should be easy to write and edit
   for developers, localization engineers, and easy to parse by machines.

1. The syntax should make a single message easily embeddable inside many container formats:
   `.properties`, YAML, XML, inlined as string literals in programming languages, etc.
   This includes a future _MessageResource_ specification.

   - _Non-Goal_: Support unnecessary escape sequences, which would theirselves require
     additional escaping when embedded. Instead, we tolerate direct use of nearly all
     characters (including line breaks, control characters, etc.) and rely upon escaping
     in those outer formats to aid human comprehension (e.g., depending upon container
     format, a U+000A LINE FEED might be represented as `\n`, `\012`, `\x0A`, `\u000A`,
     `\U0000000A`, `&#xA;`, `&NewLine;`, `%0A`, `<LF>`, or something else entirely).

### Design Restrictions

_This section is non-normative._

The syntax specification takes into account the following design restrictions:

1. Whitespace outside the translatable content should be insignificant.
   It should be possible to define a message entirely on a single line with no ambiguity,
   as well as to format it over multiple lines for clarity.

1. The syntax should define as few special characters and sigils as possible.
   Note that this necessitates extra care when presenting messages for human consumption,
   because they may contain invisible characters such as U+200B ZERO WIDTH SPACE,
   control characters such as U+0000 NULL and U+0009 TAB, permanently reserved noncharacters
   (U+FDD0 through U+FDEF and U+<i>n</i>FFFE and U+<i>n</i>FFFF where <i>n</i> is 0x0 through 0x10),
   private-use code points (U+E000 through U+F8FF, U+F0000 through U+FFFFD, and
   U+100000 through U+10FFFD), unassigned code points, and other potentially confusing content.

## Messages and their Syntax

The purpose of MessageFormat is the allow content to vary at runtime.
This variation might be due to placing a value into the content
or it might be due to selecting a different bit of content based on some data value
or it might be due to a combination of the two.

MessageFormat calls the template for a given formatting operation a _message_.

The values passed in at runtime (which are to be place into the content or used
to select between different content items) are called _external variables_.
The author of a _message_ can also assign _local variables_, including
variables that modify _external variables_.

This part of the MessageFormat specification defines the syntax for a _message_,
along with the concepts and terminology needed when processing a _message_
during the [formatting](./formatting.md) of a _message_ at runtime.

The complete formal syntax of a _message_ is described by the [ABNF](./message.abnf).

### Well-formed vs. Valid Messages

A _message_ is **_<dfn>well-formed</dfn>_** if it satisfies all the rules of the grammar.
Attempting to parse a _message_ that is not _well-formed_ will result in a _Syntax Error_.

A _message_ is **_<dfn>valid</dfn>_** if it is _well-formed_ and
**also** meets the additional content restrictions
and semantic requirements about its structure defined below.
Attempting to parse a _message_ that is not _valid_ will result in a _Data Model Error_.

## The Message

A **_<dfn>message</dfn>_** is the complete template for a specific message formatting request.

> **Note**
> This syntax is designed to be embeddable into many different programming languages and formats.
> As such, it avoids constructs, such as character escapes, that are specific to any given file
> format or processor.
> In particular, it avoids using quote characters common to many file formats and formal languages
> so that these do not need to be escaped in the body of a _message_.

> **Note**
> In general (and except where required by the syntax), whitespace carries no meaning in the structure
> of a _message_. While many of the examples in this spec are written on multiple lines, the formatting
> shown is primarily for readability.
>
> > **Example** This _message_:
> >
> > ```
> > local $foo   =   { |horse| }
> > {You have a {$foo}!}
> > ```
> >
> > Can also be written as:
> >
> > ```
> > local $foo={|horse|}{You have a {$foo}!}
> > ```
> >
> > An exception to this is: whitespace inside a _pattern_ is **always** significant.

A _message_ can be a _pattern_ or it can be a _complex message_.

A **_<dfn>complex message</dfn>_** is any _message_ that contains _declarations_,
a _matcher_, or both.
A _complex message_ always begins with the the sequence `{{`
and is terminated by the sequence `}}`
and consists of:

1. an optional list of _declarations_, followed by
2. a _body_

### Declarations

A **_<dfn>declaration</dfn>_** binds a _variable_ identifier to a value within the scope of a _message_.
This _variable_ can then be used in other _expressions_ within the same _message_.
_Declarations_ are optional: many messages will not contain any _declarations_.

An **_<dfn>input-declaration</dfn>_** binds a _variable_ to an external input value.
The _variable-expression_ of an _input-declaration_
MAY include an _annotation_ that is applied to the external value.

A **_<dfn>local-declaration</dfn>_** binds a _variable_ to the resolved value of an _expression_.

Declared _variables_ MUST NOT be used before their _declaration_,
and their values MUST NOT be self-referential;
otherwise, a _message_ is not considered _valid_.

Multiple _declarations_ MUST NOT bind a value to the same _variable_;
otherwise, a _message_ is not considered _valid_.

```abnf
declaration = input-declaration / local-declaration
input-declaration = input [s] variable-expression
local-declaration = local s variable [s] "=" [s] expression
```

### Body

The **_<dfn>body</dfn>_** of a _message_ is the part that will be formatted.
The _body_ consists of either a _quoted pattern_ or a _matcher_.

```abnf
body = quoted-pattern
     / (selectors 1*([s] variant))
```

## Pattern

A **_<dfn>pattern</dfn>_** contains a sequence of _text_ and _placeholders_ to be formatted as a unit.
Unless there is an error, resolving a _message_ always results in the formatting
of a single _pattern_.

```abnf
pattern = "{" *(text / expression) "}"
```
A _pattern_ MAY be empty.

A _pattern_ MAY contain an arbitrary number of _placeholders_ to be evaluated
during the formatting process.

### Quoted Pattern

A **_<dfn>quoted pattern</dfn>_** is a pattern that is enclosed by
starting with a sequence of two U+007B LEFT CURLY BRACKET `{{` 
and ending with a sequence of two U+007D RIGHT CURLY BRACKET `}}`.

A _quoted pattern_ MAY be empty.

> An empty _quoted pattern_:
>
> ```
> {{}}
> ```

### Text

**_<dfn>text</dfn>_** is the translateable content of a _pattern_.
Any Unicode code point is allowed, except for surrogate code points U+D800
through U+DFFF inclusive.
The characters `\`, `{`, and `}` MUST be escaped as `\\`, `\{`, and `\}`
respectively.

Whitespace in _text_, including tabs, spaces, and newlines is significant and MUST
be preserved during formatting.
Embedding a _pattern_ in curly brackets ensures that _messages_ can be embedded into
various formats regardless of the container's whitespace trimming rules.

> **Example**
> In a Java `.properties` file, the values `hello` and `hello2` both contain
> an identical _message_ which consists of a single _pattern_.
> This _pattern_ consists of _text_ with exactly three spaces before and after the word "Hello":
>
> ```properties
> hello = {   Hello   }
> hello2={   Hello   }
> ```

```abnf
text = 1*(text-char / text-escape)
text-char = %x0-5B         ; omit \
          / %x5D-7A        ; omit {
          / %x7C           ; omit }
          / %x7E-D7FF      ; omit surrogates
          / %xE000-10FFFF
```

### Placeholder

A **_<dfn>placeholder</dfn>_** is an _expression_ that appears inside of a _pattern_
and which will be replaced during the formatting of a _message_.

```abnf
placeholder = expression
```

## Matcher

A **_<dfn>matcher</dfn>_** is the _body_ of a _message_ that allows runtime selection
of the _pattern_ to use for formatting.
This allows the form or content of a _message_ to vary based on values
determined at runtime.

A _matcher_ consists of the keyword `match` followed by at least one _selector_
and at least one _variant_.

When the _matcher_ is processed, the result will be a single _pattern_ that serves
as the template for the formatting process.

A _message_ can only be considered _valid_ if the following requirements are
satisfied:

- The number of _keys_ on each _variant_ MUST be equal to the number of _selectors_.
- At least one _variant_ MUST exist whose _keys_ are all equal to the "catch-all" key `*`.

```abnf
matcher = match 1*(selector) 1*(variant)
```

> A _message_ with a _matcher_:
>
> ```
> {{
> match {$count :number}
> when 1 {{You have one notification.}}
> when * {{You have {$count} notifications.}}
> }}
> ```

> A _message_ containing a _matcher_ formatted on a single line:
>
> ```
> {{match {:platform} when windows {{Settings}} when * {{Preferences}}}}
> ```

### Selector

A **_<dfn>selector</dfn>_** is an _expression_ that ranks or excludes the
_variants_ based on the value of its corresponding _key_ in each _variant_.
The combination of _selectors_ in a _matcher_ thus determines
which _pattern_ will be used during formatting.

```abnf
selector = expression
```

There MUST be at least one _selector_ in a _matcher_.
There MAY be any number of additional _selectors_.

> A _message_ with a single _selector_ that uses a custom `:hasCase` _function_,
> allowing the _message_ to choose a _pattern_ based on grammatical case:
>
> ```
> {{
> match {$userName :hasCase}
> when vocative {{Hello, {$userName :person case=vocative}!}}
> when accusative {{Please welcome {$userName :person case=accusative}!}}
> when * {{Hello!}}
> }}
> ```

> A message with two _selectors_:
>
> ```
> {{
> match {$photoCount :number} {$userGender :equals}
> when 1 masculine {{{$userName} added a new photo to his album.}}
> when 1 feminine  {{{$userName} added a new photo to her album.}}
> when 1 *         {{{$userName} added a new photo to their album.}}
> when * masculine {{{$userName} added {$photoCount} photos to his album.}}
> when * feminine  {{{$userName} added {$photoCount} photos to her album.}}
> when * *         {{{$userName} added {$photoCount} photos to their album.}}
> }}
> ```

### Variant

A **_<dfn>variant</dfn>_** is a _pattern_ associated with a set of _keys_ in a _matcher_.
Each _variant_ MUST begin with the keyword `when`,
be followed by a sequence of _keys_,
and terminate with a valid _pattern_.
The number of _keys_ in each _variant_ MUST match the number of _selectors_ in the _matcher_.

Each _key_ is separated from the keyword `when` and from each other by whitespace.
Whitespace is permitted but not required between the last _key_ and the _pattern_.

```abnf
variant = when 1*(s key) [s] pattern
key = literal / "*"
```

#### Key

A **_<dfn>key</dfn>_** is a value in a _variant_ for use by a _selector_ when ranking
or excluding _variants_ during the _matcher_ process.
A _key_ can be either a _literal_ value or the "catch-all" key `*`.

The **_<dfn>catch-all key</dfn>_** is a special key, represented by `*`,
that matches all values for a given _selector_.

## Expressions

An **_<dfn>expression</dfn>_** is a part of a _message_ that will be determined
during the _message_'s formatting.

An _expression_ MUST begin with U+007B LEFT CURLY BRACKET `{`
and end with U+007D RIGHT CURLY BRACKET `}`.
An _expression_ MUST NOT be empty.

A **_<dfn>literal-expression</dfn>_** contains a _literal_,
optionally followed by an _annotation_.

A **_<dfn>variable-expression</dfn>_** contains a _variable_,
optionally followed by an _annotation_.

A **_<dfn>function-expression</dfn>_** contains only an _annotation_.

```abnf
expression = literal-expression / variable-expression / function-expression
literal-expression = "{" [s] literal [s annotation] [s] "}"
variable-expression = "{" [s] variable [s annotation] [s] "}"
function-expression = "{" [s] annotation [s] "}"
annotation = (function *(s option)) / private-use / reserved
```

There are several types of _expression_ that can appear in a _message_.
All _expressions_ share a common syntax. The types of _expression_ are:

1. The value of a _local-declaration_
2. A _selector_
3. A _placeholder_ in a _pattern_

Additionally, an _input-declaration_ can contain a _variable-expression_.

> Examples of different types of _expression_
>
> Declarations:
>
> ```
> input {$x :function option=value}
> local $y = {|This is an expression|}
> ```
>
> Selectors:
>
> ```
> match {$selector :functionRequired}
> ```
>
> Placeholders:
>
> ```
> This placeholder contains an {|expression with a literal|}
> This placeholder references a {$variable}
> This placeholder references a function on a variable: {$variable :function with=options}
> ```

### Annotation

An **_<dfn>annotation</dfn>_** is part of an _expression_ containing either
a _function_ together with its associated _options_, or
a _private-use_ or _reserved_ sequence.

```abnf
annotation = (function *(s option)) / reserved / private-use
```

An **_<dfn>operand</dfn>_** is the _literal_ of a _literal-expression_ or
the _variable_ of a _variable-expression_.

An _annotation_ can appear in an _expression_ by itself or following a single _operand_.
When following an _operand_, the _operand_ serves as input to the _annotation_.

#### Function

A **_<dfn>function</dfn>_** is named functionality in an _annotation_.
_Functions_ are used to evaluate, format, select, or otherwise process data
values during formatting.

Each _function_ is defined by the runtime's _function registry_.
A _function_'s entry in the _function registry_ will define
whether the _function_ is a _selector_ or formatter (or both),
whether an _operand_ is required,
what form the values of an _operand_ can take,
what _options_ and _option_ values are valid,
and what outputs might result.
See [function registry](./) for more information.

_Functions_ can be _standalone_, or can be an _opening element_ or _closing element_.

A **_<dfn>standalone</dfn>_** _function_ is not expected to be paired with another _function_.
An **_<dfn>opening element</dfn>_** is a _function_ that SHOULD be paired with a _closing element_.
A **_<dfn>closing element</dfn>_** is a _function_ that SHOULD be paired with an _opening element_.

An _opening element_ MAY be present in a message without a corresponding _closing element_,
and vice versa.

> A _message_ with a _standalone_ _function_ operating on the _variable_ `$now`:
>
> ```
> {$now :datetime}
> ```
>
> A _message_ with two markup-like _functions_, `button` and `link`,
> which the runtime can use to construct a document tree structure for a UI framework:
>
> ```
> {+button}Submit{-button} or {+link}cancel{-link}.
> ```

A _function_ consists of a prefix sigil followed by a _name_.
The following sigils are used for _functions_:

- `:` for a _standalone_ function
- `+` for an _opening element_
- `-` for a _closing element_

A _function_ MAY be followed by one or more _options_.
_Options_ are not required.

##### Options

An **_<dfn>option</dfn>_** is a key-value pair
containing a named argument that is passed to a _function_.

An _option_ has a _name_ and a _value_.
The _name_ is separated from the _value_ by an U+003D EQUALS SIGN `=` along with
optional whitespace.
The value of an _option_ can be either a _literal_ or a _variable_.

Multiple _options_ are permitted in an _annotation_.
Each _option_ is separated by whitespace.

```abnf
option = name [s] "=" [s] (literal / variable)
```

> Examples of _functions_ with _options_
>
> A _message_ with a `$date` _variable_ formatted with the `:datetime` _function_:
>
> ```
> Today is {$date :datetime weekday=long}.
> ```

> A _message_ with a `$userName` _variable_ formatted with
> the custom `:person` _function_ capable of
> declension (using either a fixed dictionary, algorithmic declension, ML, etc.):
>
> ```
> Hello, {$userName :person case=vocative}!
> ```

> A _message_ with a `$userObj` _variable_ formatted with
> the custom `:person` _function_ capable of
> plucking the first name from the object representing a person:
>
> ```
> Hello, {$userObj :person firstName=long}!
> ```

#### Private-Use

A **_<dfn>private-use</dfn>_** _annotation_ is an _annotation_ whose syntax is reserved
for use by a specific implementation or by private agreement between multiple implementations.
Implementations MAY define their own meaning and semantics for _private-use_ annotations.

A _private-use_ annotation starts with either U+0026 AMPERSAND `&` or U+005E CIRCUMFLEX ACCENT `^`.

Characters, including whitespace, are assigned meaning by the implementation.
The definition of escapes in the `reserved-body` production, used for the body of
a _private-use_ annotation is an affordance to implementations that
wish to use a syntax exactly like other functions. Specifically:

- The characters `\`, `{`, and `}` MUST be escaped as `\\`, `\{`, and `\}` respectively
  when they appear in the body of a _private-use_ annotation.
- The character `|` is special: it SHOULD be escaped as `\|` in a _private-use_ annotation,
  but can appear unescaped as long as it is paired with another `|`. This is an affordance to
  allow _literals_ to appear in the private use syntax.

A _private-use_ _annotation_ MAY be empty after its introducing sigil.

**NOTE:** Users are cautioned that _private-use_ sequences cannot be reliably exchanged
and can result in errors during formatting.
It is generally a better idea to use the function registry
to define additional formatting or annotation options.

```abnf
private-use   = private-start reserved-body
private-start = "&" / "^"
```

> Here are some examples of what _private-use_ sequences might look like:
>
> ```
> Here's private use with an operand: {$foo &bar}
> Here's a placeholder that is entirely private-use: {&anything here}
> Here's a private-use function that uses normal function syntax: {$operand ^foo option=|literal|}
> The character \| has to be paired or escaped: {&private || |something between| or isolated: \| }
> Stop {& "translate 'stop' as a verb" might be a translator instruction or comment }
> Protect stuff in {^ph}<a>{^/ph}private use{^ph}</a>{^/ph}
> ```

#### Reserved

A **_<dfn>reserved</dfn>_** _annotation_ is an _annotation_ whose syntax is reserved
for future standardization.

A _reserved_ _annotation_ starts with a reserved character.
A _reserved_ _annotation_ MAY be empty or contain arbitrary text after its first character.

This allows maximum flexibility in future standardization,
as future definitions MAY define additional semantics and constraints
on the contents of these _annotations_.
A _reserved_ _annotation_ does not include trailing whitespace.

Implementations MUST NOT assign meaning or semantics to
an _annotation_ starting with `reserved-start`:
these are reserved for future standardization.
Implementations MUST NOT remove or alter the contents of a _reserved_ _annotation_.

While a reserved sequence is technically "well-formed",
unrecognized reserved sequences have no meaning and MAY result in errors during formatting.

```abnf
reserved       = reserved-start reserved-body
reserved-start = "!" / "@" / "#" / "%" / "*" / "<" / ">" / "/" / "?" / "~"

reserved-body  = *( [s] 1*(reserved-char / reserved-escape / quoted))
reserved-char  = %x00-08        ; omit HTAB and LF
               / %x0B-0C        ; omit CR
               / %x0E-19        ; omit SP
               / %x21-5B        ; omit \
               / %x5D-7A        ; omit { | }
               / %x7E-D7FF      ; omit surrogates
               / %xE000-10FFFF
```

## Other Syntax Elements

This section defines common elements used to construct _messages_.

### Keywords

A **_<dfn>keyword</dfn>_** is a reserved token that has a unique meaning in the _message_ syntax.

The following four keywords are reserved: `input`, `local`, `match`, and `when`.
Reserved keywords are always lowercase.

```abnf
input = %x69.6E.70.75.74  ; "input"
local = %x6C.6F.63.61.6C  ; "local"
match = %x6D.61.74.63.68  ; "match"
when  = %x77.68.65.6E     ; "when"
```

### Literals

A **_<dfn>literal</dfn>_** is a character sequence that appears outside
of _text_ in various parts of a _message_.
A _literal_ can appear
as a _key_ value,
as the _operand_ of a _literal-expression_,
or in the value of an _option_.
A _literal_ MAY include any Unicode code point
except for surrogate code points U+D800 through U+DFFF.

All code points are preserved.

A **_<dfn>quoted</dfn>_** literal begins and ends with U+005E VERTICAL BAR `|`.
The characters `\` and `|` within a _quoted_ literal MUST be
escaped as `\\` and `\|`.

An **_<dfn>unquoted</dfn>_** literal is a _literal_ that does not require the `|`
quotes around it to be distinct from the rest of the _message_ syntax.
An _unquoted_ MAY be used when the content of the _literal_
contains no whitespace and otherwise matches the `unquoted` production.
Any _unquoted_ literal MAY be _quoted_.
Implementations MUST NOT distinguish between _quoted_ and _unquoted_ literals
that have the same sequence of code points.

_Unquoted_ literals have a much more restricted range that
is intentionally close to the XML's [Nmtoken](https://www.w3.org/TR/xml/#NT-Nmtoken),
with the restriction that it MUST NOT start with `-` or `:`,
as those would conflict with _function_ start characters.

```abnf
literal = quoted / unquoted

quoted         = "|" *(quoted-char / quoted-escape) "|"
quoted-char    = %x0-5B         ; omit \
               / %x5D-7B        ; omit |
               / %x7D-D7FF      ; omit surrogates
               / %xE000-10FFFF

unquoted       = unquoted-start *name-char
unquoted-start = name-start / DIGIT / "."
               / %xB7 / %x300-36F / %x203F-2040
```

### Names

A **_<dfn>name</dfn>_** is an identifier for a _variable_ (prefixed with `$`),
for a _function_ (prefixed with `:`, `+` or `-`),
or for an _option_ (these have no prefix).
The namespace for _names_ is based on XML's [Name](https://www.w3.org/TR/xml/#NT-Name),
with the restriction that it MUST NOT start with `:`,
as that would conflict with the _function_ start character.
Otherwise, the set of characters allowed in names is large.

```abnf
variable = "$" name
function = (":" / "+" / "-") name

name = name-start *name-char
name-start = ALPHA / "_"
           / %xC0-D6 / %xD8-F6 / %xF8-2FF
           / %x370-37D / %x37F-1FFF / %x200C-200D
           / %x2070-218F / %x2C00-2FEF / %x3001-D7FF
           / %xF900-FDCF / %xFDF0-FFFD / %x10000-EFFFF
name-char  = name-start / DIGIT / "-" / "." / ":"
           / %xB7 / %x300-36F / %x203F-2040
```

> [!NOTE]
> _External variables_ can be passed in that are not valid _names_.
> Such variables cannot be referenced in a _message_,
> but are not otherwise errors.

### Escape Sequences

An **_<dfn>escape sequence</dfn>_** is a two-character sequence starting with
U+005C REVERSE SOLIDUS `\`.

An _escape sequence_ allows the appearance of lexically meaningful characters
in the body of _text_, _quoted_, or _reserved_ (which includes, in this case,
_private-use_) sequences respectively:

```abnf
text-escape    = backslash ( backslash / "{" / "}" )
quoted-escape  = backslash ( backslash / "|" )
reserve-escape = backslash ( backslash / "{" / "|" / "}" )
backslash      = %x5C ; U+005C REVERSE SOLIDUS "\"
```

### Whitespace

**_<dfn>Whitespace</dfn>_** is defined as tab, carriage return, line feed, or the space character.

Inside _patterns_ and _quoted literals_,
whitespace is part of the content and is recorded and stored verbatim.
Whitespace is not significant outside translatable text, except where required by the syntax.

```abnf
s = 1*( SP / HTAB / CR / LF )
```

## Complete ABNF

The grammar is formally defined in [`message.abnf`](./message.abnf)
using the ABNF notation,
as specified by [RFC 5234](https://datatracker.ietf.org/doc/html/rfc5234).
