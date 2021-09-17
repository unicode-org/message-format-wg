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

As practically all MessageFormat use cases will make use of more than one related message,
it is beneficial to be able to group and organise related messages in the data model.

A Resource provides an externally addressable set of messages,
which all share a single _locale_ identifier.
Within a Resource, the structure of Messages may be completely flat,
or MessageGroups may be used to provide a hierarchy of messages.

A Resource is often the data model representation of a single file,
but may be constructed from any number and type of sources.
It is not necessary for an implementation to use Resources to hold messages.

```ts
interface Resource {
  id: string
  locale: string
  entries: Record<string, Message | MessageGroup>
}

interface MessageGroup {
  entries: Record<string, Message | MessageGroup>
}
```

## Message Resolution

Message resolution is the process of identifying a single message from a set of Resources,
given a Resource identifier and a key path from the root of that Resource.
This is achieved using the GetMessage abstract operation,
which is called internally by MessageFormat methods.

GetMessage will return the first Message that it finds in a Resource
with the given identifier that contains an entry at its full key path.
In other words, the order of resources determines priority,
if multiple Resources use the same identifier and
each provide a message at the same key path.

### GetMessage(_readers_, _resId_, _path_)

The GetMessage abstract operation is called with arguments
_readers_ (which must be a list of MessageResourceReader object),
_resId_ (which must be a string), and
_path_ (which must be a list of strings).
It returns a Message object or **undefined**.
The following steps are taken:

1. For each _reader_ of _readers_, do:
   1. Let _id_ be the result of calling _reader_.getId().
   1. If _id_ and _resId_ are equal, then
      1. Let _msg_ be the result of calling _reader_.getMessage(_path_).
      1. If _msg_ is not **undefined**, then
         1. Return _msg_.
1. Return **undefined**.

### MessageResourceReader

MessageResourceReader provides the minimum required runtime interface for accessing resources.
It may be extended by an implementation to provide access to a set of messages
that cannot easily be represented as a Resource.

```ts
interface MessageResourceReader {
  getId(): string
  getMessage(path: string[]): Message | undefined
}
```

#### CreateMessageResourceReader(_resource_)

The CreateMessageResourceReader abstract operation is called with an argument
_resource_ (which must be a Resource object).
It returns a MessageResourceReader object.
The following steps are taken:

1. Let _reader_ be a new MessageResourceReader instance with
   an internal slot \[\[Data]].
1. Set _reader_.\[\[Data]] as _resource_.
1. Return _reader_.

#### MessageResourceReader#getId()

When called with no arguments,
the getId method returns its string identifier.

With the default Resource-based implementation,
the following steps are taken:

1. Let _reader_ be the **this** value.
1. Let _resource_ be _reader_.\[\[Data]].
1. Return _resource_.id.

#### MessageResourceReader#getMessage(_path_)

The getMessage method is called with an argument
_path_ (which must be a list of strings).
It returns either a Message object corresponding to the _path_,
or **undefined** if not such Message exists.

With the default Resource-based implementation,
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

When formatting a SelectMessage,
it is necessary to first select one of its `cases`.
This is done by first determining the Formattable values for each of its `select` values,
and then looking for the first `cases` entry for which all the keys provide a match.
Each Selector may define a `fallback` value to use if an exact match is not found.
If a `fallback` is not defined, the default value **"other"** is used.

This algorithm relies on `cases` being in an apropriate order,
as the first full match will be selected.
Therefore, cases with more precise `key` values should precede more general values.
A case with an empty list as its `key` will always be selected,
unless an earlier case was matched first.

Plural selection is achieved by relying on the `match()` method of
a FormattableNumber instance returning **true** for a corresponding CLDR category match.
For instance, in many languages calling `match("one")` will return **true** for numbers.

The exact algorithm is defined using the following abstract operations:

### SelectMessageCase(_select_, _cases_)

The SelectMessageCase abstract operation is called with arguments
_select_ (which must be a list of Selector objects) and
_cases_ (which must be a list of SelectCase objects).
It returns either a SelectCase object or **undefined**.
The following steps are taken:

