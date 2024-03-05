# MessageFormat Working Group

Welcome to the home page for the MessageFormat Working Group, a subgroup of the [Unicode CLDR-TC](https://cldr.unicode.org).

## Charter

The Message Format Working Group (MFWG) is tasked with developing an industry standard for the representation of localizable message strings to be a successor to [ICU MessageFormat](https://unicode-org.github.io/icu/userguide/format_parse/messages/). MFWG will recommend how to remove redundancies, make the syntax more usable, and support more complex features, such as gender, inflections, and speech. MFWG will also consider the integration of the new standard with programming environments, including, but not limited to, ICU, DOM, and ECMAScript, and with localization platform interchange. The output of MFWG will be a specification for the new syntax.

- [Why ICU MessageFormat Needs a Successor](docs/why_mf_next.md)
- [Goals and Non-Goals](docs/goals.md)

## MessageFormat 2 Technical Preview

The MessageFormat 2 specification is a new part of
the [LDML](https://www.unicode.org/reports/tr35/) specification.
This specification is initially released as a "Tech Preview", 
which means that the stability policy is not in effect and feedback from
users and implementers might result in changes to the syntax, data model,
functions, or other normative aspects of MessageFormat 2.
Such changes are expected to be minor and, to the extent possible,
to be compatible with what is defined in the Tech Preview.

The MFWG welcomes any and all feedback, including bugs reports, implementation
reports, success stories, feature requests, requests for clarification, 
or anything that would be helpful in stabilizing the specification and
promoting widespread adoption.

The MFWG specifically requests feedback on the following issues:
- How best to define value resolution [#678](https://github.com/unicode-org/message-format-wg/issues/678)
- How to perform non-integer exact number selection [#675](https://github.com/unicode-org/message-format-wg/issues/675)
- Whether `markup` should support additional spaces [#650](https://github.com/unicode-org/message-format-wg/issues/650)
- Whether "attribute-like" behavior is needed and what form it should take [#642](https://github.com/unicode-org/message-format-wg/issues/642)
- Whether to relax constraints on complex message start [#610](https://github.com/unicode-org/message-format-wg/issues/610)
- Whether omitting the `*` variant key should be permitted [#603](https://github.com/unicode-org/message-format-wg/issues/603)

## What is MessageFormat 2?

Software needs to construct messages that incorporate various pieces of information. 
The complexities of the world's languages make this challenging.
MessageFormat 2 defines the data model, syntax, processing, and conformance requirements 
for the next generation of dynamic messages. 
It is intended for adoption by programming languages, software libraries, and software localization tooling.
It enables the integration of internationalization APIs (such as date or number formats),
and grammatical matching (such as plurals or genders). 
It is extensible, allowing software developers to create formatting
or message selection logic that add on to the core capabilities.
Its data model provides a means of representing existing syntaxes,
thus enabling gradual adoption by users of older formatting systems.

The goal is to allow developers and translators to create natural-sounding, grammatically-correct,
user interfaces that can appear in any language and support the needs of diverse cultures.

## MessageFormat 2 Specification and Syntax

The current specification starts [here](spec/README.md) and may have changed since the publication
of the Tech Preview version.
The Tech Preview specification is [here](tr35-messageformat.md) (link to follow).

The current draft syntax for defining messages can be found in [spec/syntax.md](./spec/syntax.md).
The syntax is formally described in [ABNF](spec/message.abnf).

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

    .match {$count :integer}
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

See more examples and the formal definition of the grammar in [spec/syntax.md](./spec/syntax.md).

## Normative Changes during Tech Preview

The Working Group continues to address feedback
and develop portions of the specification not completed for the LDML45 Tech Preview release.
The `main` branch of this repository contains changes implemented since the technical preview.

Implementers should be aware of the following normative changes during the tech preview period:
- Support for UAX31 bidi whitespace conformance \[[#673](https://github.com/unicode-org/message-format-wg/pulls/673)\] _Example only_

## Implementations

(The working group expects that ICU75 will include both Java and C/C++ implementations of the tech preview specification)

- Java: [`com.ibm.icu.message2`](https://unicode-org.github.io/icu-docs/apidoc/dev/icu4j/index.html?com/ibm/icu/message2/package-summary.html), part of ICU 72 released in October 2022, is a _tech preview_ implementation of the MessageFormat 2 syntax, together with a formatting API. See the [ICU User Guide](https://unicode-org.github.io/icu/userguide/format_parse/messages/mf2.html) for examples and a quickstart guide.
- JavaScript: [`messageformat`](https://github.com/messageformat/messageformat/tree/master/packages/mf2-messageformat) 4.0 implements the MessageFormat 2 syntax, together with a polyfill of the runtime API proposed for ECMA-402.

## Sharing Feedback

Technical Preview Feedback: [file an issue here](https://github.com/unicode-org/message-format-wg/issues/new?labels=Preview-Feedback&projects=&template=tech-preview-feedback.md&title=%5BFEEDBACK%5D+)

We invite feedback about the current syntax draft, as well as the real-life use-cases, requirements, tooling, runtime APIs, localization workflows, and other topics.

- General questions and thoughts → [post a discussion thread](https://github.com/unicode-org/message-format-wg/discussions).
- Actionable feedback (bugs, feature requests) → [file a new issue](https://github.com/unicode-org/message-format-wg/issues).

## Participation

To join in:

1. Review [CONTRIBUTING.md](./CONTRIBUTING.md)
2. Apply to join our [mailing list](https://groups.google.com/a/chromium.org/forum/#!forum/message-format-wg)
3. Watch this repository (use the "Watch" button in the upper right corner)

### Copyright & Licenses

Copyright © 2019-2024 Unicode, Inc. Unicode and the Unicode Logo are registered trademarks of Unicode, Inc. in the United States and other countries.

The project is released under [LICENSE](./LICENSE).

A CLA is required to contribute to this project - please refer to the [CONTRIBUTING.md](./CONTRIBUTING.md) file (or start a Pull Request) for more information.
