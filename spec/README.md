# MessageFormat 2.0 Specification

## Table of Contents

1. [Introduction](#introduction)
   1. [Conformance](#conformance)
   1. [Terminology and Conventions](#terminology-and-conventions)
1. [Syntax](syntax.md)
   1. [Productions](syntax.md#productions)
   1. [Tokens](syntax.md#tokens)
   1. [`message.abnf`](message.abnf)
1. [Registry](registry.md)
   1. [`registry.dtd`](registry.dtd)
1. [Formatting](formatting.md)

## Introduction

One of the challenges in adapting software to work for
users with different languages and cultures is the need for **_dynamic messages_**.
Whenever a user interface needs to present data as part of a larger string,
that data needs to be formatted (and the message may need to be altered)
to make it culturally accepted and grammatically correct.

For example, if your US English interface has a message like:

> Your item had 1,023 views on April 3, 2023

You want the translated message to be appropriately formatted into French:

> Votre article a eu 1 023 vues le 3 avril 2023

Or Japanese:

> あなたのアイテムは 2023 年 4 月 3 日に 1,023 回閲覧されました。

This specification defines the
data model, syntax, processing, and conformance requirements
for the next generation of _dynamic messages_.
It is intended for adoption by programming languages and APIs.
This will enable the integration of
existing internationalization APIs (such as the date and number formats shown above),
grammatical matching (such as plurals or genders),
as well as user-defined formats and message selectors.

The document is the successor to ICU MessageFormat,
henceforth called ICU MessageFormat 1.0.

### Conformance

Everything in this specification is normative except for:
sections marked as non-normative,
all authoring guidelines, diagrams, examples, and notes.

The key words MAY, MUST, MUST NOT, OPTIONAL, RECOMMENDED,
SHOULD, and SHOULD NOT in this document are to be interpreted as
described in BCP 14 [RFC2119] [RFC8174].

### Terminology and Conventions

When a term is defined in this document, it is marked like **_this_**.
When a term is referenced in this document it is marked like _this_.
