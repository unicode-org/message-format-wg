# MessageFormat Working Group

Welcome to the home page for the MessageFormat Working Group, a subgroup of the [Unicode CLDR-TC](https://cldr.unicode.org).

## Charter

The Message Format Working Group (MFWG) is tasked with developing an industry standard for the representation of localizable message strings to be a successor to [ICU MessageFormat](https://unicode-org.github.io/icu/userguide/format_parse/messages/). MFWG will recommend how to remove redundancies, make the syntax more usable, and support more complex features, such as gender, inflections, and speech. MFWG will also consider the integration of the new standard with programming environments, including, but not limited to, ICU, DOM, and ECMAScript, and with localization platform interchange. The output of MFWG will be a specification for the new syntax.

- [Why ICU MessageFormat Needs a Successor](docs/why_mf_next.md)
- [Goals and Non-Goals](docs/goals.md)
- [Record of Consensus Decisions](docs/consensus_decisions.md)

## MessageFormat 2 Draft Syntax

The current draft syntax for defining messages can be found in [spec/syntax.md](./spec/syntax.md).
The syntax is formally described in [ABNF](spec/message.abnf).

Messages can be simple strings:

    Hello, world!

Messages can interpolate arguments formatted using _formatting functions_:

    Today is {$date :datetime weekday=long}.

Messages can define variants which correspond to the grammatical (or other) requirements of the language:

 {{
    match {$count :number}
    when 1 {{You have one notification.}}
    when * {{You have {$count} notifications.}}
 }}

The message syntax is also capable of expressing more complex translation, for example:

  {{
    local $hostName = {$host :person firstName=long}
    local $guestName = {$guest :person firstName=long}
    local $guestsOther = {$guestCount :number offset=1}

    match {$host :gender} {$guestOther :number}

    when female 0 {{{$hostName} does not give a party.}}
    when female 1 {{{$hostName} invites {$guestName} to her party.}}
    when female 2 {{{$hostName} invites {$guestName} and one other person to her party.}}
    when female * {{{$hostName} invites {$guestName} and {$guestsOther} other people to her party.}}

    when male 0 {{{$hostName} does not give a party.}}
    when male 1 {{{$hostName} invites {$guestName} to his party.}}
    when male 2 {{{$hostName} invites {$guestName} and one other person to his party.}}
    when male * {{{$hostName} invites {$guestName} and {$guestsOther} other people to his party.}}

    when * 0 {{{$hostName} does not give a party.}}
    when * 1 {{{$hostName} invites {$guestName} to their party.}}
    when * 2 {{{$hostName} invites {$guestName} and one other person to their party.}}
    when * * {{{$hostName} invites {$guestName} and {$guestsOther} other people to their party.}}
  }}

See more examples and the formal definition of the grammar in [spec/syntax.md](./spec/syntax.md).

### Implementations

- Java: [`com.ibm.icu.message2`](https://unicode-org.github.io/icu-docs/apidoc/dev/icu4j/index.html?com/ibm/icu/message2/package-summary.html), part of ICU 72 released in October 2022, is a _tech preview_ implementation of the MessageFormat 2 syntax, together with a formatting API. See the [ICU User Guide](https://unicode-org.github.io/icu/userguide/format_parse/messages/mf2.html) for examples and a quickstart guide.
- JavaScript: [`messageformat`](https://github.com/messageformat/messageformat/tree/master/packages/mf2-messageformat) 4.0 implements the MessageFormat 2 syntax, together with a polyfill of the runtime API proposed for ECMA-402.

## Sharing Feedback

We invite feedback about the current syntax draft, as well as the real-life use-cases, requirements, tooling, runtime APIs, localization workflows, and other topics.

- General questions and thoughts → [post a discussion thread](https://github.com/unicode-org/message-format-wg/discussions).
- Actionable feedback (bugs, feature requests) → [file a new issue](https://github.com/unicode-org/message-format-wg/issues).

## Participation

To join in:

1. Review [CONTRIBUTING.md](./CONTRIBUTING.md)
2. Apply to join our [mailing list](https://groups.google.com/a/chromium.org/forum/#!forum/message-format-wg)
3. Watch this repository (use the "Watch" button in the upper right corner)

### Copyright & Licenses

Copyright © 2019-2023 Unicode, Inc. Unicode and the Unicode Logo are registered trademarks of Unicode, Inc. in the United States and other countries.

The project is released under [LICENSE](./LICENSE).

A CLA is required to contribute to this project - please refer to the [CONTRIBUTING.md](./CONTRIBUTING.md) file (or start a Pull Request) for more information.
