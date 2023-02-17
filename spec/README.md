# MessageFormat 2.0 Specification

## Table of Contents

1. [Introduction](#introduction)
   1. [Conformance](#conformance)
   1. [Terminology and Conventions](#terminology-and-conventions)
1. [Syntax](syntax.md)
   1. [Design Goals](syntax.md#design-goals)
   1. [Design Restrictions](syntax.md#design-restrictions)
   1. [Overview & Examples](syntax.md#overview--examples)
   1. [Simple Messages](syntax.md#simple-messages)
   1. [Simple Placeholders](syntax.md#simple-placeholders)
   1. [Formatting Functions](syntax.md#formatting-functions)
   1. [Markup Elements](syntax.md#markup-elements)
   1. [Selection](syntax.md#selection)
   1. [Local Variables](syntax.md#local-variables)
   1. [Complex Messages](syntax.md#complex-messages)
1. [Productions](syntax.md#productions)
   1. [Message](syntax.md#message)
   1. [Variable Declarations](syntax.md#variable-declarations)
   1. [Selectors](syntax.md#selectors)
   1. [Variants](syntax.md#variants)
   1. [Patterns](syntax.md#patterns)
   1. [Placeholders](syntax.md#placeholders)
   1. [Expressions](syntax.md#expressions)
   1. [Markup Elements](syntax.md#markup-elements)
1. [Tokens](syntax.md#tokens)
   1. [Text](syntax.md#text)
   1. [Names](syntax.md#names)
   1. [Quoted Strings](syntax.md#quoted-strings)
   1. [Escape Sequences](syntax.md#escape-sequences)
   1. [Whitespace](syntax.md#whitespace)
1. [Complete EBNF](syntax.md#complete-ebnf)
1. [Formatting](formatting.md)

## Introduction

One of the challenges in adapting software to work for users with different languages and cultures is the need for ***dynamic messages***. Whenever a user interface needs to present data as part of a larger string, that data needs to be formatted (and the message may need to be altered) to make it culturally accepted and grammatically correct.

For example, if your US English interface has a message like:
> Your item had 1,023 views on April 3, 2023
You want the translated message to be appropriately formatted into French:
> Votre article a eu 1 023 vues le 3 avril 2023
Or Japanese:
> あなたのアイテムは 2023 年 4 月 3 日に 1,023 回閲覧されました。

This specification defines the data model, syntax, processing, and conformance requirements for the next generation of _dynamic messages_. It is intended for adoption by programming languages and APIs. This will enable the integration of existing internationalization APIs (such as the date and number formats shown above), grammatical matching (such as plurals or genders), as well as user-defined formats and message selectors.

The document is the successor to ICU MessageFormat, henceforth called ICU MessageFormat 1.0.

### Conformance

Everything in this specification is normative except for: sections marked 
as non-normative, all authoring guidelines, diagrams, examples, and notes.

The key words `MAY`, `MUST`, `MUST NOT`, `OPTIONAL`, `RECOMMENDED`, 
`SHOULD`, and `SHOULD NOT` in this document are to be interpreted as 
described in BCP 14 [RFC2119] [RFC8174]. 

### Terminology and Conventions

When a term is defined in this document, it is marked like ***this***. When
a term is referenced in this document it is marked like _this_.
