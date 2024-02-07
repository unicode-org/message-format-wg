# Default Registry and MF1 Compatibility

Status: **Accepted**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@aphillips</dd>
		<dt>First proposed</dt>
		<dd>2023-12-15</dd>
	</dl>
</details>

## Objective

_What is this proposal trying to achieve?_

This section contains the list of functions (both _selectors_ and _formatters_)
proposed for the 2.0 default registry,
along with their _operands_ and _options_.

It also contains a section comparing MF1 (as embodied by ICU4J) and MF2
to ensure that we don't forget something.

Implementations MAY provide other selectors or formatters using the mechanisms defined by MF2
but these will not be considered for the LDML45 default registry.
The default registry is a foundational set of selectors and formatters that an implementation
claiming MF2 compatibility is required to supply.
Therefore, addition to this list requires a higher level of rigor.

## Default Registry Entries

### Numbers

Function name: `:number`

Aliases: 
- `:integer` (implies: `maximumFractionDigits=0`)
- `:plural` (no format, implies `select=plural` which is default)
- `:ordinal` (implies: `select=ordinal`; we are missing `style=ordinal`)

Operand: anyNumber

Options:
- `compactDisplay` (`short`, `long`; default: `short`)
- `currency` (ISO 4712 currency code)
- `currencyDisplay` (`symbol` `narrowSymbol` `code` `name`; default: `symbol`)
- `currencySign` (`accounting`, `standard`; default: `standard`)
- `notation` (`standard` `scientific` `engineering` `compact`; default: `standard`)
- `numberingSystem` (arab arabext bali beng deva fullwide gujr guru hanidec khmr knda laoo latn 
   limb mlym mong mymr orya tamldec telu thai tibt)
- `select` (`plural`, `ordinal`, `exact`; default: `plural`)
- `signDisplay` (`auto` `always` `exceptZero` `never`; default=`auto`)
- `style` (`decimal` `currency` `percent` `unit`; default=`decimal`)
- `unit` (anything not empty)
- `unitDisplay` (`long` `short` `narrow`; default=`short`)
- `minimumIntegerDigits`, (positive integer, default: `1`)
- `minimumFractionDigits`, (positive integer)
- `maximumFractionDigits`, (positive integer)
- `minimumSignificantDigits`, (positive integer, default: `1`)
- `maximumSignificantDigits`, (positive integer, default: `21`)

(When no default is given, the default depends on the locale or implementation)

---

### Dates and Times

This subsection describes the functions and options for date/time formatting.

#### Functions

