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

- Developers wish to import two or more formatting packages
  and these might have the same-named functions.
  For example, there might be both an HTML `p` and TTS `p`
  function.

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

- A syntactical prefix must not collide with `nmtoken`, to avoid parsing ambiguities with unquoted literals...

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

Define a namespacing prefix as part of the `name` production.
Each prefix is associated with a URL that points to the add-on's registry.

```abnf
name    = prefix function-sigil function
prefix  = name-start *7(name-char)
function-sigil = ":"
function = name-start *name-char
```

Examples:

> Add-on function:
>
> ```
> Today is {$today :icu:datetime skeleton=EEEEyMdjm}
> ```
>
> > Add on option:
>
> ```
> Today is {$today :datetime icu:skeleton=EEEEyMdjm}
> ```
>
> Add-on markup:
>
> ```
> Today is {+html:a}{$today}{-html:a}
> ```

## Alternatives Considered

_What other solutions are available?_
_How do they compare against the requirements?_
_What other properties they have?_
