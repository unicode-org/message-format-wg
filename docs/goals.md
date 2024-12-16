# Goals and Non-Goals

This document defines the purpose of the Message Format Working Group (MFWG)
and informs the decisions about the scope and the priorities of its efforts.

## Goals

The primary task of the MFWG is to develop an industry standard for the
representation of localizable dynamic message strings. A **_dynamic message
string_** is a string whose content changes due to the value of or insertion
of some data value or values.

The design goals are listed below.

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

1.  A formal definition of the canonical data model for representing
    localizable _dynamic message strings_.

2.  A formal definition of the canonical syntax for representing the data
    model, with well defined rules for handling text, special characters,
    escape sequences, whitespace, markup, as well as parsing errors.

3.  A specification for a one-to-one mapping between the data model and XLIFF.
    _Note: This deliverable is not included in the LDML46.1 Final Candidate release._ 

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