1. Let _formattables_ be an initially empty list of Formattable objects.
1. Let _fallbacks_ be an initially empty list of strings.
1. For each Selector _selector_ of _select_, do:
   1. Let _selFmt_ be AsFormattable(_selector_.value).
   1. Append _selFmt_ as the last element of _formattables_.
   1. Let _selFb_ be _selector_.fallback.
   1. If _selFb_ is **undefined**, then
      1. Append **"other"** as the last element of _fallbacks_.
   1. Else,
      1. Append _selFb_ as the last element of _fallbacks_.
1. For each SelectCase _selCase_ of _cases_, do:
   1. Let _match_ be SelectMessageKeyMatches(_selCase_.key, _formattables_, _fallbacks_).
   1. If _match_ is **true**, then
      1. Return _selCase_.
1. Return **undefined**.

### SelectMessageKeyMatches(_selKey_, _formattables_, _fallbacks_)

The SelectMessageKeyMatches abstract operation is called with arguments
_selKey_ (which must be a list of strings),
_formattables_ (which must be a list of Formattable objects) and
_fallbacks_ (which must be a list of strings).
It returns a boolean value.
The following steps are taken:

1. Let _i_ be 0.
1. Let _len_ be length of the list _selKey_.
1. Repeat, while _i_ < _len_:
   1. Let _key_ be the string at index _i_ of _selKey_.
   1. Let _selFmt_ be the Formattable at index _i_ of _formattables_.
   1. Let _fallback_ be the string at index _i_ of _fallbacks_.
   1. Let _match_ be the boolean result of calling _selFmt_.matchSelectKey(_key_).
   1. If _match_ is **false** and _fallback_ is not equal to _key_, then
      1. Return **false**.
1. Return **true**.

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

Formattable is a general interface for values which may be formatted
to a string or to a sequence of MessageFormatParts,
such as Messages, literals and runtime variables.
Its purpose is to allow for each Message and PatternElement formatter to
encapsulate any value while providing a fixed external interface.

The value and any formatting options must be set during the construction of the Formattable.
They are expected to remain unchanged during the lifetime of the Formattable,
allowing its methods to be considered pure and memoizable.

Except for `getValue()`, the arguments of Formattable methods always include
_locales_ (a list of valid language code strings) and
_localeMatcher_ (either **"best fit"** or **"lookup"**).
These allow for a Formattable to be defined in a context where the formatting locale is not yet known.
It is also possible for a Formattable to define its own locale and ignore the method arguments.

```ts
interface Formattable {
  getValue(): unknown
  matchSelectKey(
    locales: string[],
    localeMatcher: 'best fit' | 'lookup',
    key: string
  ): boolean
  toParts(
    locales: string[],
    localeMatcher: 'best fit' | 'lookup',
    source: string
  ): MessageFormatPart[]
  toString(locales: string[], localeMatcher: 'best fit' | 'lookup'): string
}
```

### getValue()

The getValue method is called with no arguments.
It is expected to return the source value of the Formattable.

### matchSelectKey(_locales_, _localeMatcher_, _key_)

The matchSelectKey method is called during SelectMessage case resolution with arguments
_locales_ (which must be a list of valid language code strings),
_localeMatcher_ (which must be either **"best fit"** or **"lookup"**), and
_key_ (which must be a string).
It returns a boolean value.

The returned value is expected to be **true** if the value of this Formattable matches the given _key_.
Otherwise, the method should return **false**.

### toParts(_locales_, _localeMatcher_, _source_)

The toParts method is called when formatting a message to parts with arguments
_locales_ (which must be a list of valid language code strings),
_localeMatcher_ (which must be either **"best fit"** or **"lookup"**), and
_source_ (which must be a string).
It returns a list of MessageFormatPart objects.

If _source_ is a non-empty string, the `source` value of each of the returned MessageFormatParts
is expected to start with that string.

### toString(_locales_, _localeMatcher_)

The toString method is called when formatting a message to a string with arguments
_locales_ (which must be a list of valid language code strings) and
_localeMatcher_ (which must be either **"best fit"** or **"lookup"**).
It returns a string value.

### FormattableMessage

The Formattable wrapper for Message values has the following method implementations and
abstract operations.

#### FormattableMessage#matchSelectKey(_locales_, _localeMatcher_, _key_)

