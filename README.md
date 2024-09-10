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
The Tech Preview specification is [here](https://www.unicode.org/reports/tr35/tr35-72/tr35-messageFormat.html)

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

See more examples and the formal definition of the grammar in [spec/syntax.md](./spec/syntax.md).

## Normative Changes during Tech Preview

The Working Group continues to address feedback
and develop portions of the specification not completed for the LDML45 Tech Preview release.
The `main` branch of this repository contains changes implemented since the technical preview.

Implementers should be aware of the following normative changes during the tech preview period.
See the [commit history](https://github.com/unicode-org/message-format-wg/commits) 
after 2024-04-13 for a list of all commits (including non-normative changes).
- [#771](https://github.com/unicode-org/message-format-wg/issues/771) Remove inappropriate normative statement from errors.md
- [#767](https://github.com/unicode-org/message-format-wg/issues/767) Add a test schema and
  [#778](https://github.com/unicode-org/message-format-wg/issues/778) validate tests against it
- [#775](https://github.com/unicode-org/message-format-wg/issues/775) Add a definition for `variable`
- [#774](https://github.com/unicode-org/message-format-wg/issues/774) Refactor error types, adding a _Message Function Error_ type (and subtypes)
- [#769](https://github.com/unicode-org/message-format-wg/issues/769) Add `:test:function`,
  `:test:select` and `:test:format` functions for implementation testing
- [#743](https://github.com/unicode-org/message-format-wg/issues/743) Collapse all escape sequence rules into one (affects the ABNF)
- _more to be added as they are merged_

## Implementations

- Java: [`com.ibm.icu.message2`](https://unicode-org.github.io/icu-docs/apidoc/dev/icu4j/index.html?com/ibm/icu/message2/package-summary.html), part of ICU 75, is a _tech preview_ implementation of the MessageFormat 2 syntax, together with a formatting API. See the [ICU User Guide](https://unicode-org.github.io/icu/userguide/format_parse/messages/mf2.html) for examples and a quickstart guide.
- C/C++: [`icu::message2::MessageFormatter`](https://unicode-org.github.io/icu-docs/apidoc/released/icu4c/classicu_1_1message2_1_1MessageFormatter.html), part of ICU 75, is a _tech preview_ implementation of MessageFormat 2.
- JavaScript: [`messageformat`](https://github.com/messageformat/messageformat/tree/master/packages/mf2-messageformat) 4.0 implements the MessageFormat 2 syntax, together with a polyfill of the runtime API proposed for ECMA-402.

The working group is also aware of these implementations in progress or released, but has not evaluated them:
- [i18next](https://www.npmjs.com/package/i18next-mf2) i18nFormat plugin to use mf2 format with i18next, version 0.1.1

> [!NOTE]
> Tell us about your MessageFormat 2 implementation!
> Submit a [PR on this page](https://github.com/unicode-org/message-format-wg/edit/main/README.md), file an issue, or send email to have your implementation appear here.

## Sharing Feedback

Technical Preview Feedback: [file an issue here](https://github.com/unicode-org/message-format-wg/issues/new?labels=Preview-Feedback&projects=&template=tech-preview-feedback.md&title=%5BFEEDBACK%5D+)

We invite feedback about the current syntax draft, as well as the real-life use-cases, requirements, tooling, runtime APIs, localization workflows, and other topics.

- General questions and thoughts → [post a discussion thread](https://github.com/unicode-org/message-format-wg/discussions).
- Actionable feedback (bugs, feature requests) → [file a new issue](https://github.com/unicode-org/message-format-wg/issues).

## Participation / Joining the Working Group

We are looking for participation from software developers, localization engineers and others with experience
in Internationalization (I18N) and Localization (L10N). 
If you wish to contribute to this work, please review the information about the Contributor License Agreement below. 

To follow this work:
1. Apply to join our [mailing list](https://groups.google.com/a/chromium.org/forum/#!forum/message-format-wg)
2. Watch this repository (use the "Watch" button in the upper right corner)

To contribute to this work, in addition to the above:
1. Each individual MUST have a copy of the CLA on file. See below.
2. Individuals who are employees of Unicode Member organizations SHOULD contact their member representative.
   Individuals who are not employees of Unicode Member organizations MUST contact the chair to request Invited Expert status.
   Employees of Unicode Member organizations MAY also apply for Invited Expert status,
   subject to approval from their member representative.

### Copyright & Licenses

Copyright © 2019-2024 Unicode, Inc. Unicode and the Unicode Logo are registered trademarks of Unicode, Inc. in the United States and other countries.

A CLA is required to contribute to this project - please refer to the [CONTRIBUTING.md](./CONTRIBUTING.md) file (or start a Pull Request) for more information.

The contents of this repository are governed by the Unicode [Terms of Use](https://www.unicode.org/copyright.html) and are released under [LICENSE](./LICENSE).
