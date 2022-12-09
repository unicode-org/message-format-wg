# WIP DRAFT MessageFormat 2.0 Formatting Behaviour

## Introduction

This document defines the behaviour of a MessageFormat 2.0 implementation
when formatting a message for display in a user interface, or for some later processing.

The document is part of the MessageFormat 2.0 specification,
the successor to ICU MessageFormat, henceforth called ICU MessageFormat 1.0.

## Variable Resolution

To resolve the value of a Variable,
its Name is used to identify either a local variable,
or a variable defined elsewhere.
If a local variable and an externally defined one use the same name,
the local variable takes precedence.

It is an error for a local variable definition to
refer to a local variable that's defined after it in the message.

## Format to something other than text (“format to parts”)

It was unanimously agreed that it would be very useful to be able to format a message to something other than plain text (see [issue #272](https://github.com/unicode-org/message-format-wg/issues/272)).

Some use cases:

* styling the output
* replacing the output (for example replacing a date with a date picker)
* attaching information to be used by a text-to-speech engine
* attaching information to use for grammatical features (for example agreement between parts)

Examples of prior art:
* Javascript `Intl` `formatToParts` (for example [`Intl.DateTimeFormat.formatToParts`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts))
* ICU returning a [`FormattedValue`](https://unicode-org.github.io/icu-docs/apidoc/dev/icu4j/com/ibm/icu/text/FormattedValue.html) from some formatters
* The JDK [`Format.formatToCharacterIterator`](https://docs.oracle.com/javase/8/docs/api/java/text/Format.html?is-external=true#formatToCharacterIterator-java.lang.Object-)

But in trying to come up with a universal format we agreed that it would be too much of a burden to force on all implementations.

A highly used library might need something very flexible, so that the users can build what they need on top of it.

Dedicated implementations might feel more natural by formatting to something that is more appropriate for their own environment. \
For example a public API in JavaScript would feel natural to return a DOM fragment. An iOS implementation might want to return an [`AnnotatedString`](https://developer.android.com/reference/kotlin/androidx/compose/ui/text/AnnotatedString), and Android API Android would return a [`Spanned`](https://developer.android.com/reference/android/text/Spanned).

And some implementations don't need such functionality at all.

So we decided to not specify a common format for this functionality.

In this spec we might continue to mention “format to parts” as the operation of formatting to such a structured format, and maybe recommend behavior for applications that implement such formatting.

But implementations have complete freedom to decide what that looks like, or if they need it at all.
