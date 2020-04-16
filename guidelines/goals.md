# Goals and Non-Goals

## Goals

The goals define the purpose of the Message Format Working Group (MFWG) and
inform the decisions about the scope and the priorities of its efforts.

### Data model for defining translations

  - Create a description of a data model representing translation units
    (_messages_). The data model will be agnostic with respect to the file
    format and the programming environment.

  - Design the data model for representing collections of translation
    units (_resources_).

  - Make it possible to express complex grammatical features, such as plurals,
    genders, and inflections, catalogued in the CLDR.

  - Make it possible to express other variance in translation, due to
    other linguistic and regional features not listed in the CLDR, as well as
    due to the presentation media, context, circumstance, and other factors.

### Canonical syntax representing the data model

  - Design the canonical text representation of the data model, with well
    defined rules for handling text, special characters, escape sequences,
    whitespace, and markup.

  - Define parsing errors and the requirements for how to handle them.

  - Allow other representations of the data model, optimized for other uses and
    audiences, to coexist with the canonical syntax.

### Compatibility with the localization industry practices

  - Ensure that the data model is interoperable with existing interchange
    formats. In particular, specify how to losslessly convert translations to
    and from XLIFF.

  - Ensure that the data model allows the use of machine translation and
    translation memory solutions for authoring translations.

### Runtime interpolation and formatting

  - Specify the steps involved in resolving translations at runtime to allow
    their use in building localized experiences for users.

  - Define the data types which can be interpolated in translations, and
    specify how they're interpolated. Define the error scenarios and error
    handling.

  - Enable a wide range of user space solutions building on top of the data
    model and the runtime specification, manifesting different ideas and
    programming paradigms.


## Non-Goals

The following is a list of potential goals which are explicitly excluded from
the scope of the MFWG.

  - Design a __general interchange format__ for storing and transferring
    translations. 

  - Support __all grammatical features of all languages__.

  - Create an __automated engine__ capable of transforming parts of speech in
    a grammatically-correct fashion.

  - Create optimized and efficient __implementations of the standard__.

  - Build a __framework for localizing software__.
