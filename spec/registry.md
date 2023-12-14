# WIP DRAFT MessageFormat 2.0 Registry

Implementations and tooling can greatly benefit from a
structured definition of formatting and matching functions available to messages at runtime.
The _registry_ is a mechanism for storing such declarations in a portable manner.

## Goals

_This section is non-normative._

The registry provides a machine-readable description of MessageFormat 2 extensions (custom functions),
in order to support the following goals and use-cases:

- Validate semantic properties of messages. For example:
  - Type-check values passed into functions.
  - Validate that matching functions are only called in selectors.
  - Validate that formatting functions are only called in placeholders.
  - Verify the exhaustiveness of variant keys given a selector.
- Support the localization roundtrip. For example:
  - Generate variant keys for a given locale during XLIFF extraction.
- Improve the authoring experience. For example:
  - Forbid edits to certain function options (e.g. currency options).
  - Autocomplete function and option names.
  - Display on-hover tooltips for function signatures with documentation.
  - Display/edit known message metadata.
  - Restrict input in GUI by providing a dropdown with all viable option values.

## Conformance and Use

_This section is normative._

To be conformant with MessageFormat 2.0, an implementation MUST implement
all of the formatting and selection _functions_ described in the default registry,
including all of the _options_ and _option_ values, _operands_ and outputs
described by the default registry.

Implementations are not required to provide a registry nor to read or interpret
a copy of this registry in order to be conformant.

The MessageFormat 2.0 Registry was created to describe
the core set of formatting and selection _functions_,
including _operands_, _options_, and _option_ values.
This is the minimum set of functionality needed for conformance.
By using the same names and values, _messages_ can be used interchangeably
by different implementations,
regardless of programming language or runtime environment.
This ensures that developers do not have to relearn core MessageFormat syntax
and functionality when moving between platforms
and that translators do not need to know about the runtime environment for most
selection or formatting operations.

The registry provides a machine-readable description of _functions_
suitable for tools, such as those used in translation automation, so that
variant expansion and information about available _options_ and their effects
are available in the translation ecosystem.
To that end, implementations are strongly encouraged to provide appropriately
tailored versions of the registry for consumption by tools
(even if not included in software distributions)
and to encourage any add-on or plug-in functionality to provide
a registry to support localization tooling.

## Data Model

_This section is non-normative._

The registry contains descriptions of function signatures.
[`registry.dtd`](./registry.dtd) describes its data model.

The main building block of the registry is the `<function>` element.
It represents an implementation of a custom function available to translation at runtime.
A function defines a human-readable `<description>` of its behavior
and one or more machine-readable _signatures_ of how to call it.
Named `<validationRule>` elements can optionally define regex validation rules for
literals, option values, and variant keys.

MessageFormat 2 functions can be invoked in two contexts:

- inside placeholders, to produce a part of the message's formatted output;
  for example, a raw value of `|1.5|` may be formatted to `1,5` in a language which uses commas as decimal separators,
- inside selectors, to contribute to selecting the appropriate variant among all given variants.

A single _function name_ may be used in both contexts,
regardless of whether it's implemented as one or multiple functions.

A _signature_ defines one particular set of at most one argument and any number of named options
that can be used together in a single call to the function.
`<formatSignature>` corresponds to a function call inside a placeholder inside translatable text.
`<matchSignature>` corresponds to a function call inside a selector.

A signature may define the positional argument of the function with the `<input>` element.
If the `<input>` element is not present, the function is defined as a nullary function.
A signature may also define one or more `<option>` elements representing _named options_ to the function.
An option can be omitted in a call to the function,
unless the `required` attribute is present.
They accept either a finite enumeration of values (the `values` attribute)
or validate their input with a regular expression (the `validationRule` attribute).
Read-only options (the `readonly` attribute) can be displayed to translators in CAT tools, but may not be edited.

As the `<input>` and `<option>` rules may be locale-dependent,
each signature can include an `<override locales="...">` that extends and overrides
the corresponding input and options rules.
If multiple `<override>` elements would match the current locale,
only the first one is used.

Matching-function signatures additionally include one or more `<match>` elements
to define the keys against which they can match when used as selectors.

Functions may also include `<alias>` definitions,
which provide shorthands for commonly used option baskets.
An _alias name_ may be used equivalently to a _function name_ in messages.
Its `<setOption>` values are always set, and may not be overridden in message annotations.

If a `<function>`, `<input>` or `<option>` includes multiple `<description>` elements,
each SHOULD have a different `xml:lang` attribute value.
This allows for the descriptions of these elements to be themselves localized
according to the preferred locale of the message authors and editors.

## Example

