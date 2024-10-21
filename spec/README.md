# MessageFormat 2.0 Specification

## Table of Contents

1. [Introduction](#introduction)
   1. [Conformance](#conformance)
   1. [Terminology and Conventions](#terminology-and-conventions)
   1. [Stability Policy](#stability-policy)
1. [Syntax](syntax.md)
   1. [Productions](syntax.md#productions)
   1. [Tokens](syntax.md#tokens)
   1. [`message.abnf`](message.abnf)
1. [Errors](errors.md)
   1. [Error Handling](errors.md#error-handling)
   1. [Syntax Errors](errors.md#syntax-errors)
   1. [Data Model Errors](errors.md#data-model-errors)
   1. [Resolution Errors](errors.md#resolution-errors)
   1. [Message Function Errors](errors.md#message-function-errors)
1. [Default Function Registry](registry.md)
1. [`u:` Namespace](u-namespace.md)
1. [Formatting](formatting.md)
1. [Interchange data model](data-model/README.md)

## Introduction

One of the challenges in adapting software to work for
users with different languages and cultures is the need for **_<dfn>dynamic messages</dfn>_**.
Whenever a user interface needs to present data as part of a larger string,
that data needs to be formatted (and the message may need to be altered)
to make it culturally accepted and grammatically correct.

> For example, if your US English (`en-US`) interface has a message like:
>
> > Your item had 1,023 views on April 3, 2023
>
> You want the translated message to be appropriately formatted into French:
>
> > Votre article a eu 1 023 vues le 3 avril 2023
>
> Or Japanese:
>
> > あなたのアイテムは 2023 年 4 月 3 日に 1,023 回閲覧されました。

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

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL
NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED",
"MAY", and "OPTIONAL" in this document are to be interpreted as
described in BCP 14 \[[RFC2119](https://www.rfc-editor.org/rfc/rfc2119)\]
\[[RFC8174](https://www.rfc-editor.org/rfc/rfc8174)\] when, and only when, they
appear in all capitals, as shown here.

### Terminology and Conventions

A **_term_** looks like this when it is defined in this specification.

A reference to a _term_ looks like this.

> Examples are non-normative and styled like this.

### Stability Policy

> [!IMPORTANT]
> The provisions of the stability policy are not in effect until
> the conclusion of the technical preview and adoption of this specification.

Updates to this specification will not make any valid _message_ invalid.

Updates to this specification will not remove any syntax provided in this version.

Updates to this specification MUST NOT specify an error for any message
that previously did not specify an error.

Updates to this specification MUST NOT specify the use of a fallback value for any message
that previously did not specify a fallback value.

Updates to this specification will not change the syntactical meaning
of any syntax defined in this specification.

Updates to this specification will not remove any functions defined in the default registry.

Updates to this specification will not remove any options or option values
defined in the default registry.

> [!NOTE]
> The foregoing policies are _not_ a guarantee that the results of formatting will never change.
> Even when this specification or its implementation do not change,
> the functions for date formatting, number formatting and so on
> can change their results over time or behave differently due to local runtime
> differences in implementation or changes to locale data
> (such as due to the release of new CLDR versions).

Updates to this specification will only reserve, define, or require
function names or function option names
consisting of characters in the ranges a-z, A-Z, and 0-9.
All other names in these categories are reserved for the use of implementations or users.

> [!NOTE]
> Users defining custom names SHOULD include at least one character outside these ranges
> to ensure that they will be compatible with future versions of this specification.
> They SHOULD also use the namespace feature to avoid collisions with other implementations.

Future versions of this specification will not introduce changes
to the data model that would result in a data model representation
based on this version being invalid.

> For example, existing interfaces or fields will not be removed.

> [!IMPORTANT]
> This stability policy allows any of the following, non-exhaustive list, of changes
> in future versions of this specification:
> - Future versions may define new syntax and structures
>   that would not be supported by this version of the specification.
> - Future versions may add additional structure or meaning to existing syntax.
> - Future versions may define new keywords.
> - Future versions may make previously invalid messages valid.
> - Future versions may define additional functions in the default registry
>   or may reserve the names of functions for the purposes of interoperability.
> - Future versions may define additional options to existing functions.
> - Future versions may define additional option values for existing options.
> - Future versions may deprecate (but not remove) keywords, functions, options, or option values.
> - Future versions of this specification may introduce changes
>   to the data model that would result in future data model representations
>   not being valid for implementations of this version of the data model.
>   - For example, a future version could introduce a new keyword,
>     whose data model representation would be a new interface
>     that is not recognized by this version's data model.

