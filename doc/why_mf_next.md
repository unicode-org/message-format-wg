# Why `MessageFormat` needs a successor ([issue #49](https://github.com/unicode-org/message-format-wg/issues/49))

## Intro

The `MessageFormat` API and syntax have been around for a long time.

Its “ancestor”, [java/text/MessageFormat](https://docs.oracle.com/javase/7/docs/api/java/text/MessageFormat.html), was introduced with Java 1.4, February 2002.

The [ICU MessageFormat](https://unicode-org.github.io/icu-docs/apidoc/released/icu4j/com/ibm/icu/text/MessageFormat.html) is tagged as stable API since ICU 3.0 (June 2004)

The ICU version evolved compared to the JDK one:
* added support for plurals (ICU 3.8, 2007)
* added support for select (ICU 4.4, 2010)
* named arguments (`...{user}...` vs `...{0}...`)
* better handling of the apostrophe escaping
* date/time/number skeletons (2018)
* more

Despite being around for such a long time, it is still not well supported by localization tools.

Other efforts: Fluent, FB

## Core problems with the current `MessageFormat`

I've started with the list of problems in the next section.
But that ends up being a (biased) reshuffling of the issues and feature requests that we collected in [GitHub](https://github.com/unicode-org/message-format-wg/issues)

So I have tried to distill that to a few root causes
(think [“5 why”](https://en.wikipedia.org/wiki/Five_whys))

I think that these are the problems we need to avoid repeating,
otherwise it is just a matter of time until we end up in the same place.

Here it is:
1. Does not have any “extension points”
2. Not a formal standard with an “acceptance test suite”
3. Can't remove anything, even if we know know better
4. Hard to map to the existing localization core structures
5. Designed to work on plain text, UI, “imperative style”

### 1. Does not have any “extension points”

No extension points means that it is hard to add new functionality unless you
are doing it in ICU itself.
It also means most tools used to process these messages are built rigidly,
and are unprepared to handle changes
(think localization tools, liners, friendly UIs, etc.).

### 2. Not a formal standard with an “acceptance test suite”

This means that the implementations ICU4C and ICU4J are
“de facto reference-implementations”, and the ports to other languages
(JavaScript, Go, Dart, etc.) are at risk for being “slightly incompatible”

### 3. Can't remove anything, even if we know know better

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

### 4. Hard to map to the existing localization core structures

The format is not supported by any major localization system that I know of. \
I think that the root cause of that is not it is difficult to parse.
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

### 5. Designed to work on plain text, UI, “imperative style”

The main (only?) use case was: load the string from resources,
replace placeholders, and return the string result.

It does not play well with binding, use formatting tags (thing `html`),
or  “document-like” content, like templating
(think [freemarker](https://freemarker.apache.org/),
[mustache](https://mustache.github.io/), etc.)

---

**If we agree on the above section, we can drop this.**  
**Or we “map” these bullets to the root causes above.**

## Problems with the current `MessageFormat`

* No support for advanced features (for example inflections)
* Not standard. There are implementations for JavaScript, Closure, Dart, Go, others, but because there is no standard they are all slightly different (and incompatible). Would be nice to have at least a data-driven test suite.
* Not well supported by localization tools
* No standard way to extend it (would need to fork + change the ICU code)
* Moving too slowly. The arguments supported by `MessageFormat` right now are `number` (`integer`, `currency`, `percent`), `date`, `time`, `spellout`, `ordinal`, `duration`, and the selectors are `choice`, `plural`, `select`, and `selectordinal`. But ICU itself already supports a lot more: intervals, relative dates and times, lists, measurements, compact decimals. And we would like even more, both formatters and selectors (think gender, inflections, formality level) 
* Carrying with it legacy baggage that we know now better: date/time patterns, `ChoiceFormat`, clunky syntax (especially for nested plural/select), problematic escaping, selectors on part of the message
* It is hard to add new functionality while keeping backward compatibility
* We would like: inflections, protecting message ranges, `formatToValue`, formatting (think `html` tags)
* High “impedance” when converting to / from localization tools

---

Mandatory xkcd: \
[<img src='https://imgs.xkcd.com/comics/standards.png'>](https://xkcd.com/927/)

---

_The Message Format Working Group (MFWG) is tasked with developing an industry
standard for the representation of localizable message strings to be a
successor to ICU MessageFormat. MFWG will recommend how to remove
redundancies, make the syntax more usable, and support more complex features,
such as gender, inflections, and speech. MFWG will also consider the
integration of the new standard with programming environments, including, but
not limited to, ICU, DOM, and ECMAScript, and with localization platform
interchange. The output of MFWG will be a specification for the new syntax,
which is expected to be on track to become a Unicode Technical Standard._
