# MessageFormat 2.0 Data Model

This document defines the syntax-independent data model of a single message. The purpose of the data model is to represent the message in a manner suitable for interchange between localization tooling and workflows, with no loss of expressive power and content.

The data model defined here is not suitable for the parser-serializer roundtrip. Implementations should define their own mapping of the grammar to concrete and abstract syntax trees.


## Message

```ts
interface Message {
	aliases: Map<string, Expression>;
	selectors: Array<Expression>;
	variants: Array<Variant>;
}
```

## Variants

```ts
interface Variant {
	keys: Array<Literal>;
	pattern: Pattern;
}
```

## Patterns

```ts
type Pattern = Array<Text | Expression>;
```

```ts
interface Text {
	value: string;
}
```

## Expressions

```ts
type Expression = FormatCall | FunctionCall;
```

```ts
interface FormatCall {
	argument: Literal | Variable
	function: string;
	options: Record<string, Argument>;
}
```

```ts
interface FunctionCall {
	function: string;
	options: Record<string, Argument>;
}
```

```ts
type Argument = Literal | Variable;
```

## Other

```ts
interface Variable {
	name: string;
}
```

```ts
type Literal = StringLiteral | NumberLiteral;

interface StringLiteral {
	value: string;
}

interface NumberLiteral {
	value: string;
}
```
