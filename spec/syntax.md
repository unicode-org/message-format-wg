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

The purpose of MessageFormat is to allow content to vary at runtime.
This variation might be due to placing a value into the content
or it might be due to selecting a different bit of content based on some data value
or it might be due to a combination of the two.

MessageFormat calls the template for a given formatting operation a _message_.

The values passed in at runtime (which are to be placed into the content or used
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
and semantic requirements about its structure defined below for
_declarations_, _matcher_ and _options_.
Attempting to parse a _message_ that is not _valid_ will result in a _Data Model Error_.

## The Message

A **_<dfn>message</dfn>_** is the complete template for a specific message formatting request.

> [!NOTE]
> This syntax is designed to be embeddable into many different programming languages and formats.
> As such, it avoids constructs, such as character escapes, that are specific to any given file
> format or processor.
> In particular, it avoids using quote characters common to many file formats and formal languages
> so that these do not need to be escaped in the body of a _message_.

> [!NOTE]
> In general (and except where required by the syntax), whitespace carries no meaning in the structure
> of a _message_. While many of the examples in this spec are written on multiple lines, the formatting
> shown is primarily for readability.
>
> > **Example** This _message_:
> >
> > ```
> > .local $foo   =   { |horse| }
> > {{You have a {$foo}!}}
> > ```
> >
> > Can also be written as:
> >
> > ```
> > .local $foo={|horse|}{{You have a {$foo}!}}
> > ```
> >
> > An exception to this is: whitespace inside a _pattern_ is **always** significant.

> [!NOTE]
> The syntax assumes that each _message_ will be displayed with a left-to-right display order
> and be processed in the logical character order.
> The syntax also permits the use of right-to-left characters in _identifiers_,
> _literals_, and other values.
> This can result in confusion when viewing the _message_.
> 
> Additional restrictions or requirements,
> such as permitting the use of certain bidirectional control characters in the syntax,
> might be added during the Tech Preview to better manage bidirectional text.
> Feedback on the creation and management of _messages_
> containing bidirectional tokens is strongly desired.

A _message_ can be a _simple message_ or it can be a _complex message_.

```abnf
message = simple-message / complex-message
```

A **_<dfn>simple message</dfn>_** contains a single _pattern_,
with restrictions on its first character.
An empty string is a valid _simple message_.

```abnf
simple-message = [simple-start pattern]
simple-start   = simple-start-char / text-escape / placeholder
```

A **_<dfn>complex message</dfn>_** is any _message_ that contains _declarations_,
a _matcher_, or both.
A _complex message_ always begins with either a keyword that has a `.` prefix or a _quoted pattern_
and consists of:

1. an optional list of _declarations_, followed by
2. a _complex body_

```abnf
complex-message = *(declaration [s]) complex-body
```

### Declarations

A **_<dfn>declaration</dfn>_** binds a _variable_ identifier to a value within the scope of a _message_.
This _variable_ can then be used in other _expressions_ within the same _message_.
_Declarations_ are optional: many messages will not contain any _declarations_.

An **_<dfn>input-declaration</dfn>_** binds a _variable_ to an external input value.
The _variable-expression_ of an _input-declaration_
MAY include an _annotation_ that is applied to the external value.

A **_<dfn>local-declaration</dfn>_** binds a _variable_ to the resolved value of an _expression_.

For compatibility with later MessageFormat 2 specification versions,
_declarations_ MAY also include _reserved statements_.

```abnf
declaration       = input-declaration / local-declaration / reserved-statement
input-declaration = input [s] variable-expression
local-declaration = local s variable [s] "=" [s] expression
```

_Variables_, once declared, MUST NOT be redeclared. 
A _message_ that does any of the following is not _valid_ and will produce a 
_Duplicate Declaration_ error during processing:
- A _declaration_ MUST NOT bind a _variable_
  that appears as a _variable_ anywhere within a previous _declaration_.
- An _input-declaration_ MUST NOT bind a _variable_
  that appears anywhere within the _annotation_ of its _variable-expression_.
- A _local-declaration_ MUST NOT bind a _variable_ that appears in its _expression_.

A _local-declaration_ MAY overwrite an external input value as long as the
external input value does not appear in a previous _declaration_.

> [!Note]
> These restrictions only apply to _declarations_.
> A _placeholder_ or _selector_ can apply a different annotation to a _variable_
> than one applied to the same _variable_ named in a _declaration_.
> For example, this message is _valid_:
> ```
> .input {$var :number maximumFractionDigits=0}
> .match {$var :number maximumFractionDigits=2}
> 0 {{The selector can apply a different annotation to {$var} for the purposes of selection}}
> * {{A placeholder in a pattern can apply a different annotation to {$var :number maximumFractionDigits=3}}}
> ```
> (See the [Errors](./errors.md) section for examples of invalid messages)

#### Reserved Statements

A **_<dfn>reserved statement</dfn>_** reserves additional `.keywords`
for use by future versions of this specification.
Any such future keyword must start with `.`,
followed by two or more lower-case ASCII characters.

The rest of the statement supports
a similarly wide range of content as _reserved annotations_,
but it MUST end with one or more _expressions_.

```abnf
reserved-statement = reserved-keyword [s reserved-body] 1*([s] expression)
reserved-keyword   = "." name
```

> [!Note]
> The `reserved-keyword` ABNF rule is a simplification,
> as it MUST NOT be considered to match any of the existing keywords
> `.input`, `.local`, or `.match`.

This allows flexibility in future standardization,
as future definitions MAY define additional semantics and constraints
on the contents of these _reserved statements_.

Implementations MUST NOT assign meaning or semantics to a _reserved statement_:
these are reserved for future standardization.
Implementations MUST NOT remove or alter the contents of a _reserved statement_.

### Complex Body

The **_<dfn>complex body</dfn>_** of a _complex message_ is the part that will be formatted.
The _complex body_ consists of either a _quoted pattern_ or a _matcher_.

```abnf
complex-body = quoted-pattern / matcher
```

## Pattern

A **_<dfn>pattern</dfn>_** contains a sequence of _text_ and _placeholders_ to be formatted as a unit.
Unless there is an error, resolving a _message_ always results in the formatting
of a single _pattern_.

```abnf
pattern = *(text-char / text-escape / placeholder)
```
A _pattern_ MAY be empty.

A _pattern_ MAY contain an arbitrary number of _placeholders_ to be evaluated
during the formatting process.

### Quoted Pattern

A **_<dfn>quoted pattern</dfn>_** is a _pattern_ that is "quoted" to prevent 
interference with other parts of the _message_. 
A _quoted pattern_ starts with a sequence of two U+007B LEFT CURLY BRACKET `{{` 
and ends with a sequence of two U+007D RIGHT CURLY BRACKET `}}`.

```abnf
quoted-pattern = "{{" pattern "}}"
```

A _quoted pattern_ MAY be empty.

> An empty _quoted pattern_:
>
> ```
> {{}}
> ```

### Text

**_<dfn>text</dfn>_** is the translateable content of a _pattern_.
Any Unicode code point is allowed, except for U+0000 NULL
and the surrogate code points U+D800 through U+DFFF inclusive.
The characters U+005C REVERSE SOLIDUS `\`,
U+007B LEFT CURLY BRACKET `{`, and U+007D RIGHT CURLY BRACKET `}`
MUST be escaped as `\\`, `\{`, and `\}` respectively.

In the ABNF, _text_ is represented by non-empty sequences of
`simple-start-char`, `text-char`, and `text-escape`.
The first of these is used at the start of a _simple message_,
and matches `text-char` except for not allowing U+002E FULL STOP `.`.
The ABNF uses `content-char` as a shared base for _text_ and _quoted literal_ characters.

Whitespace in _text_, including tabs, spaces, and newlines is significant and MUST
be preserved during formatting.

```abnf
simple-start-char = content-char / s / "@" / "|"
text-char         = content-char / s / "." / "@" / "|"
quoted-char       = content-char / s / "." / "@" / "{" / "}"
reserved-char     = content-char / "."
content-char      = %x01-08        ; omit NULL (%x00), HTAB (%x09) and LF (%x0A)
                  / %x0B-0C        ; omit CR (%x0D)
                  / %x0E-1F        ; omit SP (%x20)
                  / %x21-2D        ; omit . (%x2E)
                  / %x2F-3F        ; omit @ (%x40)
                  / %x41-5B        ; omit \ (%x5C)
                  / %x5D-7A        ; omit { | } (%x7B-7D)
                  / %x7E-D7FF      ; omit surrogates
                  / %xE000-10FFFF
```

When a _pattern_ is quoted by embedding the _pattern_ in curly brackets, the
resulting _message_ can be embedded into
various formats regardless of the container's whitespace trimming rules.
Otherwise, care must be taken to ensure that pattern-significant whitespace is preserved.

> **Example**
> In a Java `.properties` file, the values `hello` and `hello2` both contain
> an identical _message_ which consists of a single _pattern_.
> This _pattern_ consists of _text_ with exactly three spaces before and after the word "Hello":
>
> ```properties
> hello = {{   Hello   }}
> hello2=\   Hello  \ 
> ```

### Placeholder

A **_<dfn>placeholder</dfn>_** is an _expression_ or _markup_ that appears inside of a _pattern_
and which will be replaced during the formatting of a _message_.

```abnf
placeholder = expression / markup
```

## Matcher

A **_<dfn>matcher</dfn>_** is the _complex body_ of a _message_ that allows runtime selection
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
- Each _selector_ MUST have an _annotation_,
  or contain a _variable_ that directly or indirectly references a _declaration_ with an _annotation_.

```abnf
matcher         = match-statement 1*([s] variant)
match-statement = match 1*([s] selector)
```

> A _message_ with a _matcher_:
>
> ```
> .match {$count :number}
> one {{You have {$count} notification.}}
> *   {{You have {$count} notifications.}}
> ```

> A _message_ containing a _matcher_ formatted on a single line:
>
> ```
> .match {:platform} windows {{Settings}} * {{Preferences}}
> ```

### Selector

A **_<dfn>selector</dfn>_** is an _expression_ that ranks or excludes the
_variants_ based on the value of the corresponding _key_ in each _variant_.
The combination of _selectors_ in a _matcher_ thus determines
which _pattern_ will be used during formatting.

```abnf
selector = expression
```

There MUST be at least one _selector_ in a _matcher_.
There MAY be any number of additional _selectors_.

> A _message_ with a single _selector_ that uses a custom _function_
> `:hasCase` which is a _selector_ that allows the _message_ to choose a _pattern_
> based on grammatical case:
>
> ```
> .match {$userName :hasCase}
> vocative {{Hello, {$userName :person case=vocative}!}}
> accusative {{Please welcome {$userName :person case=accusative}!}}
> * {{Hello!}}
> ```

> A message with two _selectors_:
>
> ```
> .match {$numLikes :number} {$numShares :number}
> 0   0   {{Your item has no likes and has not been shared.}}
> 0   one {{Your item has no likes and has been shared {$numShares} time.}}
> 0   *   {{Your item has no likes and has been shared {$numShares} times.}}
> one 0   {{Your item has {$numLikes} like and has not been shared.}}
> one one {{Your item has {$numLikes} like and has been shared {$numShares} time.}}
> one *   {{Your item has {$numLikes} like and has been shared {$numShares} times.}}
> *   0   {{Your item has {$numLikes} likes and has not been shared.}}
> *   one {{Your item has {$numLikes} likes and has been shared {$numShares} time.}}
> *   *   {{Your item has {$numLikes} likes and has been shared {$numShares} times.}}
> ```

### Variant

A **_<dfn>variant</dfn>_** is a _quoted pattern_ associated with a set of _keys_ in a _matcher_.
Each _variant_ MUST begin with a sequence of _keys_,
and terminate with a valid _quoted pattern_.
The number of _keys_ in each _variant_ MUST match the number of _selectors_ in the _matcher_.

Each _key_ is separated from each other by whitespace.
Whitespace is permitted but not required between the last _key_ and the _quoted pattern_.

```abnf
variant = key *(s key) [s] quoted-pattern
key     = literal / "*"
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
An _expression_ cannot contain another _expression_.
An _expression_ MAY contain one more _attributes_.

A **_<dfn>literal-expression</dfn>_** contains a _literal_,
optionally followed by an _annotation_.

A **_<dfn>variable-expression</dfn>_** contains a _variable_,
optionally followed by an _annotation_.

An **_<dfn>annotation-expression</dfn>_** contains an _annotation_ without an _operand_.

```abnf
expression            = literal-expression
                      / variable-expression
                      / annotation-expression
literal-expression    = "{" [s] literal [s annotation] *(s attribute) [s] "}"
variable-expression   = "{" [s] variable [s annotation] *(s attribute) [s] "}"
annotation-expression = "{" [s] annotation *(s attribute) [s] "}"
```

There are several types of _expression_ that can appear in a _message_.
All _expressions_ share a common syntax. The types of _expression_ are:

1. The value of a _local-declaration_
2. A _selector_
3. A kind of _placeholder_ in a _pattern_

Additionally, an _input-declaration_ can contain a _variable-expression_.

> Examples of different types of _expression_
>
> Declarations:
>
> ```
> .input {$x :function option=value}
> .local $y = {|This is an expression|}
> ```
>
> Selectors:
>
> ```
> .match {$selector :functionRequired}
> ```
>
> Placeholders:
>
> ```
> This placeholder contains a literal expression: {|literal|}
> This placeholder contains a variable expression: {$variable}
> This placeholder references a function on a variable: {$variable :function with=options}
> This placeholder contains a function expression with a variable-valued option: {:function option=$variable}
> ```

### Annotation

An **_<dfn>annotation</dfn>_** is part of an _expression_ containing either
a _function_ together with its associated _options_, or
a _private-use annotation_ or a _reserved annotation_.

```abnf
annotation = function
           / private-use-annotation
           / reserved-annotation
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
See [function registry](./registry.md) for more information.

A _function_ starts with a prefix sigil `:` followed by an _identifier_.
The _identifier_ MAY be followed by one or more _options_.
_Options_ are not required.

```abnf
function = ":" identifier *(s option)
```

> A _message_ with a _function_ operating on the _variable_ `$now`:
>
> ```
> It is now {$now :datetime}.
> ```

##### Options

An **_<dfn>option</dfn>_** is a key-value pair
containing a named argument that is passed to a _function_.

An _option_ has an _identifier_ and a _value_.
The _identifier_ is separated from the _value_ by an U+003D EQUALS SIGN `=` along with
optional whitespace.
The value of an _option_ can be either a _literal_ or a _variable_.

Multiple _options_ are permitted in an _annotation_.
_Options_ are separated from the preceding _function_ _identifier_
and from each other by whitespace.
Each _option_'s _identifier_ MUST be unique within the _annotation_:
an _annotation_ with duplicate _option_ _identifiers_ is not valid.

```abnf
option = identifier [s] "=" [s] (literal / variable)
```

> Examples of _functions_ with _options_
>
> A _message_ using the `:datetime` function.
> The _option_ `weekday` has the literal `long` as its value:
>
> ```
> Today is {$date :datetime weekday=long}!
> ```

> A _message_ using the `:datetime` function.
> The _option_ `weekday` has a variable `$dateStyle` as its value:
>
> ```
> Today is {$date :datetime weekday=$dateStyle}!
> ```

#### Private-Use Annotations

A **_<dfn>private-use annotation</dfn>_** is an _annotation_ whose syntax is reserved
for use by a specific implementation or by private agreement between multiple implementations.
Implementations MAY define their own meaning and semantics for _private-use annotations_.

A _private-use annotation_ starts with either U+0026 AMPERSAND `&` or U+005E CIRCUMFLEX ACCENT `^`.

Characters, including whitespace, are assigned meaning by the implementation.
The definition of escapes in the `reserved-body` production, used for the body of
a _private-use annotation_ is an affordance to implementations that
wish to use a syntax exactly like other functions. Specifically:

- The characters `\`, `{`, and `}` MUST be escaped as `\\`, `\{`, and `\}` respectively
  when they appear in the body of a _private-use annotation_.
- The character `|` is special: it SHOULD be escaped as `\|` in a _private-use annotation_,
  but can appear unescaped as long as it is paired with another `|`.
  This is an affordance to allow _literals_ to appear in the private use syntax.

A _private-use annotation_ MAY be empty after its introducing sigil.

```abnf
private-use-annotation = private-start reserved-body
private-start          = "^" / "&"
```

> [!Note]
> Users are cautioned that _private-use annotations_ cannot be reliably exchanged
> and can result in errors during formatting.
> It is generally a better idea to use the function registry
> to define additional formatting or annotation options.

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

#### Reserved Annotations

A **_<dfn>reserved annotation</dfn>_** is an _annotation_ whose syntax is reserved
for future standardization.

A _reserved annotation_ starts with a reserved character.
A _reserved annotation_ MAY be empty or contain arbitrary text after its first character.

This allows maximum flexibility in future standardization,
as future definitions MAY define additional semantics and constraints
on the contents of these _annotations_.
A _reserved annotation_ does not include trailing whitespace.

Implementations MUST NOT assign meaning or semantics to
an _annotation_ starting with `reserved-start`:
these are reserved for future standardization.
Implementations MUST NOT remove or alter the contents of a _reserved annotation_.

While a reserved sequence is technically "well-formed",
unrecognized _reserved-annotations_ or _private-use-annotations_ have no meaning.

```abnf
reserved-annotation       = reserved-annotation-start reserved-body
reserved-annotation-start = "!" / "%" / "*" / "+" / "<" / ">" / "?" / "~"

reserved-body             = *([s] 1*(reserved-char / reserved-escape / quoted))
```

## Markup

**_<dfn>Markup</dfn>_** _placeholders_ are _pattern_ parts
that can be used to represent non-language parts of a _message_,
such as inline elements or styling that should apply to a span of parts.

_Markup_ MUST begin with U+007B LEFT CURLY BRACKET `{`
and end with U+007D RIGHT CURLY BRACKET `}`.
_Markup_ MAY contain one more _attributes_.

_Markup_ comes in three forms:

**_<dfn>Markup-open</dfn>_** starts with U+0023 NUMBER SIGN `#` and
represents an opening element within the _message_,
such as markup used to start a span.
It MAY include _options_.

**_<dfn>Markup-standalone</dfn>_** starts with U+0023 NUMBER SIGN `#`
and has a U+002F SOLIDUS `/` immediately before its closing `}`
representing a self-closing or standalone element within the _message_.
It MAY include _options_.

**_<dfn>Markup-close</dfn>_** starts with U+002F SOLIDUS `/` and
is a _pattern_ part ending a span.

```abnf
markup = "{" [s] "#" identifier *(s option) *(s attribute) [s] ["/"] "}"  ; open and standalone
       / "{" [s] "/" identifier *(s option) *(s attribute) [s] "}"  ; close
```

> A _message_ with one `button` markup span and a standalone `img` markup element:
>
> ```
> {#button}Submit{/button} or {#img alt=|Cancel| /}.
> ```

> A _message_ with attributes in the closing tag:
>
> ```
> {#ansi attr=|bold,italic|}Bold and italic{/ansi attr=|bold|} italic only {/ansi attr=|italic|} no formatting.}
> ```

A _markup-open_ can appear without a corresponding _markup-close_.
A _markup-close_ can appear without a corresponding _markup-open_.
_Markup_ _placeholders_ can appear in any order without making the _message_ invalid.
However, specifications or implementations defining _markup_ might impose requirements
on the pairing, ordering, or contents of _markup_ during _formatting_.

## Attributes

**_Attributes_ are reserved for standardization by future versions of this specification.**
Examples in this section are meant to be illustrative and
might not match future requirements or usage.

> [!NOTE]
> The Tech Preview does not provide a built-in mechanism for overriding
> values in the _formatting context_ (most notably the locale)
> Nor does it provide a mechanism for identifying specific expressions
> such as by assigning a name or id.
> The utility of these types of mechanisms has been debated.
> There are at least two proposed mechanisms for implementing support for
> these. 
> Specifically, one mechanism would be to reserve specifically-named options, 
> possibly using a Unicode namespace (i.e. `locale=xxx` or `u:locale=xxx`).
> Such options would be reserved for use in any and all functions or markup.
> The other mechanism would be to use the reserved "expression attribute" syntax
> for this purpose (i.e. `@locale=xxx` or `@id=foo`)
> Neither mechanism was included in this Tech Preview.
> Feedback on the preferred mechanism for managing these features
> is strongly desired.
> 
> In the meantime, function authors and other implementers are cautioned to avoid creating 
> function-specific or implementation-specific option values for this purpose.
> One workaround would be to use the implementation's namespace for these 
> features to insure later interoperability when such a mechanism is finalized 
> during the Tech Preview period.
> Specifically:
> - Avoid specifying an option for setting the locale of an expression as different from
>   that of the overall _message_ locale, or use a namespace that later maps to the final
>   mechanism.
> - Avoid specifying options for the purpose of linking placeholders
>   (such as to pair opening markup to closing markup).
>   If such an option is created, the implementer should use an
>   implementation-specific namespace.
>   Users and implementers are cautioned that such options might be
>   replaced with a standard mechanism in a future version.
> - Avoid specifying generic options to communicate with translators and 
>   translation tooling (i.e. implementation-specific options that apply to all
>   functions.
> The above are all desirable features.
> We welcome contributions to and proposals for such features during the
> Technical Preview.

An **_<dfn>attribute</dfn>_** is an _identifier_ with an optional value
that appears in an _expression_ or in _markup_.

_Attributes_ are prefixed by a U+0040 COMMERCIAL AT `@` sign,
followed by an _identifier_.
An _attribute_ MAY have a _value_ which is separated from the _identifier_
by an U+003D EQUALS SIGN `=` along with optional whitespace.
The _value_ of an _attribute_ can be either a _literal_ or a _variable_.

Multiple _attributes_ are permitted in an _expression_ or _markup_.
Each _attribute_ is separated by whitespace.

```abnf
attribute = "@" identifier [[s] "=" [s] (literal / variable)]
```

> Examples of _expressions_ and _markup_ with _attributes_:
>
> A _message_ including a _literal_ that should not be translated:
>
> ```
> In French, "{|bonjour| @translate=no}" is a greeting
> ```
>
> A _message_ with _markup_ that should not be copied:
>
> ```
> Have a {#span @can-copy}great and wonderful{/span @can-copy} birthday!
> ```

## Other Syntax Elements

This section defines common elements used to construct _messages_.

### Keywords

A **_<dfn>keyword</dfn>_** is a reserved token that has a unique meaning in the _message_ syntax.

The following three keywords are defined: `.input`, `.local`, and `.match`.
Keywords are always lowercase and start with U+002E FULL STOP `.`.

```abnf
input = %s".input"
local = %s".local"
match = %s".match"
```

### Literals

A **_<dfn>literal</dfn>_** is a character sequence that appears outside
of _text_ in various parts of a _message_.
A _literal_ can appear
as a _key_ value,
as the _operand_ of a _literal-expression_,
or in the value of an _option_.
A _literal_ MAY include any Unicode code point
except for U+0000 NULL or the surrogate code points U+D800 through U+DFFF.

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

_Unquoted_ literals can contain a _name_ or consist of a _number-literal_.
A _number-literal_ uses the same syntax as JSON and is intended for the encoding 
of number values in _operands_ or _options_, or as _keys_ for _variants_.

```abnf
literal        = quoted / unquoted
quoted         = "|" *(quoted-char / quoted-escape) "|"
unquoted       = name / number-literal
number-literal = ["-"] (%x30 / (%x31-39 *DIGIT)) ["." 1*DIGIT] [%i"e" ["-" / "+"] 1*DIGIT]
```

### Names and Identifiers

An **_<dfn>identifier</dfn>_** is a character sequence that
identifies a _function_, _markup_, or _option_.
Each _identifier_ consists of a _name_ optionally preceeded by
a _namespace_. 
When present, the _namespace_ is separated from the _name_ by a
U+003A COLON `:`.
Built-in _functions_ and their _options_ do not have a _namespace_ identifier.

The _namespace_ `u` (U+0075 LATIN SMALL LETTER U)
is reserved for future standardization.

_Function_ _identifiers_ are prefixed with `:`.
_Markup_ _identifiers_ are prefixed with `#` or `/`.
_Option_ _identifiers_ have no prefix.

A **_<dfn>name</dfn>_** is a character sequence used in an _identifier_ 
or as the name for a _variable_
or the value of an _unquoted_ _literal_.

_Variable_ names are prefixed with `$`.

Valid content for _names_ is based on <cite>Namespaces in XML 1.0</cite>'s 
[NCName](https://www.w3.org/TR/xml-names/#NT-NCName).
This is different from XML's [Name](https://www.w3.org/TR/xml/#NT-Name)
in that it MUST NOT contain a U+003A COLON `:`.
Otherwise, the set of characters allowed in a _name_ is large.

> [!NOTE]
> _External variables_ can be passed in that are not valid _names_.
> Such variables cannot be referenced in a _message_,
> but are not otherwise errors.

Examples:
> A variable:
>```
> This has a {$variable}
>```
> A function:
> ```
> This has a {:function}
> ```
> An add-on function from the `icu` namespace:
> ```
> This has a {:icu:function}
> ```
> An option and an add-on option:
> ```
> This has {:options option=value icu:option=add_on}
> ```

Support for _namespaces_ and their interpretation is implementation-defined
in this release.

```abnf
variable   = "$" name
option     = identifier [s] "=" [s] (literal / variable)

identifier = [namespace ":"] name
namespace  = name
name       = name-start *name-char
name-start = ALPHA / "_"
           / %xC0-D6 / %xD8-F6 / %xF8-2FF
           / %x370-37D / %x37F-1FFF / %x200C-200D
           / %x2070-218F / %x2C00-2FEF / %x3001-D7FF
           / %xF900-FDCF / %xFDF0-FFFC / %x10000-EFFFF
name-char  = name-start / DIGIT / "-" / "."
           / %xB7 / %x300-36F / %x203F-2040
```

### Escape Sequences

An **_<dfn>escape sequence</dfn>_** is a two-character sequence starting with
U+005C REVERSE SOLIDUS `\`.

An _escape sequence_ allows the appearance of lexically meaningful characters
in the body of _text_, _quoted_, or _reserved_ (which includes, in this case,
_private-use_) sequences respectively:

```abnf
text-escape     = backslash ( backslash / "{" / "}" )
quoted-escape   = backslash ( backslash / "|" )
reserved-escape = backslash ( backslash / "{" / "|" / "}" )
backslash       = %x5C ; U+005C REVERSE SOLIDUS "\"
```

### Whitespace

**_<dfn>Whitespace</dfn>_** is defined as one or more of
U+0009 CHARACTER TABULATION (tab), 
U+000A LINE FEED (new line),
U+000D CARRIAGE RETURN, 
U+3000 IDEOGRAPHIC SPACE, 
or U+0020 SPACE.

Inside _patterns_ and _quoted literals_,
whitespace is part of the content and is recorded and stored verbatim.
Whitespace is not significant outside translatable text, except where required by the syntax.

> [!NOTE]
> The character U+3000 IDEOGRAPHIC SPACE is included in whitespace for
> compatibility with certain East Asian keyboards and input methods,
> in which users might accidentally create these characters in a _message_.

```abnf
s = 1*( SP / HTAB / CR / LF / %x3000 )
```

## Complete ABNF

The grammar is formally defined in [`message.abnf`](./message.abnf)
using the ABNF notation [[STD68](https://www.rfc-editor.org/info/std68)],
including the modifications found in [RFC 7405](https://www.rfc-editor.org/rfc/rfc7405).

RFC7405 defines a variation of ABNF that is case-sensitive.
Some ABNF tools are only compatible with the specification found in
[RFC 5234](https://www.rfc-editor.org/rfc/rfc5234). 
To make `message.abnf` compatible with that version of ABNF, replace
the rules of the same name with this block:

```abnf
input = %x2E.69.6E.70.75.74  ; ".input"
local = %x2E.6C.6F.63.61.6C  ; ".local"
match = %x2E.6D.61.74.63.68  ; ".match"
```
