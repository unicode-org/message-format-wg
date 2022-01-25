# Data Model

The MessageFormat data model defines a syntax-independent representation of a message,
or of a resource containing a hierarchy of messages.

The canonical model presented here is suitable for interchange between systems,
using a form that is suitable for representation as JSON.
Implementations that are internally generating and processing a message data model
from a different representation are free to use a different representation
or to simplify the model.

## Message Resources

As practically all MessageFormat use cases will make use of more than one related message,
it is beneficial to be able to group and organise related messages in the data model.

A Resource provides an externally addressable set of messages,
which all share a single _locale_ identifier.
Within a Resource, the structure of Messages may be completely flat,
or MessageGroups may be used to provide a hierarchy of messages.

Groups of messages are useful for associating shared metadata information that can be used by localization tools,
and for scenarios where a single user interface primitive requires multiple messages to be resolved together to localize it.

A Resource is often the data model representation of a single file,
but may be constructed from any number and type of sources.
It is not necessary for a message formatter to actually use Resources to hold messages,
but this may be useful for Message Selection.

```ts
interface Resource {
  type: 'resource'
  id: string
  locale: string
  entries: Record<string, Message | MessageGroup>
  comment?: string
  meta?: Meta
}

interface MessageGroup {
  type: 'group'
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
type Meta = Record<string, string>
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
```

A PatternMessage contains a list of PatternElement values,
some of which are directly defined literal values,
while others are placeholders with formatted values that depend on additional data.

```ts
interface PatternMessage {
  type: 'message'
  pattern: PatternElement[]
  comment?: string
  meta?: Meta
}
```

SelectMessage provides for the selection of one list of PatternElement values
to use as the message's pattern when formatting,
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
  type: 'select'
  select: Selector[]
  cases: SelectCase[]
  comment?: string
  meta?: Meta
}

interface Selector {
  value: PatternElement
  fallback?: string
}

interface SelectCase {
  key: string[]
  value: PatternMessage
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
- Element

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
  var_path: (Literal | VariableRef | Alias)[]
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
  args: (Literal | VariableRef | Alias)[]
  options?: Record<string, Literal | VariableRef | Alias>
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
  msg_path: (Literal | VariableRef | Alias)[]
  scope?: Record<string, Literal | VariableRef | Alias>
}
```

If `res_id` is undefined, the message is sought in the current Resource.
If it is set, it identifies the resource for the sought message.
It is entirely intentional that this value may not be defined at runtime,
as this allows for a static determination of the resources required to format a message.

`msg_path` is used to locate the Message within the Resource.
Unlike the `res_id`, it may include parts that require additional context to resolve.

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

### Element

Display and markup elements represent anything from
HTML tags, formatting information for the voice assistant,
to instructions for a translator to keep an inner span as untranslated.

Unlike other placeholders, elements in general have no textual representation themselves.
Instead, they modify or qualify the presentation of their contents,
or are represented in the final message by some non-textual representation.
Some elements may have no formatted representation at all.

```ts
interface Element extends PatternElement {
  type: 'element'
  elem: string
  has_body: boolean
  options?: Record<string, Literal | VariableRef | Alias>
}

interface ElementEnd extends PatternElement {
  type: 'element-end'
  elem: string
}
```

If the `has_body` value of an Element is `true`,
the message is expected to contain a matching ElementEnd later in the current pattern,
i.e. one with the same `elem` value.
