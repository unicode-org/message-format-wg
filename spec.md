# PROPOSED DRAFT: The MessageFormat 2.0 Specification

This document is the incomplete working draft of the MF2 specification.
It _will_ experience breaking changes,
and should not be depended on by anyone for anything.
For now, there isn't even an expectation for various parts of the spec
to be in agreement with each other.

---

## Contents

The body of the specification is split into the following documents:

- [META](./spec-meta.md) - How to contribute changes
- [Syntax](./spec-syntax.md) - A human-friendly syntax for MessageFormat
- [Data Model](./spec-data-model.md) - The data model for representing messages and message resources
- [Formatting Behaviour](./spec-formatting.md) - The expected behaviour of a message formatter
- [Message Selection](./spec-message-selection.md) - The detailed behaviour of message selection, for MessageRef resolution

Supporting files include:

- [data-model.ts](./data-model.ts) - A standalone TypeScript definition of the data model
- [syntax.ebnf](./syntax.ebnf) - An EBNF formulation of the syntax

## Introduction

> _Why this thing exists, what it's trying to be, and what it's not._

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
