# The Third Data Model Proposal

## Summary

The proposed data model is a compromise between the EM and the EZ model. In particular:

- Refactor the data model of placeholders in the EM model and introduce explicit variable references — this brings it closer to EZ and allows one-level-deep indirection via `FUNC($var)`.
- Drop nested function calls from the EZ model — and recommend that the complexity should instead be handled by programmers inside custom functions' implementation.

## Model Differences

Based on [Data & Execution Model Differences](https://github.com/unicode-org/message-format-wg/wiki/Data-&-Execution-Model-Differences).

### Structural Depth

Limited by design. The longest structural path that a message may contain is: `Message.phrases[]` → `Phrase.variants[]` → `Variant.value` (`Part[]`) → `FunctionCall.args[]` → `VariableReference.name`.

### Message References

No built-in support. However:

- Glossaries of shared terms can be implemented through custom functions. See [`example_glossary.ts`](https://github.com/unicode-org/message-format-wg/blob/experiments/experiments/stasm/third/example/example_glossary.ts).
- The problem of variant explosion is solved by introducing _phrases_ — sub-messages stored inside the message referencing them. See [`example_phrases.ts`](https://github.com/unicode-org/message-format-wg/blob/experiments/experiments/stasm/third/example/example_phrases.ts).

### Runtime Variable References

Fully supported, first-class citizens of the data model. Can be used as placeholders (when they're interpolated into the surrounding text) or as arguments and options in function calls.

### Formatting Function Dependencies

See [`impl/registry.ts`](https://github.com/unicode-org/message-format-wg/blob/experiments/experiments/stasm/third/impl/registry.ts).

```ts
interface FormattingContext {
	locale: string;
	message: Message;
	vars: Record<string, RuntimeValue<unknown>>;
	visited: WeakSet<Array<Part>>;
	// TODO: expose cached formatters, etc.
}

interface RegistryFunc<T> {
	(ctx: FormattingContext, args: Array<Argument>, opts: Record<string, Parameter>): RuntimeValue<T>
}
```

### Formatting Function Trust

High. They must have access to everything that might be required to do any message formatting, including all runtime values.

### Static Code Analysis

Easy. Variable references are first-class citizens of the data model, making it easy to query and validate them statically. The signatures of custom functions in the registry should also be introspectable, but this hasn't been implemented yet.

## Related Discussion

- Dropping function composition
    - [#188 Placeholders and Function Calls](https://github.com/unicode-org/message-format-wg/discussions/188)
    - [The Third Data Model](https://docs.google.com/presentation/d/1pex8lEIQ0dFs72ATxva0IprIP6xLe14Sop2Oy4xPXFo/edit?usp=sharing) (slides)

- Restricting message references and introducing phrases
    - [#149 Restricting message references](https://github.com/unicode-org/message-format-wg/discussions/149)

## How to Run

Run all examples:

    npm start

Run each example individually:

    npm run example glossary
    npm run example phrases
    npm run example list
    npm run example number
    npm run example opaque

## References

- [#181 The Data Model Q&A](https://github.com/unicode-org/message-format-wg/discussions/181) (thread)

- [Data & Execution Model Differences](https://github.com/unicode-org/message-format-wg/wiki/Data-&-Execution-Model-Differences) (wiki)

- [Data Model Questions](https://docs.google.com/presentation/d/153q1UcCgfTQBJEZpxQiRbqYLrU8clkxmRvCJVC2BQTU/edit#slide=id.gdfd5b6784c_0_80) (slides)

- [Data Model Questions](https://docs.google.com/document/d/1kVXGMfwNKwU8QiUvUKReGapUAOhwZYaWJUAI3NW06UA/edit) (doc)
