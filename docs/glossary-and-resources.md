## Glossary

### Basic terms for localization

- **language** - a system of communication used by a particular country or community. [ISO 639](https://en.wikipedia.org/wiki/ISO_639) is the main standard used to define language codes.
- **locale** - the implementation of a language in a given market, including formatting (numbers, date, etc), common expressions and cultural differences. For example, French France (fr-FR) is different than French Canada (fr-CA). [BCP 47](https://en.wikipedia.org/wiki/IETF_language_tag) is the main standard used to define locale codes.
- **Internationalization (i18n)**: a set of best practices and design process that ensures that an application can be adapted to various locales without requiring code changes.
- **localization / l10n** - converting a program to run in a different locale. Most of the effort revolves around translating UI string text, so "localization" often gets used synonymously with "translation". But technically also includes designing different layouts (ex: scripts that prefer top-to-bottom right-to-left) and UI widgets (some icons flipping for right-to-left languages)
- **CAT (Computer Assisted Translation) tool** - an editor that is designed for translators to be efficient to use and integrated with other l10n services. The CAT tool UI usually has a 2-column interface in which each message's source (original) and target (translation) text are kept vertically aligned with each other.
- **TMS (Translation Management System)** - a workflow system that manages the end-to-end work of translation. Includes user upload and download, cost estimation & billing, distributing work to translators, integration of reviewers and secondary reviewers, QA / issue management, and post-editing. Some TMSes provide their own integrated CAT tools. In other cases translators choose to use their own CAT tool, in which case they may use an industry standard format like XLIFF to download the translation source and upload their finished translation.
- **post-editing** - after the user receives their translated document as the result of the main translation workflow in the TMS, the user may want to make their own final touches to the translated doc. Those final touches are called post-editing.
- **Translation Memory (TM)** - a database of previous translations (translation entry = source string, source language, target language, target string). TMs typically store individual messages as source strings in separate entries. TMs can be shared globally, shared within a company, and/or private to a single user.
- **Machine Translation (MT)** - letting an automatic translation program perform translation of the source text. This is usually performed only when no entries in the Translation Memory exit that match the source text. The reason is that it is usually easier & cheaper to start translation by correcting Machine Translation output than to write out the translated string from scratch.
- **[XLIFF](https://en.wikipedia.org/wiki/XLIFF) (XML Localization Interchange File Format)** - a localization industry standard file format that defines the structure for translation task data.
- **[Okapi](https://okapiframework.org/) Framework** - a software framework that enables people to develop their own l10n software (CAT tools / TMSes). Hierarchy of classes is similar to XLIFF data hierarchy spec. Supports XLIFF and many common textual document file formats via a plugin-style architecture. Most CAT tools / TMSes are built on Okapi.
- **translatable unit / text unit** - the first level of granularity in which a translation document is broken down to in XLIFF/Okapi. Represents translatable text -- text to be translated by a translator. Usually corresponds to paragraphs, but depends on the file format handler implementation
- **segment** - a sub-unit of a text unit. Usually corresponds to a sentence. Also represents translatable text.
- **source locale** - language of the source text (input) for a translation.
- **target locale** - language of the translated text (output) of a translation.
- **placeholder** - a piece of information inline within a segment that should not be translated. Usually represented in the UI as an indivisible widget (or substring).
- **placeholder type** - which linguistic category that a placeholder represents, as it pertains to the work of translation. Common ones are 'gender' (of a word or person) and 'plural' (a number).
- **Natural Language Generation (NLG)** - a process that transforms structured data into natural language.

### Terms for message formatting


- **[ABNF](https://en.wikipedia.org/wiki/Augmented_Backus%E2%80%93Naur_form)** - (Augmented Backus-Naur Form). ABNF is a method of specifying valid syntax for a specification. The MessageFormat ABNF spec defines what is and is not required for a string to be valid MessageFormat. ABNF is specified by RFC 5234 and RFC 7405.
- **API** - any function call(s) invoked by the user to perform message formatting.
- **API argument format** - syntax of values passed to input of message formatting API. May also refer to structure of values represented by the syntax. May be similar or same as _authoring format_. See _message syntax_.
- **application locale** - the locale for formatting (or formatting resources) requested by an application.
- **attribute** - A value in a message or a function call that provides additional information that may be needed to properly resolve. Attributes are key/value pairs expressed in the form "@key=value".
- **authoring** - writing a message by hand that adheres to some syntax.
- **authoring format** - syntax of message formatting inputs when constructed for a program, either manually (by a developer) or programtically (ex: a WYSIWYG tool used by a translator). May also refer to structure of values represented by the syntax. May be similar or same as _API argument format_. See _message syntax_.
- **[CLDR](https://cldr.unicode.org/)** - Unicode's Common Locale Data Repository - a set of standardized building blocks that enable software to support languages and locales around the world.
- **data model** - a syntax-independent description of the structure of values passed to the message formatting API.
- **format to parts** - A formatting call that returns an array of objects representing the message,
  or some part of it, rather than a single concatenated string.
  A formatted part may also represent a non-string value, such as an inline image.
- **formatter** - in MessageFormat, a function that takes a set of parameters (eg: ```code: 'USD', amount: 3.9```), and returns formatted text that can be incorporated into the output string (eg: ```"<span class="cur"><span class="cur-symbol">$</span><span class="cur-amt">3.90</span> <span class="cur-code">USD</span>"```)
- **function** - in MessageFormat, functionality that is callable in the context of a MessageFormat message to perform a variety of functions, from determining the plural form needed to represent a number, to formatting an option for output.
- **gender** - In many languages, nouns are considered to have a gender which requires changes to the text around the noun. Common genders in linguistics are feminine, masculine, neuter, common (gendered) or epicene.
- **grammeme** - a value of a grammatical category, such as "singular" or "plural" for numerical grammer, or "male" or "female" for gendered nouns
- **implementation** - code written to achieve the intended behavior of output for a given input. It is expected that MessageFormat will have implementations in all popular programming languages.
- **inflection** - a variation in a word or phrase common in many languages, that expresses further context such as tense, mood, formality, etc.
- **interchange format** - syntax/file format used to convert the inputs of message formatting into inputs for other systems (ex: l10n systems).
- **interpolate** - inserting the contents of one string in the middle of another, at places indicated by a pattern / placeholder. See _translation merging_.
- **LDML** - Locale Data Markup Language - the spec schema that defines CLDR
- **locale fallback** - offering a reasonable substitute locale when the requested locale's resources are not available. Results may vary depending on context (ex: audio vs. text vs. video).
- **locale matching** - computing the locale fallback.
- **markup** - characters present in the MessageFormat source strings that are intended to provide structure, functionality, or formatting to the output, as opposed to display text.
- **match** - a mechanism in MessageFormat that allows the message author to specify a variety of outcomes based on the combined values of one or more inputs.
- **metadata** - Addition information about an MF2 message that aids in translation, or other pre-runtime processes, but has no impact on how the message will be rendered. This may be context notes, screenshots of the string in situ, etc. Metadata should never be relied upon at runtime.
- **open/close** - syntax within the source test that changes the execution context of the parser from output mode to code mode, and back again.
- **operand** - A character in a message that denotes an action taken during runtime execution, such as value assignment or comparison.
- **options** - values passed in, along with an MF2 message, that will be used to determine the output. Examples may be item count in a search results string.
- **placeholder** - An expression or markup in a message pattern.
- **registry** - MF2's function registry, which allows reusable logic to be executed at runtime while resolving an MF2 string to output.
- **resource** - files bundled with an application that are loaded in by the executable code. UI strings, etc. and their locale-specific translations are typically stored as resources.
- **roundtrip** - the process of transforming a message into another format or representation, then transforming it back into the original format.
- **translation merging** - in l10n TMSes, the document-level interpolation of translated content. In other words, the replacing of translatable units in the source document with their equivalent translated units. See _interpolate_.
- **selector** - see _placeholder type_.
- **specification** - the rules we decide that describe what is passed to the API for message formatting (structure of data, syntax, etc.).
- **serialization** - how to convert in-memory representations of data to/from a file/stream.
- **sigil** - A character in a string that is used to denote a change in context.
- **spannable** - A construct in messages where there is an open and a close denotation (start and stop). The italics markup, for instance ("<i>This is italicized</i>") is a spannable.
- **syntax** - a general term to describe a set of rules that describe the set of allowed symbols and their ordering. Can apply to data, source code, communication protocols, etc. regardless of interface (stream, file). Sometimes used synonymously for _file format_.
- **variant** - one of the pre-defined values (cases) in a switch/case manner that a message can take depending on the value of some variable (switch), such as a polaceholder.

## Synonyms

- AST (Abstract Syntax Tree) - the tree structure created by a parser of an input stream/file according to a particular syntax/format, typically in refernece to source code (as opposed to data files).
- binding syntax - see _authoring format_.
- build/parse-time format - see _authoring format_.
- compound message - a message that can take on different pre-defined values (cases) in a switch/case manner depending on the value of some variable (switch), such as a placeholder. See _variant_.
- consumed format - see _API arugment format_.
- developer format - see _authoring format_.
- DOM overlay - a way to enable merging translated HTML attributes for an HTML tag that is inline with the translated text. See _interpolate_ and _translation merging_.
- file format - a standard syntax, coupled with a semantics for interpretation, to describe the contents of a file. Most commonly used for files representing data (including documents) and executables. See _syntax_.
- filter - Okapi terminology for the serialization code for a file format between input documents and Okapi in-memory data structures.
- formatting locale - the locale provided by the locale fallback mechanism for formatting a message.
- fragment message - when a message is used to represent a portion of a larger message, often nested within the larger message. Fragment messages can occur in messages with multiple variants as a means to refactor and narrow the region covered by variant text. See _variant_.
- full message - when a message is not nested with other messages (ex: the message is just an interposing of strings and placeholders). See _fragment message_.
- language negotation - see _locale fallback_.
- locale chain - see _locale matching_.
- intermediate format - see _authoring format_.
- markup - a category of file formats for plain text data in which portions of text are annotated with metadata / attributes. Boundaries of annotated portions are marked inline using text 'tags' that that are distinguishable from the main text. See _syntax_ and _file format_.
- message syntax - the syntax of the inputs to message formatting. If the structure significantly changes between authoring and the API calls at runtime, and the representation used for notation also must differ, we can split this into _API argument format_ and _authoring format_. The term _syntax_ here may also refer to structure of values represented by the syntax.
- multi-level filter - Okapi terminology for a filter that supports the proper extraction of text units when contents adhering to one file format are embedding within contents adhering to another file format.
- placeable - see _placeholder_.
- placeholder locale - if placeholders contain content that is computed based on the locale, and if that locale is allowed to differ from the rest of the text in the message, then this is the locale for just that placeholder.
- positional variable - when a function call takes a series of values without some way to name those values (ex: comma-separated list). Changing the order of the inputs to the function call would lead to different semantics. In contrast, maps and named paramters are ways to provide arguments to function calls that are order-independent.
- selector - see _placeholder type_.
- source code representation - see _authoring format_
- standard message format - see _message syntax_.
- translation/localization format - the interchange format used specifically for l10n use cases. See _interchange format_.
- resource locale - see _target locale_.
- runtime format - see _API argument format_.
- UI language - see _target locale_.
- variable - see _placeholder_.
- variable locale - see _placeholder locale_.

## Resources

- [Localization Essentials (Udacity)](https://www.udacity.com/course/localization-essentials--ud610) - free
- [Localization standards reader 4.0](https://magazine.multilingual.com/issue/jan-feb-2019dm/localization-standards-reader-4-0/)
- [Localization standards reader 4.0 - teaching copy](http://www.tara.tcd.ie/bitstream/handle/2262/90713/L10n%20Standards%20Reader%20v4.0.1.pdf?sequence=1&isAllowed=y)
