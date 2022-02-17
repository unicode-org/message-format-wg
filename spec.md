# Unicode MessageFormat 2.0

##### Unofficial Proposal Draft, January 2022

- Champions:
  - Eemeli Aro (Mozilla / OpenJS Foundation)
  - Zibi Braniecki (Unicode)
- Contributors:
  - Staś Małolepszy (Google)
  - Erik Nordin (Mozilla)

---

## Abstract

The following is an incomplete working draft of the Unicode MessageFormat 2.0 specification.

MessageFormat 2.0 (aka “MF2”) is a localization system designed to be integrated into a variety of user interface systems
(graphical, textual, voice, ambient etc.)
providing a comperhensive solution for localization of the interface.

The system is composed of:

- Data - potentially encoded in one or more syntaxes
- Resolution Logic - describes extensible behavior and integration with other I18n APIs
- API - allows for direct formatting as well as binding the system as an input to UI frameworks.

Together, the system provides a complete solution to user interface localization
in line with the best practices of the Unicode project and well integrated into other Unicode components.

## Contents

The body of the specification is split into the following sections:

- [Syntax](./spec-syntax.md) - A human-friendly syntax for MessageFormat
- [Data Model](./spec-data-model.md) - The data model for representing messages and message resources
- [Formatting Behaviour](./spec-formatting.md) - The expected behaviour of a message formatter

Supporting files and documents:

- [Meta](./spec-meta.md) - How to contribute changes into this specification
- [data-model.ts](./data-model.ts) - A standalone TypeScript definition of the data model
- [syntax.ebnf](./syntax.ebnf) - An EBNF formulation of the syntax

Supporting external materials:

- Document: [Message Pattern Elements](https://docs.google.com/document/d/1f9He3gTjKp0vrg7XMfTfm1t68lfIruWcboGs2H4Szo4/edit?usp=sharing) -
  Lays out the foundations of pattern elements, as used in the specification
- Document: [Runtime Behaviour](https://docs.google.com/document/d/1lCSg7H_Nz20_LITon3g12Iq5KtE9cxXTg58zyLeW3gw/edit?usp=sharing) -
  More detailed exploration of what is actually required and possible when formatting messages
- [Intl.MessageFormat proposal](https://github.com/dminor/proposal-intl-messageformat/) -
  For eventual presentation and consideration as an ECMA-402 stage-1 proposal
- [JavaScript implementation](https://github.com/messageformat/messageformat/tree/master/packages/mf2-messageformat) -
  A polyfill implementation of the proposed `Intl.MessageFormat`, along with MF2 parsers for ICU MessageFormat and Fluent syntaxes
- [DOM Localization proposal](https://nordzilla.github.io/dom-l10n-draft-spec/) -
  A "collection of interesting ideas" towards an eventual proposal for a web standard for DOM localization

## Introduction

User interfaces provide a rich and diverse set of primitives for human-computer interactions (HCI).
Enabling UIs to be adaptable to all languages and cultures requires
a large and nuanced set of features designed to enable the whole spectrum of cultural expressions.

The goal of the localization system is to abstract the complexity and
minimize the burden placed on the developers and developer experience,
while enabling localizers to adapt the UIs to their language and culture.

MessageFormat 2.0 builds on top of Unicode and ICU projects
leveraging a wide range of internationalization components
such as plural rules, date, time, list and number formatting, CLDR and bi-directionality techniques.

The output of the message formatting API may either be a stand-alone complete string,
or rich structured data to be composed by the UI framework into localized user interface.

### Terminology

- `Message` - Single, complete, stringifiable, message to be communicated (visually, audibly etc.) to the user
- `Message Pattern` - A sequence of parts that make up the body of a message.
  A select message has a separate pattern for each of its cases.
- `Message Pattern Element` - In the data model, one part of a message
- `Placeholder` - Pattern element which contains resolvable logic (variable, message reference etc.)
- `Literal` - Pattern element which contains a hardcoded string
- `Variable` - Value passed from the runtime context to the message to be used in message resolution
- `Message Reference` - Reference of one message from within another
- `Dynamic Message Reference` - Composable system which uses dynamically provided information (variable)
  to select a message or term to be indluded in another
- `Function` - Processing entity which takes resolved arguments and options as input and,
  potentially using contextual information, returns an output to be used in message formatting
- `Resolution` - The act of combining values, formatting options and contextual information such as the locale
  to produce a single formattable representation thereof.
- `Formattable` - A value or object that contains sufficient information (e.g. locale, formatting options)
  for formatting it in one or more output shapes.
- `Partially Resolved Variable` - A combination of a variable with formatting options
  that the developer may provide to the message resolution.
  A partially resolved variable may be formattable.
- `Message Group` - Set of messages which are semantically related to one aspect of a user interface
- `Message Resource` - A group of messages and message groups which are stored together.
- `Comment` - Free flowing textual content that can be attached to any part of the message or resource.
  May contain meta information intended solely for non-formatting purposes such as translation.
- `Meta` - Semantic information attached to messages or resources
  that can be used by the localization tooling (screenshot, role of the message etc.)
  or by runtime user interface toolkit (emphasis and tone information for voice assistant etc.)

### Goals

- Provide generic composable localization system to supplement Unicode and Web needs
- Build on top of Unicode, ICU and CLDR solutions
- Enable the system to be easy to integrate into rich user interface toolkits (graphical, voice operated and ambient)
- Enable extensibility and customizability of the system for the needs of different software projects and organizations
- Provide rich capabilities for developing high quality CAT tools and analytical tools for software release and maintenance
- Ensure high quality error fallbacking models to provide degradable user experience in error cases

### Non-goals

- Supply all possible linguistic features via algorithmic solution

## Conformance

The MessageFormat specification describes a syntax, a data model,
the behaviour of a formatting runtime, and
an XLIFF 2 representation for messages and message resources.
It is expected that a system, library or other tool interacting with MessageFormat
will be making use of some subset of these interfaces and processes.
To that end, conformance is defined separately for various roles:

- A **resource parser** is conformant with this specification if it can
  read a string representation of a message resource
  and produce a corresponding data model.

- A **single-message parser** is conformant with this specification if it can
  read a string representation of a single message
  and produce a corresponding data model.

- A **formatter** is conformant with this specification if it can
  accept the data model of one or more message resources,
  along with any necessary formatting context inputs,
  and produce formatted output in one or more formatting targets.

- A **single-messsage formatter** is conformant with this specification if it can
  accept the data model of a single message,
  along with any necessary formatting context inputs,
  and produce formatted output in one or more formatting targets.
  A single-message formatter MAY use only the fallback representation
  when formatting any MessageRef pattern elements.

- A **resource syntax serialiser** is conformant with this specification if it can
  take as input the data model representation of a message resource,
  and produce a valid string representation of the same.

- A **single-message syntax serialiser** is conformant with this specification if it can
  take as input the data model representation of a single message,
  and produce a valid string representation of the same.

- An **XLIFF processor** is conformant with this specification if it can
  convert both ways between the data model and XLIFF 2 representations of
  a message resource, merging and separating source and target language content as necessary.
