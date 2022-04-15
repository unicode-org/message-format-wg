# MessageFormat 2.0 Data Model

This document defines the syntax-independent data model of a single message. The purpose of the data model is to represent the message in a manner suitable for interchange between localization tooling and workflows, with no loss of expressive power and content.

The data model defined here is not suitable for the parser-serializer roundtrip. Implementations should define their own mapping of the grammar to concrete and abstract syntax trees.

## Table of Contents

1. [Interfaces](#interfaces)
    1. [Message](#message)
    1. [Selector](#selector)
    1. [Variant](#variant)
    1. [Pattern](#pattern)
    1. [Expression](#expression)
    1. [MarkupElement](#markupelement)
    1. [Value](#value)
1. [Examples](#examples)

## Interfaces

### Message

A _message_ is a container for a unit of translation.

```ts
interface Message {
    comment: string;
    selectors: Array<Selector>;
    variants: Array<Variant>;
}
```

Even for the simple case of a single-pattern translation, a single `Variant` is stored in an array. The runtime specification defines how the only variant is chosen in absence of selectors and variant keys. This allows effortless conversion from a single-variant translation in the source language to a multi-variant translation in the target language (or _vice versa_), because it can be done without any changes to the message's structure.

### Selector

A selector is an expression used to choose the appropriate variant from the message's list of variants. Selectors can be optionally bound to local variables, which are then available inside other expressions throughout the message's definition. The runtime specification defines the exact rules for resolving and evaluating them.

```ts
interface Selector {
    comment: null | string;
    name: null | string;
    value: Expression;
}
```

### Variant

A _variant_ is a container for a single _facet_ of the translation.

```ts
interface Variant {
    keys: Array<String>;
    pattern: Pattern;
}
```

Variants are keyed using zero or more strings. The runtime specification defines how the variant's keys are matched against the message's _selectors_. It's valid for a variant to have zero keys, in which case it becomes the _default_ variant. A message with a single key-less variant will always select it during formatting.

### Pattern

A _pattern_ is a sequence of _pattern elements_.

```ts
type Pattern = Array<PatternElement>;
type PatternElement = Text | Expression | MarkupElement;
```

```ts
interface Text {
    value: string;
}
```

### Expression

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

### MarkupElement

Markup elements are placeables which can (but do not have to) be matched by their name in open-close pairs. They do not accept positional arguments, and key-value options are allowed only on the opening element. There are no guarantees about the well-formedness of pairs of elements.

```ts
type MarkupElement = StartElement | EndElement;
```

```ts
interface StartElement {
    name: string;
    options: Map<string, Value>;
}
```

```ts
interface EndElement {
    name: string;
}
```

### Value

The following types can be used in value positions, i.e as expression operands and option values.

```ts
type Value = Variable | String;
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
        comment: "",
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

    {{$count: plural}}
        1 [One apple]
        other [{$count} apples]

</td>
<td>

    Message {
        comment: "",
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
                    String {
                        value: "1",
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
