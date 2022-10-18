# PROPOSED DRAFT: The MessageFormat 2.0 Specification

## META

This document is the incomplete working draft of the MF2 specification.
It _will_ experience breaking changes,
and should not be depended on by anyone for anything.
For now, there isn't even an expectation for various parts of the spec
to be in agreement with each other.

To **add** content to or **change** a section of this document
or to **reorganise** sections,
please file a PR to this repo's `master` branch.
Each PR should only either add or change one section
(i.e. content directly under a `#` header or under a single `##` section title),
or reorganise sections.
Once a valid PR has been open for at least **two weeks**
it may be merged if:

- It is approved by:
  - **one active member** of the WG,
    if the PR adds a new section or reorganises sections
  - **three active members** of the WG,
    if the PR changes the contents of a section.
- No active members of the WG have reviewed it with "Request changes",
  or the specific concerns presented in their review have been addressed.
  Such a block on progress should only apply to the explicit minimal scope of the PR,
  so wanting it to be expanded should not prevent the smaller PR to be merged first.
- If an active member of the WG has requested additional time to review the PR,
  the PR has been open for **four weeks**,
  or said member has concluded their review.
- No other similarly approved PR exists with contents for the same section.
  If the PRs cannot be combined or have all but one withdrawn,
  the choice will be discussed at the next plenary meeting of the WG.
  If the plenary meeting does not conclude with a decision:
  - For PRs adding new sections or reorganising sections,
    a **simple coin toss** or some other fair random selection method
    will decide which PR gets initially merged at the end of the meeting.
  - For PRs changing the contents of an existing section,
    discussion will **continue offline** and at subsequent plenary meetings.

Contents of this working draft of the spec should be written in
[GitHub-flavoured markdown](https://docs.github.com/en/github/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax),
with [semantic line breaks](https://sembr.org/)
separating sentences and other substantial units of thought.
Trailing whitespace should be trimmed,
and exactly one empty line should separate content blocks.
Typo fixes and other non-normative editorial corrections
may be merged with no regard for the minimum open time or other requirements,
as long as they have at least one approval and no change requests from active WG members.
Sections containing a single indented sentence _in italics_ should be considered empty,
as that is intended as an template for the section's contents.

This initial META section will not be a part of the final specification,
but the same above-defined rules apply to changing its contents.
The intent is to publish the specification first as a Draft Unicode Technical Standard (D-UTS)
and eventually have it accepted as a Unicode Technical Standard (UTS).

---

# Introduction

> _Why this thing exists, what it's trying to be, and what it's not._

## Terminology

## Goals

## Non-goals

# Conformance

> _How we define compliance with the spec._

# Message Resources

> _The structures that hold messages within them._

## Data Model

> _The data-only representation of a message resource._

## Message Resolution

> _The runtime interface for getting a message or other data from a message resource._

### getId()

### getMessage()

## Mapping Other Message Structures to MessageFormat Resources

> _How messages stored in various formats can or may be represented in MF2._

# Messages

## Data Model

A Message provides the representation of a single message.
It takes one of two forms,
either as a PatternMessage or a SelectMessage.

```ts
type Message = PatternMessage | SelectMessage

type MessageBody = PatternElement[]
```

A PatternMessage contains a list of PatternElement values,
some of which are directly defined literal values,
while others are placeholders with formatted values that depend on additional data.

```ts
interface PatternMessage {
  value: MessageBody
}
```

SelectMessage provides for the selection of one list of PatternElement values
to use as the message's value when formatting,
depending on the value of one or more Selector values.

Each of the SelectMessage `cases` is defined by a key of one or more string identifiers,
and selection between them is made according to the corresponding Selector values.
From this it follows that a valid SelectMessage must have at least as many `select` entries
as its highest count of string entries within the keys of its `cases`.
The `fallback` value of a Selector is used in addition to its `value`
when selecting one of the `cases` during formatting.
It should match exactly one of the corresponding SelectCase `key` values.

```ts
interface SelectMessage {
  select: Selector[]
  cases: Map<string[], PatternMessage>
}

interface Selector {
  value: PatternElement
  fallback?: string
}
```

> _The shape of `SelectMessage`, in particular the representation of fallback values, is still under discussion and will be further reviewed by the WG._

## Select Case Resolution

> _How a single pattern is selected from a SelectMessage at runtime._

# Pattern Elements

> _The types of pieces that can make up a message._

## Pattern Formatter Interface

> _The runtime interface required of all pattern element formatters._

### initContext()

### getValue()

### formatToString()

### formatToParts()

## Literal

> _Values that are defined directly in the message data._

### Data Model

## Variable

> _Values that are provided as runtime arguments or parameters to the formatter._

### Data Model

### Runtime Scope

> _How the formatting arguments/parameters are accessed._

## Function

> _Values defined by a user-definable function call._

### Data Model

### Function Call Signature

> _The arguments and return type for user-definable functions._

### Function Options

> _How to define the options that a function provides._

### Default Function Registry

> _The functions that are always available._

#### number()

#### datetime()

## Term

> _Include one message within another message._

### Data Model

### Message Access

## Supporting Custom Pattern Elements

> _How to extend the spec when you need to._

## Fallback Behaviour for Unknown Pattern Elements

> _What to do on encountering a pattern element of an unsupported type._

# Formatting Messages

> _How the runtime actually runs._

## Formattables

> _Representations of runtime values with associated options, metadata and formatters._

### getValue()

### matchSelectKey()

### toString()

### toParts()

### FormattableNumber

### FormattableDateTime

## formatToString()

> _Turning a message into a string._

## formatToParts()

> _Turning a message into a sequence of parts._

## Error Handling

> _How to always provide some output, and loudly complain only in dev mode._

# Syntax

> _How MF2 messages look like to programmers, and sometimes translators._

## Message Contents

> _The representation of a message's contents, embeddable in various file formats._

## Message Resources

> _The canonical file format for MF2._

# XLIFF 2 Interoperability

> _How MF2 messages and resources map to XLIFF._

## The XLIFF 2 MessageFormat Module

## MessageFormat to XLIFF

## XLIFF to MessageFormat
