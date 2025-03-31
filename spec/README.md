# The Unicode MessageFormat Standard Specification

> [!IMPORTANT]
> This page is not a part of the specification and is not normative.

## What is Unicode MessageFormat?

Software needs to construct messages that incorporate various pieces of information.
The complexities of the world's languages make this challenging.
_Unicode MessageFormat_ defines the data model, syntax, processing, and conformance requirements
for the next generation of dynamic messages.
It is intended for adoption by programming languages, software libraries, and software localization tooling.
It enables the integration of internationalization APIs (such as date or number formats),
and grammatical matching (such as plurals or genders).
It is extensible, allowing software developers to create formatting
or message selection logic that add on to the core capabilities.
Its data model provides a means of representing existing syntaxes,
thus enabling gradual adoption by users of older formatting systems.

During its development, _Unicode MessageFormat_ was known as "MessageFormat 2.0",
since the specification was intended to replace earlier message formatting capabilities
developed in the [ICU](https://icu.unicode.org) project.

The goal is to allow developers and translators to create natural-sounding, grammatically-correct,
user interfaces that can appear in any language and support the needs of diverse cultures.

## Status of the documents in this repo

The editor's copy of the specification is found in this directory of this repo and starts [here](intro.md).
The editor's copy may have changed since the publication of the most recent LDML version.

The Final Candidate specification is in [LDML 46.1](https://www.unicode.org/reports/tr35/tr35-73/tr35-messageFormat.html)
which is identical to the materials in the LDML 46.1 release in this repo.

## About

Messages can be simple strings:

    Hello, world!

Messages can interpolate arguments:

    Hello {$user}!

Messages can transform those arguments using _formatting functions_.
Functions can optionally take _options_:

    Today is {$date :datetime}
    Today is {$date :datetime weekday=long}.

Messages can use a _selector_ to choose between different _variants_,
which correspond to the grammatical (or other) requirements of the language:

    .input {$count :integer}
    .match $count
    0   {{You have no notifications.}}
    one {{You have {$count} notification.}}
    *   {{You have {$count} notifications.}}

Messages can annotate arguments with formatting instructions
or assign local values for use in the formatted message:

    .input {$date :datetime weekday=long month=medium day=short}
    .local $numPigs = {$pigs :integer}
    {{On {$date} you had this many pigs: {$numPigs}}}

The message syntax supports using multiple _selectors_ and other features
to build complex messages.
It is designed so that implementations can extend the set of functions or their options
using the same syntax.
Implementations may even support users creating their own functions.

See more examples and the formal definition of the grammar in [spec/syntax.md](./syntax.md).

## Developer Documentation

Unofficial documentation for developers on MessageFormat 2 syntax and on using it with
various programming languages can be found at [messageformat.dev](https://messageformat.dev/),
which also includes an interactive [playground](https://messageformat.dev/playground/)
for experimenting with message syntax.

## Implementations

- Java: [`com.ibm.icu.message2`](https://unicode-org.github.io/icu-docs/apidoc/dev/icu4j/index.html?com/ibm/icu/message2/package-summary.html), part of ICU 76, is a _tech preview_ implementation of the MessageFormat 2 syntax, together with a formatting API. See the [ICU User Guide](https://unicode-org.github.io/icu/userguide/format_parse/messages/mf2.html) for examples and a quickstart guide.
- C/C++: [`icu::message2::MessageFormatter`](https://unicode-org.github.io/icu-docs/apidoc/released/icu4c/classicu_1_1message2_1_1MessageFormatter.html), part of ICU 76, is a _tech preview_ implementation of MessageFormat 2.
- JavaScript: [`messageformat`](https://github.com/messageformat/messageformat/tree/main/mf2/messageformat) 4.0 implements the MessageFormat 2 syntax, together with a polyfill of the runtime API proposed for ECMA-402.

The working group is also aware of these implementations in progress or released, but has not evaluated them:
- [i18next](https://www.npmjs.com/package/i18next-mf2) i18nFormat plugin to use mf2 format with i18next, version 0.1.1

> [!NOTE]
> Tell us about your MessageFormat 2 implementation!
> Submit a [PR on this page](https://github.com/unicode-org/message-format-wg/edit/main/spec/README.md), file an issue, or send email to have your implementation appear here.
