# MessageFormat 2.0 Data Model

This document defines the syntax-independent data model of a single message. The purpose of the data model is to represent the message in a manner suitable for interchange between localization tooling and workflows, with no loss of expressive power and content.

The data model defined here is not suitable for the parser-serializer roundtrip. Implementations should define their own mapping of the grammar to concrete and abstract syntax trees.

## Table of Contents

1. [Message](#message)
1. [Variants](#variants)
1. [Patterns](#patterns)
1. [Expressions](#expressions)
1. [Variables](#variables)
1. [Literals](#literals)

## Message

A _message_ is a container for a unit of translation. A unit of translation can be a single _pattern_, or can be defined as a set of _variants_ corresponding to a set of _selectors_.

```ts
interface Message {
	aliases: Map<string, Expression>;
	selectors: Array<Expression>;
	variants: Array<Variant>;
}
```

Even for the simple case of a single-variant translation, the single `Variant` is stored in an array. The runtime specification defines how the only variant is chosen in absence of selectors. This allows effortless conversion from a single-variant translation in the source language to a multi-variant translation in the target language (or _vice versa_), because it can be done without any changes to the message's structure.

The `Message.aliases` map stores locally-scoped variable bindings to `Expression`s. These aliases are available inside other expressions throughout the message's definition. The runtime specification defines the exact rules for resolving and evaluating them.

## Variants

A _variant_ is a container for a single _facet_ of the translation.

```ts
interface Variant {
	keys: Array<Literal>;
	pattern: Pattern;
}
```

Variants are keyed using one or more literals. The runtime specification defines how the variant's keys are matched against the message's _selectors_. It's valid for a variant to have zero keys, in which case it becomes the _default_ variant. A special occurence of this is a simple single-variant message with no selectors.

## Patterns

A _pattern_ is a sequence of _pattern elements_.

```ts
type Pattern = Array<PatternElement>;
type PatternElement = Text | Expression;
```

```ts
interface Text {
	value: string;
}
```

## Expressions

An _expression_ represents one of the following two data structures:

* An implicit or explicit formatting of a literal or a variable by means of a function invoked with a map of options (named arguments).
* A standalone call to a function with a map of options (named arguments).

```ts
type Expression = FormatCall | FunctionCall;
```

```ts
interface FormatCall {
	argument: Argument;
	function: null | string;
	options: Map<string, Argument>;
}
```

```ts
interface FunctionCall {
	function: string;
	options: Map<string, Argument>;
}
```

```ts
type Argument = Literal | Variable;
```

## Variables

```ts
interface Variable {
	name: string;
}
```

## Literals

```ts
type Literal = StringLiteral | NumberLiteral;

interface StringLiteral {
	value: string;
}

interface NumberLiteral {
	value: string;
}
```
