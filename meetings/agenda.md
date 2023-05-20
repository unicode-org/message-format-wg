# MessageFormat Subcommittee Agenda

This is the agenda document for upcoming calls of the MessageFormat subcommittee. We normally meet bi-weekly 
(every two weeks) on Mondays at 9:30 Pacific (`America/Los_Angeles`). This is currently UTC+7. 

See [here](https://www.timeanddate.com/worldclock/converter.html?iso=20230522T173000&p1=224&p2=248&p3=136&p4=179&p5=33&p6=101&p7=268) for your local time.

Information on joining calls is found in the calendar invite.

## Scribe

This block reserved for scribe rotation.

Recent scribes:
* 2023-05-08 MIH
* 2023-04-24 SCL
* 2023-04-10 TIM
* 2023-03-31 ECH, APP
* 2023-03-27 STA
* 2023-03-13 ECH
* 2023-03-06 SCL
* 2023-02-27 MIH
* 2023-02-13 MOC, SLC, ECH
* 2023-02-06 RGN, ECH
* 2023-01-23 STA, ECH

## Notes Document for The Upcoming Call

https://docs.google.com/document/d/178DGq3ZwgcH7sfJsxF7i3N1V1P0NKQ6XHPaSAPvmoTc/edit#

## NOTE WELL

The next call will be 22 May 2023. 

***This is a regularly scheduled session***

## Homework

Read the PR for function registry for the next meetings in April:

* https://github.com/unicode-org/message-format-wg/pull/368 

## Agenda

To request that the chair add an _issue_ to the agenda, add the label `Agenda+`
To request that the chair add an agenda item, send email to the message-format-wg group email.

***Date: 2023-05-22***

### Topic: Agenda Review

### Topic: Info Share

### Topic: Action Item Review

### Topic: Function Registry (continued)
* Requested by: STA

Discussion of the function registry. Two of the three models had sections on this.

### Topic: Active PR review
* Requested by: EAO

Discussion of active PRs. We will merge or reject them in the call.

| PR   | Description | Recommendation |
|------|-------------|----------------|
| #197 | Consensus 7 | Discuss (see below) |
| #278 | Add examples in other resource languages | Abandon |
| #315 | Bidi support | Discuss (see below) |
| #318 | Format to Parts | Reject (see below) |
| #357 | Unknown Markup error | Reject (obsolete) |
| #364 | Unquoted plain expression arguments | Merge with edits |
| #368 | Draft of registry | Discuss |
| #372 | Column-first | Merge |
| #381 | Variable overrides | Merge with edits |
| #382 | Literal Resolution | Discuss |

* PR #197 is about an old WG consensus. Let's double-check that consensus quickly and merge in the call.
* PR #315 about bidi needs another round of edits and should be discussed in a future call. 
* PR #318 about formatToParts is not written in a way that fits into the spec. A version that is "spec ready" should be produced instead.
* The recommendation "discuss" is to ensure there is WG consensus before merging. The recommendation "merge with edits" is to merge once existing comments have been addressed.

### Topic: AOB?

---

## Proposed for Future (or if time permits)


### Topic: (Discussion) Guidance needed for dealing with selector explosions
* Requested by: STA
* https://github.com/unicode-org/message-format-wg/discussions/323

### Topic: Bidi
* Requested by: EAO

Discussion of bidirectional text handling. See:
* https://github.com/unicode-org/message-format-wg/pull/315

### Topic: Defining MF1 compatibility
* Requested by: EAO

_Eemeli requested this in our previous call (2023-03-06) and we have discussed this in various issues._
