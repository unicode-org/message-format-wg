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

1. Does not have any “extension points”
2. Can't remove anything, even if now we know better
3. Hard to map to the existing localization core structures
4. Designed to be API only, plain text, UI, “imperative style”

### 1. Does not have any “extension points”

No extension points means that it is hard to add new functionality unless you
are doing it in ICU itself.
It also means most tools used to process these messages are built rigidly,
and are unprepared to handle changes
(think localization tools, liners, friendly UIs, etc.).

### 2. Can't remove anything, even if now we know better

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
