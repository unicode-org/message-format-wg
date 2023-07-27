# DRAFT MessageFormat 2.0 Syntax

## Table of Contents

1. [Introduction](#introduction)
   1. [Design Goals](#design-goals)
   1. [Design Restrictions](#design-restrictions)
1. [Overview & Examples](#overview--examples)
   1. [Messages and Patterns](#messages-and-patterns)
   1. [Expressions](#expression)
   1. [Formatting Functions](#function)
   1. [Selection](#selection)
   1. [Local Variables](#local-variables)
   1. [Complex Messages](#complex-messages)
1. [Productions](#productions)
   1. [Message](#message)
   1. [Variable Declarations](#variable-declarations)
   1. [Selectors](#selectors)
   1. [Variants](#variants)
   1. [Patterns](#patterns)
   1. [Expressions](#expressions)
      1. [Private-Use Sequences](#private-use)
      2. [Reserved Sequences](#reserved)
1. [Tokens](#tokens)
   1. [Keywords](#keywords)
   1. [Text](#text)
   1. [Literals](#literals)
   1. [Names](#names)
   1. [Escape Sequences](#escape-sequences)
   1. [Whitespace](#whitespace)
1. [Complete ABNF](#complete-abnf)

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

## Core Concepts

The purpose of MessageFormat is the allow content to vary at runtime.
This variation might be due to placing a value into the content
or it might be due to selecting a different bit of content based on some data value
or it might be due to a combination of the two.

MessageFormat calls the template for a given formatting operation a _message_.

The values passed in at runtime (which are to be place into the content or used
to select between different content items) are called _external variables_.
The author of a _message_ can also assign _local variables_, including
variables that modify _external variables_.

Values are operated on using _functions_.
_Functions_ described by the function registry. 
Some functions are used for _formatting_, that is, preparing a data value for display.
Other functions are used for _selection_, that is, choosing between different 
content items.
Some functions can be used for both.






## Messages and their Syntax

### Messages

A **_message_** is the complete template for a specific message formatting request.

The complete syntax of a _message_ is described by the ABNF.

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
>> **Example** This _message_:
>>```
>>let $foo   =   { |horse| }
>>{You have a {$foo}!}
>>```
>> Can also be written as:
>>```
>>let $foo={|horse|}{You have a {$foo}!}
>>```
> An exception to this is: whitespace inside a _pattern_ is **always** significant.

A _message_ consists of two parts:
1. an optional list of _declarations_, followed by
2. a _body_

All _messages_ MUST contain a _body_.
An empty string is not a _well-formed_ _message_.

> A simple _message_ containing only a _body_:
> ```
> {Hello world!}
> ```
>The same _message_ defined in a `.properties` file:
>
>```properties
>app.greetings.hello = {Hello, world!}
>```
>The same _message_ defined inline in JavaScript:
>
>```js
>let hello = new MessageFormat('{Hello, world!}')
>hello.format()
>```

#### Well-formed vs. Valid Messages

A _message_ is **_well-formed_** if it satisfies all the rules of the grammar.

A _message_ is **_valid_** if it is _well-formed_ and **also** meets the additional content restrictions
and semantic requirements about its structure defined below.

## Declarations

A **_declaration_** binds a _variable_ identifier to the value of an _expression_ within the scope of a _message_.
This local variable can then be used in other _expressions_ within the same _message_.

```
declaration = let s variable [s] "=" [s] expression
```

## Body

The **_body_** of a _message_ is the part that will be formatted.
The _body_ consists of either a _pattern_ or a _matcher_.

```abnf
body = pattern / matcher
```

## Pattern

A **_pattern_** is a sequence of _text_ and _placeholders_ to be formatted as a unit.
All _patterns_ begin with U+007B LEFT CURLY BRACKET `{` and end with U+007D RIGHT CURLY BRACKET `}`.
Unless there is an error, resolving a _message_ always results in the formatting
of a single _pattern_.

```abnf
pattern = "{" *(text / expression) "}"
```

A _pattern_ MAY be empty.

> An empty _pattern_:
> ```
> {}
> ```

A _pattern_ MAY contain an arbitrary number of _placeholders_ to be evaluated 
during the formatting process.

### Text

**_text_** is the translateable content of a _pattern_.
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

A **_placeholder_** is an _expression_ that appears inside of a _pattern_
and which will be replaced during the formatting of a _message_.

```abnf
placeholder = expression
```

## Matcher

A **_matcher_** is the _body_ of a _message_ that allows runtime selection
of the _pattern_ to use for formatting.
This allows the form or content of a _message_ to vary based on values
determined at runtime.

A _matcher_ consists of the keyword `match` followed by at least one _selector_
and at least one _variant_.

When the _matcher_ is processed, the result will be a single _pattern_ that serves 
as the template for the formatting process.

A _message_ can only be considered _valid_ if the following requirements are
satisfied:
* The number of _keys_ on each _variant_ MUST be equal to the number of _selectors_.
* At least one _variant_ MUST exist whose _keys_ are all equal to the "catch-all" key `*`.

```abnf
matcher = match 1*(selector) 1*(variant)
```

> A _message_ with a _matcher_:
> ```
> match {$count :number}
> when 1 {You have one notification.}
> when * {You have {$count} notifications.}
> ```

> A _message_ containing a _matcher_ formatted on a single line:
> ```
> match {:platform} when windows {Settings} when * {Preferences}
> ```

### Selector

A **_selector_** is an _expression_ that ranks or excludes the
_variants_ based on the value of its corresponding _key_ in each _variant_.
The combination of _selectors_ in a _matcher_ thus determines 
which _pattern_ will be used during formatting.

```abnf
selector = expression
```

There MUST be at least one _selector_ in a _matcher_.
There MAY be any number of additional _selectors_.

>A _message_ with a single _selector_ that uses a custom `:hasCase` _function_,
>allowing the _message_ to choose a _pattern_ based on grammatical case:
>
>```
>match {$userName :hasCase}
>when vocative {Hello, {$userName :person case=vocative}!}
>when accusative {Please welcome {$userName :person case=accusative}!}
>when * {Hello!}
>```

>A message with two _selectors_:
>
>```
>match {$photoCount :number} {$userGender :equals}
>when 1 masculine {{$userName} added a new photo to his album.}
>when 1 feminine  {{$userName} added a new photo to her album.}
>when 1 *         {{$userName} added a new photo to their album.}
>when * masculine {{$userName} added {$photoCount} photos to his album.}
>when * feminine  {{$userName} added {$photoCount} photos to her album.}
>when * *         {{$userName} added {$photoCount} photos to their album.}
>```

### Variant

A **_variant_** is a _pattern_ associated with a set of _keys_ in a _matcher_.
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

A **_key_** is a value in a _variant_ for use by a _selector_ when ranking
or excluding _variants_ during the _matcher_ process. 
A _key_ can be either a _literal_ value or the "catch-all" key `*`.

The **_catch-all key_** is a special key, represented by `*`,
that matches all values for a given _selector_.

## Expressions

An **_expression_** is a part of a _message_ that will be determined
during the _message_'s formatting.

An _expression_ MUST begin with U+007B LEFT CURLY BRACKET `{` 
and end with U+007D RIGHT CURLY BRACKET `}`.
An _expression_ MUST NOT be empty.
An _expression_ can contain an _operand_, 
an _annotation_, 
or an _operand_ followed by an _annotation_;
or it can consist of a _private-use_ or _reserved_ sequence.

```abnf
expression = "{" [s] ((operand [s annotation]) / annotation) [s] "}"
operand = literal / variable
annotation = (function *(s option)) / private-use / reserved
```

There are several types of _expression_ that can appear in a _message_.
All _expressions_ share a common syntax. The types of _expression_ are:
1. The value of a _declaration_
2. A _selector_
3. A _placeholder_ in a _pattern_

> Examples of different types of _expression_
>
> Declarations:
> ```
> let $x = {|This is an expression|}
> let $y = {$operand :function option=operand}
> ```
> Selectors:
> ```
> match {$selector :functionRequired}
> ```
> Placeholders:
> ```
> {This placeholder contains an {|expression with a literal|}}
> {This placeholder references a {$variable}}
> {This placeholder references a function on a variable: {$variable :function with=options}}
> ```

### Operand

An **_operand_** is a _literal_ or a _variable_ to be evaluated in an _expression_.
An _operand_ MAY optionally be followed by an _annotation_.

```abnf
operand    = literal / variable
```

### Annotation

An **_annotation_** is part of an _expression_ containing either 
a _function_ together with its associated _options_, or
a _private-use_ or _reserved_ sequence.

```abnf
annotation = (function *(s option)) / reserved / private-use
```

### Function

A **_function_** is a used to evaluate, format, select, or otherwise process an _operand_,
or, if lacking an _operand_, its _options_.
A _function_ accepts only an _operand_ as a positional argument.

A _function_ consists of a prefix sigil followed by a _name_.
The following sigils are used for _functions_:
* `:` for standalone content
* `+` for starting or opening _expressions_
* `-` for ending or closing _expressions_

A _function_ MAY be followed by one or more _options_.
_Options_ are not required.

>For example, a _message_ with a `$date` _variable_ formatted with the `:datetime` _function_:
>
>```
>{Today is {$date :datetime weekday=long}.}
>```

>A _message_ with a `$userName` _variable_ formatted with
>the custom `:person` _function_ capable of
>declension (using either a fixed dictionary, algorithmic declension, ML, etc.):
>
>```
>{Hello, {$userName :person case=vocative}!}
>```

>A _message_ with a `$userObj` _variable_ formatted with
>the custom `:person` _function_ capable of
>plucking the first name from the object representing a person:
>
>```
>{Hello, {$userObj :person firstName=long}!}
>```

_Functions_ can be _standalone_, or can be an _opening element_ or _closing element_.

A **_standalone_** _function_ is not expected to be paired with another _function_.
An **_opening element_** is a _function_ that SHOULD be paired with a _closing function_.
A **_closing element_** is a _function_ that SHOULD be paired with an _opening function_.

An _opening element_ MAY be present in a message without a corresponding _closing element_,
and vice versa.

>A message with two markup-like _functions_, `button` and `link`,
>which the runtime can use to construct a document tree structure for a UI framework:
>
>```
>{{+button}Submit{-button} or {+link}cancel{-link}.}
>```

#### Private-Use

A **_private-use_** _annotation_ is an _annotation_ whose syntax is reserved
for use by a specific implementation or by private agreement between multiple implementations. 
Implementations MAY define their own meaning and semantics for _private-use_ annotations.

A _private-use_ annotation starts with either U+0026 AMPERSAND `&` or U+005E CIRCUMFLEX ACCENT `^`.
 
Characters, including whitespace, are assigned meaning by the implementation.
The definition of escapes in the `reserved-body` production, used for the body of
a _private-use_ annotation is an affordance to implementations that 
wish to use a syntax exactly like other functions. Specifically:
* The characters `\`, `{`, and `}` MUST be escaped as `\\`, `\{`, and `\}` respectively
when they appear in the body of a _private-use_ annotation. 
* The character `|` is special: it SHOULD be escaped as `\|` in a _private-use_ annotation,
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
> ```
> {Here's private use with an operand: {$foo &bar}}
> {Here's a placeholder that is entirely private-use: {&anything here}}
> {Here's a private-use function that uses normal function syntax: {$operand ^foo option=|literal|}}
> {The character \| has to be paired or escaped: {&private || |something between| or isolated: \| }}
> {Stop {& "translate 'stop' as a verb" might be a translator instruction or comment }}
> {Protect stuff in {^ph}<a>{^/ph}private use{^ph}</a>{^/ph}}
>```

#### Reserved

A **_reserved_** _annotation_ is an _annotation_ whose syntax is reserved
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


### Complex Messages

The various features can be used to produce arbitrarily complex _messages_ by combining
_declarations_, _selectors_, _functions_, and more.

>A complex message with 2 _selectors_ and 3 local variable _declarations_:
>
>```
>let $hostName = {$host :person firstName=long}
>let $guestName = {$guest :person firstName=long}
>let $guestsOther = {$guestCount :number offset=1}
>
>match {$host :gender} {$guestOther :number}
>
>when female 0 {{$hostName} does not give a party.}
>when female 1 {{$hostName} invites {$guestName} to her party.}
>when female 2 {{$hostName} invites {$guestName} and one other person to her party.}
>when female * {{$hostName} invites {$guestName} and {$guestsOther} other people to her party.}
>
>when male 0 {{$hostName} does not give a party.}
>when male 1 {{$hostName} invites {$guestName} to his party.}
>when male 2 {{$hostName} invites {$guestName} and one other person to his party.}
>when male * {{$hostName} invites {$guestName} and {$guestsOther} other people to his party.}
>
>when * 0 {{$hostName} does not give a party.}
>when * 1 {{$hostName} invites {$guestName} to their party.}
>when * 2 {{$hostName} invites {$guestName} and one other person to their party.}
>when * * {{$hostName} invites {$guestName} and {$guestsOther} other people to their party.}
>```


> Expression examples:
>
> ```
> {1.23}
> ```
>
> ```
> {|-1.23|}
> ```
>
> ```
> {1.23 :number maxFractionDigits=1}
> ```
>
> ```
> {|Thu Jan 01 1970 14:37:00 GMT+0100 (CET)| :datetime weekday=long}
> ```
>
> ```
> {|My Brand Name| :linkify href=|foobar.com|}
> ```
>
> ```
> {$when :datetime month=2-digit}
> ```
>
> ```
> {:message id=some_other_message}
> ```
>
> ```
> {+ssml.emphasis level=strong}
> ```
>
> Message examples:
>
> ```
> {This is {+b}bold{-b}.}
> ```
>
> ```
> {{+h1 name=above-and-beyond}Above And Beyond{-h1}}
> ```


## Tokens

The grammar defines the following tokens for the purpose of the lexical analysis.

### Keywords

A **_keyword_** is a reserved token that has a unique meaning in the _message_ syntax.

The following three keywords are reserved: `let`, `match`, and `when`.
Reserved keywords are always lowercase.

```abnf
let   = %x6C.65.74        ; "let"
match = %x6D.61.74.63.68  ; "match"
when  = %x77.68.65.6E     ; "when"
```

### Literals

A **_literal_** is a character sequence that appears outside
of _text_ in various parts of a _message_.
A _literal_ can appear in a _declaration_, as a _key_ value,
as an _operand_, or in the value of an _option_.
A _literal_ MAY include any Unicode code point
except for surrogate code points U+D800 through U+DFFF.

All code points are preserved.

A **_quoted_** literal begins and ends with U+005E VERTICAL BAR `|`.
The characters `\` and `|` within a _quoted_ literal MUST be 
escaped as `\\` and `\|`.

An **_unquoted_** literal is a _literal_ that does not require the `|`
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

The **_name_** token is used for variable names (prefixed with `$`),
function names (prefixed with `:`, `+` or `-`),
as well as option names.
It is based on XML's [Name](https://www.w3.org/TR/xml/#NT-Name),
with the restriction that it MUST NOT start with `:`,
as that would conflict with _function_ start characters.
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

### Escape Sequences

An **_escape sequence_** is a two-character sequence starting with
U+005C REVERSE SOLIDUS `\`.

An _escape sequence_ allows the appearance of lexically meaningful characters
in the body of `text`, `quoted`, or `reserved` sequences respectively:

```abnf
text-escape    = backslash ( backslash / "{" / "}" )
quoted-escape  = backslash ( backslash / "|" )
reserve-escape = backslash ( backslash / "{" / "|" / "}" )
backslash      = %x5C ; U+005C REVERSE SOLIDUS "\"
```

### Whitespace

**_Whitespace_** is defined as tab, carriage return, line feed, or the space character.

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