The following `registry.xml` is an example of a registry file
which may be provided by an implementation to describe its built-in functions.
For the sake of brevity, only `locales="en"` is considered.

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE registry SYSTEM "./registry.dtd">

<registry xml:lang="en">
    <function name="platform">
        <description>Match the current OS.</description>
        <matchSignature>
            <match values="windows linux macos android ios"/>
        </matchSignature>
    </function>

    <validationRule id="anyNumber" regex="-?[0-9]+(\.[0-9]+)"/>
    <validationRule id="positiveInteger" regex="[0-9]+"/>
    <validationRule id="currencyCode" regex="[A-Z]{3}"/>

    <function name="number">
        <description>
            Format a number.
            Match a **formatted** numerical value against CLDR plural categories or against a number literal.
        </description>

        <matchSignature>
            <input validationRule="anyNumber"/>
            <option name="type" values="cardinal ordinal"/>
            <option name="minimumIntegerDigits" validationRule="positiveInteger"/>
            <option name="minimumFractionDigits" validationRule="positiveInteger"/>
            <option name="maximumFractionDigits" validationRule="positiveInteger"/>
            <option name="minimumSignificantDigits" validationRule="positiveInteger"/>
            <option name="maximumSignificantDigits" validationRule="positiveInteger"/>
            <!-- Since this applies to both cardinal and ordinal, all plural options are valid. -->
            <match locales="en" values="one two few other" validationRule="anyNumber"/>
            <match values="zero one two few many other" validationRule="anyNumber"/>
        </matchSignature>

        <formatSignature>
            <input validationRule="anyNumber"/>
            <option name="minimumIntegerDigits" validationRule="positiveInteger"/>
            <option name="minimumFractionDigits" validationRule="positiveInteger"/>
            <option name="maximumFractionDigits" validationRule="positiveInteger"/>
            <option name="minimumSignificantDigits" validationRule="positiveInteger"/>
            <option name="maximumSignificantDigits" validationRule="positiveInteger"/>
            <option name="style" readonly="true" values="decimal currency percent unit" default="decimal"/>
            <option name="currency" readonly="true" validationRule="currencyCode"/>
        </formatSignature>

        <alias name="integer">
          <description>Locale-sensitive integral number formatting</description>
          <setOption name="maximumFractionDigits" value="0" />
          <setOption name="style" value="decimal" />
        </alias>
    </function>
</registry>
```

Given the above description, the `:number` function is defined to work both in a selector and a placeholder:

```
.match {$count :number}
1 {{One new message}}
* {{{$count :number} new messages}}
```

Furthermore,
`:number`'s `<matchSignature>` contains two `<match>` elements
which allow the validation of variant keys.
The element whose `locales` best matches the current locale
using resource item [lookup](https://unicode.org/reports/tr35/#Lookup) from LDML is used.
An element with no `locales` attribute is the default
(and is considered equivalent to the `root` locale).

- `<match locales="en" values="one two few other" .../>` can be used in locales like `en` and `en-GB`
  to validate the `when other` variant by verifying that the `other` key is present
  in the list of enumarated values: `one other`.
- `<match ... validationRule="anyNumber"/>` can be used to valide the `when 1` variant
  by testing the `1` key against the `anyNumber` regular expression defined in the registry file.

---

A localization engineer can then extend the registry by defining the following `customRegistry.xml` file.

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE registry SYSTEM "./registry.dtd">

<registry xml:lang="en">
    <function name="noun">
        <description>Handle the grammar of a noun.</description>
        <formatSignature>
            <override locales="en">
                <input/>
                <option name="article" values="definite indefinite"/>
                <option name="plural" values="one other"/>
                <option name="case" values="nominative genitive" default="nominative"/>
            </override>
        </formatSignature>
    </function>

    <function name="adjective">
        <description>Handle the grammar of an adjective.</description>
        <formatSignature>
            <override locales="en">
                <input/>
                <option name="article" values="definite indefinite"/>
                <option name="plural" values="one other"/>
                <option name="case" values="nominative genitive" default="nominative"/>
            </override>
        </formatSignature>
        <formatSignature>
            <override locales="en">
                <input/>
                <option name="article" values="definite indefinite"/>
                <option name="accord"/>
            </override>
        </formatSignature>
    </function>
</registry>
```

Messages can now use the `:noun` and the `:adjective` functions.
The following message references the first signature of `:adjective`,
which expects the `plural` and `case` options:

> ```
> You see {$color :adjective article=indefinite plural=one case=nominative} {$object :noun case=nominative}!
> ```

The following message references the second signature of `:adjective`,
which only expects the `accord` option:

>```
> .input {$object :noun case=nominative}
> {{You see {$color :adjective article=indefinite accord=$object} {$object}!}}
>```
