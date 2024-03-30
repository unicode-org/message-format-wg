# Blog Post for Technical Preview

# DRAFT DRAFT DRAFT

Unicode announced today the Technical Preview of MessageFormat 2,
a new standard for creating and managing user interface strings.
These messages can dynamically include data values formatted
(using information in the Common Locale Data Repository [CLDR])
according to the needs of the language and culture of the end user.
Such messages can be adjusted to meet the linguistic needs of each
language and are designed to be translated easily and efficiently.

Previously, software developers had to choose between many different
APIs and templating languages to build user interface string.
These solutions did not always provide for the features of different
human languages, were not widely supported by translation tools,
and were not extensible as new internationalization-aware APIs were developed.

MessageFormat 2 provides built-in support for the most basic formatting,
plus is designed to be extended by specific programming languages and
operating environments.
In addition, users can create their own functions.

In addition to a syntax for messages,
the Technical Preview includes a default registry of functions,
a mechanism for creating additional function descriptions for general use,
a data model for interchange of messages with previoius standards,
and a test suite.

The Technical Preview period is expected to last until the LDML46 release,
in the fall of 2024.
Feedback about implementation experience,
syntax,
functionality,
or other parts of the specification is welcome!
