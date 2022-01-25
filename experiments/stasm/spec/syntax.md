# Message Format 2.0 Syntax

<details>
<summary>Changelog</summary>

|   Date   | Description |
|----------|-------------|
| **TODO** |Aliases to submessages|
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
    1. [Complex Messages](#complex-messages)
1. [Comparison with Message Format 1.0](#comparison-with-message-format-10)
1. [Productions](#productions)
    1. [Message](#message)
    1. [Definitions](#definitions)
    1. [Variants & Patterns](#variants--patterns)
    1. [Expressions](#expressions)
1. [Tokens](#tokens)
    1. [Literals & Identifiers](#literals--identifiers)
    1. [Character Classes](#character-classes)
    1. [Escape Sequences](#escape-sequences)
    1. [Whitespace](#whitespace)
1. [Complete EBNF](#complete-ebnf)

## Introduction

This document defines the formal grammar describing the syntax of a single message. A separate syntax shall be specified to describe collections of messages (_MessageResources_), including message identifiers, metadata, comments, groups, etc.

### Design Goals

The design goals of the syntax specification are as follows:

1. The syntax should be an incremental update over the Message Format 1.0 syntax in order to leverage the familiarity and the single-message model that is ubiquitous in the localization tooling today, and increase the chance of adoption.

    * _Non-Goal_: Be backwards-compatible with the Message Format 1.0 syntax.

1. The syntax inside translatable content should be easy to understand for humans. This includes making it clear which parts of the message body _are_ translatable content, which parts are placeholders, as well as making the selection logic predictable and easy to reason about.

    * _Non-Goal_: Make the syntax intuitive enough for non-technical translators to hand-edit. Instead, we assume that most translators will work with Message Format 2.0 by means of GUI tooling, CAT workbenches etc.

1. The syntax surrounding translatable content should be easy to write and edit for developers, localization engineers, and easy to parse by machines.

1. The syntax should make a single message easily embeddable inside many container formats: `.properties`, YAML, XML, inlined as string literals in programming languages, etc. This includes a future _MessageResource_ specification.

### Design Restrictions

The syntax specification takes into account the following design restrictions:

1. The syntax should be described by an LL(1) grammar without backtracking.

1. Whitespace outside the translatable content should be insignificant. A message can be defined entirely on a single line with no ambiguitiy, or it can be formatted over multiple lines for clarity.

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
let hello = new Intl.MessageFormat("[Hello, world!]");
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
let hello = new Intl.MessageFormat("[Hello, {$userName}!]");
hello.format({userName: "Anne"});
```

### Formatting Functions

A message with an interpolated `$date` variable formatted with a custom `datetime` function:

    [Today is {$date datetime weekday:long}]

A message with an interpolated `$userName` variable formatted with a custom `name` function capable of declension (using either a fixed dictionary, algorithmic declension, ML, etc.):

    [Hello, {$userName name case:vocative}!]

A message with an interpolated `$userObj` variable formatted with a custom `name` function capable of plucking the first name from the object representing a person:

    [Hello, {$userObj name first:full}!]

### Selection

A message with a single selector:

    {$count plural}? 
        one [$You have one notification.]
        other [$You have {$count} notification.]

A message with a single selector which is an invocation of a custom function named `platform`, formatted on a single line:

    {platform}? windows [Settings] _ [Preferences]

A message with a single selector and a custom `hasCase` function which allows the message to query for presence of grammatical cases required for each variant:

    {$userName hasCase}?
        vocative [Hello, {$userName name case:vocative}!]
        accusative [Please welcome {$userName name case:accusative}!]
        _ [Hello!]

A message with two selectors:

    {$photoCount plural}? {$userGender}?
        one masculine [{$userName} added a new photo to his album.]
        one feminine [{$userName} added a new photo to her album.]
        one other [{$userName} added a new photo to their album.]
        other masculine [{$userName} added {$photoCount} photos to his album.]
        other feminine [{$userName} added {$photoCount} photos to her album.]
        other other [{$userName} added {$photoCount} photos to their album.]

### Complex Messages

A complex message with two selectors and local variable definitions:

    $hostName = {$host name first:full}
    $guestName = {$guest name first:full}
    $guestsOther = {$guestCount number offset:1}

    {$host gender}? {$guestCount number}?
        female 0 [{$hostName} does not give a party.]
        female 1 [{$hostName} invites {$guestName} to her party.]
        female 2 [{$hostName} invites {$guestName} and one other person to her party.]
        female [{$hostName} invites {$guestName} and {$guestsOther} other people to her party.]

        male 0 [{$hostName} does not give a party.]
        male 1 [{$hostName} invites {$guestName} to his party.]
        male 2 [{$hostName} invites {$guestName} and one other person to his party.]
        male [{$hostName} invites {$guestName} and {$guestsOther} other people to his party.]

        other 0 [{$hostName} does not give a party.]
        other 1 [{$hostName} invites {$guestName} to their party.]
        other 2 [{$hostName} invites {$guestName} and one other person to their party.]
        other [{$hostName} invites {$guestName} and {$guestsOther} other people to their party.]

## Comparison with Message Format 1.0

Message Format 2.0 improves upon the Message Format 1.0 syntax through the following changes:

1. In Message Format 2.0, variants can only be defined at the top level of the message, thus precluding any possible nestedness of expressions. 

    Message Format 1.0:
    ```
    {foo, func,
        foo1 {Value 1},
        foo2 {
            {bar, func,
                bar1 {Value 2a}
                bar2 {Value 2b}}}}
    ```

    Message Format 2.0:
    ```
    {$foo func}?
    {$bar func}?
        foo1 [Value 1]
        foo2 bar1 [Value 2a]
        foo2 bar2 [Value 2b]
    ```
1. Message Format 2.0 differentiates between the syntax used to introduce expressions (`{...}`) and the syntax used to defined translatable content (`[...]`).

1. Message Format 2.0 uses the dollar sign (`$`) as the sigil for variable references, and only allows named options to functions. The purpose of this change is to help disambiguate between the different parts of a placeholder (variable references, function names, literals etc.).

    Message Format 1.0:
    ```
    {when, date, short}
    ```

    Message Format 2.0:
    ```
    {$when date style:short}
    ```

1. Message Format 2.0 doesn't provide the `#` shorthand inside variants. Instead it allows aliases to be defined at the top of the message; these aliases can then be referred to inside patterns similar to other variables.

1. Message Format 2.0 doesn't require commas (`,`) inside placeholders.

## Productions

### Message

A single message consists of zero of more _definitions_ and at least one _variant_.

```
Message ::= Definition* Variant+
```

### Definitions

A definition is an _expression_ which may be used as a selector to select an appropriate variant.  It may also be bound to an _alias_ which can then be used in subsequent definitions and variant patterns.

```
Definition ::= Alias? "{" Expression "}" "?"?
Alias ::= VariableName "="
```

Examples:

```
{$userGender}?
```

```
{$count plural}?
```

```
$itemAccusative = {$item noun case:accusative}?
```


### Variants & Patterns

A message must include at least one _variant_. The translatable content of a variant is called a _pattern_. Patterns are always delimited with `[` at the start, and `]` at the end. This serves 3 purposes:

* The message should be unambiguously embeddable in various container formats regardless of the container's whitespace trimming rules. E.g. in Java `.properties` files, `hello = [Hello]` will unambiguously define the `Hello` message without the space in front of it.
* The message should be conveniently embeddable in various programming languages without the need to escape characters commonly related to strings, e.g. `"` and `'`. Such need may still occur when a singe or double quote is used in the translatable content.
* The syntax should make it as clear as possible which parts of the message body are translatable and which are part of the formatting logic definition.

Variants can be optionally keyed, in which case their keys will be matched against the message's selectors. The formatting specification defines which variant is chosen by comparing its keys to the message's selectors, including the situation when no keys or no selectors are defined.

```
Variant ::= VariantKey? Pattern
VariantKey ::= (Literal Literal*)
Pattern ::= "[" (Text | Placeable)* "]" /* ws: explicit */
Placeable ::= "{" Expression "}"
```

Examples:

```
[Hello, world!]
```

```
key [Hello, world!]
```

```
key 0 [Hello, world!]
```

### Expressions

Expressions can be either of the following productions:

- _Number formatters_ start with the number literal optionally followed by the formatting function and its named options. Formatting functions do not accept any positional arguments other than the number literal in front of them.
- _Variable formatters_ start with the variable's name and are optionally followed by the formatting function and its named options. Formatting functions do not accept any positional arguments other than the variable in front of them.
- _Function calls_ are standalone invocations which start with the function's name optionally followed by its named options. Functions do not accept any positional arguments.

```
Expression ::= NumberFmt | VariableFmt | FunctionCall
NumberFmt ::= Number FunctionCall?
VariableFmt ::= VariableName FunctionCall?
FunctionCall ::= Symbol FunctionOpt*
FunctionOpt ::= Symbol ":" (Literal | VariableName)
```

Examples:

```
1.23 number maxFractionDigits:1
```

```
$when datetime style:long
```

```
ref msgid:some_other_message
```

## Tokens

The grammar defines the following tokens for the purpose of the lexical analysis.

### Literals & Identifiers

```
Text ::= (TextChar | EscapeSeq)+
VariableName ::= "$" Symbol /* ws: explicit */
Literal ::= Symbol | Number /* ws: explicit */
Symbol ::= (SymbolChar | "_") (SymbolChar | DecimalDigit | "_" | "-")* /* ws: explicit */
Number ::= ("-")? DecimalDigit+ ("." DecimalDigit+)? /* ws: explicit */
```

### Character Classes

Any Unicode codepoint is allowed in the translatable text, with the exception of `]` (which ends the pattern), `{` (which starts a placeholder), and `\` (which starts an escape sequence).

The set of characters that can be used in symbols is intentionally limited to simplify parsing and error recovery, discourage complexity in custom function implementations, and encourage using the grammatical feature data [specified in LDML](https://unicode.org/reports/tr35/tr35-general.html#Grammatical_Features) and [defined in CLDR](https://unicode-org.github.io/cldr-staging/charts/latest/grammar/index.html).

```
TextChar ::= . - ("]" | "{" | #x5c)
SymbolChar ::= [a-zA-Z]
DecimalDigit ::= [0-9]
HexDigit ::= [0-9a-fA-F]
```

### Escape Sequences

Escape sequences are introduced inside translatable text by the backslash character (`\`).

```
EscapeSeq ::= #x5c "]" | #x5c "{" | UnicodeSeq
UnicodeSeq ::= #x5c "u" HexDigit HexDigit HexDigit HexDigit
             | #x5c "U" HexDigit HexDigit HexDigit HexDigit HexDigit HexDigit
```

### Whitespace

Inside patterns, whitespace is part of the translatable content and is recorded and stored verbatim. Outside translatable text, whitespace is not significant, unless it's required to differentiate between two literals.

```
WhiteSpace ::= TAB | VT | FF | SP | NBSP | BOM | USP /* ws: definition */
TAB ::= #x0009
VT ::= #x000B
FF ::= #x000C
SP ::= #x0020
NBSP ::= #x00A0
BOM ::= #xFEFF
USP ::= [#x0009-#x000D] | #x0020 | #x0085 | #x00A0 | #x1680 | #x180E
      | [#x2000-#x200A] | #x2028 | #x2029 | #x202F | #x205F | #x3000
```

## Complete EBNF

The following EBNF uses the [W3C flavor](https://www.w3.org/TR/xml/#sec-notation) of the BNF notation.

```ebnf
Message ::= Definition* Variant+

/* Aliases and selectors */
Definition ::= Alias? "{" Expression "}" "?"?
Alias ::= VariableName "="

/* Pattern and pattern elements */
Variant ::= VariantKey? Pattern
VariantKey ::= (Literal Literal*)
Pattern ::= "[" (Text | Placeable)* "]" /* ws: explicit */
Placeable ::= "{" Expression "}"

/* Expressions */
Expression ::= NumberFmt | VariableFmt | FunctionCall
NumberFmt ::= Number FunctionCall?
VariableFmt ::= VariableName FunctionCall?
FunctionCall ::= Symbol FunctionOpt*
FunctionOpt ::= Symbol ":" (Literal | VariableName)

<?TOKENS?>

/* Literals & Identifiers*/
Text ::= (TextChar | EscapeSeq)+
VariableName ::= "$" Symbol /* ws: explicit */
Literal ::= Symbol | Number /* ws: explicit */
Symbol ::= (SymbolChar | "_") (SymbolChar | DecimalDigit | "_" | "-")* /* ws: explicit */
Number ::= ("-")? DecimalDigit+ ("." DecimalDigit+)? /* ws: explicit */

/* Character classes */
TextChar ::= . - ("]" | "{" | #x5c)
SymbolChar ::= [a-zA-Z]
DecimalDigit ::= [0-9]
HexDigit ::= [0-9a-fA-F]

/* Escape sequences */
EscapeSeq ::= #x5c "]" | #x5c "{" | UnicodeSeq
UnicodeSeq ::= #x5c "u" HexDigit HexDigit HexDigit HexDigit
             | #x5c "U" HexDigit HexDigit HexDigit HexDigit HexDigit HexDigit

/* All whitespace outside text is ignored */
WhiteSpace ::= TAB | VT | FF | SP | NBSP | BOM | USP /* ws: definition */
TAB ::= #x0009
VT ::= #x000B
FF ::= #x000C
SP ::= #x0020
NBSP ::= #x00A0
BOM ::= #xFEFF
USP ::= [#x0009-#x000D] | #x0020 | #x0085 | #x00A0 | #x1680 | #x180E
      | [#x2000-#x200A] | #x2028 | #x2029 | #x202F | #x205F | #x3000
```