Functions for formatting [date/time values](#operands) in the default registry are:

- `:datetime`
- `:date`
- `:time`

If no options are specified, each of the functions defaults to the following:
- `{$d :datetime}` is the same as `{$d :datetime dateStyle=short timeStyle=short}`
- `{$d :date}` is the same as `{$d :date style=short}`
- `{$t :time}` is the same as `{$t :time style=short}`

> [!NOTE]
> Pattern selection based on date/time values is a complex topic and no support for this
> is required in this release.

#### Operands

The operand of a date/time function is either 
an implementation-defined date/time type (passed in as an argument)
or a _date/time literal value_, as defined below.

A **_<dfn>date/time literal value</dfn>_** is a non-empty string consisting of 
one of the following:
- an XMLSchema 1.1 [dateTime](https://www.w3.org/TR/xmlschema11-2/#dateTime)
- an XMLSchema 1.1 [time](https://www.w3.org/TR/xmlschema11-2/#time)
- an XMLSchema 1.1 [date](https://www.w3.org/TR/xmlschema11-2/#date)

The `timezoneOffset` of each of these formats is optional. 
When the offset is not present, implementations should use a floating time type
(such as Java's `java.time.LocalDateTime`) to represent the time value.
For more information, see [Working with Timezones](https://w3c.github.io/timezone).

> [!IMPORTANT]
> The [ABNF](./spec/message.abnf) and [syntax](./spec/syntax.md) of MFv2
> do not formally define date/time literals. 
> This means that a _message_ can be syntactically valid but produce
> runtime errors due to what amounts to a "type mismatch".

> [!NOTE]
> String values passed as variables in the _formatting context_'s
> _input mapping_ can be formatted as date/time values as long as their
> contents are date/time literals.
>
> For example, if the value of the variable `now` were the string
> `2024-02-06T16:40:00Z`, it would behave identically to the local
> variable in this example:
> ```
> .local $example = {|2024-02-06T16:40:00Z| :datetime}
> {{{$now :datetime} == {$example}}}
> ```

> [!NOTE]
> True time zone support in serializations is expected to coincide with the adoption
> of Temporal in JavaScript.
> The form of these serializations is known and is a de facto standard.
> Support for these extensions is expected to be required in the post-tech preview.
> See: https://datatracker.ietf.org/doc/draft-ietf-sedate-datetime-extended/

#### Options

All date/time functions support the following options, which 
provide high-level control over date/time formats:
- `calendar` (default is locale-specific)
  - valid [Unicode Calendar Identifier](https://cldr-smoke.unicode.org/spec/main/ldml/tr35.html#UnicodeCalendarIdentifier)
- `numberingSystem` (default is locale-specific)
   - valid [Unicode Number System Identifier](https://cldr-smoke.unicode.org/spec/main/ldml/tr35.html#UnicodeNumberSystemIdentifier)
- `timeZone` (default is system default time zone or UTC)
  - valid identifier per [BCP175](https://www.rfc-editor.org/rfc/rfc6557)

In addition to the above high-level options, a function can use either the appropriate
_style_ options for that function
or can use a collection of _field options_ (but not both) to control the formatted 
output.

The function `:datetime` has these function-specific _style_ options.
- `dateStyle`
  - `full`
  - `long`
  - `medium`
  - `short`
- `timeStyle`
  - `full`
  - `long`
  - `medium`
  - `short`

The function `:date` has these function-specific _style_ options:
- `style`
  - `full`
  - `long`
  - `medium`
  - `short`

The function `:time` has these function-specific _style_ options:
- `style`
  - `full`
  - `long`
  - `medium`
  - `short`

The _field_ options are defined as follows:

All functions have the following option:
- `timeZoneName`
  - `long`
  - `short`
  - `shortOffset`
  - `longOffset`
  - `shortGeneric`
  - `longGeneric`

The functions `:datetime` and `:date` have the following options:
- `weekday`
  - `long`
  - `short`
  - `narrow`
- `era`
  - `long`
  - `short`
  - `narrow`
- `year`
  - `numeric`
  - `2-digit`
- `month`
  - `numeric`
  - `2-digit`
  - `long`
  - `short`
  - `narrow`
- `day`
  - `numeric`
  - `2-digit`
 
The functions `:datetime` and `:time` have the following options:
- `hour`
  - `numeric`
  - `2-digit`
- `minute`
  - `numeric`
  - `2-digit`
- `second`
  - `numeric`
  - `2-digit`
- `fractionalSecondDigits`
  - `1`
  - `2`
  - `3`
- `hourCycle` (default is locale-specific)
  - `h11`
  - `h12`
  - `h23`
  - `h24`


#### Selection

Selection based on date/time types is not required by MFv2.
Implementations should use care when defining selectors based on date/time types.
The types of queries found in implementations such as `java.time.TemporalAccessor`
are complex and user expectations may be inconsistent with good I18N practices.

---

### Strings

Function name: `:string`

String is both a formatter and a selector, where it fills the role that `SelectFormat` fills in MF1.

Operand: any value

Options:
(none?)


### Other


### Deliberately Excluded

The following functionality was deliberately excluded:
* Spellout
* Duration
* ChoiceFormat
* Percent (as an alias of `:number`)
* Currency (as an alias of `:number`)


## Compatibility Matrix

How to write an MF1 format or selector in MF2:

| MF1                | Syntax                         | MF2                                                                 | Comment                         |
| ------------------ | ------------------------------ | ------------------------------------------------------------------- | ------------------------------- |
| String             | `{var}`                        | `{$var}`<br/>`{$var :string}`                                       |                                 |
| Select             | `{var,select, ...}`            | `.match {$var :string}`<br/>`.match {$num :number select=exact}`    |                                 |
| Number             | `{num,number}`                 | `{$num :number}`                                                    |                                 |
| Integer            | `{num,number,integer}`         | `{$num :integer}`<br/>`{$num :number maximumFractionDigits=0}`      |                                 |
| Percent            | `{num,number,percent}`         | `{$num :number style=percent}`                                      |                                 |
| Currency           | `{num,number,currency}`        | `{$num :number style=currency currency=$code}`                      |                                 |
| Plural (selector)  | `{num,plural, ...}`            | `.match {$num :plural}`<br/>`.match {$num :number}`                 |                                 |
| Ordinal (selector) | `{num,selectordinal, ...}`     | `.match {$num :ordinal}`<br/>`.match {$num :number select=ordinal}` |                                 |
| Ordinal (format)   | `{num,ordinal}`                |                                                                     | missing                         |
| Date               | `{date,date}`                  | `{$date :date}`<br/>`{$date :datetime}`                             | short date is default           |
| Date               | `{date,date,short}`            | `{$date :date style=short}`<br/>`{$date :datetime dateStyle=short}` | also medium,long,full           |
| Time               | `{date,time}`                  | `{$date :time}`<br/>`{$date :datetime timeStyle=short}`             | shorthand or timeStyle required |
| Date               | `{date,time,short}`            | `{$date :time style=short}`<br/>`{$date :datetime timeStyle=short}` | also medium,long,full           |
| Datetime           | (requires picture or skeleton) | `{$date :datetime dateStyle=short timeStyle=short}`                 | also medium,long,full           |
| Datetime           | `{date,time,::skeleton}`       | `{$date :datetime weekday=short ...}`                               | supported through options bag   |
| Spellout           | `{num,spellout}`               |                                                                     | missing                         |
| Duration           | `{num,duration}`               |                                                                     | missing                         |
| Choice             | `{num,choice, ...}`            |                                                                     | deprecated in MF1               |
