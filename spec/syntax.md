# DRAFT MessageFormat 2.0 Syntax

## Table of Contents

1. [Introduction](#introduction)
   1. [Design Goals](#design-goals)
   1. [Design Restrictions](#design-restrictions)
1. [Overview & Examples](#overview--examples)
   1. [Simple Messages](#simple-messages)
   1. [Simple Placeholders](#simple-placeholders)
   1. [Formatting Functions](#formatting-functions)
   1. [Markup Elements](#markup-elements)
   1. [Selection](#selection)
   1. [Local Variables](#local-variables)
   1. [Complex Messages](#complex-messages)
1. [Productions](#productions)
   1. [Message](#message)
   1. [Plain](#plain)
   1. [Preamble](#preamble)
   1. [Variants](#variants)
   1. [Patterns](#patterns)
   1. [Placeholders](#placeholders)
   1. [Expressions](#expressions)
   1. [Markup Elements](#markup-elements)
1. [Tokens](#tokens)
   1. [Text](#text)
   1. [Names](#names)
   1. [Quoted Strings](#quoted-strings)
   1. [Escape Sequences](#escape-sequences)
   1. [Whitespace](#whitespace)
1. [Complete EBNF](#complete-ebnf)

## Introduction

This document defines the formal grammar describing the syntax of a single message.
A separate syntax shall be specified to describe collections of messages (_MessageResources_),
including message identifiers, metadata, comments, groups, etc.

The document is part of the MessageFormat 2.0 specification,
the successor to ICU MessageFormat, henceforth called ICU MessageFormat 1.0.

### Design Goals

The design goals of the syntax specification are as follows:

1. The syntax should leverage the familiarity with ICU MessageFormat 1.0
   in order to lower the barrier to entry and increase the chance of adoption.
   At the same time,
   the syntax should fix the [pain points of ICU MessageFormat 1.0](../docs/why_mf_next.md).

   - _Non-Goal_: Be backwards-compatible with the ICU MessageFormat 1.0 syntax.

1. The syntax inside translatable content should be easy to understand for humans.
   This includes making it clear which parts of the message body _are_ translatable content,
   which parts inside it are placeholders,
   as well as making the selection logic predictable and easy to reason about.

   - _Non-Goal_: Make the syntax intuitive enough for non-technical translators to hand-edit.
     Instead, we assume that most translators will work with MessageFormat 2.0
     by means of GUI tooling, CAT workbenches etc.

1. The syntax surrounding translatable content should be easy to write and edit
   for developers, localization engineers, and easy to parse by machines.

1. The syntax should make a single message easily embeddable inside many container formats:
   `.properties`, YAML, XML, inlined as string literals in programming languages, etc.
   This includes a future _MessageResource_ specification.

1. Simple messages that do not use any placeholders or selectors should (as far as possible)
   be represented in the syntax with no additional characters than their actual contents.

### Design Restrictions

The syntax specification takes into account the following design restrictions:

1. Whitespace outside the translatable content should be insignificant.
   It should be possible to define a message entirely on a single line with no ambiguity,
   as well as to format it over multiple lines for clarity.

1. The syntax should not use nor reserve any keywords in any natural language,
   such as `if`, `match`, or `let`.

1. The syntax should define as few special characters and sigils as possible.

## Overview & Examples

### Simple Messages

A simple message without any variables does not need any syntax:

    Hello, world!

The same message defined in a `.properties` file:

```properties
app.greetings.hello = Hello, world!
```

The same message defined inline in JavaScript:

```js
let hello = new MessageFormat('Hello, world!')
hello.format()
```

### Simple Placeholders

A message with an interpolated variable needs to be interpreted as a pattern,
which uses `[…]` delimiters:

    [Hello, {$userName}!]

The same message defined in a `.properties` file:

```properties
app.greetings.hello = [Hello, {$userName}!]
```

The same message defined inline in JavaScript:

```js
let hello = new MessageFormat('[Hello, {$userName}!]')
hello.format({ userName: 'Anne' })
```

### Formatting Functions

A message with an interpolated `$date` variable formatted with the `:datetime` function:

    [Today is {$date :datetime weekday=long}.]

A message with an interpolated `$userName` variable formatted with
the custom `:person` function capable of
declension (using either a fixed dictionary, algorithmic declension, ML, etc.):

    [Hello, {$userName :person case=vocative}!]

A message with an interpolated `$userObj` variable formatted with
the custom `:person` function capable of
plucking the first name from the object representing a person:

    [Hello, {$userObj :person firstName=long}!]

### Markup Elements

A message with two markup-like element placeholders, `button` and `link`,
which the runtime can use to construct a document tree structure for a UI framework.

    [{button}Submit{/button} or {link}cancel{/link}.]

### Selection

A message with a single selector:

    {$count :number}
        1 [You have one notification.]
        * [You have {$count} notifications.]

A message with a single selector which is an invocation of
a custom function `:platform`, formatted on a single line:

    {:platform} windows [Settings] * [Preferences]

A message with a single selector and a custom `:hasCase` function
which allows the message to query for presence of grammatical cases required for each variant:

    {$userName :hasCase}
        vocative [Hello, {$userName :person case=vocative}!]
        accusative [Please welcome {$userName :person case=accusative}!]
        * [Hello!]

A message with 2 selectors:

    {$photoCount :number} {$userGender :equals}
        1 masculine [{$userName} added a new photo to his album.]
        1 feminine [{$userName} added a new photo to her album.]
        1 * [{$userName} added a new photo to their album.]
        * masculine [{$userName} added {$photoCount} photos to his album.]
        * feminine [{$userName} added {$photoCount} photos to her album.]
        * * [{$userName} added {$photoCount} photos to their album.]

### Local Variables

A message defining a local variable `$whom` which is then used twice inside the pattern:

    $whom = {$monster :noun case=accusative}
    [You see {$quality :adjective article=indefinite accord=$whom} {$whom}!]

A message defining two local variables:
`$itemAcc` and `$countInt`, and using `$countInt` as a selector:

    $countInt = {$count :number maximumFractionDigits=0}
    $itemAcc = {$item :noun count=$count case=accusative}
        one [You bought {$color :adjective article=indefinite accord=$itemAcc} {$itemAcc}.]
        * [You bought {$countInt} {$color :adjective accord=$itemAcc} {$itemAcc}.]

### Complex Messages

A complex message with 2 selectors and 3 local variable definitions:

    {$host :gender}
    {$guestOther :number}

    $hostName = {$host :person firstName=long}
    $guestName = {$guest :person firstName=long}
    $guestsOther = {$guestCount :number offset=1}

        female 0 [{$hostName} does not give a party.]
        female 1 [{$hostName} invites {$guestName} to her party.]
        female 2 [{$hostName} invites {$guestName} and one other person to her party.]
        female * [{$hostName} invites {$guestName} and {$guestsOther} other people to her party.]

        male 0 [{$hostName} does not give a party.]
        male 1 [{$hostName} invites {$guestName} to his party.]
        male 2 [{$hostName} invites {$guestName} and one other person to his party.]
        male * [{$hostName} invites {$guestName} and {$guestsOther} other people to his party.]

        * 0 [{$hostName} does not give a party.]
        * 1 [{$hostName} invites {$guestName} to their party.]
        * 2 [{$hostName} invites {$guestName} and one other person to their party.]
        * * [{$hostName} invites {$guestName} and {$guestsOther} other people to their party.]

## Productions

The specification defines the following grammar productions.
A message satisfying all rules of the grammar is considered _well-formed_.
Furthermore, a well-formed message can is considered _valid_
if it meets additional semantic requirements about its structure, defined below.

### Message

A single message is either a plain message, a single pattern, or has a preamble
followed by one or more variants which represent the translatable body of the message.

```ebnf
Message ::= Plain | Pattern | Preamble Variant+
```

### Plain

A plain message only contains translatable content;
placeholders or their delimiters are not allowed inside a plain message.
Plain messages must not start with one of the syntax characters `[`, `{` or `$`,
as those would indicate that the message has a more complex structure.
Any whitespace at the beginning or end of a plain message is ignored.
A plain message cannot represent an empty string;
for that, use an empty pattern `[]` instead.

```ebnf
Plain ::= PlainStart (PlainChar* PlainEnd)?  /* ws: explicit */
PlainChar ::= AnyChar - ('{' | '}')
PlainStart ::= PlainChar - ('[' | '$' | WhiteSpace)
PlainEnd ::= PlainChar - WhiteSpace
```

### Preamble

The preamble is where selectors and local variables can be defined.
A selector is an expression which will be used to choose one of the variants during formatting.
A selector can be optionally bound to a local variable, which may then be used in other expressions.

```ebnf
Preamble ::= Selector+
Selector ::= (Variable '=')? '{' Expression '}'
```

Examples:

```
$frac = {$count: number minFractionDigits=2}
    1 [One apple]
    * [{$frac} apples]
```

### Variants

A variant is a keyed pattern.
The keys are used to match against the selectors defined in the preamble.
The key `*` is a "catch-all" key, matching all selector values.

```ebnf
Variant ::= VariantKey* Pattern
VariantKey ::= Literal | Nmtoken | '*'
```

A well-formed message is considered valid if the following requirements are satisfied:

- The number of keys on each variant must be fewer or equal to the number of selectors defined in the preamble.
- At least one variant's keys must all be equal to the catch-all key (`*`).

### Patterns

A pattern is a sequence of translatable elements.
Patterns are always delimited with `[` at the start, and `]` at the end.
This serves 3 purposes:

- The message should be unambiguously embeddable in various container formats
  regardless of the container's whitespace trimming rules.
  E.g. in Java `.properties` files,
  `hello = [Hello]` will unambiguously define the `Hello` message without the space in front of it.
- The message should be conveniently embeddable in various programming languages
  without the need to escape characters commonly related to strings, e.g. `"` and `'`.
  Such need may still occur when a single or double quote is
  used in the translatable content.
- The syntax should make it as clear as possible which parts of the message body
  are translatable and which ones are part of the formatting logic definition.

```ebnf
Pattern ::= '[' (Text | Placeholder)* ']' /* ws: explicit */
```

Examples:

```
[Hello, world!]
```

### Placeholders

Placeholders can contain expressions and markup elements.

```ebnf
Placeholder ::= '{' (Expression | MarkupStart | MarkupEnd) '}'
```

### Expressions

Expressions can either start with an operand, or be standalone function calls.

The operand is a literal or a variable name.
The operand can be optionally followed by an _annotation_:
a formatting function and its named options.
Formatting functions do not accept any positional arguments
other than the operand in front of them.

Standalone function calls don't have any operands in front of them.

```ebnf
Expression ::= Operand Annotation? | Annotation
Operand ::= Literal | Variable
Annotation ::= Function Option*
Option ::= Name '=' (Literal | Nmtoken | Variable)
```

Examples:

```
(1.23)
```

```
(1.23) :number maxFractionDigits=1
```

```
(1970-01-01T13:37:00.000Z) :datetime weekday=long
```

```
(Thu Jan 01 1970 14:37:00 GMT+0100 \(CET\)) :datetime weekday=long
```

```
$when :datetime month=2-digit
```

```
:message id=some_other_message
```

### Markup

Markup elements provide a structured way to mark up parts of the content.
There are two kinds of elements: start (opening) elements and end (closing) elements,
each with its own syntax.
They mimic XML elements, but do not require well-formedness.
Standalone display elements should be represented as function expressions.

```ebnf
MarkupStart ::= Name Option*
MarkupEnd ::= '/' Name
```

Examples:

```
[This is {b}bold{/b}.]
```

```
[{h1 name=(above-and-beyond)}Above And Beyond{/h1}]
```

## Tokens

The grammar defines the following tokens for the purpose of the lexical analysis.

### Text

Text is the translatable content of a _pattern_.
Any Unicode codepoint is allowed in text, with the exception of
`[` and `]` (which delimit patterns),
`{` and `}` (which delimit placeholders),
and `\` (which starts an escape sequence).

```ebnf
Text ::= (TextChar | TextEscape)+ /* ws: explicit */
TextChar ::= AnyChar - ('[' | ']' | '{' | '}' | Esc)
AnyChar ::= .
```

### Names

The _name_ token is used for variable names (prefixed with `$`),
function names (prefixed with `:`) as well as option names.
A name cannot start with an ASCII digit and certain basic combining characters.
Otherwise, the set of characters allowed in names is large.

The _nmtoken_ token doesn't have _name_'s restriction on the first character
and is used as variant keys and option values.

_Note:_ The Name and Nmtoken symbols are intentionally defined to be
the same as XML's [Name](https://www.w3.org/TR/xml/#NT-Name) and [Nmtoken](https://www.w3.org/TR/xml/#NT-Nmtokens)
in order to increase the interoperability with data defined in XML.
In particular, the grammatical feature data [specified in LDML](https://unicode.org/reports/tr35/tr35-general.html#Grammatical_Features)
and [defined in CLDR](https://unicode-org.github.io/cldr-staging/charts/latest/grammar/index.html)
uses Nmtokens.

```ebnf
Variable ::= '$' Name /* ws: explicit */
Function ::= ':' Name /* ws: explicit */
Name ::= NameStart NameChar* /* ws: explicit */
Nmtoken ::= NameChar+ /* ws: explicit */
NameStart ::= [a-zA-Z] | "_"
            | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF]
            | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D]
            | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF]
            | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
NameChar ::= NameStart | [0-9] | "-" | "." | #xB7
           | [#x0300-#x036F] | [#x203F-#x2040]
```

### Literal

Any Unicode code point is allowed in literals,
with the exception of its delimiters `(` and `)`,
and `\` (which starts an escape sequence).

```ebnf
Literal ::= '(' (LiteralChar | LiteralEscape)* ')' /* ws: explicit */
LiteralChar ::= AnyChar - ('(' | ')' | Esc)
```

### Escape Sequences

Escape sequences are introduced by the backslash character (`\`).
They are allowed in translatable text as well as in literals.

```ebnf
Esc ::= '\'
TextEscape ::= Esc Esc | Esc '[' | Esc ']' | Esc '{' | Esc '}'
LiteralEscape ::= Esc Esc | Esc '(' | Esc ')'
```

### Whitespace

Whitespace is defined as tab, carriage return, line feed, or the space character.

Inside patterns,
whitespace is part of the translatable content and is recorded and stored verbatim.
Whitespace is not significant outside translatable text.

```ebnf
WhiteSpace ::= #x9 | #xD | #xA | #x20 /* ws: definition */
```

## Complete EBNF

The complete EBNF is available as [`message.ebnf`](./message.ebnf).
It uses the [W3C flavor](https://www.w3.org/TR/xml/#sec-notation) of the BNF notation.
The grammar is an LL(1) grammar without backtracking.
