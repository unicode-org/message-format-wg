# MessageFormat 2.0 Registry

The implementations and tooling can greatly benefit from a structured definition of formatting and matching functions available to messages at runtime. The _registry_ is a mechanism for storing such declarations. They are portable and can be used by tooling to type-check and lint messages at authoring time or buildtime.

## Use Cases

The registry enables the following usage scenarios:

* Localization quality:
    * Type-check values passed into functions.
    * Validate matching functions as being only used in selectors, formatting functions—only in placeholders.
    * Verify the exhaustiveness of variant keys given a selector.

* Localization workflow:
    * Forbid edits to certain function options (e.g. `currency` options).
    * Autogenerate variant keys for a given locale during XLIFF extraction.

* Authoring experience:
    * Autocomplete function names, as well as option names passed into functions.
    * Autogenerate code snippet with all required variant keys.
    * Display on-hover tooltips for function signatures with documentation.
    * Validate option values in a linter.
    * Restrict input in GUI by providing a dropdown with all viable option values.

## Data Model

The registry contains descriptions of function signatures. The following DTD describes the data model of a registry definition.

```xml
<!ELEMENT registry (function*) >

<!ELEMENT function (description, pattern*, signature+) >
<!ATTLIST function id NMTOKEN #REQUIRED>

<!ELEMENT description (#CDATA)>

<!ELEMENT pattern EMPTY>
<!ATTLIST pattern name NMTOKEN #REQUIRED>
<!ATTLIST pattern regex CDATA #IMPLIED>

<!ELEMENT signature (input*, param*, match*)>
<!ATTLIST signature type (match|format) #REQUIRED>
<!ATTLIST signature locales NMTOKENS #IMPLIED>

<!ELEMENT input EMPTY>
<!ATTLIST input title CDATA #IMPLIED>
<!ATTLIST input values NMTOKENS #IMPLIED>
<!ATTLIST input pattern NMTOKEN #IMPLIED>

<!ELEMENT param EMPTY>
<!ATTLIST param name NMTOKEN #REQUIRED>
<!ATTLIST param values NMTOKENS #IMPLIED>
<!ATTLIST param pattern NMTOKEN #IMPLIED>
<!ATTLIST param title CDATA #IMPLIED>
<!ATTLIST param required (true|false) "false">
<!ATTLIST param readonly (true|false) "false">

<!ELEMENT match EMPTY>
<!ATTLIST match values NMTOKENS #IMPLIED>
<!ATTLIST match pattern NMTOKEN #IMPLIED>
```

The main building block of the registry is the `<function>` element. It represents an implementation of a custom function available to translation at runtime. A function defines a human-readable _description_ of its behavior and one or more _signatures_ of how to call it. Named regex _patterns_ can optionally define validation rules for input, optional values, and variant keys.

The `<signature>` element defines the calling context of a function with the `type` attribute. A `type="format"` function can only be called inside a placeholder inside translatable text. A `type="match"` function can only be called inside a selector. Signatures with a non-empty `locales` attribute are locale-specific.

A signature may define the type of input it accepts with zero or more `<input>` elments. Note that in MessageFormat 2.0 functions can only ever accept at most one positional argument. Multiple `<input>` elements can be used to define different validation rules for this single argument input, together with appropriate human-readable descriptions.

A signature may also define one or more `<param>` elements representing _named options_ to the function. Parameters are optional by default, unless the `required` attribute is present. They accept either a finite enumeration of values (the `values` attribute) or validate they input with a regular expression (the `regex` attribute). Read-only parameters (the `readonly` attribute) can be displayed to translators in CAT tools, but may not be edited.

Matching-function signatures additionally include one or more `<match>` elements to define the keys against which they're capable of matching. If more than one `<match>` is defined, the final validation rule is the union of all of them.

## Example

The following `registry.xml` is an example of a registry file which may be provided by an implementation to describe its built-in functions. For the sake of brevity, only `locales="en"` is considered.

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE registry SYSTEM "./registry.dtd">

<registry>
    <function id="getPlatform">
        <description>Match the current OS.</description>
        <signature type="match">
            <match values="windows linux macos android ios"/>
        </signature>
    </function>

    <function id="asNumber">
        <description>
            Format a number. Match a numerical value against CLDR plural categories
            or against a number literal.
        </description>

	<pattern name="anyNumber" regex="-?[0-9]+(\.[0-9]+)"/>
	<pattern name="positiveInteger" regex="[0-9]+"/>
	<pattern name="currencyCode" regex="[A-Z]{3}"/>

        <signature type="match" locales="en">
            <input pattern="anyNumber"/>
            <param name="type" values="cardinal ordinal"/>
            <param name="minimumIntegerDigits" pattern="positiveInteger"/>
            <param name="minimumFractionDigits" pattern="positiveInteger"/>
            <param name="maximumFractionDigits" pattern="positiveInteger"/>
            <param name="minimumSignificantDigits" pattern="positiveInteger"/>
            <param name="maximumSignificantDigits" pattern="positiveInteger"/>
            <match values="one other"/>
            <match pattern="anyNumber"/>
        </signature>

        <signature type="format" locales="en">
            <input pattern="anyNumber"/>
            <param name="minimumIntegerDigits" pattern="positiveInteger"/>
            <param name="minimumFractionDigits" pattern="positiveInteger"/>
            <param name="maximumFractionDigits" pattern="positiveInteger"/>
            <param name="minimumSignificantDigits" pattern="positiveInteger"/>
            <param name="maximumSignificantDigits" pattern="positiveInteger"/>
            <param name="style" readonly="true" values="decimal currency percent unit"/>
            <param name="currency" readonly="true" pattern="currencyCode"/>
        </signature>
    </function>
</registry>
```

A localization engineer can then extend the registry by defining the following `customRegistry.xml` file.

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE registry SYSTEM "./registry.dtd">

<registry>
    <function id="asNoun">
        <description>Handle the grammar of a noun.</description>
        <signature type="format" locales="en">
            <input title="Noun id"/>
            <param name="article" values="definite indefinite"/>
            <param name="plural" values="one other"/>
            <param name="case" values="nominative genitive"/>
        </signature>
    </function>

    <function id="asAdjective">
        <description>Handle the grammar of an adjective.</description>
        <signature type="format" locales="en">
            <input title="Adjective id"/>
            <param name="article" values="definite indefinite"/>
            <param name="plural" values="one other"/>
            <param name="case" values="nominative genitive"/>
        </signature>
        <signature type="format" locales="en">
            <input title="Adjective id"/>
            <param name="article" values="definite indefinite"/>
            <param name="accord"/>
        </signature>
    </function>
</registry>
```

Messages can now use the `asNoun` and the `asAdjective` functions. The following message references the first signature of `asAdjective`, which expects the `plural` and `case` options:

    [You see {$color asAdjective article=indefinite plural=one case=nominative} {$object asNoun case=nominative}!]

The following message references the second signature of `asAdjective`, which only expects the `accord` option:

    $obj = {$object asNoun case=nominative}
    [You see {$color asAdjective article=indefinite accord=$obj} {$obj}!]
