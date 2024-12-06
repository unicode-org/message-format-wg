# MessageFormat Working Group

Welcome to the home page for the MessageFormat Working Group, a subgroup of the [Unicode CLDR-TC](https://cldr.unicode.org).

## Charter

The MessageFormat Working Group (MFWG) is tasked with developing an industry standard
for the representation of localizable message strings to be a successor to 
[ICU MessageFormat](https://unicode-org.github.io/icu/userguide/format_parse/messages/). 
MFWG will recommend how to remove redundancies, 
make the syntax more usable, 
and support more complex features, such as gender, inflections, and speech. 
MFWG will also consider the integration of the new standard with programming environments, 
including, but not limited to, ICU, DOM, and ECMAScript, and with localization platform interchange. 
The output of MFWG will be a specification for the new syntax.

- [Why ICU MessageFormat Needs a Successor](docs/why_mf_next.md)
- [Goals and Non-Goals](docs/goals.md)

## MessageFormat 2 Final Candidate

The [MessageFormat 2 specification](./spec/) is a new part of
the [LDML](https://www.unicode.org/reports/tr35/) specification.
MessageFormat 2 has been approved by the CLDR Technical Committee 
to be issued as a "Final Candidate".
This means that the stability policy is not in effect and feedback from
users and implementers might result in changes to the syntax, data model,
functions, or other normative aspects of MessageFormat 2.
Such changes are expected to be minor and, to the extent possible,
to be compatible with what is defined in the Final Candidate specification.

The MessageFormat Working Group and CLDR Technical Committee welcome any and all feedback, 
including bugs reports, 
implementation reports, 
success stories, 
feature requests, 
requests for clarification, 
or anything that would be helpful in stabilizing the specification and
promoting widespread adoption.

The MFWG specifically requests feedback on the following issues:
- How to perform non-integer exact number selection [#675](https://github.com/unicode-org/message-format-wg/issues/675)
- Whether omitting the `*` variant key should be permitted [#603](https://github.com/unicode-org/message-format-wg/issues/603)
- Whether there should be normative requirements for markup handling [#586](https://github.com/unicode-org/message-format-wg/issues/586)
- Whether the delimiters used for literals and patterns were chosen correctly [#602](https://github.com/unicode-org/message-format-wg/issues/602)

## Normative Changes during the Final Candidate period

The MessageFormat Working Group continues to address feedback
and develop portions of the specification not completed for the LDML 46.1 Final Candidate release.
The `main` branch of this repository contains changes implemented since the specification was released.

Implementers should be aware of the following normative changes during the v46.1 final candidate review period.
See the [commit history](https://github.com/unicode-org/message-format-wg/commits) 
after 2024-11-20 for a list of all commits (including non-normative changes).

In addition to the above, the test suite has been modified and updated.

## Sharing Feedback

Final Candidate Feedback: [file an issue here](https://github.com/unicode-org/message-format-wg/issues/new?labels=Preview-Feedback&projects=&template=tech-preview-feedback.md&title=%5BFEEDBACK%5D+)

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
