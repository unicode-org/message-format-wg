# MessageFormat 2.0 Syntax

<details>
<summary>Changelog</summary>

|   Date   | Description |
|----------|-------------|
|2022-01-30|Readd number literals and remove nmtokens. Allow standalone functions.|
|2022-01-29|Split symbols into names and nmtokens|
|2022-01-28|Add aliases to phrases|
|2022-01-28|Forbid selector-less variants|
|2022-01-28|Split declarations into aliases and selectors|
|2022-01-28|Remove standalone functions|
|2022-01-27|Remove number literals and relax symbol's grammar|
|2022-01-27|Change opt:value to opt=value|
|2022-01-26|Specify symbols more precisely. Restrict whitespace.|
|2022-01-26|Add `/*...*/` comments|
|2022-01-25|Add `"..."` string literals and literal formatters|
|2022-01-25|Specify escape sequences|
|2022-01-25|Initial design|

</details>

## Table of Contents

1. [Introduction](#introduction)
    1. [Design Goals](#design-goals)
    1. [Design Restrictions](#design-restrictions)
1. [Overview & Examples](#overview--examples)
    1. [Simple Messages](#simple-messages)
    1. [Simple Placeholders](#simple-placeholders)
    1. [Formatting Functions](#formatting-functions)
    1. [Selection](#selection)
    1. [Aliases](#aliases)
    1. [Complex Messages](#complex-messages)
1. [Comparison with ICU MessageFormat 1.0](#comparison-with-icu-messageformat-10)
1. [Productions](#productions)
    1. [Message](#message)
    1. [Phrases](#phrases)
    1. [Patterns](#patterns)
    1. [Selectors & Variants](#selectors--variants)
    1. [Expressions](#expressions)
    1. [Aliases](#aliases)
1. [Tokens](#tokens)
    1. [Names](#names)
    1. [Text](#text)
    1. [Literals](#literals)
    1. [Escape Sequences](#escape-sequences)
    1. [Comments](#comments)
    1. [Whitespace](#whitespace)
1. [Complete EBNF](#complete-ebnf)

## Introduction

This document defines the formal grammar describing the syntax of a single message. A separate syntax shall be specified to describe collections of messages (_MessageResources_), including message identifiers, metadata, comments, groups, etc.

The document is part of the MessageFormat 2.0 specification, the successor to ICU MessageFormat, henceforth called ICU MessageFormat 1.0.

### Design Goals

The design goals of the syntax specification are as follows:

1. The syntax should be an incremental update over the ICU MessageFormat 1.0 syntax in order to leverage the familiarity and the single-message model that is ubiquitous in the localization tooling today, and increase the chance of adoption.

    * _Non-Goal_: Be backwards-compatible with the ICU MessageFormat 1.0 syntax.

1. The syntax inside translatable content should be easy to understand for humans. This includes making it clear which parts of the message body _are_ translatable content, which parts inside it are placeholders, as well as making the selection logic predictable and easy to reason about.

    * _Non-Goal_: Make the syntax intuitive enough for non-technical translators to hand-edit. Instead, we assume that most translators will work with MessageFormat 2.0 by means of GUI tooling, CAT workbenches etc.

1. The syntax surrounding translatable content should be easy to write and edit for developers, localization engineers, and easy to parse by machines.

1. The syntax should make a single message easily embeddable inside many container formats: `.properties`, YAML, XML, inlined as string literals in programming languages, etc. This includes a future _MessageResource_ specification.

### Design Restrictions

The syntax specification takes into account the following design restrictions:

1. Whitespace outside the translatable content should be insignificant. It should be possible to define a message entirely on a single line with no ambiguity, as well as to format it over multiple lines for clarity.

1. The syntax should not use nor reserve any keywords in any natural language, such as `if`, `match`, or `let`.

1. The syntax should define as few special characters and sigils as possible.

## Overview & Examples

### Simple Messages

A simple message without any variables:

    [Hello, world!]

The same message defined in a `.properties` file:

```properties
app.greetings.hello = [Hello, world!]
```

The same message defined inline in JavaScript:

```js
let hello = new MessageFormat("[Hello, world!]");
hello.format();
```

### Simple Placeholders

A message with an interpolated variable:

    [Hello, {$userName}!]

The same message defined in a `.properties` file:

```properties
app.greetings.hello = [Hello, {$userName}!]
```

The same message defined inline in JavaScript:

```js
let hello = new MessageFormat("[Hello, {$userName}!]");
hello.format({userName: "Anne"});
```

### Formatting Functions

A message with an interpolated `$date` variable formatted with the `asDateTime` function:

    [Today is {$date asDateTime weekday=long}.]

A message with an interpolated `$userName` variable formatted with the custom `asPerson` function capable of declension (using either a fixed dictionary, algorithmic declension, ML, etc.):

    [Hello, {$userName asPerson case=vocative}!]

A message with an interpolated `$userObj` variable formatted with the custom `asPerson` function capable of plucking the first name from the object representing a person:

    [Hello, {$userObj asPerson first=full}!]

A message with two markup-like custom functions, `open(elemName)` and `close(elemName)`, which the runtime can use to construct a document tree structure for a UI framework.

    [{open tag=button}Submit{close tag=button} or {open tag=link}cancel{close tag=link}]

### Selection

A message with a single selector:

    {$count asNumber}?
        one [You have one notification.]
        other [You have {$count} notification.]

A message with a single selector which is an invocation of a custom function `getPlatform()`, formatted on a single line:

    {getPlatform}? windows [Settings] _ [Preferences]

A message with a single selector and a custom `hasCase` function which allows the message to query for presence of grammatical cases required for each variant:

    {$userName hasCase}?
        vocative [Hello, {$userName asPerson case=vocative}!]
        accusative [Please welcome {$userName asPerson case=accusative}!]
        _ [Hello!]

A message with 2 selectors:

    {$photoCount asNumber}? {$userGender}?
        one masculine [{$userName} added a new photo to his album.]
        one feminine [{$userName} added a new photo to her album.]
        one other [{$userName} added a new photo to their album.]
        other masculine [{$userName} added {$photoCount} photos to his album.]
        other feminine [{$userName} added {$photoCount} photos to her album.]
        other other [{$userName} added {$photoCount} photos to their album.]

A message with 3 plural selectors, which results in 8 variants in English:

    {$roomCount asNumber}?
    {$suiteCount asNumber}?
    {$guestCount asNumber}?
        1 1 1 [This isn't a hotel, okay?]
        1 1 _ [This hotel has 1 room and 1 suite, accommodating up to {$guestCount} guests.]
        1 _ 1 [This hotel has 1 room and {$suiteCount} suites, accommodating up to 1 guest.]
        1 _ _ [This hotel has 1 room and {$suiteCount} suites, accommodating up to {$guestCount} guests.]

        _ 1 1 [This hotel has {$roomCount} rooms and 1 suite, accommodating up to 1 guest.]
        _ 1 _ [This hotel has {$roomCount} rooms and 1 suite, accommodating up to {$guestCount} guests.]
        _ _ 1 [This hotel has {$roomCount} rooms and {$suiteCount} suites, accommodating up to 1 guests.]
        _ _ _ [This hotel has {$roomCount} rooms and {$suiteCount} suites, accommodating up to {$guestCount} guests.]

### Aliases

A message defining a `$whom` alias which is then used twice inside the pattern:

    $whom = {$monster asNoun case=accusative}
    [You see {$quality asAdjective article=indefinite accord=$whom} {$whom}!]

A message defining two aliases: `$itemAcc` and `$countInt`, and using `$countInt` as a selector:

    $itemAcc = {$item asNoun count=$count case=accusative}
    $countInt = {$count asNumber maximumFractionDigits=0}

    {$countInt}?
        one [You bought {$color asAdjective article=indefinite accord=$itemAcc} {$itemAcc}.]
        other [You bought {$countInt} {$color asAdjective accord=$itemAcc} {$itemAcc}.]

A message defining three aliases bound to message _fragments_, to mitigate the combinatorial explosion of variants from the example above:

    $roomsFragment = {{$roomCount}? 1 [1 room] other [{$roomCount} rooms]}
    $suitesFragment = {{$suiteCount}? 1 [1 suite] other [{$suitesCount} suites]}
    $guestsFragment = {{$guestCount}? 1 [1 guest] other [{$guestsCount} guests]}

    {$roomCount asNumber}?
    {$suiteCount asNumber}?
    {$guestCount asNumber}?
        1 1 1 [This isn't a hotel, okay?]
        _ _ _ [This hotel has {$roomsFragment} and {$suitesFragment}, accommodating up to {$guestsFragment}.]

A message using an alias to translate the `title` attribute without nesting patterns.

    $title = {[Let's go, {$username}!]}
    [{open tag=button title=$title}Continue{close tag=button}]

### Complex Messages

A complex message with 2 selectors and 3 local variable definitions:

    /* The host's first name. */
    $hostName = {$host asPerson first=full}
    /* The first guest's first name. */
    $guestName = {$guest asPerson first=full}
    /* The number of guests excluding the first guest. */
    $guestsOther = {$guestCount asNumber /* Remove 1 from $guestCount */ offset=1}

    {$host getGender}? {$guestOther asNumber}?
        /* The host is female. */
        female 0 [{$hostName} does not give a party.]
        female 1 [{$hostName} invites {$guestName} to her party.]
        female 2 [{$hostName} invites {$guestName} and one other person to her party.]
        female [{$hostName} invites {$guestName} and {$guestsOther} other people to her party.]

        /* The host is male. */
        male 0 [{$hostName} does not give a party.]
        male 1 [{$hostName} invites {$guestName} to his party.]
        male 2 [{$hostName} invites {$guestName} and one other person to his party.]
        male [{$hostName} invites {$guestName} and {$guestsOther} other people to his party.]

        other 0 [{$hostName} does not give a party.]
        other 1 [{$hostName} invites {$guestName} to their party.]
        other 2 [{$hostName} invites {$guestName} and one other person to their party.]
        other [{$hostName} invites {$guestName} and {$guestsOther} other people to their party.]

## Comparison with ICU MessageFormat 1.0

MessageFormat 2.0 improves upon the ICU MessageFormat 1.0 syntax through the following changes:

1. In MessageFormat 2.0, variants can only be defined at the top level of the message, thus precluding any possible nestedness of expressions.

    ICU MessageFormat 1.0:
    ```
    {foo, func,
        foo1 {Value 1},
        foo2 {
            {bar, func,
                bar1 {Value 2a}
                bar2 {Value 2b}}}}
    ```

    MessageFormat 2.0:
    ```
    {$foo func}?
    {$bar func}?
        foo1 [Value 1]
        foo2 bar1 [Value 2a]
        foo2 bar2 [Value 2b]
    ```

1. MessageFormat 2.0 differentiates between the syntax used to introduce expressions (`{...}`) and the syntax used to defined translatable content (`[...]`).

1. MessageFormat 2.0 uses the dollar sign (`$`) as the sigil for variable references, and only allows named options to functions. The purpose of this change is to help disambiguate between the different parts of a placeholder (variable references, function names, literals etc.).

    ICU MessageFormat 1.0:
    ```
    {when, date, short}
    ```

    MessageFormat 2.0:
    ```
    {$when date style=short}
    ```

1. MessageFormat 2.0 doesn't provide the `#` shorthand inside variants. Instead it allows aliases to be defined at the top of the message; these aliases can then be referred to inside patterns similar to other variables.

1. MessageFormat 2.0 doesn't require commas (`,`) inside placeholders.

## Productions

### Message

A single message consists of zero of more _alias_ definitions, and one _phrase_ which represents the translatable body of the message.

```ebnf
Message ::= Alias* Phrase
```

### Phrases

A phrase represents the translatable body of the message. It consists of:

* a single _pattern_ with no _selectors_ nor _keys_, or
* one or more _selectors_ and one or more keyed _variants_.

```ebnf
Phrase ::= Pattern | Selector+ Variant+
```

Phrases can also be bound to [_aliases_](#aliases). This powerful feature should be used sparingly to declutter very complex messages.

### Patterns

A pattern is a sequence of translatable elements. A message must define at least one _pattern_, standalone or as part of a _variant_. Patterns are always delimited with `[` at the start, and `]` at the end. This serves 3 purposes:

* The message should be unambiguously embeddable in various container formats regardless of the container's whitespace trimming rules. E.g. in Java `.properties` files, `hello = [Hello]` will unambiguously define the `Hello` message without the space in front of it.
* The message should be conveniently embeddable in various programming languages without the need to escape characters commonly related to strings, e.g. `"` and `'`. Such need may still occur when a singe or double quote is used in the translatable content or to delimit a string literal.
* The syntax should make it as clear as possible which parts of the message body are translatable and which ones are part of the formatting logic definition.

```ebnf
Pattern ::= '[' (Text | Placeable)* ']' /* ws: explicit */
Placeable ::= '{' Expression '}'
```

Examples:

```
[Hello, world!]
```

### Selectors & Variants

A selector is an _expression_ which will be used to choose one of the variants during formatting. Selectors are always suffixed with a `?`. A variant is a keyed _pattern_.

```ebnf
Selector ::= '{' Expression '}' '?'
Variant ::= VariantKey+ Pattern
VariantKey ::= String | Number | Name
```

Examples:

```
{$count asNumber}?
    1 [One apple]
    other [{$count} apples]
```

### Expressions

Expressions can either start with an operand, or be standalone function calls.

The operand is a number literal, a quoted string literal or a variable name. The operand can be optionally followed by a formatting function and its named options. Formatting functions do not accept any positional arguments other than the operand in front of them.

Standalone function calls don't have any operands in front of them.

```ebnf
Expression ::= Operand Function? | Function
Operand ::= String | Number | Variable
Function ::= Name Option*
Option ::= Name '=' (String | Number | Name | Variable)
```

Examples:

```
1.23
```

```
1.23 asNumber maxFractionDigits=1
```

```
"1970-01-01T13:37:00.000Z" asDateTime weekday=long
```

```
$when asDateTime style=long
```

```
getMessage id=some_other_message
```

### Aliases

An alias is a local variable bound to an _expression_ or a _phrase_, defined at the beginning of the message. Aliases may be used in other expressions.

```ebnf
Alias ::= Variable '=' '{' (Expression | Phrase) '}'
```

Examples:

```
$itemAccusative = {$item asNoun case=accusative}
```

```
$roomsFragment = {{$roomCount asNumber}?
    one [1 room]
    other [{$roomCount} rooms]}
```

## Tokens

The grammar defines the following tokens for the purpose of the lexical analysis.

### Names

The _name_ token is used for variable names (prefixed with `$`), as well as function and option names. A name cannot start with an ASCII digit and certain basic combining characters. Otherwise, the set of characters allowed in names is large.

Names can also be used as quote-less single-word string literals in variant keys and option values.

_Note:_ The Name symbol is intentionally defined to be the same as XML's [Name](https://www.w3.org/TR/xml/#NT-Name) in order to increase the interoperability with data defined in XML. In particular, the grammatical feature data [specified in LDML](https://unicode.org/reports/tr35/tr35-general.html#Grammatical_Features) and [defined in CLDR](https://unicode-org.github.io/cldr-staging/charts/latest/grammar/index.html) uses [Nmtokens](https://www.w3.org/TR/xml/#NT-Nmtokens), which are similar to Name but don't have the restriction on the first character. When dealing with Nmtokens which are not Names (e.g. `2-digit`), quoted strings can be used to disambiguate from number literals (`day="2-digit"`).

```ebnf
Variable ::= '$' Name /* ws: explicit */
Name ::= NameStart NameChar* /* ws: explicit */
NameStart ::= [a-zA-Z] | "_"
            | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF]
            | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D]
            | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF]
            | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
NameChar ::= NameStart | [0-9] | "-" | "." | #xB7
           | [#x0300-#x036F] | [#x203F-#x2040]
```

### Text

Text is the translatable content of a _pattern_. Any Unicode codepoint is allowed in text, with the exception of `]` (which ends the pattern), `{` (which starts a placeholder), and `\` (which starts an escape sequence).

```ebnf
Text ::= (TextChar | TextEscape)+ /* ws: explicit */
TextChar ::= AnyChar - (']' | '{' | Esc)
AnyChar ::= .
```

### Literals

Any Unicode codepoint is allowed in string literals, with the exception of `"` (which ends the string literal), and `\` (which starts an escape sequence).

```ebnf
String ::= '"' (StringChar | StringEscape)* '"' /* ws: explicit */
Number ::= '-'? DecimalDigit+ ('.' DecimalDigit+)? /* ws: explicit */
StringChar ::= AnyChar - ('"'| Esc)
DecimalDigit ::= [0-9]
```

### Escape Sequences

Escape sequences are introduced by the backslash character (`\`). They are allowed in translatable text as well as in string literals.

```ebnf
Esc ::= '\'
TextEscape ::= Esc ']' | Esc '{' | UnicodeEscape
StringEscape ::= Esc '"' | UnicodeEscape
UnicodeEscape ::= Esc 'u' HexDigit HexDigit HexDigit HexDigit
                | Esc 'U' HexDigit HexDigit HexDigit HexDigit HexDigit HexDigit
HexDigit ::= [0-9a-fA-F]
```

### Comments

Comments are delimited with `/*` at the start, and `*/` at the end, and can contain any Unicode codepoint including line breaks. Comments can only appear outside translatable text.

```ebnf
Comment ::= '/*' (AnyChar* - (AnyChar* '*/' AnyChar*)) '*/'
```

### Whitespace

Whitespace is defined as tab, carriage return, line feed, or the space character.

Inside patterns, whitespace is part of the translatable content and is recorded and stored verbatim. Whitespace is not significant outside translatable text.

```ebnf
WhiteSpace ::= #x9 | #xD | #xA | #x20
```

## Complete EBNF

The following EBNF uses the [W3C flavor](https://www.w3.org/TR/xml/#sec-notation) of the BNF notation. The grammar is an LL(1) grammar without backtracking.

```ebnf
Message ::= Alias* Phrase
Alias ::= Variable '=' '{' (Expression | Phrase) '}'
Phrase ::= Pattern | Selector+ Variant+

/* Selectors and variants */
Selector ::= '{' Expression '}' '?'
Variant ::= VariantKey+ Pattern
VariantKey ::= String | Number | Name

/* Pattern and pattern elements */
Pattern ::= '[' (Text | Placeable)* ']' /* ws: explicit */
Placeable ::= '{' Expression '}'

/* Expressions */
Expression ::= Operand Function? | Function
Operand ::= String | Number | Variable
Function ::= Name Option*
Option ::= Name '=' (String | Number | Name | Variable)

/* Ignored tokens */
Ignore ::= Comment | WhiteSpace /* ws: definition */

<?TOKENS?>

/* Names */
Variable ::= '$' Name /* ws: explicit */
Name ::= NameStart NameChar* /* ws: explicit */
NameStart ::= [a-zA-Z] | "_"
            | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF]
            | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D]
            | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF]
            | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
NameChar ::= NameStart | [0-9] | "-" | "." | #xB7
           | [#x0300-#x036F] | [#x203F-#x2040]

/* Text */
Text ::= (TextChar | TextEscape)+
TextChar ::= AnyChar - (']' | '{' | Esc)
AnyChar ::= .

/* Literals */
String ::= '"' (StringChar | StringEscape)* '"' /* ws: explicit */
Number ::= '-'? DecimalDigit+ ('.' DecimalDigit+)? /* ws: explicit */
StringChar ::= AnyChar - ('"'| Esc)
DecimalDigit ::= [0-9]

/* Escape sequences */
Esc ::= '\'
TextEscape ::= Esc ']' | Esc '{' | UnicodeEscape
StringEscape ::= Esc '"' | UnicodeEscape
UnicodeEscape ::= Esc 'u' HexDigit HexDigit HexDigit HexDigit
                | Esc 'U' HexDigit HexDigit HexDigit HexDigit HexDigit HexDigit
HexDigit ::= [0-9a-fA-F]

/* Comments */
Comment ::= '/*' (AnyChar* - (AnyChar* '*/' AnyChar*)) '*/'

/* WhiteSpace */
WhiteSpace ::= #x9 | #xD | #xA | #x20
```
