# Why `MessageFormat` needs a successor ([issue #49](https://github.com/unicode-org/message-format-wg/issues/49))

## Intro

The `MessageFormat` API and syntax have been around for a long time.

Intro

- `MessageFormat` is the Unicode API for software localization
- It is 20 years old, well designed, proven solution
  Its design was optimized for the software development model
  of twenty years ago.
  Implementers, developers, and translators struggle with its shortcomings.

The current wave of software development uses dynamic languages, modern UI
frameworks and new forms of user interactions (voice, VR etc.).

Considering these new challenges, combined with the lessons learned from using
`MessageFormat`, we aim to design the next iteration of `MessageFormat`
suitable for current generation of software, and adoption by Web Standards.

Other efforts: [Fluent](https://projectfluent.org/),
[FBT](https://facebook.github.io/fbt/)

## Core problems with the current `MessageFormat`(aka "MessageFormat 1.0")

1. The design is not modular enough
   - Does not have any “extension points”
   - Can't deprecate anything, even if now we know better
2. Some existing problems
3. Hard to map to the existing localization core structures
4. Designed to be API only, plain text, UI, “imperative style”

### 1. The design is not modular enough

The "data model" is hard-coded in the standard and in the syntax.
This makes it very rigid.

#### 1.1 Does not have any “extension points”

No extension points means that it is hard to add new functionality unless you
are doing it in ICU itself.

It also means most tools used to process these messages are built rigidly,
and are unprepared to handle changes
(think localization tools, linters, friendly UIs, etc.).

The most basic functionality would be adding a new formatting function.
MessageFormat 1.0 only supported a small number of basic formatting functions,
while over the years ICU added many new capabilities: date and time intervals,
measurement units, lists, person names, and many more.
Developers also sometimes want to define their own formatting functions.
Supporting additional formats risks breaking interoperability or compatibility
with existing tools.

### 1.2. Can't deprecate anything, even if now we know better

ICU is old, but also very popular (right now it is the core i18n library
for all major operating systems, browsers, and many other products).

As a result of its age and design,
MessageFormat 1.0 has both numeric (positional) and named parameters.
It still provides date and time patterns (picture strings), when skeletons or option
bags provide far superior results.
It allows selectors (such as plural and select) around only part of the overall message,
which is a form of non-internationalized string concatenation.

Most of it can't be “blamed” directly on a bad decision, it is just time
teaching us what works (for instance skeletons did not exist when the
date/time parameters were added).

But the stability requirements prevent any major cleanup.

### 2. Some existing problems

- ICU added new formatters, but MessageFormat does not support them
- Messages with selectors (`select` and/or `plural`) are difficult to create
  and edit because of the complex nesting requirements of the syntax.
- `select` and `plural` placeholders inside a message are difficult to translate as
  grammatical agreement may require words _outside_ the `select`/`plural` to change.
  See https://en.wikipedia.org/wiki/Agreement_(linguistics)
- Placeholders for `date`, `time`, and `number` can include picture strings
  that require translators to alter the "code" portion of a message
  and to understand arcane software-developer oriented syntaxes.
  While more-modern solutions such as skeletons have been added,
  there are no guardrails to keep people from using these poorly
  internationalized features.
- Unable to support grammatical or personal gender selection well. 
  Existing selectors such as `select` cannot account
  for the grammatical needs of different gender categories across languages.
  Tools have no way to know what modifications are needed
  and developers have to understand the needs of current and future languages to succeed.
- Escaping with apostrophe is error prone. There is no reliable way to tell if
  it has to be doubled or not.
- The `#` is used in plural format instead of `{...}`, but does not work for nesting unless the plural is the innermost selector. But named placeholders don't work
  properly for plurals with offset. So there are 2 ways to do the same thing that work in 98% of cases, but in special situations only one of the ways works.
- Does not support inflections, and it would be hard to add without breaking existing tools.

### 3. Hard to map to the existing localization core structures

While MessageFormat 1.0 and its syntax are widely supported by runtime environments,
the same cannot be said for localization tooling.
The root cause of that is not it is difficult to parse.
Because it is not. And ICU4J has public API for parsing.

Most translation tools take a string (with placeholders) in a source language
and give back a translated string, usually with the same placeholders
(with some degree of flexibility).

To get the right results, translation software needs to understand the message syntax.
For example, it needs to adjust the number of translated "patterns" to match the
grammatical needs of the target language.
Where the English input might have only two patterns (singular and plural),
the Arabic translator needs to supply six message variants,
and the Japanese translator only one.

This is not a superficial problem. It affects most steps in the normal
localization flow:

- leveraging (the same string “X files” must be translated
  in 2/3 different ways)
- validation (placeholders, length, terminology, etc.)
- word count and payment
- alignment (the process of creating a TM from source + translated documents)

### 4. Designed to be API only, plain text, UI, “imperative style”

The typical use case for `MessageFormat` is: load the string from resources,
replace placeholders, and return the string result with placeholders replaced. \
An i18n-aware `printf`, basically.

It does not account for formatting tags (such as HTML),
or “document-like” content (for example templating systems like
[freemarker](https://freemarker.apache.org/),
[mustache](https://mustache.github.io/), even JSP, PHP, etc.)

There is also no metadata “packaging”: comments, length limits, example, links,
protecting non-translatable sections of text, etc.

But this is also an advantage.

One can store the strings in the format recommended for the tech stack used
(`.properties`, `.strings`, `.rc`, `.resx`, `strings.xml`, `.po`, databases, etc).

Applications don't need to migrate all the strings to a new format and resource
resolution only to support some more advanced features in a few messages.

And since the string loading is left to the underlying tech stack it means that
the locale resolution and fallback is consistent with everything else. \
For example in Android there is locale based selection (with fallback) for
styles, images, sounds, any kind of assets. \
So there is no risk that the string fallback is different than the sound
fallback, for example.

---

**Mandatory xkcd:**

[<img src='https://imgs.xkcd.com/comics/standards.png'>](https://xkcd.com/927/)