When the matchSelectKey method of a FormattableMessage instance is called
with arguments _locales_, _localeMatcher_, and _key_,
the following steps are taken:

1. Let _fmtMsg_ be **this** value.
1. Let _str_ be _fmtMsg_.toString().
1. If _key_ and _str_ are equal, then
   1. Return **true**.
1. Else,
   1. Return **false**.

#### FormattableMessage#toParts(_locales_, _localeMatcher_, _source_)

When the toParts method of a FormattableMessage instance is called
with arguments _locales_, _localeMatcher_ and _source_,
the following steps are taken:

1. Let _fmtMsg_ be **this** value.
1. Let _res_ be an empty list of MessageFormatParts.
1. Let _fmtMeta_ be _fmtMsg_.\[\[Meta]].
1. Let _selResult_ be _fmtMsg_.\[\[SelectFailed]].
1. If _fmtMeta_ is not **undefined** or _selResult_ is **"no-match"**, then
   1. Let _metaPart_ be a new MessageFormatPart object.
   1. Set _metaPart_.type to **"meta"**.
   1. Set _metaPart_.value to en empty string.
   1. Let _meta_ be an empty object with string values.
   1. If _fmtMeta_ is not **undefined**, then
      1. For each key-value pair _key_, _value_ of _fmtMeta_, do:
         1. Set the property _key_ of _meta_ to _value_.
   1. If _selResult_ is a non-empty string, then
      1. Set the property **"select-result"** of _meta_ to _selResult_.
   1. Set _metaPart_.meta to _meta_.
   1. Append _metaPart_ as the last entry of _res_.
1. Let _context_ be _fmtMsg_.\[\[Context]].
1. Let _pattern_ be GetMessagePattern(_fmtMsg_).
1. For each PatternElement _elem_ of _pattern_, do:
   1. Let _elemFmt_ be GetPatternElementFormatter(_elem_).
   1. Let _elemtParts_ be _elemFmt_.formatToParts(_context_, _elem_).
   1. For each MessageFormatPart _part_ of _elemParts_, do:
      1. Append _part_ as the last entry of _res_.
1. If _source_ is a non-empty string, then
   1. For each MessageFormatPart _part_ of _res_, do:
      1. Let _prevSource_ be _part_.source.
      1. If _prevSource_ is a non-empty string, then
         1. Set _part.source_ to the string-concatenation of
            _source_, **"/"**, and _prevSource_.
      1. Else,
         1. Set _part_.source to _source_.
1. Return _res_.

#### FormattableMessage#toString()

When the toString method of a FormattableMessage instance is called,
the following steps are taken:

1. Let _fmtMsg_ be **this** value.
1. Let _str_ be an empty string.
1. Let _context_ be _fmtMsg_.\[\[Context]].
1. Let _pattern_ be GetMessagePattern(_fmtMsg_).
1. For each PatternElement _elem_ of _pattern_, do:
   1. Let _elemFmt_ be GetPatternElementFormatter(_elem_).
   1. Let _elemtStr_ be _elemFmt_.formatToString(_context_, _elem_).
   1. Append _elemStr_ to the end of _str_.
1. Return _str_.

#### CreateFormattableMessage(_context_, _message_)

The CreateFormattableMessage abstract operation is called with arguments
_context_ (which must be a FormattingContext object) and
_message_ (which must be a Message object).
It returns a FormattableMessage object.
The following steps are taken:

1. Let _fmtMsg_ be a new FormattableMessage instance with
   internal slots \[\[Context]], \[\[Meta]], \[\[Value]] and \[\[SelectResult]].
1. Set _fmtMsg_.\[\[Context]] to _context_.
1. Set _fmtMsg_.\[\[Value]] to _message_.
1. Set _fmtMsg_.\[\[SelectResult]] to **undefined**.
1. If _message_.meta is **undefined**, then
   1. Set _fmtMsg_.\[\[Meta]] to **undefined**.
1. Else,
   1. Set _fmtMsg_.\[\[Meta]] to a shallow copy of _message_.meta.
1. Return _fmtMsg_.

#### GetMessagePattern(_fmtMsg_)

The GetMessagePattern abstract operation is called with an argument
_fmtMsg_ (which must be a FormattableMessage object).
It returns a list of PatternElement objects.
The following steps are taken:

