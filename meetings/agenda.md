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

https://docs.google.com/document/d/13JVPTuhs_SJXWcsSpjFWNIVk3o-T1DQI30RX0qyeK5k/edit

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

* [ ] MIH: propose text and proposed XML for default registry
* [ ] APP: provide pro/con comparison for immutability/namespacing discussion
* [ ] APP: provide EAO feedback on text for data model


## Topic: Active PR review

Discussion of active PRs. We will merge or reject them in the call.

The recommendation "discuss" is to ensure there is WG consensus before merging. The recommendation "merge with edits" is to merge once existing comments have been addressed.

Discussion of active PRs. We will merge or reject them in the call.

| PR   | Description | Recommendation |
|------|-------------|----------------|
| #412 | Replace (literal / variable) with operand in definition of option | Discuss |
| #402 | Require variable names to be globally unique | Discuss |
| #399 | Add negative-start rule | Merge (but see discussion) |
| #398 #397 | (two proposals for changing the open/close sigils) | Discuss |
| #393 | Add interchange data model | Merge |
| #432 | Simplify MatchSelectorKeys() arguments | Merge |
| #431 | Add “Missing Selector annotation” error | Merge |
| #429 | Refactoring sped.md (speculative) | Discuss (see also #419) |
| #421 | Implement `private-use` separately from `reserved` | Merge |
| #420 | First draft of some registry functions | Discuss |
| #419 | Styling and structural changes to spec.md | Merge |
| #415 | Fix reserved-body to use quoted rather than literal | Merge |
| #414 | Use `”` or `’` instead of `\|` for literals (This is a change to WG consensus) | Discuss |

* The recommendation "discuss" is to ensure there is WG consensus before merging. The recommendation "merge with edits" is to merge once existing comments have been addressed.

## Topic: Open Issue Review

* https://github.com/unicode-org/message-format-wg/issues

Currently we have 83 open (was 73 last time).
* 17 are `resolved-candidate` and proposed for close.
* 5 are `Agenda+` and proposed for discussion.


| Issue | Status | Description | Chair's Recommendation |
|-------|--------|-------------|----------------|
| (#272)[https://github.com/unicode-org/message-format-wg/issues/272] | blocker-candidate | decide on formatting to something other than text | discuss (important!) |

## Topic: Summary of ad-hoc of 2023-07-21

A small group (@mihnita, @stasm, @eemeli, @macchiato, @aphillips) met on Friday to discuss #425, primarily the problem of "default" selectors. Let's discuss the results of that call.

## Topic: Discuss whether to refactor spec.md

See #429

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


## Topic: AOB?

