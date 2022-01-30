# MessageFormat 2.0 Data Model

This document defines the syntax-independent data model of a single message. The purpose of the data model is to represent the message in a manner suitable for interchange between localization tooling and workflows, with no loss of expressive power and content.

The data model defined here is not suitable for the parser-serializer roundtrip. Implementations should define their own mapping of the grammar to concrete and abstract syntax trees.

## Table of Contents

1. [Interfaces](#interfaces)
    1. [Message](#message)
    1. [Variants](#variants)
    1. [Patterns](#patterns)
    1. [Expressions](#expressions)
    1. [Values](#values)
1. [Examples](#examples)

## Interfaces

### Message

A _message_ is a container for a unit of translation.

```ts
interface Message {
    aliases: Map<string, Alias>;
    selectors: Array<Expression>;
    variants: Array<Variant>;
}

type Alias = Expression | Phrase;
```

Even for the simple case of a single-pattern translation, a single `Variant` is stored in an array. The runtime specification defines how the only variant is chosen in absence of selectors and variant keys. This allows effortless conversion from a single-variant translation in the source language to a multi-variant translation in the target language (or _vice versa_), because it can be done without any changes to the message's structure.

The `Message.aliases` map stores locally-scoped variable bindings to `Expression`s or `Phrase`s. These aliases are available inside other expressions throughout the message's definition. The runtime specification defines the exact rules for resolving and evaluating them.

### Phrases

The _phrase_ type represents a translatable message fragment bound to an _alias_, available to be referenced in expressions throught the message's definition.

```ts
interface Phrase {
    selectors: Array<Expression>;
    variants: Array<Variant>;
}
```

Phrases are a powerful feature which should be used sparingly to declutter very complex messages. With phrases, it becomes possible to factor out fragments of the translation into aliases, combatting combinatorial explosion of variants at the cost of introducing locally-scoped indirection.

The benefit of phrases over custom functions implementing message referencing is that phrases are part of the message's definition. This results in:

* better portability, because a message always travels with its required phrases,
* better integrity, because a message doesn't have to depend on external messages,
* better introspection, because tooling can always access the definitions of phrases,
* better isolation, because other messages cannot accidentally or on purpose refer to phrases, which would create implicit dependencies.

### Variants

A _variant_ is a container for a single _facet_ of the translation.

```ts
interface Variant {
    keys: Array<String | Number>;
    pattern: Pattern;
}
```

Variants are keyed using zero or more strings. The runtime specification defines how the variant's keys are matched against the message's _selectors_. It's valid for a variant to have zero keys, in which case it becomes the _default_ variant. A message with a single key-less variant will always select it during formatting.

### Patterns

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

### Expressions

The _expression_ type represents one of the following two concepts:

* An implicit or explicit formatting of a literal or a variable by means of a function invoked with a map of options (named arguments).
* A standalone call to a function with a map of options (named arguments).

```ts
type Expression = ValueExpression | FunctionExpression;
```

```ts
interface ValueExpression {
    operand: Value;
    function: null | FunctionExpression;
}
```

```ts
interface FunctionExpression {
    name: string;
    options: Map<string, Value>;
}
```

### Values

The following types can be used in value positions, i.e as expression operands and option values.

```ts
type Value = Variable | String | Number;
```

The _variable_ type represents a reference to a value provided by the callsite at runtime, or a reference to an alias defined in the current message.

```ts
interface Variable {
    name: string;
}
```

The _string_ type represents a literal string.

```ts
interface String {
    value: string;
}

The _number_ type represents a numerical value stored as a string for portability together with the number of fractional digits parsed from the number literal.

```ts
interface Number {
    value: string;
    precision: number;
}
```

## Examples

<table>
<tr>
<th>Syntax</th>
<th>Data Model</th>
</tr>

<tr>
<td>

    [Hello, {$username}!]

</td>
<td>

    Message {
        aliases: [],
        selectors: [],
        variants: [
            Variant {
                keys: [],
                pattern: Pattern [
                    Text {
                        value: "Hello, world!"
                    },
                    ValueExpression {
                        operand: Variable {
                            name: "username"
                        },
                        function: null
                    },
                ]
            },
        ]
    }

</td>
</tr>

<tr>
<td>

    {$count plural}?
        1 [One apple]
        other [{$count} apples]

</td>
<td>

    Message {
        aliases: [],
        selectors: [
            ValueExpression {
                operand: Variable {
                    name: "count"
                },
                function: FunctionExpression {
                    name: "plural",
                    options: Map {}
                }
            },
        ],
        variants: [
            Variant {
                keys: [
                    Number {
                        value: "1",
                        precision: 0
                    },
                ],
                pattern: Pattern [
                    Text {
                        value: "One apple"
                    },
                ]
            },
            Variant {
                keys: [
                    String {
                        value: "other"
                    },
                ],
                pattern: Pattern [
                    ValueExpression {
                        operand: Variable {
                            name: "count"
                        },
                        function: null
                    },
                    Text {
                        value: " apples"
                    },
                ]
            }
        ]
    }

</tr>
</table>
