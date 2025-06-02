# Goals and Non-Goals

This document contains the DRAFT charter for the MessageFormat Working Group (MFWG),
which is subject to approval from the CLDR-TC,
and informs decisions about the scope and priority of its efforts.

## Charter

A **_dynamic message string_** is a string whose content changes due to the value of or insertion
of some data value or values.

The _Unicode MessageFormat Standard_ is an industry standard for the representation
of localizable _dynamic message strings_.

The MessageFormat Working Group maintains and extends the Unicode MessageFormat Standard,
provides documentation;
encourages implementation, including the development of tools and best practices;
manages default and Unicode-defined function sets;
and provides for interoperability with other standards.

The MessageFormat Working Group is a working group of the CLDR-TC.

## Goals

- Maintain and develop the [messageformat.unicode.org] site,
  maintaining a high bar (as a model for other Unicode documentation),
  including at least 
  a user guide,
  and a migration guide from other formats (including ICU MessageFormat).
- Encourage adoption of Unicode MessageFormat by:
  providing implementation support materials;
  creating tests;
  linking to success stories, tools, and implementations;
  supporting or hosting workshops or supporting presentations by members;
  and supporting adoption by encapsulating standards (such as ECMA-402, MessageResource, etc.)
- Support migration and adoption by publishing as Stable in the default function set
  the functions and options needed to provide compatibility with ICU MessageFormat ("MF1").
  Note that certain features of MF1 have been deliberately excluded from this goal
  because they are in conflict with the design goals of Unicode MessageFormat,
  because they are specialized features unique to MF1 (which ICU is free to implement),
  or because they might be superseded by newer specifications:
  - ChoiceFormat (an anti-pattern)
  - Date/time picture strings (an anti-pattern)
  - Date/time and number skeletons (potentially superseded by semantic skeletons)
  - Nested selection or partial message selection (an anti-pattern)
  - `spellout` and `duration` formats (specialized functionality)
  - `ordinal` _formatting_ (specialized functionality)
- Support migration and adoption by expanding the default function set to support
  additional use cases.
- Develop a machine-readable function description format or syntax to support the needs of
  implementations, including localization tools.
- Define a standard vocabulary for expression attributes and message properties/metadata,
  to enable better interoperation between translation tools and platforms.
- Incubate and support working groups or interest groups
  that promote adoption of Unicode MessageFormat,
  such as the proposed working group to develop a standard message resource format,
  i.e. a new file format for bundles or collections of messages.

## Deliverables (v48, v49, v50)

- Deliver as Stable all remaining functions needed to support migration from MF1
  - `:datetime` and all date/time functions
  - percent formatting
- Deliver at least as Technical Preview (v49) and Stable (v50) all draft functions and options
  - `:unit`
  - the `u:locale` option
- Deliver as Technical Preview additional functions to support significant additional functionality.
  Such functions could include: lists, ranges, relative time, inflection.
- Deliver as Technical Preview a machine-readable function description format or syntax.

## Design Goals

The original design goals are listed below.

1. Allow users to write messages that are both grammatically
   correct and can be translated in a grammatically correct manner
   to languages that have different requirements.
   For example, providing a mechanism that uses CLDR's plural rules
   to select between various strings to use based on a numeric input value.

3.  Express formattable data, such as numbers, dates, currencies, or units,
    in a locale-appropriate way.

4.  Represent structured data alongside translations, such as markup.

5.  Be capable of localization roundtrip.

6.  Enable the creation of implementations, frameworks and tools building on
    top of the standard, manifesting different ideas and programming paradigms,
    and optimized for different uses and audiences.

## Deliverables

The original deliverables were:

1.  A formal definition of the canonical data model for representing
    localizable _dynamic message strings_.

2.  A formal definition of the canonical syntax for representing the data
    model, with well defined rules for handling text, special characters,
    escape sequences, whitespace, markup, as well as parsing errors.

3.  A specification for a one-to-one mapping between the data model and XLIFF.
    _Note: This deliverable was not included in the LDMLv47 release._ 

4.  A specification for resolving messages at runtime, including
    runtime errors.

5.  A conformance test suite for parsing and formatting messages sufficient to
    ensure implementations can validate conformance to the specification(s) provided.

6.  A determination that there are at least two interoperable independent implementations
    compliant with the conformance test suite in order to demonstrate that the
    specification(s) are practical and meet requirements.

## Non-Goals

The following is a list of potential goals which are explicitly excluded from
the scope of the MFWG.

1.  Design a _general interchange format_ for storing and transferring
    translations. Instead, ensure compatibility with the existing interchange
    formats.

2.  Support _all grammatical features of all languages_. Instead, focus on
    features most commonly encountered in user interfaces, textual, graphical
    and spoken ones alike.

3.  Create an _automated engine_ capable of transforming parts of speech in
    a grammatically-correct fashion. Instead, allow interfacing with such
    automatic and non-automatic engines from within the data model.

4.  Build a _framework for localizing software_. Instead, design the standard
    as a building block to be used by third parties to create localization
    frameworks.
