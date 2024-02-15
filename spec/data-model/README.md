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

A `SimpleMessage` corresponds to a syntax message that includes _selectors_.
A message without _selectors_ and with a single _pattern_ is represented by a `ComplexMessage`.

In the syntax,
a `ComplexMessage` may be represented either as a _simple message_ or as a _complex message_,
depending on whether it has declarations and if its `pattern` is allowed in a _simple message_.

```ts
type Message = SimpleMessage | ComplexMessage;

interface SimpleMessage {
  type: "simple-message";
  pattern: Pattern;
}

interface Matcher {
  selectors: Expression[];
  variants: Variant[];
}

interface ComplexMessage {
  type: "complex-message";
  declarations?: Declaration[];
  body: Pattern | Matcher;
}
```

Each message _declaration_ is represented by a `Declaration`,
which connects the `name` of a _variable_
with its _expression_ `value`.
The `name` does not include the `$` sigil of the _variable_,
or the starting and ending `|` of the literals.

The `name` of an `InputDeclaration` MUST be the same
as the `name` in the `VariableRef` of its `VariableExpression` `value`.

An `ReservedStatement` represents a statement not supported by the implementation.
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
type Declaration = InputDeclaration | LocalDeclaration | ReservedStatement;

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

interface ReservedStatement {
  type: "reserved-statement";
  keyword: string;
  body?: string;
  expressions: Expression[];
}
```

In a `Matcher` the `keys` and `value` of each _variant_ are represented as an array of `Variant`. \
For the `CatchallKey`, a `Pattern` `value` MUST be provided.
A `CatchallKey` is always `'*'` in MessageFormat 2 syntax, but may vary in other formats.

```ts
interface Variant {
  keys: Array<Literal | CatchallKey>;
  value: Pattern;
}

interface CatchallKey {
  type: "*";
  value: Pattern;
}
```

## Patterns

Each `Pattern` contains a linear sequence of text and placeholders corresponding
to potential output of a message.

Each element of the `Pattern` MUST either be a non-empty string, an `Expression`,
or a `Markup` object. \
String values represent literal _text_. \
String values include all processing of the underlying _text_ values,
including escape sequence processing. \
`Expression` wraps each of the potential _expression_ shapes. \
`Markup` wraps each of the potential _markup_ shapes.

Implementations MUST NOT rely on the set of `Expression` and
`Markup` interfaces defined in this document being exhaustive. \
Future versions of this specification might define additional
expressions or markup.

```ts
type Pattern = Array<string | Expression | Markup>;

type Expression =
  | LiteralExpression
  | VariableExpression
  | AnnotationExpression

interface LiteralExpression {
  type: "literal-expression";
  arg: Literal;
  annotation?: Annotation;
  attributes?: Attributes[];
}

interface VariableExpression {
  type: "variable-expression";
  arg: VariableRef;
  annotation?: Annotation;
  attributes?: Attributes[];
}

interface AnnotationExpression {
  type: "annotation-expression";
  annotation?: Annotation;
  attributes?: Attributes[];
}

type Annotation = FunctionAnnotation | PrivateUseAnnotation | ReservedAnnotation;

interface FunctionAnnotation {
  type: "function-annotation";
  identifier: Identifier;
  option?: Option[];
}

interface PrivateUseAnnotation {
  type: "private-use-annotation";
  sigil: string;
  reservedBody: string;
}

interface ReservedAnnotation {
  type: "reserved-annotation";
  sigil: string;
  reservedBody: string;
}

interface Attribute {
  identifier: Identifier;
  value?: Literal | VariableRef;
}
```

## Expressions

The `Literal` and `VariableRef` correspond to the the _literal_ and _variable_ syntax rules.
When they are used as the `body` of an `Expression`,
they represent _expression_ values with no _annotation_.

`Literal` represents all literal values, both numeric (_unquoted_) and string (_quoted_).
The presence or absence of quotes (`'|'` in MessageFormat 2) is not preserved by the data model.
The `value` of `StringLiteral` is the "cooked" value (i.e. escape sequences are processed).
The `value` of `NumberLiteral` is the numeric value after parsing (for example the trailing zeros are not preserved).

In a `VariableRef`, the `name` does not include the initial `$` of the _variable_.

```ts
interface VariableRef {
  type: "variable";
  name: string;
}

type Literal = StringLiteral | NumberLiteral

interface StringLiteral {
  type: "string-literal";
  value: string;
}

interface NumberLiteral {
  type: "number-literal";
  value: number;
}
```

A `FunctionAnnotation` represents a _function_ _annotation_.
The `identifier` does not include the `:` starting sigil.

Each _option_ is represented by an `Option`.

```ts
interface Option {
  identifier: Identifier;
  value: Literal | VariableRef;
}
```

An `PrivateUseAnnotation` represents a _private-use annotation_,
not supported by the implementation.
These are annotations that might be supported by some implementations,
and are guaranteed to not be in conflict with future standard development.

An `ReservedAnnotation` represents a _reserved annotation_.
not supported by the implementations.
These are annotations that might be defined in the future version of the standars.
Current implementations should not use them in any way, only preserve them "as is".

The `sigil` corresponds to the starting sigil of the _annotation_, so that
it can be serialized back without loss of information.

The `reservedBody` is the "raw" value (i.e. escape sequences are not processed)
and does not include the starting `sigil`.

> **Note**
> Be aware that future versions of this specification
> might assign meaning to _reserved annotation_ `sigil` values.
> This would result in new interfaces being added to
> this data model.

When parsing the syntax of a _message_ that includes a _private-use annotation_
or _reserved annotation_ supported by the implementation,
the implementation SHOULD represent it in the data model
using an interface appropriate for the semantics and meaning
that the implementation attaches to that _annotation_.

## Identifiers

An `Identifier` is used to identify functions, options, attributes, markup,
and supporting namespaces to avoid conflict between various proprietary extensions. \
The exact naming convention for the namespaces is not yet specified.
But the empty namespace is reserved for the future extensions of the standard,
and for functions, options, markup that will be part of the standard registry.

```ts
interface Identifier {
  namespaces?: string[];
  name: string;
}
```

## Markup

A `Markup` object is either `MarkupOpen`, `MarkupStandalone`, or `MarkupClose`,
which are differentiated by `kind`.
The `name` in these does not include the starting sigils `#` and `/`
or the ending sigil `/`.
The optional `options` for open and standalone markup use the same `Option`
as `FunctionAnnotation`.

```ts
enum MarkupKind {
  Open,
  Close,
  Standalone,
}

interface Markup {
  type: "markup";
  kind: MarkupKind;
  identifier: Identifier;
  options?: Option[];
  attributes?: Attribute[];
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
