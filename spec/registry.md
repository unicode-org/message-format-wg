# WIP DRAFT MessageFormat 2.0 Registry

_This document is non-normative._

The implementations and tooling can greatly benefit from a structured definition of formatting and matching functions available to messages at runtime.
The _registry_ is a mechanism for storing such declarations in a portable manner.

## Goals

The goal of the registry is to provide a machine-readable description of MessageFormat extensions (custom functions) in order to:

* support the localization roundtrip,
* validate message correctness, and
* improve the authoring experience.

## Use Cases

The registry enables the following usage scenarios:

* Generate variant keys for a given locale during XLIFF extraction.
* Verify the exhaustiveness of variant keys given a selector.
* Type-check values passed into functions.
* Validate that matching functions are only called in selectors.
* Validate that formatting functions are only called in placeholders.
* Forbid edits to certain function options (e.g. currency options).
* Autocomplete function and option names.
* Display on-hover tooltips for function signatures with documentation.
* Display/edit known message metadata.
* Restrict input in GUI by providing a dropdown with all viable option values.

## Data Model

The registry contains descriptions of function signatures.
[`registry.dtd`](./registry.dtd) describes its data model.

The main building block of the registry is the `<function>` element.
It represents an implementation of a custom function available to translation at runtime.
A function defines a human-readable _description_ of its behavior
and one or more machine-readable _signatures_ of how to call it.
Named `<pattern>` elements can optionally define regex validation rules for input, option values, and variant keys.

MessageFormat functions can be invoked in two contexts:
* inside placeholders, to produce a part of the message's formatted output;
  for example, a raw value of `|1.5|` may be formatted to `1,5` in a language which uses commas as decimal separators,
* inside selectors, to contribute to selecting the appropriate variant among all given variants.

A single _function name_ may be used in both contexts,
regardless of whether it's implemented as one or multiple functions.

A _signature_ defines one particular set of arguments and named options that can be used together in a single call to the function.
`<formatSignature>` corresponds to a function call inside a placeholder inside translatable text.
`<matchSignature>` corresponds to a function call inside a selector.
Signatures with a non-empty `locales` attribute are locale-specific and only available in translations in the given languages.

A signature may define the positional argument of the function with the `<input>` element.
A signature may also define one or more `<option>` elements representing _named options_ to the function.
Options are optional by default,
unless the `required` attribute is present.
They accept either a finite enumeration of values (the `values` attribute)
or validate they input with a regular expression (the `pattern` attribute).
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

    <pattern id="anyNumber" regex="-?[0-9]+(\.[0-9]+)"/>
    <pattern id="positiveInteger" regex="[0-9]+"/>
    <pattern id="currencyCode" regex="[A-Z]{3}"/>

    <function name="number">
        <description>
            Format a number.
            Match a numerical value against CLDR plural categories or against a number literal.
        </description>

        <matchSignature locales="en">
            <input title="The number to match." pattern="anyNumber"/>
            <option name="type" values="cardinal ordinal"/>
            <option name="minimumIntegerDigits" pattern="positiveInteger"/>
            <option name="minimumFractionDigits" pattern="positiveInteger"/>
            <option name="maximumFractionDigits" pattern="positiveInteger"/>
            <option name="minimumSignificantDigits" pattern="positiveInteger"/>
            <option name="maximumSignificantDigits" pattern="positiveInteger"/>
            <match values="one other"/>
            <match pattern="anyNumber"/>
        </matchSignature>

        <formatSignature locales="en">
            <input title="The number to format" pattern="anyNumber"/>
            <option name="minimumIntegerDigits" pattern="positiveInteger"/>
            <option name="minimumFractionDigits" pattern="positiveInteger"/>
            <option name="maximumFractionDigits" pattern="positiveInteger"/>
            <option name="minimumSignificantDigits" pattern="positiveInteger"/>
            <option name="maximumSignificantDigits" pattern="positiveInteger"/>
            <option name="style" readonly="true" values="decimal currency percent unit" default="decimal"/>
            <option name="currency" readonly="true" pattern="currencyCode"/>
        </formatSignature>
    </function>
</registry>
```

A localization engineer can then extend the registry by defining the following `customRegistry.xml` file.

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE registry SYSTEM "./registry.dtd">

<registry>
    <function name="noun">
        <description>Handle the grammar of a noun.</description>
        <formatSignature locales="en">
            <input title="Noun id"/>
            <option name="article" values="definite indefinite"/>
            <option name="plural" values="one other"/>
            <option name="case" values="nominative genitive" default="nominative"/>
        </formatSignature>
    </function>

    <function name="adjective">
        <description>Handle the grammar of an adjective.</description>
        <formatSignature locales="en">
            <input title="Adjective id"/>
            <option name="article" values="definite indefinite"/>
            <option name="plural" values="one other"/>
            <option name="case" values="nominative genitive" default="nominative"/>
        </formatSignature>
        <formatSignature locales="en">
            <input title="Adjective id"/>
            <option name="article" values="definite indefinite"/>
            <option name="accord"/>
        </formatSignature>
    </function>
</registry>
```

Messages can now use the `:noun` and the `:adjective` functions.
The following message references the first signature of `:adjective`,
which expects the `plural` and `case` options:

    {You see {$color :adjective article=indefinite plural=one case=nominative} {$object :noun case=nominative}!}

The following message references the second signature of `:adjective`,
which only expects the `accord` option:

    let $obj = {$object :noun case=nominative}
    {You see {$color :adjective article=indefinite accord=$obj} {$obj}!}
