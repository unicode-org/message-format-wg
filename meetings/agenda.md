# MessageFormat Subcommittee Agenda

This is the agenda document for upcoming calls of the MessageFormat subcommittee. We normally meet bi-weekly 
(every two weeks) on Mondays at 9:30 Pacific (`America/Los_Angeles`). This is currently UTC+7. 

See [here](https://www.timeanddate.com/worldclock/converter.html?iso=20230724T163000&p1=224&p2=248&p3=136&p4=179&p5=33&p6=101&p7=268) for your local time.

Information on joining calls is found in the calendar invite.

## Scribe

This block reserved for scribe rotation.

Recent scribes:
* 2023-07-10 ECH, CMD
* 2023-07-03 STA
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

https://docs.google.com/document/d/1QPc_qxtqvSl1TwQvFXpt-UiISdGwMezHpx_WgLpGjmg/edit

## NOTE WELL

The next call will be Monday 24 July 2023. 

***This is a regularly scheduled session***

## Homework


## Agenda

To request that the chair add an _issue_ to the agenda, add the label `Agenda+`
To request that the chair add an agenda item, send email to the message-format-wg group email.


### Topic: Agenda Review


### Topic: Info Share


### Topic: Action Item Review

[ ] MIH: propose text and proposed XML for default registry
[ ] APP: provide pro/con comparison for immutability/namespacing discussion
[ ] APP: provide EAO feedback on text for data model


## Topic: Active PR review

Discussion of active PRs. We will merge or reject them in the call.

The recommendation "discuss" is to ensure there is WG consensus before merging. The recommendation "merge with edits" is to merge once existing comments have been addressed.

Discussion of active PRs. We will merge or reject them in the call.

| PR   | Description | Recommendation |
|------|-------------|----------------|
| #402 | Require variable names to be globally unique | Discuss |
| #399 | Add negative start rule | Discuss (item below) |
| #398 | Change the syntax of the \\open /close | Discuss (item below) |
| #397 | Change the syntax of the ::open :/close | Discuss (item below) |
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

## Topic: Open/Close function syntax, naming, and immutability.

We have multiple proposals for open/close function markup, including the current scheme (`+function`/`-function`). Let's resolve how to support open/close functionality. These proposal partly exist to address the problem of negative literals, given our use of `-function` currently. 

We have also been discussing whether `let` statements should be immutable. If they are immutable, there is a proposal that they use a different sigil from `$` or that they use a two-character sigil (such as `$$localVar`). Note that separating the sigil allows for static analysis of local variables as called out by #403. This can be a separate concern from whether they are immutable.

| PR   | Description |
|------|-------------|
| #398 | Use `\\open` and `/close` |
| #397 | Use `::open` and `:/close` |
| #399 | Keep `+` and `-`, allow negative literals |

Proposals:

[ ] Make local variables use a different sigil
    [ ] If yes, use one character or two? Which character(s)?
[ ] Make local variables immutable
[ ] Change open and close sigils to avoid `-`?
    [ ] If yes, what sigils or sequences to use?
[ ] Should `name`, etc. use `Nmtoken` or some other rules?

## Topic: Discussion of default registry requirements
* Follow up on MIH's action to create draft default registry.

## Topic: AOB?

