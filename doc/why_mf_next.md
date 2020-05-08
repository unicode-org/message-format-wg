# Why MessageFormat needs a successor ([issue #49](https://github.com/unicode-org/message-format-wg/issues/49))


The `MessageFormat` has been around for a long time.

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

* No support for advanced features (for example inflections)
* Not standard. There are implementations for JavaScript, Closure, Dart, Go, others, but because there is no standard they are all slightly different (and incompatible). Would be nice to have at least a data-driven test suite.
* Not well supported by localization tools
* No standard way to extend it (would need to fork + change the ICU code)
* Moving too slowly. The arguments supported by MessageFormat right now are `number` (`integer`, `currency`, `percent`), `date`, `time`, `spellout`, `ordinal`, `duration`, and the selectors are `choice`, `plural`, `select`, and `selectordinal`. But ICU itself already supports a lot more: intervals, relative dates and times, lists, measurements, compact decimals. And we would like even more, both formatters and selectors (think gender, inflections, formality level) 
* Carying with it legacy bagage that we know now better: date/time patterns, `ChoiceFormat`, clunky syntax (especially for nested plural/select), problematic escaping, selectors on part of the message
* It is hard to add new functionality while keeping backward compatibility
* We would like: inflections, protecting message ranges, formatToValue, formatting (think html)
* High "impedance" when converting to / from localization tools

---

Mandatory xkcd: \
[<img src="https://imgs.xkcd.com/comics/standards.png">](https://xkcd.com/927/)

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
