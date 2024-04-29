# Blog Post for Technical Preview

Today, Unicode announced the Technical Preview of MessageFormat 2,
a new standard for creating and managing user interface strings.
These messages can dynamically include data values formatted
(using information in the Common Locale Data Repository [CLDR])
according to the needs of the language and culture of the end user.
Such messages can be adjusted to meet the linguistic needs of each
language and are designed to be translated easily and efficiently.

Previously, software developers had to choose between many different
APIs and templating languages to build user interface strings.
These solutions did not always provide for the features of different
human languages. Support was limited to specific platforms
and these formats were not widely supported by translation tools,
making translation and adaptation to specific cultures costly
and time consuming.
Most significantly, message formatting was limited to a small
number of built-in formats.

One of the challenges in adapting software to work for
users with different languages and cultures is the need for **_dynamic messages_**.
Whenever a user interface needs to present data as part of a larger message,
that data needs to be formatted. 
In many languages, including English, the message itself needs to be altered
to make it grammatically correct.

For example, if a message in English might read:

> Your item had **1,023** views on **April 8, 2024**.

The equivalent message in French might read:

> Votre article a eu **1 023** vues le **8 avril 2024**.

Or Japanese:

> あなたのアイテムは **2024 年 4 月 8 日**に **1,023** 回閲覧されました。

But even in English, there are grammatical variations required:

> Your item had _no views_...
> 
> Your item had 1 _view_...
> 
> Your item had 1,043 _views_...

Once messages have been created, they need to be translated into the various
languages and adapted for the various cultures around the world.
Previously, there was no widely adopted standard,
and existing formats provided only rudimentary support for managing
the variations needed by other languages.
Thus, it could be difficult for translators to do their work effectively.

For example, the same message shown above needs a different set of variations
in order to support Polish:

> Twój przedmiot nie _ma_ żadnych _wyświetleń_.
> 
> Twój przedmiot _miał_ 1 _wyświetlenie_.
> 
> Twój przedmiot _miał_ 2 _wyświetlenia_.
> 
> Twój przedmiot _ma_ 5 _wyświetleń_.


MessageFormat 2 makes it easy to write messages like this
without developers needing to know about such language variation.
In fact, developers don't need to learn about any of the language
and formatting variations needed by languages other than their own
nor write code that manipulates formatting.

MessageFormat 2 messages can be simple strings:
```
    Hello, world!
```

A message can also include _placeholders_ that are replaced by user-provided values:
```
    Hello {$user}!
```

The user-provided values can be transformed or formatted using functions:
```
    Today is {$date :date}
    Today is {$date :datetime weekday=long}.
```

Messages can use a function (called a _selector_) to choose between
different versions of a message.
These allow messages to be tailored to the grammatical (or other) requirements of 
a given language:
```
    .match {$count :integer}
    0   {{You have no views.}}
    one {{You have {$count} view.}}
    *   {{You have {$count} views.}}
```

Unlike the previous version of MessageFormat, MessageFormat 2 is designed for
extension by implementers and even end users.
This means that new functionality can be added to messages without modifying
either existing messages or, in some cases, even the core library containing the 
MessageFormat 2 code.

MessageFormat 2 provides a rich and extensible set of functionality
to permit the creation of natural-sounding, grammatically-correct, 
messages, while enabling rapid, accurate translation
and extension using new and improved internationalization functionality
in any computing system.

The Technical Preview is available for comment.
The stable version of this specification is expected to be part of the 
Fall 2024 release of CLDR (v46).
Implementations are available in ICU4J (Java) and ICU4C (C/C++)
as well as JavaScript.
Feedback about implementation experience,
syntax,
functionality,
or other parts of the specification is welcome!
See the end of this article for details on participation and how to comment on this work.

MessageFormat 2 consists of multiple parts: 
a syntax, including a formal grammar, for writing messages;
a data model for representing messages (including those ported from other APIs);
a registry of required functions;
a function description mechanism for use by implementations and tools;
and a test suite.
