# Registry

The implementations and tooling can greatly benefit from a structured definition of formatting and matching functions available to messages at runtime. The _registry_ is a mechanism for storing such declarations. They are portable and can be used by tooling to type-check and lint messages at authoring time or buildtime.

## Data Model

The registry contains descriptions of function signatures. The following DTD describes the data model of a registry definition.

```xml
<!ELEMENT registry (function*) >

<!ELEMENT function (description, signature+) >
<!ATTLIST function id NMTOKEN #REQUIRED>

<!ELEMENT description>

<!ELEMENT signature (argument*, option*, matches*) >
<!ATTLIST signature type (match|format) #REQUIRED>

<!ELEMENT argument EMPTY>
<!ATTLIST argument title CDATA #IMPLIED>
<!ATTLIST argument regex CDATA #IMPLIED>

<!ELEMENT option EMPTY>
<!ATTLIST option name NMTOKEN #REQUIRED>
<!ATTLIST option locale NMTOKEN #IMPLIED>
<!ATTLIST option values NMTOKEN #IMPLIED>
<!ATTLIST option regex CDATA #IMPLIED>
<!ATTLIST option title CDATA #IMPLIED>
<!ATTLIST option required (true, false) "false">

<!ELEMENT matches EMPTY>
<!ATTLIST matches key NMTOKEN #IMPLIED>
<!ATTLIST matches regex CDATA #IMPLIED>
<!ATTLIST matches default (true|false) "false">
```

The main building block of the registry is the `<function>` element. It represents an implementation of a custom function available to translation at runtime. A function defines a human-readable _description_ of its behavior and one or more _signatures_ of how to call it.

The `<signature>` element defines the calling context of a function with the `type` attribute. A `type="format"` function can only be called inside a placeholder inside translatable text. A `type="match"` function can only be called inside a selector.

A signature may define the type of input it accept with one or more `<argument>` elments. Note that in MessageFormat 2.0 functions can only ever accept one position argument. Multiple `<argument>` elements are used to define different validation rules for the input, together with appropriate human-readable descriptions.

A signature may also define one or more `<option>` elements representing _named options_ to the function. Options are optional by default, unless the `required` attribute is present. They may be locale-specific. They accept either a finite enumeration of values or validate they input with a regular expression.

Matching-function signatures additionally include one or more `<matches>` elements to define the keys against which they're capable of matching.

## Example

The following `registry.xml` is an example of a registry file which may be provided by an implementation to describe its built-in functions.

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE registry SYSTEM "./registry.dtd">

<registry>
	<function id="platform">
		<description>Match the current OS.</description>
		<signature type="match">
			<matches key="windows"/>
			<matches key="linux"/>
			<matches key="macos"/>
			<matches key="android"/>
			<matches key="ios"/>
			<matches key="_" default/>
		</signature>
	</function>

	<function id="number">
		<description>Format a number. Match a numerical value against CLDR plural categories or against a number literal.</description>
		<signature type="match">
			<argument regex="[0-9]+(\.[0-9]+)?"/>
			<option name="localeMatcher" values="lookup bestfit"/>
			<option name="type" values="cardinal ordinal"/>
			<option name="minimumIntegerDigits" regex="[0-9]+"/>
			<option name="minimumFractionDigits" regex="[0-9]+"/>
			<option name="maximumFractionDigits" regex="[0-9]+"/>
			<option name="minimumSignificantDigits" regex="[0-9]+"/>
			<option name="maximumSignificantDigits" regex="[0-9]+"/>
			<matches key="zero"/>
			<matches key="one"/>
			<matches key="two"/>
			<matches key="few"/>
			<matches key="many"/>
			<matches key="other" default/>
			<matches regex="[0-9]"/>
		</signature>
		<signature type="format">
			<argument regex="[0-9]+(\.[0-9]+)?"/>
			<option name="localeMatcher" values="lookup bestfit"/>
			<option name="minimumIntegerDigits" regex="[0-9]+"/>
			<option name="minimumFractionDigits" regex="[0-9]+"/>
			<option name="maximumFractionDigits" regex="[0-9]+"/>
			<option name="minimumSignificantDigits" regex="[0-9]+"/>
			<option name="maximumSignificantDigits" regex="[0-9]+"/>
		</signature>
	</function>
</registry>
```

A localization engineer can then extend the registry by defining the following `customRegistry.xml` file.

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE registry SYSTEM "./registry.dtd">

<registry>
	<function id="adjective">
		<description>Handle grammar of an adjective.</description>
		<signature type="format">
			<argument title="Adjective id"/>
			<option locale="en" name="article" values="definite indefinite none"/>
			<option locale="en" name="plural" values="one other"/>
			<option locale="en" name="case" values="nominative genitive"/>
		</signature>
		<signature type="format">
			<argument title="Adjective id"/>
			<option locale="en" name="article" values="definite indefinite none"/>
			<option name="accord"/>
		</signature>
	</function>

	<function id="adjective">
		<description>Handle grammar of an adjective.</description>
		<signature type="format">
			<argument title="Adjective id"/>
			<option locale="en" name="article" values="definite indefinite none"/>
			<option locale="en" name="plural" values="one other"/>
			<option locale="en" name="case" values="nominative genitive"/>
		</signature>
		<signature type="format">
			<argument title="Adjective id"/>
			<option locale="en" name="article" values="definite indefinite none"/>
			<option name="accord"/>
		</signature>
	</function>
</registry>
```

Messages can now use the `noun` and the `adjective` functions. The following message references the first signature of `adjective`, which expects the `plural` and case` options:

    [You see {$color adjective article=indefinite plural=one case=nominative} {$object noun case=nominative}!]

The following message references the second signature of `adjective`, which only expects the `accord` option:

    $obj = {$object noun case=nominative}
    [You see {$color adjective article=indefinite accord=$obj} {$obj}!]
