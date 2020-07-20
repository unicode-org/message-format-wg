# Why `MessageFormat` needs a successor ([issue #49](https://github.com/unicode-org/message-format-wg/issues/49))

## Intro

The `MessageFormat` API and syntax have been around for a long time.

Intro
* `MessageFormat` is the Unicode API for software localization
* It is 20 years old, well designed, proven solution
* Its design is optimized for the software development model of 20y ago and its
shortcomings result in mixed reception and adoption by the industry.

The current wave of software development uses dynamic languages, modern UI
frameworks and new forms of user interactions (voice, VR etc.).

Considering these new challenges, combined with the lessons learned from using
`MessageFormat`, we aim to design the next iteration of `MessageFormat`
suitable for current generation of software, and adoption by Web Standards.

Other efforts: [Fluent](https://projectfluent.org/),
[FBT](https://facebook.github.io/fbt/)

## Core problems with the current `MessageFormat`

1. The design is not modular enough
    * Does not have any “extension points”
    * Can't deprecate anything, even if now we know better
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

The most basic functionality would be adding a new formatter. Meantime ICU
added other formatters: time intervals, measurement, lists. But MessageFormat
did not keep up. And adding support for any of these new formats risks to break
existing tools.

### 1.2. Can't deprecate anything, even if now we know better

ICU is old, but also very popular (right now it is the core i18n library
for all major operating systems, and many products).

This is how he have both numeric and named parameters, partial strings in
plural / select (technically concatenation, which is bad i18n), date / time
patterns (bad i18n, when skeletons are the better way), nesting selectors,
unfriendly escaping (think doubling the apostrophe `''` ), `#` in plurals.

Most of it can't be “blamed” directly on a bad decision, it is just time
teaching us what works (for instance skeletons did not exist when the
date/time parameters were added).

But the stability requirements prevent any major cleanup.

### 2. Some existing problems
* ICU added new formatters, but MessageFormat does not support them
* Combined selectors (select + plural) results in unreadable and error
prone nesting
* Select and plurals inside the message are difficult to translate because of 
grammatical agreement requires words outside select / plural to change.
See https://en.wikipedia.org/wiki/Agreement_(linguistics)
* Patterns in the date / time / number placeholders are bad i18n, should use skeletons
* No official support for gender. It can be done with `select`, but it
is not the same thing (same as the difference between an `enum` and integer/strings). Developers can use masculine/feminine, masc/fem, male/female, etc.
* Formatting for “parameters” known at compile time
* Escaping with apostrophe is error prone. There is no reliable way to tell if
it has to be doubled or not.
* The # is used in plural format instead of {...}, but does not work for nesting unless the plural is the innermost selector. But named placeholders don't work
properly for plurals with offset. So there are 2 ways to do the same thing that work in 98% of cases, but in special situations only one of the ways works. 
* Does not support inflections, and it would be hard to add without breaking existing tools.

### 3. Hard to map to the existing localization core structures

The format is not well supported by any major localization system. \
The root cause of that is not it is difficult to parse.
Because it is not. And ICU4J has public API for parsing.

Most translation tools take a string (with placeholders) in a source language
and gives back a translated string, usually with the same placeholders
(with some degree of flexibility).

It makes it very difficult to translate things like plurals, where the input
has (for example) 2 “message variants” (English, 1 / many, singular / plural),
and return 4 message variants for Russian, for example.

This is not a superficial problem. It affects most steps in the normal
localization flow:
* leveraging (the same string “X files” must be translated
in 2/3 different ways)
* validation (placeholders, length, terminology, etc.)
* word count and payment
* alignment (the process of creating a TM from source + translated documents)

### 4. Designed to be API only, plain text, UI, “imperative style”

The main (only?) use case for `MessageFormat` is: load the string from resources,
replace placeholders, and return the string result with placeholders replaced. \
An i18n-aware `printf`, basically.

It does not play well with binding, formatting tags (think `html`),
or  “document-like” content (for example templating systems like
[freemarker](https://freemarker.apache.org/),
[mustache](https://mustache.github.io/), even JSP, PHP, etc.)

Because it is API only it has no standard way to store the stings in a
serialized format and to carry info or directives for translators or
localization tools. \
So there is no way for a message to reference another message, or to fallback
to a different locale. That is all left to the "host resource manager"
(whatever that is for the given tech stack)

There is also no metadata: comments, length limits, example, links,
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
