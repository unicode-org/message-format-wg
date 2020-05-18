# Goals and Non-Goals

This document defines the purpose of the Message Format Working Group (MFWG)
and informs the decisions about the scope and the priorities of its efforts.

## Goals

The primary task of the MFWG is to develop an industry standard for the
representation of localizable message strings. The design goals are listed
below.

 1. Express grammatical features, such as plurals, genders, and inflections.

 2. Express other variance in translation, due to linguistic and regional
    features, the presentation media, context, circumstance, and other factors.

 3. Represent structured data alongside translations, such as markup, comments,
    and metadata.

 4. Ensure interoperability with existing interchange formats, in particular
    with XLIFF.

 5. Ensure that the standard can integrate with existing TMS and CAT
    toolchains.

 6. Enable a wide range of user space solutions building on top of the
    standard, manifesting different ideas and programming paradigms, and
    optimized for different uses and audiences.


## Deliverables

 1. A formal definition of the canonical data model for representing
    localizable message strings.

 2. A formal definition of the canonical syntax for representing the data
    model, with well defined rules for handling text, special characters,
    escape sequences, whitespace, markup, as well as parsing errors.

 3. A specification for lossless conversion between the data model and XLIFF.

 4. A specification for resolving translations at runtime, including
    interpolated data types and runtime errors.


## Non-Goals

The following is a list of potential goals which are explicitly excluded from
the scope of the MFWG.

 1. Design a _general interchange format_ for storing and transferring
    translations. Instead, ensure compatibility with the existing interchange
    formats.

 2. Support _all grammatical features of all languages_. Instead, focus on
    features most commonly encountered in user interfaces, textual, graphical
    and spoken ones alike.

 3. Create an _automated engine_ capable of transforming parts of speech in
    a grammatically-correct fashion. Instead, allow interfacing with such
    automatic and non-automatic engines from within the data model.

 4. Create optimized and efficient _implementations of the standard_.  Instead,
    create specifications, compliance test suites, recommendations and good
    practices to support implementors.

 5. Build a _framework for localizing software_. Instead, design the standard
    as a building block to be used by third parties to create localization
    frameworks.
