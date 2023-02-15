# MessageFormat 2.0 Specification

## Table of Contents

1. [Introduction](#introduction)
   1. [Conformance](#conformance)
   1. [Terminology and Conventions](#terminology-and-conventions)
   1. [Design Goals](#design-goals)
   1. [Design Restrictions](#design-restrictions)
1. [Syntax](spec.md)
   1. [Overview & Examples](spec.md#overview--examples)
   1. [Simple Messages](spec.md#simple-messages)
   1. [Simple Placeholders](spec.md#simple-placeholders)
   1. [Formatting Functions](spec.md#formatting-functions)
   1. [Markup Elements](spec.md#markup-elements)
   1. [Selection](spec.md#selection)
   1. [Local Variables](spec.md#local-variables)
   1. [Complex Messages](spec.md#complex-messages)
1. [Productions](spec.md#productions)
   1. [Message](spec.md#message)
   1. [Variable Declarations](spec.md#variable-declarations)
   1. [Selectors](spec.md#selectors)
   1. [Variants](spec.md#variants)
   1. [Patterns](spec.md#patterns)
   1. [Placeholders](spec.md#placeholders)
   1. [Expressions](spec.md#expressions)
   1. [Markup Elements](spec.md#markup-elements)
1. [Tokens](spec.md#tokens)
   1. [Text](spec.md#text)
   1. [Names](spec.md#names)
   1. [Quoted Strings](spec.md#quoted-strings)
   1. [Escape Sequences](spec.md#escape-sequences)
   1. [Whitespace](spec.md#whitespace)
1. [Complete EBNF](spec.md#complete-ebnf)
1. [Formatting](formatting.md)

## Introduction

This document defines the formal grammar describing the syntax of a single message.
A separate syntax shall be specified to describe collections of messages (_MessageResources_),
including message identifiers, metadata, comments, groups, etc.

The document is part of the MessageFormat 2.0 specification,
the successor to ICU MessageFormat, henceforth called ICU MessageFormat 1.0.

### Conformance

Everything in this specification is normative except for: sections marked 
as non-normative, all authoring guidelines, diagrams, examples, and notes.

The key words `MAY`, `MUST`, `MUST NOT`, `OPTIONAL`, `RECOMMENDED`, 
`SHOULD`, and `SHOULD NOT` in this document are to be interpreted as 
described in BCP 14 [RFC2119] [RFC8174]. 

### Terminology and Conventions

When a term is defined in this document, it is marked like ***this***. When
a term is referenced in this document it is marked like _this_.
