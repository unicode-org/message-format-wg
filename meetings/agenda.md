# MessageFormat Subcommittee Agenda

This is the agenda document for upcoming calls of the MessageFormat subcommittee. We normally meet bi-weekly 
(every two weeks) on Mondays at 9:30 Pacific (`America/Los_Angeles`). This is currently UTC+8. This will become UTC+7 before our next call (slated for 2023-02-13). Since the USA switches to Daylight/Summer time before most other countries, this may affect the wall time of this call for you.

See [here](https://www.timeanddate.com/worldclock/converter.html?iso=20230123T173000&p1=224&p2=248&p3=136&p4=179&p5=33&p6=101&p7=268) for your local time.

Information on joining calls is found in the calendar invite.

## Scribe

This block reserved for scribe rotation.

Recent scribes:
* 2023-02-13 MOC, SLC, ECH
* 2023-02-06 RGN, ECH
* 2023-01-23 STA, ECH

## Notes Document for The Upcoming Call

https://docs.google.com/document/d/1WN2xLV9hp0n_49ApAJgjGpe9B_UiV-Mvo6QBk4TtGsI/edit

## NOTE WELL

The next call will be 27 Feburary 2023

## Agenda

To request that the chair add an _issue_ to the agenda, add the label `Agenda+`
To request that the chair add an agenda item, send email to the message-format-wg group email.

#### Agenda for 2023-02-27

* [2023-02-13 Notes](https://docs.google.com/document/d/1cJ76HjvBkImqSdPpmkbW133AnO3sFu29TUDrP3nxbrI/edit#)
* [2023-02-13 Official Notes](2023/notes-2023-02-13.md)

**Topic:** Agenda Review

**Topic:** Info Share

**Topic:** Action Item Review

**Topic:** Function Registry (continued)
* Requested by: STA

Discussion of the function registry. Two of the three models had sections on this.

---

**Über-topic**: ABNF

_We need to decide if the ABNF changes are ready to commit. As suspected, writing the ABNF exposed a host of other issues for discussion. But let's start with deciding to commit this ABNF (or request more edits) and then proceed to discuss issues that might modify it._

* https://github.com/unicode-org/message-format-wg/pull/347


**Topic:** First-match vs. best-match
* Requested by: APP
* https://github.com/unicode-org/message-format-wg/issues/351

**Topic:** whitespace in the EBNF
* Requested by: APP, STA

_This topic appears to be done, but let's make sure we agree on the whitespace handling._

* https://github.com/unicode-org/message-format-wg/issues/340

**Topic:** Delimiter for literals
* Requested by: STA
* https://github.com/unicode-org/message-format-wg/issues/263

_@stasm reopened this as part of our ABNF work. We need to close on whether to keep `(` and `)` for literals or switch to `|`_

**Topic:** Markup
* Requested by: APP, MIH
* https://github.com/unicode-org/message-format-wg/issues/356

_@mihnita has called out that our decisions about markup might be premature. Meanwhile, based solely on consistency and the ABNF work, @aphillips has a PR adding a markup error. Let's discuss markup._

@mihnita notes:

> Markup open issues:
> * https://github.com/unicode-org/message-format-wg/issues/241
> * https://github.com/unicode-org/message-format-wg/issues/262
> * https://github.com/unicode-org/message-format-wg/issues/238
>
> And to show that it was not agreed on, see PR https://github.com/unicode-org/message-format-wg/pull/283 in Jun 21, 2022:
>> I will approve it to move things forward and not have these many open PRs.
>>  It does not mean I agree with this syntax, so it should not be hold against me 1 month from now ("but you approved X")
>>  There are still at least 2 open issues arguing about how to best handle "markup elements"

---

## Proposed for Future (or if time permits)

**Topic:** Bidi
* Requested by: EAO

Discussion of bidirectional text handling. See:
* https://github.com/unicode-org/message-format-wg/pull/315

**Topic:** (Discussion) Guidance needed for dealing with selector explosions
* Requested by: STA
* https://github.com/unicode-org/message-format-wg/discussions/323
