# MessageFormat 2.0

The following is the work-in-progress MessageFormat 2.0 specification proposal developed for the [Message Format Working Group](https://github.com/unicode-org/message-format-wg).

## Motivation

The ambition of this proposal is to create a **maximally minimal** message formatting specification. The proposal attempts this by moving a large part of the complexity resulting from grammatical features of natural languages and the runtime requirements of the user to the implementation of custom functions, as well as to sources of data agnostic and external to the translation.

The grammar, the data model, and the runtime behavior are intentionally designed to be as simple as possible. Whenever there is an opportunity to re-use an existing concept, syntax or interface — without introducing ambiguity or compromising expressiveness — this proposal does so. The author hopes that this proposal can inform the decisions of the Message Format Working Group by defining the **lower bound of the spectrum of design complexity**.

## Design Principles

The design of this proposal was informed by the Message Format Working Group's [Goals and Non-Goals](https://github.com/unicode-org/message-format-wg/blob/main/guidelines/goals.md). Additionally, the proposal is centered around the following design principles, largely influenced by [The Rule of Least Power](https://www.w3.org/2001/tag/doc/leastPower.html):

* **Compatibility** - In order to increase the chance of adoption, MessageFormat 2.0 should require little modification of existing localization workflows and tooling in order to be supported by them.

    The design presented in this proposal is intentionally similar to ICU MessageFormat 1.0 (e.g. the proposal focuses on the message rather than the container format) and the good practices that have emerged around it (e.g. top-level case selection).

    Furthermore, the proposed syntax is intentionally based on some symbols defined in the XML grammar for best interoperability with LDML and CLDR.

* **Embeddability** - MessageFormat 2.0 translations should be agnostic with regards to how and where they're defined and stored.

    The main consequence of this tenet is, same as above, this proposal's focus on the message rather then the container. It should be easy and possible to embed messages in common container formats, store them in databases as individual records, and even inline them inside code.

    This also is the main reason why this proposal doesn't feature a built-in manner of referencing messages from other messages, and instead suggests that users who require message references implement them by means of custom functions. For message references to be a meaningful part of the specification, the design would need to be opinionated about where messages are stored and how they're retrieved.

* **Predictability** - The translation content inside message should be easy to reason about. The control flow inside messages should be predictable. MessageFormat 2.0 should be intentionally designed to not be a full programming language.

## Specifications

* [Data Model](./model.md) - The representation of a single message suitable for runtime evaluation, transport, and interchange.
* [Syntax](./syntax.md) - The formal grammar defining a DSL for representing a single translatable message.
* Runtime - The definition of the runtime behavior during formatting of a single message.
* [Registry](./registry.md) - The definition of the global store of formatting function signatures, variable types, etc. which are available to messages at runtime. These declarations can be used by tooling to type-check and lint messages at authoring time or buildtime.
