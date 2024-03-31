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




The goal is to allow developers and translators to create natural-sounding, grammatically-correct,
user interfaces that can appear in any language and support the needs of diverse cultures.

## MessageFormat 2 Specification and Syntax

MessageFormat 2 messages can be simple strings:

    Hello, world!

A message can also include _placeholders_ that are replaced by user-provided values:

    Hello {$user}!

The user-provided values can be transformed or formatted using functions:

    Today is {$date :datetime}
    Today is {$date :datetime weekday=long}.

Messages can use a function (called a _selector_) to choose between different
different versions of a message.
These allow messages to be tailored to the grammatical (or other) requirements of 
a given language:

    .match {$count :integer}
    0   {{You have no notifications.}}
    one {{You have {$count} notification.}}
    *   {{You have {$count} notifications.}}

The syntax also allows user to provide formatting instructions
or assign local values for use in the formatted message:

    .input {$date :datetime weekday=long month=medium day=short}
    .local $numPigs = {$pigs :integer}
    {{On {$date} you had this many pigs: {$numPigs}}}

Unlike previous versions of MessageFormat, MessageFormat 2 is designed for
extension by implementers and even end users.
This means that new functionality can be added to messages without modifying
either existing messages or, in some cases, even the core library containing the 
MessageFormat 2 code.

The message syntax supports using multiple _selectors_ and other features
to build complex messages.
It is designed so that implementations can extend the set of functions or their options
using the same syntax. 
Implementations may even support users creating their own functions.
