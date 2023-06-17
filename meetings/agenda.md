# MessageFormat Subcommittee Agenda

This is the agenda document for upcoming calls of the MessageFormat subcommittee. We normally meet bi-weekly 
(every two weeks) on Mondays at 9:30 Pacific (`America/Los_Angeles`). This is currently UTC+7. 

See [here](https://www.timeanddate.com/worldclock/converter.html?iso=20230619T163000&p1=224&p2=248&p3=136&p4=179&p5=33&p6=101&p7=268) for your local time.

Information on joining calls is found in the calendar invite.

## Scribe

This block reserved for scribe rotation.

Recent scribes:
* 2023-06-05 RGN
* 2023-05-22 ECH
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

https://docs.google.com/document/d/1XagOIWNBU3_gJneSvCYzscESyvgs3OJm0DLAuknzWFM/edit#

## NOTE WELL

The next call will be Monday 19 June 2023. 

***This is a regularly scheduled session***

## Homework


## Agenda

To request that the chair add an _issue_ to the agenda, add the label `Agenda+`
To request that the chair add an agenda item, send email to the message-format-wg group email.


### Topic: Agenda Review


### Topic: Info Share
* Presentation this week (Thursday) at the Unicode CLDR thingy.

### Topic: Action Item Review


## Topic: Active PR review

Discussion of active PRs. We will merge or reject them in the call.

The recommendation "discuss" is to ensure there is WG consensus before merging. The recommendation "merge with edits" is to merge once existing comments have been addressed.

Discussion of active PRs. We will merge or reject them in the call.

| PR   | Description | Recommendation |
|------|-------------|----------------|
| #315 | Bidi support | Discuss (see below) |
| #381 | Clarify variable declarations may override previous ones | Merge |
| #387 | Fix dangling mention of `nmtoken` | Merge |
| #388 | Change the "pattern selection" text | Discuss |
| #389 | Make pattern selection example 3 clearer | Discuss |


* The recommendation "discuss" is to ensure there is WG consensus before merging. The recommendation "merge with edits" is to merge once existing comments have been addressed.

## Topic: Bidi support
https://github.com/unicode-org/message-format-wg/pull/315 
Discussion of bidirectional text support and specifically how to handle auto-isolation of placeables.

## Topic: Pattern Selection text
https://github.com/unicode-org/message-format-wg/pull/388
The above PR changes the wording related to patterns selection to use a different approach. This is based on a comment Addison made on PR#385.

## Topic: Make pattern selection example 3 clearer
https://github.com/unicode-org/message-format-wg/pull/389
Editorial changes to make this example easier to understand. (Taken from comments on PR #385)

## Topic: Open Issue Review

* https://github.com/unicode-org/message-format-wg/issues

Currently we have 90 open.

Here is the "Top 10 List":

| Issue | Status | Description | Chair's Recommendation |
|-------|--------|-------------|----------------|
| (#259)[https://github.com/unicode-org/message-format-wg/issues/259] | resolve-candidate | Don't allow whitespace everywhere | close |
| (#248)[https://github.com/unicode-org/message-format-wg/issues/248] | resolve-candidate | Naming things | close |
| (#378)[https://github.com/unicode-org/message-format-wg/issues/378] | blocker-candidate | reserve sigils for private use | proceed to PR |
| (#356)[https://github.com/unicode-org/message-format-wg/issues/356] | blocker-candidate | clarify that standalone markup is permitted | resolve-candidate | close? addressed by ABNF changes |
| (#351)[https://github.com/unicode-org/message-format-wg/issues/351] | resolve-candidate | replace first-match with best-match | close (accepted) |
| (#346)[https://github.com/unicode-org/message-format-wg/issues/346] | resolve-candidate | consider escaping by doubling special | close (stale) |
| (#299)[https://github.com/unicode-org/message-format-wg/issues/299] | blocker-candidate | when do we evaluate the local variables? | discuss (related to other discussions) |
| (#298)[https://github.com/unicode-org/message-format-wg/issues/298] | blocker-candidate | should custom functions override standard ones? | discuss |
| (#292)[https://github.com/unicode-org/message-format-wg/issues/292] | resolve-candidate | resolving type when chaining local variables | close (MF doesn't have types or interpret values) |
| (#272)[https://github.com/unicode-org/message-format-wg/issues/272] | blocker-candidate | decide on formatting to something other than text | discuss (important!) |


## Topic: AOB?

