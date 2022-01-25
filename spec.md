# Unicode MessageFormat 2.0
##### Unofficial Proposal Draft, January 2022
---

## Abstract

The following is an incomplete working draft of the Unicode MessageFormat 2 specification.

MessageFormat 2.0 is a localization system designed to be integrated into a variety of user interface systems (graphical, textual, voice, ambient etc.) providing a comperhensive solution for localization of the interface.

The system is composed of:
* Data - potentially encoded in one or more syntaxes
* Resolution Logic - describes extensible behavior and integration with other I18n APIs
* API - allows for direct formatting as well as binding the system as an input to UI frameworks.

Together, the system provides complete solution to localization of user interfaces in line with best practices of the Unicode project and well integrated into other Unicode components.

## Contents

The body of the specification is split into the following documents:

- [Meta](./spec-meta.md) - How to contribute changes
- [Syntax](./spec-syntax.md) - A human-friendly syntax for MessageFormat
- [Data Model](./spec-data-model.md) - The data model for representing messages and message resources
- [Formatting Behaviour](./spec-formatting.md) - The expected behaviour of a message formatter
- [Message Selection](./spec-message-selection.md) - The detailed behaviour of message selection, for MessageRef resolution

Supporting files include:

- [data-model.ts](./data-model.ts) - A standalone TypeScript definition of the data model
- [syntax.ebnf](./syntax.ebnf) - An EBNF formulation of the syntax

## Introduction

User interfaces provide rich and diverse set of primitives for human-computer interactions (HCI). Enabling UIs to be adaptable to all languages and cultures requires a large and neuanced set of features designed to enable whole spectrum of cultural expressions.

The goal of the localization system is to abstract the complexity and minimize the burden placed on the developers and developer experience, while enabling localizers to adapt the UIs to their language and culture.

MessageFormat 2.0 builds on top of Unicode and ICU projects leveraging wide range of internationalization components such as plural rules, date, time, list and number formatting, CLDR and bi-directionality techniques.

The output of the API may be either a stand-alone complete string, or a rich structured data to be composed by the UI framework into localized user interface.

### Terminology

### Goals

### Non-goals

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
