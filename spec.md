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

# Data Model

## Message Resources

As practically all MessageFormat use cases will make use of more than one related message,
it is beneficial to be able to group and organise related messages in the data model.

A Resource provides an externally addressable set of messages,
which all share a single _locale_ identifier.
Within a Resource, the structure of Messages may be completely flat,
or MessageGroups may be used to provide a hierarchy of messages.

A Resource is often the data model representation of a single file,
but may be constructed from any number and type of sources.
It is not necessary for a message formatter to actually use Resources to hold messages,
but this may be useful for Message Selection.

```ts
interface Resource {
  id: string
  locale: string
  entries: Record<string, Message | MessageGroup>
  comment?: string
  meta?: Meta
}

interface MessageGroup {
  entries: Record<string, Message | MessageGroup>
  comment?: string
  meta?: Meta
}
```

## Comments and Metadata

Each Resource, MessageGroup, Message and PatternElement
may have comments and metadata associated with it.
A _comment_ is expected to contain unstructured text,
while _meta_ is a key-value record of structured data.
Both are intended to provide context and other information about the messages they contain.

```ts
type Meta = Record<string, string | number | boolean>
```

Comments are not used or included in any resolved or formatted message output.
Message and PatternElement _meta_ values are included in their resolved values,
and may be used e.g. by custom formatting functions.

## Messages

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
  comment?: string
  meta?: Meta
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
  comment?: string
  meta?: Meta
}

