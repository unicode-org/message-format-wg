# WIP DRAFT MessageFormat 2.0 Registry

_This document is non-normative._

The implementations and tooling can greatly benefit from a
structured definition of formatting and matching functions available to messages at runtime.
The _registry_ is a mechanism for storing such declarations in a portable manner.

## Goals

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

## Data Model

The registry contains descriptions of function signatures.
[`registry.dtd`](./registry.dtd) describes its data model.

The main building block of the registry is the `<function>` element.
It represents an implementation of a custom function available to translation at runtime.
A function defines a human-readable _description_ of its behavior
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
Signatures with a non-empty `locales` attribute are locale-specific
and only available in translations in the given languages.

A signature may define the positional argument of the function with the `<input>` element.
If the `<input>` element is not present, the function is defined as a nullary function.
A signature may also define one or more `<option>` elements representing _named options_ to the function.
An option can be omitted in a call to the function,
unless the `required` attribute is present.
They accept either a finite enumeration of values (the `values` attribute)
or validate their input with a regular expression (the `validationRule` attribute).
Read-only options (the `readonly` attribute) can be displayed to translators in CAT tools, but may not be edited.

Matching-function signatures additionally include one or more `<match>` elements
to define the keys against which they can match when used as selectors.

## Example

The following `registry.xml` is an example of a registry file
which may be provided by an implementation to describe its built-in functions.
For the sake of brevity, only `locales="en"` is considered.

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE registry SYSTEM "./registry.dtd">

<registry>
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

        <matchSignature locales="en">
            <input validationRule="anyNumber"/>
            <option name="type" values="cardinal ordinal"/>
            <option name="minimumIntegerDigits" validationRule="positiveInteger"/>
            <option name="minimumFractionDigits" validationRule="positiveInteger"/>
            <option name="maximumFractionDigits" validationRule="positiveInteger"/>
            <option name="minimumSignificantDigits" validationRule="positiveInteger"/>
            <option name="maximumSignificantDigits" validationRule="positiveInteger"/>
            <!-- Since this applies to both cardinal and ordinal, all plural options are valid. -->
            <match values="zero one two few many"/>
            <match validationRule="anyNumber"/>
        </matchSignature>

        <formatSignature locales="en">
            <input validationRule="anyNumber"/>
            <option name="minimumIntegerDigits" validationRule="positiveInteger"/>
            <option name="minimumFractionDigits" validationRule="positiveInteger"/>
            <option name="maximumFractionDigits" validationRule="positiveInteger"/>
            <option name="minimumSignificantDigits" validationRule="positiveInteger"/>
            <option name="maximumSignificantDigits" validationRule="positiveInteger"/>
            <option name="style" readonly="true" values="decimal currency percent unit" default="decimal"/>
            <option name="currency" readonly="true" validationRule="currencyCode"/>
        </formatSignature>
    </function>
</registry>
```

Given the above description, the `:number` function is defined to work both in a selector and a placeholder:

```
{{
match {$count :number}
when 1 {{One new message}}
when * {{{$count :number} new messages}}
}}
```

Furthermore,
`:number`'s `<matchSignature>` contains two `<match>` elements
which allow to validate the variant keys.
If at least one `<match>` validation rules passes,
a variant key is considered valid.

- `<match validationRule="anyNumber"/>` can be used to valide the `when 1` variant
  by testing the `1` key against the `anyNumber` regular expression defined in the registry file.
- `<match values="one other"/>` can be used to valide the `when other` variant
  by verifying that the `other` key is present in the list of enumarated values: `one other`.

---

A localization engineer can then extend the registry by defining the following `customRegistry.xml` file.

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE registry SYSTEM "./registry.dtd">

<registry>
    <function name="noun">
        <description>Handle the grammar of a noun.</description>
        <formatSignature locales="en">
            <input/>
            <option name="article" values="definite indefinite"/>
            <option name="plural" values="one other"/>
            <option name="case" values="nominative genitive" default="nominative"/>
        </formatSignature>
    </function>

    <function name="adjective">
        <description>Handle the grammar of an adjective.</description>
        <formatSignature locales="en">
            <input/>
            <option name="article" values="definite indefinite"/>
            <option name="plural" values="one other"/>
            <option name="case" values="nominative genitive" default="nominative"/>
        </formatSignature>
        <formatSignature locales="en">
            <input/>
            <option name="article" values="definite indefinite"/>
            <option name="accord"/>
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
> {{
>  input {$object :noun case=nominative}
>  {{You see {$color :adjective article=indefinite accord=$object} {$object}!}}
> }}
>```