1. Let _msg_ be _fmtMsg_.\[\[Value]].
1. Let _type_ be _msg_.type.
1. If _type_ is **"message"**, then
   1. Return _msg_.value.
1. Else if _type_ is not **"select"**, then
   1. Throw a **TypeError** excpetion.
1. Let _select_ be _msg_.select.
1. Let _cases_ be _msg_.cases.
1. Let _selCase_ be SelectMessageCase(_select_, _cases_).
1. If _selCase_ is **undefined**, then
   1. Set _fmtMsg_.\[\[SelectResult]] to **"no-match"**.
   1. Return an empty list.
1. Else,
   1. Set _fmtMsg_.\[\[SelectResult]] to **"success"**.
   1. Return _selCase_.value.

### FormattableNumber

Number values must be wrapped in a FormattableNumber,
i.e. a class that implements the Formattable interface but has the following behaviour.
An implementation may further extend the FormattableNumber class to account for different
representations of numbers.

#### FormattableNumber#matchSelectKey(_locales_, _localeMatcher_, _key_)

The matchSelectKey method of a FormattableNumber instance is defined as follows:

1. Let _fmtNum_ be **this** value.
1. Let _num_ be _fmtNum_.getValue().
1. If _num_ is an integer, then
   1. Let _strNum_ be the default, non-localized string representation of _num_.
   1. If _key_ and _strNum_ are equal, then
      1. Return **true**.
1. Let _pluralCat_ be the CLDR string identifier of the plural category corresponding to _num_,
   while taking into account _locales_, _localeMatcher_, and
   any options previously passed to the FormattableNumber.
1. If _key_ and _pluralCat_ are equal, then
   1. Return **true**.
1. Else,
   1. Return **false**.

### AsFormattable(_value_)

The abstract operation AsFormattable is called with the argument _value_.
It returns a Formattable object.
The following steps are taken:

1. If _value_ is a Formattable object, then
   1. Return _value_.
1. If _value_ is a number, then
   1. Let _fmt_ be a FormattableNumber object that wraps _value_.
1. Else,
   1. Let _fmt_ be an implementation-defined Formattable object that wraps _value_.
1. Return _fmt_.

## Formatting Context

The formatting of a message is dependent on a number of environmental or runtime factors.
These are all encapsulated in a FormattingContext object,
which holds information about the current locale,
as well as any PatternElementFormatter-specific context.

```ts
interface FormattingContext {
  asFormattable(elem: PatternElement): Formattable
  formatToParts(elem: PatternElement): MessageFormatPart[]
  formatToString(elem: PatternElement): string
  localeMatcher: 'best fit' | 'lookup'
  locales: string[]
  types: Record<string, unknown>
}
```

The `types` object holds context info for any PatternElementFormatter
that defines an `initContext` method.
It is keyed by the `type` identifier of each PatternElementFormatter.

### CreateFormattingContext(_mf_, _resId_, _scope_)

The abstract operation CreateFormattingContext is called with the arguments
_mf_ (which must be a MessageFormat object),
_resId_ (which must be a string), and
an optional argument _scope_.
It returns a FormattingContext object.
The following steps are taken:

1. Let _locales_ be _mf_.\[\[Locales]].
1. Let _localeMatcher_ be _mf_.\[\[LocaleMatcher]].
1. Let _context_ be a new FormattingContext object.
1. Set _context_.locales to _locales_.
1. Set _context_.localeMatcher to _localeMatcher_.
1. Set _context_.types to be a new empty object.
1. Let _formatters_ be MessageFormat.\[\[Formatters]].
1. For each _formatter_ of _formatters, do:
   1. Let _init_ be _formatter_.initContext
   1. If _init_ is a function, then
      1. Let _type_ be _formatter_.type.
      1. Let _fmtCtx_ be _init_(_context_, _resId_, _scope_).
      1. Add a property _type_ to _context_.types with the value _fmtCtx_.
1. Return _context_.

## MessageFormat

### constructor()

### addResources()

### formatToString()

> _Turning a message into a string._

### formatToParts()

> _Turning a message into a sequence of parts._

### getMessage()

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