interface Selector {
  value: PatternElement
  fallback?: string
}
```

## Pattern Elements

Pattern elements are used in three places:

1. The body of each PatternMessage is a sequence of pattern elements.
2. The Selector value is a pattern element.
3. Some pattern elements may contain other pattern elements,
   defining the values of arguments or options.

This specification defines the following pattern elements:

- Literal
- VariableRef
- FunctionRef
- MessageRef
- Alias

```ts
interface PatternElement {
  type: string
  alias?: string
  comment?: string
  meta?: Meta
}
```

An implementation MAY support additional custom pattern elements.
If it does so, each such custom PatternElement must extend the PatternElement interface and
include a U+003A COLON `:` character within its `type` value
(used for namespacing and to ensure forward compatibility).

For explanations of the optional fields available for all pattern elements,
see the sections on Comments and Metadata as well as the Alias pattern element.

### Literal

Literal values are immediately defined in the data model.
The canonical value of a Literal is always a string.

```ts
interface Literal extends PatternElement {
  type: 'literal'
  value: string
}
```

### VariableRef

Variables are resolved with values that are
provided as runtime arguments or parameters to the formatter.

```ts
interface VariableRef extends PatternElement {
  type: 'variable'
  var_path: (Literal | VariableRef)[]
}
```

Using a `var_path` array with more than one value refers to an inner property of an object value.

### FunctionRef

FunctionRef elements represent values defined by a user-definable function call.
To resolve a FunctionRef,
an externally defined function is called with
the resolved values of the specified arguments and options.

```ts
interface FunctionRef extends PatternElement {
  type: 'function'
  func: string
  args: (Literal | VariableRef)[]
  options?: Record<string, Literal | VariableRef>
}
```

The `func` identifies a function that takes in the current locale,
the arguments `args`,
as well as any `options`,
and returns some corresponding output.
Likely functions available by default would include formatters for numeric and date values.

### MessageRef

A MessageRef is a pointer to a Message,
which allows for including one message within another message.
To resolve a MessageRef,
that message is first identified and then resolved.

```ts
interface MessageRef extends PatternElement {
  type: 'message'
  res_id?: string
  msg_path: (Literal | VariableRef)[]
  scope?: Record<string, Literal | VariableRef>
}
```

If `res_id` is undefined, the message is sought in the current Resource.
If it is set, it identifies the resource for the sought message.
It is entirely intentional that this value may not be defined at runtime,
as this allows for a static determination of the resources required to format a message.

`msg_path` is used to locate the Message within the Resource,
and it may include VariableRef values.

`scope` overrides values in the current scope when resolving the message.

### Alias

An Alias is a pointer to another PatternElement within the current message.
Its resolved value is equivalent to that of the non-alias PatternElement with the same `alias` value.

```ts
interface Alias extends PatternElement {
  type: 'alias'
  alias: string
}
```

Each Alias must be defined exactly once within a message where it is used.
The definition of an alias may come after its use,
but creating a loop where the value of an alias depends on its own value is an error.

# Message Pattern Selection

When resolving and formatting a SelectMessage,
it is necessary to first select the PatternMessage of one of its `cases`.

Case selection is done by first resolving the value of
each of the SelectMessage `select` values,
and then looking for the first `cases` entry for which all the keys provide a match.
Each Selector may define a `fallback` value to use if an exact match is not found.
If a `fallback` is not defined, the default value **"other"** is used.

To perform case selection:

1. Resolve the value of each `select` entry.
1. Consider each _key_ of `cases` in their specified order.
1. If every _key_ value matches the corresponding resolved value of `select` or its fallback value,
   select the current case.
   If the selection made use of at least one fallback value,
   include a `meta` value `selectResult: 'fallback'` in the resolved value of this message.
1. If no case is selected:
   1. Report an error in an implementation-specified manner.
   1. Use a fallback representation as the resolved value of the current message,
      including a `meta` value `selectResult: 'no-match'`.

This algorithm relies on `cases` being in an appropriate order,
as the first full match will be selected.
Therefore, cases with more precise key values should precede more general values.
A case with an empty list as its key will always be selected,
unless an earlier case was matched first.

In order to compare a selector value with its corresponding string key value,
either the selector value must itself be a string,
it must be representable as a string, or
the implementation must provide special handling for its value type.
If none of these applies for a selector,
its value cannot provide a match for any key value.

## Plural Category Selectors

In order to support plural category selection,
an implementation MUST provide special handling for selectors which resolve to numerical values,
as well as selectors which resolve to some representation of a numerical value combined with formatting options.

For such numerical values,
if a key value is one of the CLDR plural categories
`zero`, `one`, `two`, `few`, `many` or `other`,
the corresponding plural category of the selector value MUST be determined for the current locale,
and the given key value compared to it rather than a string representation of the value itself.
If the selector value includes any formatting options,
these must be accounted for when determining the plural category.

Specifically, the formatting options described here may include
an option specifying a minimum number of fraction digits,
as well as an option specifying ordinal (rather than the default cardinal) plurals to be used.

Separately from the CLDR plural category values,
if a key value consists entirely of a string representation of a decimal integer,
this integer value is compared to the selector's numerical value
instead of the customary string comparison.
Notably, in this comparison any formatting options of the numerical value are not considered.

## MessageRef as Selector

If a MessageRef is used as a selector value,
it will match a key value if the resolved message's formatted-string output matches the corresponding key value exactly.
If the selector message's resolution or formatting resulted in any errors,
it will not match any key value.

# Message Pattern Resolution

The resolution and formatting of a message may be dependent on
a number of environmental or runtime factors.
Some of this context -- in particular, information about the current locale --
is common to all pattern elements,
while other parts are specific to each pattern element.

It may be useful for an implementation to consider the resolution of pattern element values
as a separate step from their formatting.
For example, selector values that resolve to numerical values need special handling.
Separating formatting from resolution also allows for formattable data types to
be handled independently of their origin.

As formatting a message often requires interaction with external and user-controlled values,
contextual access SHOULD be limited as much as possible during value resolution and formatting.

The Literal and Alias pattern elements
do not require any external context for their resolution.

## Locale Information

The exact shape of locale information is implementation-dependent,
but must be made available when resolving or formatting each part of a message.
Locale information MUST at least include the tag of a preferred locale,
but MAY also include additional information such as a list of fallback tags.
Implementations SHOULD NOT assume that a message in a resource with a specific locale
will always be formatted with that exact locale.

## VariableRef

Resolving the value of a variable requires access to variables.
At its simplest,
this may be achieved by having the formatting call include
a map of variable values as an argument.

As a VariableRef may include a `var_path` array with more than one value,
its resolution may require accessing inner properties of an object value.
For example, a path with a resolved value of `['user', 'name']` would either
require something like `{ name: 'Kat' }` as the value of the `'user'` variable,
or a more complex data structure as the map of variable values.

## FunctionRef

A MessageFormat implementation MUST provide a way for
formatting functions to be defined by its users.
As the same formatting functions are expected to be used relatively widely,
such functions may well be shared across multiple MessageFormat instances.

All functions share a single namespace,
and in the data model their `func` identifiers are static strings.
This allows for (but does not require) an implementation to check while loading a resource
whether all of the FunctionRefs included in its messages
refer to known registered functions.

Formatting functions MUST be pure, i.e.
provide the same outputs for the same input arguments and options,
and have no side effects.
This does not forbid such formatting functions from internally memoizing or sharing
formatters or other functions,
as long as this has no external visibility.

As formatting functions are often custom code written for a specific user,
implementations SHOULD take this into account in their treatment of formatting functions
and the development of their security models.
The contextual access of a formatting function SHOULD be limited as much as possible,
and the access level required to define a new function SHOULD be higher than the access level
required to introduce a new message to be formatted.

Formatting functions MUST NOT treat their inputs differently depending on their origin.
This means that a formatting function that is (for example) given a string value as an argument
MUST provide the same output independently of whether the string is the resolved value of
a Literal or a VariableRef pattern element.

## MessageRef

The resolution of a MessageRef requires access to the currently available messages.
Resolving a MessageRef with a `res_id` value requires
access not only to messages in the current resource, but also to other message resources.

The shape and requirements of the context required for this
are presented in the Message Selection section.

# Message Selection

Message selection is the process of identifying a single message from a set of Message Resources,
given a Resource identifier and a key path from the root of that Resource.
While this process MAY be used by an implementation's API
when initially selecting a message for formatting,
it MUST be used when resolving a MessageRef pattern element.

As an implementation may use a different internal representation of messages than Message Resources,
Message Selection is presented here in terms of a minimal shared interface, MessageResourceReader.
The construction and internal behaviour of its methods are presented based on Message Resources.

```ts
interface MessageResourceReader {
  getId(): string
  getMessage(path: string[]): Message | undefined
}
```

## MessageResourceReader Methods

The methods of a MessageResourceReader MUST be synchronous,
to ensure that message formatting can be fast.
If some asynchrony is needed e.g. due to loading or parsing source files,
This asynchrony should be handled before or during
the construction of a MessageResourceReader instance.

### MessageResourceReader#getId()

The getId method is called with no arguments.
It returns the string identifier of the current message resource.

With an implementation constructed with CreateMessageResourceReader(_resource_),
the following steps are taken:

1. Let _reader_ be the **this** value.
1. Let _resource_ be _reader_.\[\[Data]].
1. Return _resource_.id.

### MessageResourceReader#getMessage(_path_)

The getMessage method is called with an argument
_path_ (which must be a list of strings).
It returns either a Message object corresponding to the _path_,
or **undefined** if not such Message exists.

With an implementation constructed with CreateMessageResourceReader(_resource_),
the following steps are taken:

1. If _path_ is an empty list,
   1. Return **undefined**.
1. Let _reader_ be the **this** value.
1. Let _msg_ be _reader_.\[\[Data]].
1. For each string _key_ of _path_, do:
   1. If _msg_ is **undefined** or _msg_.type is **"message"** or **"select"**, then
      1. Return **undefined**.
   1. Let _entries_ be _msg_.entries.
   1. Set _msg_ to the value of the property _key_ in _entries_ or
      **undefined** if no such property exists.
1. If _msg_ is not **undefined** and _msg_.type is **"message"** or **"select"**, then
   1. Return _msg_.
1. Else,
   1. Return **undefined**.

## Abstract Operations

### CreateMessageResourceReader(_resource_)

The CreateMessageResourceReader abstract operation is called with an argument
_resource_ (which must be a Resource object).
It returns a MessageResourceReader object.
The following steps are taken:

1. Let _reader_ be a new MessageResourceReader instance with
   an internal slot \[\[Data]].
1. Set _reader_.\[\[Data]] as _resource_.
1. Return _reader_.

### GetMessage(_readers_, _resId_, _path_)

The GetMessage abstract operation is called with arguments
_readers_ (which must be a list of MessageResourceReader objects that allows for synchronous iteration),
_resId_ (which must be a string), and
_path_ (which must be a list of strings).
It returns a Message object or **undefined**.

GetMessage will return the first Message that it finds in a Resource
with the given identifier that contains an entry at its full key path.
In other words, the order of resources determines priority,
if multiple Resources use the same identifier and
each provide a message at the same key path.

The following steps are taken:

1. For each _reader_ of _readers_, do:
   1. Let _id_ be the result of calling _reader_.getId().
   1. If _id_ and _resId_ are equal, then
      1. Let _msg_ be the result of calling _reader_.getMessage(_path_).
      1. If _msg_ is not **undefined**, then
         1. Return _msg_.
1. Return **undefined**.








# Pattern Elements

## Supporting Custom Pattern Elements

> _How to extend the spec when you need to._

## Fallback Behaviour for Unknown Pattern Elements

> _What to do on encountering a pattern element of an unsupported type._

# Default Function Registry

> _The functions that are always available._

## number()

## datetime()

# Error Handling

> _How to always provide some output, and loudly complain only in dev mode._

# Syntax

> _How MF2 messages look like to programmers, and sometimes translators._

## Message Contents

> _The representation of a message's contents, embeddable in various file formats._

## Message Resources

> _The canonical file format for MF2._

# Mapping Other Message Structures to MessageFormat Resources

> _How messages stored in various formats can or may be represented in MF2._

# XLIFF 2 Interoperability

> _How MF2 messages and resources map to XLIFF._

## The XLIFF 2 MessageFormat Module

## MessageFormat to XLIFF

## XLIFF to MessageFormat
