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
}

interface MessageGroup {
  entries: Record<string, Message | MessageGroup>
}
```

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

## Pattern Elements

Pattern elements are used in three places:

1. The body of each PatternMessage is a sequence of pattern elements.
2. The Selector value is a pattern element.
3. Some pattern elements may contain other pattern elements,
   defining the values of arguments or options.

This specification defines the following four pattern elements:

- Literal
- VariableRef
- FunctionRef
- MessageRef

```ts
interface PatternElement {
  type: string
}
```

An implementation MAY support additional custom pattern elements.
If it does so, each such custom PatternElement must extend the PatternElement interface and
include a U+003A COLON `:` character within its `type` value
(used for namespacing and to ensure forward compatibility).

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

Using an array with more than one value refers to an inner property of an object value,
so e.g. `['user', 'name']` would require something like `{ name: 'Kat' }`
as the value of the `'user'` runtime parameter.

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

# Message Pattern Selection

When resolving and formatting a SelectMessage,
it is necessary to first select the PatternMessage of one of its `cases`.

Case selection is done by first determining the Matchable values for
each of the SelectMessage `select` values,
and then looking for the first `cases` entry for which all the keys provide a match.
Each Selector may define a `fallback` value to use if an exact match is not found.
If a `fallback` is not defined, the default value **"other"** is used.

This algorithm relies on `cases` being in an appropriate order,
as the first full match will be selected.
Therefore, cases with more precise `key` values should precede more general values.
A case with an empty list as its `key` will always be selected,
unless an earlier case was matched first.

Plural selection is achieved by relying on the `match()` method of
a MatchableNumber instance returning **true** for a corresponding CLDR category match.
For instance, in many languages calling `match("one")` will return **true** for the number `1`.

The exact algorithm is defined using the following abstract operations:

## SelectMessageCase(_select_, _cases_)

The SelectMessageCase abstract operation is called with arguments
_select_ (which must be a list of Selector objects) and
_cases_ (which must be a list of SelectCase objects).
It returns either a SelectCase object or **undefined**.
The following steps are taken:

1. Let _matchables_ be an initially empty list of Matchable objects.
1. Let _fallbacks_ be an initially empty list of strings.
1. For each Selector _selector_ of _select_, do:
   1. Let _sm_ be AsMatchable(_selector_.value).
   1. Append _sm_ as the last element of _matchables_.
   1. Let _sf_ be _selector_.fallback.
   1. If _sf_ is **undefined**, then
      1. Append **"other"** as the last element of _fallbacks_.
   1. Else,
      1. Append _sf_ as the last element of _fallbacks_.
1. For each SelectCase _selCase_ of _cases_, do:
   1. Let _match_ be SelectMessageKeyMatches(_selCase_.key, _matchables_, _fallbacks_).
   1. If _match_ is **true**, then
      1. Return _selCase_.
1. Return **undefined**.

## SelectMessageKeyMatches(_selKey_, _matchables_, _fallbacks_)

The SelectMessageKeyMatches abstract operation is called with arguments
_selKey_ (which must be a list of strings),
_matchables_ (which must be a list of Matchable objects) and
_fallbacks_ (which must be a list of strings).
It returns a boolean value.
The following steps are taken:

1. Let _i_ be 0.
1. Let _len_ be length of the list _selKey_.
1. Repeat, while _i_ < _len_:
   1. Let _key_ be the string at index _i_ of _selKey_.
   1. Let _sm_ be the Matchable at index _i_ of _matchables_.
   1. Let _fallback_ be the string at index _i_ of _fallbacks_.
   1. Let _match_ be the boolean result of calling _sm_.matchSelectKey(_key_).
   1. If _match_ is **false** and _fallback_ is not equal to _key_, then
      1. Return **false**.
1. Return **true**.

## Matchables

Matchable is a general interface for values which may be used as a SelectMessage selector value.
Its purpose is to allow for each Message and PatternElement formatter to
encapsulate any value while providing a fixed external interface.

The value and any formatting options must be set during the construction of the Matchable.
They are expected to remain unchanged during the lifetime of the Matchable,
allowing its methods to be considered pure and memoizable.

```ts
interface Matchable {
  matchSelectKey(
    locales: string[],
    localeMatcher: 'best fit' | 'lookup',
    key: string
  ): boolean
}
```

### matchSelectKey(_locales_, _localeMatcher_, _key_)

The matchSelectKey method is called during SelectMessage case resolution with arguments
_locales_ (which must be a list of valid language code strings),
_localeMatcher_ (which must be either **"best fit"** or **"lookup"**), and
_key_ (which must be a string).
It returns a boolean value.

Always including the locale information in the method arguments allow for a Matchable
to be defined in a context where the formatting locale is not yet known.
It is also possible for a Matchable to define its own locale and ignore the method arguments.

The returned value is expected to be **true** if the value of this Matchable matches the given _key_.
Otherwise, the method should return **false**.

### MatchableMessage

The Matchable wrapper for Message values must implement the following behaviour:

#### MatchableMessage#matchSelectKey(_locales_, _localeMatcher_, _key_)

When the matchSelectKey method of a FormattableMessage instance is called
with arguments _locales_, _localeMatcher_, and _key_,
the following steps are taken:

1. Let _msg_ be **this** value.
1. Let _str_ be _msg_.toString().
1. If _key_ and _str_ are equal, then
   1. Return **true**.
1. Else,
   1. Return **false**.

#### CreateMatchableMessage(_context_, _message_)

The CreateMatchableMessage abstract operation is called with arguments
_context_ (which must be a FormattingContext object) and
_message_ (which must be a Message object).
It returns a MatchableMessage object.
The following steps are taken:

1. Let _msg_ be a new MatchableMessage instance with
   internal slots \[\[Context]], \[\[Meta]], \[\[Value]] and \[\[SelectResult]].
1. Set _msg_.\[\[Context]] to _context_.
1. Set _msg_.\[\[Value]] to _message_.
1. Set _msg_.\[\[SelectResult]] to **undefined**.
1. If _message_.meta is **undefined**, then
   1. Set _msg_.\[\[Meta]] to **undefined**.
1. Else,
   1. Set _msg_.\[\[Meta]] to a shallow copy of _message_.meta.
1. Return _msg_.

### MatchableNumber

Number values must be wrapped in a MatchableNumber,
i.e. a class that implements the Matchable interface but has the following behaviour.
An implementation may further extend the MatchableNumber class to account for different
representations of numbers.

#### MatchableNumber#matchSelectKey(_locales_, _localeMatcher_, _key_)

The matchSelectKey method of a MatchableNumber instance is defined as follows:

1. Let _matchNum_ be **this** value.
1. Let _num_ be _matchNum_.getValue().
1. If _num_ is an integer, then
   1. Let _strNum_ be the default, non-localized string representation of _num_.
   1. If _key_ and _strNum_ are equal, then
      1. Return **true**.
1. Let _pluralCat_ be the CLDR string identifier of the plural category corresponding to _num_,
   while taking into account _locales_, _localeMatcher_, and
   any options previously passed to the MatchableNumber.
1. If _key_ and _pluralCat_ are equal, then
   1. Return **true**.
1. Else,
   1. Return **false**.

### AsMatchable(_value_)

The abstract operation AsMatchable is called with the argument _value_.
It returns a Matchable object.
The following steps are taken:

1. If _value_ is a Matchable object, then
   1. Return _value_.
1. If _value_ is a number, then
   1. Let _match_ be a MatchableNumber object that wraps _value_.
1. Else,
   1. Let _match_ be an implementation-defined Matchable object that wraps _value_.
1. Return _match_.

# Pattern Elements

## Pattern Formatter Interface

> _The runtime interface required of all pattern element formatters._

### initContext()

### getValue()

### formatToString()

## Literal

## VariableRef

### Runtime Scope

> _How the formatting arguments/parameters are accessed._

```ts
interface Scope {
  [key: string]: unknown
}
```

Variables are defined by the current Scope.

## FunctionRef

> _Values defined by a user-definable function call._

### Data Model

### FunctionRef Call Signature

> _The arguments and return type for user-definable functions._

### FunctionRef Options

> _How to define the options that a function provides._

### Default Function Registry

> _The functions that are always available._

#### number()

#### datetime()

## MessageRef

### Message Access

## Supporting Custom Pattern Elements

> _How to extend the spec when you need to._

## Fallback Behaviour for Unknown Pattern Elements

> _What to do on encountering a pattern element of an unsupported type._

# Formatting Messages

> _How the runtime actually runs._

## Formattables

Formattable is a general interface for values which may be formatted
to a string or to some other target,
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

In addition to `toString()`,
an implementation of Formattable may provide other formatters,
supporting other corresponding formatting targets.
For example,
an implementation may provide an interface for formatting a message to
a sequence of parts representing ther resolved value of each of the message's pattern elements,
including metadata about their shape and origin.

```ts
interface Formattable {
  getValue(): unknown
  toString(locales: string[], localeMatcher: 'best fit' | 'lookup'): string
}
```

### getValue()

The getValue method is called with no arguments.
It is expected to return the source value of the Formattable.

### toString(_locales_, _localeMatcher_)

The toString method is called when formatting a message to a string with arguments
_locales_ (which must be a list of valid language code strings) and
_localeMatcher_ (which must be either **"best fit"** or **"lookup"**).
It returns a string value.

### FormattableMessage

The Formattable wrapper for Message values has the following method implementations and
abstract operations.

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

### Abstract Operations

#### AsFormattable(_value_)

The abstract operation AsFormattable is called with the argument _value_.
It returns a Formattable object.
The following steps are taken:

1. If _value_ is a Formattable object, then
   1. Return _value_.
1. Return an implementation-defined Formattable object that wraps _value_.

#### GetPatternElementFormatter

> _TODO_

## Formatting Context

The formatting of a message is dependent on a number of environmental or runtime factors.
These are all encapsulated in a FormattingContext object,
which holds information about the current locale,
as well as any PatternElementFormatter-specific context.

```ts
interface FormattingContext {
  asFormattable(elem: PatternElement): Formattable
  formatToString(elem: PatternElement): string
  localeMatcher: 'best fit' | 'lookup'
  locales: string[]
  types: Record<string, unknown>
}
```

The `types` object holds context info for any PatternElementFormatter
that defines an `initContext` method.
It is keyed by the `type` identifier of each PatternElementFormatter.

## Runtime

> _TODO_

### GetDefaultRuntime

> _TODO_

## Error Handling

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
