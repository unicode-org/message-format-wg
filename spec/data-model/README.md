# DRAFT MessageFormat 2.0 Data Model

To work with messages defined in other syntaxes than that of MessageFormat 2,
an equivalent data model representation is also defined.
Implementations MAY provide interfaces which allow
for MessageFormat 2 syntax to be parsed into this representation,
for this representation to be serialized into MessageFormat 2 syntax
or any other syntax,
for messages presented in this representation to be formatted,
or for other operations to be performed on or with messages in this representation.

Implementations are not required to use this data model for their internal representation of messages.

To ensure compatibility across all platforms,
this interchange data model is defined here using TypeScript notation.
Two equivalent definitions of the data model are also provided:

- [`message.json`](./message.json) is a JSON Schema definition,
  for use with message data encoded as JSON or compatible formats, such as YAML.
- [`message.dtd`](./message.dtd) is a document type definition (DTD),
  for use with message data encoded as XML.

## Messages

A `SelectMessage` corresponds to a syntax message that includes _selectors_.
A message without _selectors_ and with a single _pattern_ is represented by a `PatternMessage`.

```ts
type Message = PatternMessage | SelectMessage;

interface PatternMessage {
  type: 'message';
  declarations: Declaration[];
  pattern: Pattern;
}

interface SelectMessage {
  type: 'select';
  declarations: Declaration[];
  selectors: Expression[];
  variants: Variant[];
}
```

Each message _declaration_ is represented by a `Declaration`,
which connects the `name` of the left-hand side _variable_
with its right-hand side `value`.
The `name` does not include the initial `$` of the _variable_.

```ts
interface Declaration {
  name: string;
  value: Expression;
}
```

In a `SelectMessage`,
the `keys` and `value` of each _variant_ are represented as an array of `Variant`.
For the `CatchallKey`, a string `value` may be provided to retain an identifier.
This is always `'*'` in MessageFormat 2 syntax, but may vary in other formats.

```ts
interface Variant {
  keys: Array<Literal | CatchallKey>;
  value: Pattern;
}

interface CatchallKey {
  type: '*';
  value?: string;
}
```

## Patterns

Each `Pattern` represents a linear sequence, without selectors.
Each element of the sequence MUST have either a `Text` or an `Expression` shape.
`Text` represents literal _text_,
while `Expression` wraps each of the potential _expression_ shapes.
The `value` of `Text` is the "cooked" value (i.e. escape sequences are processed).

Implementations MUST NOT rely on the set of `Expression` `body` values being exhaustive,
as future versions of this specification MAY define additional expressions.
A `body` with an unrecognized value SHOULD be treated as an `Unsupported` value.

```ts
interface Pattern {
  body: Array<Text | Expression>;
}

interface Text {
  type: 'text';
  value: string;
}

interface Expression {
  type: 'expression';
  body: Literal | VariableRef | FunctionRef | Unsupported;
}
```

## Expressions

The `Literal` and `VariableRef` correspond to the the _literal_ and _variable_ syntax rules.
When they are used as the `body` of an `Expression`,
they represent _expression_ values with no _annotation_.

`Literal` represents all literal values, both _quoted_ and _unquoted_.
The presence or absence of quotes is not preserved by the data model.
The `value` of `Literal` is the "cooked" value (i.e. escape sequences are processed).

In a `VariableRef`, the `name` does not include the initial `$` of the _variable_.

```ts
interface Literal {
  type: 'literal';
  value: string;
}

interface VariableRef {
  type: 'variable';
  name: string;
}
```

A `FunctionRef` represents an _expression_ with a _function_ _annotation_.
In a `FunctionRef`,
the `kind` corresponds to the starting sigil of a _function_:
`'open'` for `+`, `'close'` for `-`, and `'value'` for `:`.
The `name` does not include this starting sigil.

The optional `operand` is the _literal_ or _variable_
before the _annotation_ in the _expression_, if present.
Each _option_ is represented by an `Option`.

```ts
interface FunctionRef {
  type: 'function';
  kind: 'open' | 'close' | 'value';
  name: string;
  operand?: Literal | VariableRef;
  options?: Option[];
}

interface Option {
  name: string;
  value: Literal | VariableRef;
}
```

An `Unsupported` represents an _expression_ with a
_reserved_ _annotation_ or a _private-use_ _annotation_ not supported
by the implementation.
The `sigil` corresponds to the starting sigil of the _annotation_.
The `source` is the "raw" value (i.e. escape sequences are not processed)
and does not include the starting `sigil`.

> **Note**
> Be aware that future versions of this specification
> might assign meaning to _reserved_ `sigil` values.
> This would result in new interfaces being added to
> this data model.

If the _expression_ includes a _literal_ or _variable_ before the _annotation_,
it is included as the `operand`.

When parsing the syntax of a _message_ that includes a _private-use_ _annotation_
supported by the implementation,
the implementation SHOULD represent it in the data model
using an interface appropriate for the semantics and meaning
that the implementation attaches to that _annotation_.

```ts
interface Unsupported {
  type: 'unsupported';
  sigil: '!' | '@' | '#' | '%' | '^' | '&' | '*' | '<' | '>' | '/' | '?' | '~';
  source: string;
  operand?: Literal | VariableRef;
}
```

## Extensions

Implementations MAY extend this data model with additional interfaces,
as well as adding new fields to existing interfaces.
When encountering an unfamiliar field, an implementation MUST ignore it.
For example, an implementation could include a `span` field on all interfaces
encoding the corresponding start and end positions in its source syntax.

In general,
implementations MUST NOT extend the sets of values for any defined field or type
when representing a valid message.
However, when using this data model to represent an invalid message,
an implementation MAY do so.
This is intended to allow for the representation of "junk" or invalid content within messages.
