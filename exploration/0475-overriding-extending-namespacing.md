# Design Proposal Template

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@aphillips</dd>
		<dt>First proposed</dt>
		<dd>2023-09-13</dd>
		<dt>Pull Request</dt>
		<dd>#475</dd>
	</dl>
</details>

## Objective

_What is this proposal trying to achieve?_

Implementations will provide the functionality for selection and formatting,
including options and option values.
Much of this functionality will be mandated by the default registry.
We expect that default registry entries will serve the core needs for MF2 users.
However, there are many capabilities available in platform, library,
or operating environment APIs that could be useful to developers and translators
or which might be expected on a specific platform or in a specific programming language.
In addition, we expect to provide support for markup and templating regimes.
These need to be implemented using values not found in the default registry.

An additional hope is that a robust ecosystem of function libraries will be created.
A successful ecosystem will allow users to pick-and-choose or cherry-pick fuctions or
options to use in a given development environment.
Each function, option, or option value extension needs to work as seamlessly as possible
with other add-ons and with the built-in functionality.

To that end, we need to define how externally-authored functions appear in a _message_;
how externally-authored function options (and their values) can be supported;
and what, if any, effects this has on the namespace of functions and options.

## Background

_What context is helpful to understand this proposal?_

One example of potential add-on functionality that can help readers understand this proposal
is the use of _skeletons_ for date and number formatting.

The JavaScript `Intl.DateTimeFormat` API provides for the customization of date and time values
through the use of "option bags". For example:

```js
new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
});
```

This might be expressed in MessageFormat as:

```
Today is {$today :datetime weekday=long year=numeric month=short day=numeric hour=numeric minute=numeric}
```

The ICU family of libraries provide a shorthand mechanism called _skeletons_ for accessing
date and time format options without needing a verbose list of options.
The same message might look like this with a skeleton:

```
Today is {$today :datetime skeleton=EEEEyMdjm}
```

Skeletons are not proposed for inclusion in the default registry
because they are not universally available in all datetime formatting
libraries.

## Use-Cases

_What use-cases do we see? Ideally, quote concrete examples._

- Developers need to add options to the base functions to suit local needs.
  For example, ICU's skeletons as part of the `:datetime` function
  Support for this option needs to be specified for local implemented versions.

- Developers want to write a function and access it from messages.

- Developers want to import 3rd party formatting packages and use the package's
  features from within messages.

- Users want to import two or more formatting packages
  and these might have the same-named functions.
  For example, there might be both an HTML `p` and TTS `p`
  function.

- Users want to control how extensions are referenced in their messages.
  For example, they might wish to make a long namespace name shorter.

- Translators and tools would like a machine-readable way to find out the names
  and option values for add-on packages.

## Requirements

_What properties does the solution have to manifest to enable the use-cases above?_

- Developers must be able to write functions that do not later collide with items in the default registry.
- Developers must be able to write function add-ons that do not later collide with items in the default registry.
- Users should be able to tell visually when an add-on feature has been used vs. a built-in
- Users should be able to resolve conflicts between add-on packages that use the same
  function names without altering add-on packages
-

## Constraints

_What prior decisions and existing conditions limit the possible design?_

- A syntactical prefix or its separator(s) must not collide with characters valid in either
  the prefix or in any of the name productions.

- A prefix must not collide with unquoted literal values.

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

The actual addition and provisioning of features to an implementation is implementation specific.
Implementations are not required to read the registry format defined by MFv2
or use it for any particular purpose.

> For example, a Java implementation might use the `ServiceProvider` interface to load
> functionality, while a Node application might use `import`.

If an implementation supports user-installed formatters, selectors, function options,
or expression annotations, it must also support providing "namespace" prefixes for
each installed set of functionality.

In this design, each namespace prefix is a short string and is associated with a URL.
The URL is intended to point to some publically-available copy of the add-on library's
registry description, for use by tooling and as a reference to users such as translators.

There is no requirement that an implementation read the document at the end of the URL,
nor validate the contents in general or against the actual functionality installed.

> [!NOTE]
> It is a good idea to use ASCII strings for namespace identifiers.
> Remember that translators (and others) in many different languages and
> with many different keyboards need to be able to enter the prefix.

