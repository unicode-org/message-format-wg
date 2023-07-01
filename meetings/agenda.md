# MessageFormat Subcommittee Agenda

This is the agenda document for upcoming calls of the MessageFormat subcommittee. We normally meet bi-weekly 
(every two weeks) on Mondays at 9:30 Pacific (`America/Los_Angeles`). This is currently UTC+7. 

See [here](https://www.timeanddate.com/worldclock/converter.html?iso=20230703T163000&p1=224&p2=248&p3=136&p4=179&p5=33&p6=101&p7=268) for your local time.

Information on joining calls is found in the calendar invite.

## Scribe

This block reserved for scribe rotation.

Recent scribes:
* 2023-06-19 TIM
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

https://docs.google.com/document/d/1gJ92S0roqvXYmv7mmKb2ICQsZ5Z5XSn6WLgGFNcq6S0/edit

## NOTE WELL

The next call will be Monday 3 July 2023. 

***This is a regularly scheduled session***

## Homework

**_Review all `resolve-candidate` issues for closure BEFORE 2023-06-23_**

## Agenda

To request that the chair add an _issue_ to the agenda, add the label `Agenda+`
To request that the chair add an agenda item, send email to the message-format-wg group email.


### Topic: Agenda Review


### Topic: Info Share
* Presentation at CLDR event
* https://thenewstack.io/whats-next-for-javascript-new-features-to-look-forward-to/ 

### Topic: Action Item Review

[ ] STA: file known issues against function registry

## Topic: Active PR review

Discussion of active PRs. We will merge or reject them in the call.

The recommendation "discuss" is to ensure there is WG consensus before merging. The recommendation "merge with edits" is to merge once existing comments have been addressed.

Discussion of active PRs. We will merge or reject them in the call.

| PR   | Description | Recommendation |
|------|-------------|----------------|
| #404 | Reserve `^` and `&` for private use | Merge |
| #402 | Require variable names to be globally unique | Discuss |
| #401 | docs: markup feature history | Merge |
| #400 | docs: add _roundtrip_ to glossary | Merge |
| #399 | Add negative start rule | Discuss (item below) |
| #398 | Change the syntax of the \\open /close | Discuss (item below) |
| #397 | Change the syntax of the ::open :/close | Discuss (item below) |
| #396 | Add missing formatting sections | Merge with edits |
| #393 | Add interchange data model description + JSON schema definition | Discuss |


* The recommendation "discuss" is to ensure there is WG consensus before merging. The recommendation "merge with edits" is to merge once existing comments have been addressed.

## Topic: Open Issue Review

* https://github.com/unicode-org/message-format-wg/issues

Currently we have 73 open.

| Issue | Status | Description | Chair's Recommendation |
|-------|--------|-------------|----------------|
| (#378)[https://github.com/unicode-org/message-format-wg/issues/378] | blocker-candidate | reserve sigils for private use | proceed to PR |
| (#299)[https://github.com/unicode-org/message-format-wg/issues/299] | blocker-candidate | when do we evaluate the local variables? | discuss (related to other discussions) |
| (#298)[https://github.com/unicode-org/message-format-wg/issues/298] | blocker-candidate | should custom functions override standard ones? | discuss |
| (#272)[https://github.com/unicode-org/message-format-wg/issues/272] | blocker-candidate | decide on formatting to something other than text | discuss (important!) |

## Topic: Open/Close functions

We have multiple proposals for open/close function markup, including the current scheme (`+function`/`-function`). Let's resolve how to support open/close functionality.

| PR   | Description |
|------|-------------|
| #398 | Use `\\open` and `/close` |
| #397 | Use `::open` and `:/close` |
| #399 | Keep `+` and `-`, allow negative literals |

## Topic: Discussion of `Nmtoken` and naming

See thread in #399

## Topic: Discussion of default registry requirements

An open question is whether MFv2 will provide a **_default_** registry of functions/selectors that implementations are **_required_** to implement.
If such a registry were created, what _should_ go in it (what are the inclusion criteria)?
If we do not create a default registry, how will we prevent divergence of the syntax between implementations?

## Topic: AOB?

