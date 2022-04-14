# MessageFormat 2.0 Runtime Behavior

_Work in progress..._

## Values

The data model defines the following value types:

```ts
type Value = String | Variable;
```

### String

Strings always evaluate to their literal value. They require no additional formatting, but they may be _annotated_ with a formatting function. Matching on strings consists of making an equality comparison between two strings. Strings are also used to represent numerical data, in which case they need to be formatted with a function which will parse the numerical value out of the string.

### Variable

Variables are resolved eagerly and passed into functions as the data they refer to. Implementations must define default matching and formatting functions for input types that they accept.

## Alias Evaluation

Alias definitions are evaluated lazily, so that other expressions have access to the raw value as well as the function call data. In the following example, the `$percentage` alias is defined as call to the `number` function operating on the `$progressFloat` input variable.

    {$percentage = {$progressFloat: number style=percent}}

The implementation must allow other expressions to access the raw value of `$progressFloat`. For instance, `progressColor` must be able to access both the variable value as a float, the formatting function name associated with the `$percentage` alias, as well as the `{style: "percent"}` option map.

    [...{$percentage: progressColor}...]

## Variant Selection

The variants are matched against the selectors in order. Each variant key is matched against the corresponding selector. If all keys match, the variant is returned immediately. In pseudocode:

    for each variant in massage.variants:
        for each (index, key) in variant.keys:
            if key == "_":
                # The catch-all symbol always matches.
                # Proceed to the next key.
                continue inner loop
            let selector = message.selectors[index]
            if not selector.matches(key):
                # A single mismatch discards the variant.
                # Proceed to the next varint.
                continue outer loop

        # Return the first variant that matched on all keys.
        return variant

Valid messages must have at least one variant whose keys are all set to the catch-all `_` symbol. This guarantees that case selection always returns a variant.
