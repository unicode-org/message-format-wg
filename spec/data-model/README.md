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

In the syntax,
a `PatternMessage` may be represented either as a _simple message_ or as a _complex message_,
depending on whether it has declarations and if its `pattern` is allowed in a _simple message_.

```ts
type Message = PatternMessage | SelectMessage;

interface PatternMessage {
  type: "message";
  declarations: Declaration[];
  pattern: Pattern;
}

interface SelectMessage {
  type: "select";
  declarations: Declaration[];
  selectors: Expression[];
  variants: Variant[];
}
```

Each message _declaration_ is represented by a `Declaration`,
which connects the `name` of a _variable_
with its _expression_ `value`.
The `name` does not include the initial `$` of the _variable_.

The `name` of an `InputDeclaration` MUST be the same
as the `name` in the `VariableRef` of its `VariableExpression` `value`.

An `UnsupportedStatement` represents a statement not supported by the implementation.
Its `keyword` is a non-empty string name (i.e. not including the initial `.`).
If not empty, the `body` is the "raw" value (i.e. escape sequences are not processed)
starting after the keyword and up to the first _expression_,
not including leading or trailing whitespace.
The non-empty `expressions` correspond to the trailing _expressions_ of the _reserved statement_.

> **Note**
> Be aware that future versions of this specification
> might assign meaning to _reserved statement_ values.
> This would result in new interfaces being added to
> this data model.

```ts
type Declaration = InputDeclaration | LocalDeclaration | UnsupportedStatement;

interface InputDeclaration {
  type: "input";
  name: string;
  value: VariableExpression;
}

interface LocalDeclaration {
  type: "local";
  name: string;
  value: Expression;
}

interface UnsupportedStatement {
  type: "unsupported-statement";
  keyword: string;
  body?: string;
  expressions: Expression[];
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
  type: "*";
  value?: string;
}
```

## Patterns

Each `Pattern` represents a linear sequence, without selectors.
Each element of the `body` array MUST either be a non-empty string or an `Expression` or `Markup` object.
String values represent literal _text_,
while `Expression` and `Markup` wrap each of the potential _expression_ and _markup_ shapes.
The `body` strings are the "cooked" _text_ values, i.e. escape sequences are processed.

Implementations MUST NOT rely on the set of `Expression` and `Markup` interfaces being exhaustive,
as future versions of this specification MAY define additional expressions.

```ts
interface Pattern {
  body: Array<string | Expression | Markup>;
}

type Expression =
  | LiteralExpression
  | VariableExpression
  | FunctionExpression
  | UnsupportedExpression;

interface LiteralExpression {
  type: "expression";
  arg: Literal;
  annotation?: FunctionAnnotation | UnsupportedAnnotation;
}

interface VariableExpression {
  type: "expression";
  arg: VariableRef;
  annotation?: FunctionAnnotation | UnsupportedAnnotation;
}

interface FunctionExpression {
  type: "expression";
  arg?: never;
  annotation: FunctionAnnotation;
}

interface UnsupportedExpression {
  type: "expression";
  arg?: never;
  annotation: UnsupportedAnnotation;
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
  type: "literal";
  value: string;
}

interface VariableRef {
  type: "variable";
  name: string;
}
```

A `FunctionAnnotation` represents a _function_ _annotation_.
The `name` does not include the `:` starting sigil.

Each _option_ is represented by an `Option`.

```ts
interface FunctionAnnotation {
  type: "function";
  name: string;
  options?: Option[];
}

interface Option {
  name: string;
  value: Literal | VariableRef;
}
```

An `UnsupportedAnnotation` represents a
_private-use annotation_ not supported by the implementation or a _reserved annotation_.
The `sigil` corresponds to the starting sigil of the _annotation_.
The `source` is the "raw" value (i.e. escape sequences are not processed)
and does not include the starting `sigil`.

> **Note**
> Be aware that future versions of this specification
> might assign meaning to _reserved annotation_ `sigil` values.
> This would result in new interfaces being added to
> this data model.

When parsing the syntax of a _message_ that includes a _private-use annotation_
supported by the implementation,
the implementation SHOULD represent it in the data model
using an interface appropriate for the semantics and meaning
that the implementation attaches to that _annotation_.

```ts
interface UnsupportedAnnotation {
  type: "unsupported-annotation";
  sigil: "!" | "@" | "%" | "^" | "&" | "*" | "+" | "<" | ">" | "?" | "~";
  source: string;
}
```

## Markup

Each of _markup-open_, _markup-close_, and _markup-standalone_ are represented
by the corresponding `MarkupOpen`, `MarkupStandalone`, and `MarkupClose`.
The `name` in these does not include the starting sigils `#` and `/`.
The optional `options` for open and standalone markup use the same `Option`
as `FunctionAnnotation`.

```ts
type Markup = MarkupOpen | MarkupStandalone | MarkupClose;

interface MarkupOpen {
  type: "markup";
  kind: "open";
  name: string;
  options?: Option[];
}

interface MarkupStandalone {
  type: "markup";
  kind: "standalone";
  name: string;
  options?: Option[];
}

interface MarkupClose {
  type: "markup";
  kind: "close";
  name: string;
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
