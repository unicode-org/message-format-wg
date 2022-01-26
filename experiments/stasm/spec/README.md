# MessageFormat 2.0

The following is the work-in-progress MessageFormat 2.0 specification proposal developed for the [Message Format Working Group](https://github.com/unicode-org/message-format-wg).

## Specifications

* [Data Model](./model.md) - The representation of a single message suitable for runtime evaluation, transport, and interchange.
* [Syntax](./syntax.md) - The formal grammar defining a DSL for representing a single translatable message.
* Runtime - The definition of the runtime behavior during formatting of a single message.
* Registry - The definition of the global store of formatting function signatures, variable types, etc. which are available to messages at runtime. These declarations can be used by tooling to type-check and lint messages at authoring time or buildtime.