The namespace prefix is part of the `name` production.
The prefix must be at least one character in length.
It may be as long as desired, although users are cautioned that brevity
is desirable.
The prefix is separated from the name by a colon (U+003A COLON).

The choice of a `:` is intentional, as it already used for function identification
and might be familiar from similar usage in XML namespaces
as well as slightly similar to C++, e.g. `ns::function`.
This design leverages these sorts of "application familiarity"
as well as the current syntax's use of colon as the function sigil.

The namespace prefix `std` is reserved and refers to the default registry.
The default registry will have a well-known URL under `unicode.org`
but this URL is not yet specified.

```abnf
name      = [namespace] name-body
namespace = name-start *name-char namespace-sep
namespace-sep = ":"
name-body = name-start *name-char
```

> [!NOTE]
> The `name-start` and `name-char` productions will have to be altered to
> **_not_** permit U+003A COLON in a name and to otherwise address
> naming concerns.
> This design document does not show the naming changes because there are
> other issues in play for these names.
> For now, just consider that `name-char` will have no colon.

The `name` production as defined here applies to:

- function (selector/formatting) names
- option names
- spanable names
- expression annotation names (if approved)

Examples:

> Add-on function:
>
> ```
> Today is {$today :icu:datetime skeleton=EEEEyMdjm}
> ```
>
> Add on option:
>
> ```
> Today is {$today :datetime icu:skeleton=EEEEyMdjm}
> ```
>
> Add-on spannables (such as markup):
>
> ```
> Today is {+html:a}{$today}{-html:a}
> ```
>
> Add-on expression annotation:
>
> ```
> Today is {$today :datetime @my:annotation}
> ```
>
> Everything altogether all at once. This probably does not work
> correctly, since `std:datetime` may not understand `icu:skeleton`:
>
> ```
> Today is {+html:a}{$today :std:datetime icu:skeleton=EEEEyMdjm @my:annotation}{-html:a}
> ```

Users, such as developers writing messages or translators creating translations,
are not required to type the namespace prefix in message patterns unless there
is ambiguity in the given formatting content or in the runtime.
However, tooling might reject or have difficulty processing values without
the prefix being present.

> For example, if an implementation is using the ICU4J library, any of the
> following messages might be acceptable alternatives:
>
> ```
> Today is {$today :datetime skeleton=EEEEMd}
> Today is {$today :datetime icu:skeleton=EEEEMd}
> Today is {$today :icu:datetime skeleton=EEEEMd}
> Today is {$today :icu:datetime icu:skeleton=EEEEMd}
> ```

### Changes Required by This Design

Implementation of this design will require the following changes:

- Update the ABNF syntax and corresponding text in the syntax.md spec
- Changes to the `name`/`name-char` productions and related naming productions
- Additions to the formatting.md spec regarding namespace resolution
  to ensure that the correct function is called
- Additional error type for namespace resolution failure; alternatively
  this might take the form of the existing resolution error
- Addition of namespace to the data model for all relative items

It is possible that the registry description will need to include slots for URL
and default namespace name.

### Potential Negatives

This design is based on the assertion that implementors will provide an
extension mechanism and that users will want to use that mechanism to install formatting
or selection functionality.
Any non-standard functions, options, option values, or expressions have the potential
to be disruptive or fragmenting to the overall tooling or localization space.
Any extension that is widely adopted would thus be better off in the default registry
if at all possible.
On the other hand, language- or platform-specific extensions can make MFv2 feel
more "fluent" or consistent for users in a given environment.

## Alternatives Considered

_What other solutions are available?_
_How do they compare against the requirements?_
_What other properties they have?_

### No namespacing

Each implementation can install whatever additional functionality.
It is up to the implementation to describe what is permitted and to check messages.
Users will have to RTFM.

- **+** Flexible
- **-** Does not promote a healthy ecosystem of add-on packages
- **-** Does not supply a mechanism for tooling to leverage

### Reverse-domain-name namespacing

Use `com.foo.bar.baz.Function` type naming for functions, options, or expressions.

> ```
> Today is {$today :com.example.foo.datetime dateStyle=short}
> Today is {$today :datetime com.example.foo.skeleton=EEEEMd}
> ```

- **+** Familiarity. This is a familiar structure for developers.
- **-** Verbose. The resulting names are long and difficult to parse visually
