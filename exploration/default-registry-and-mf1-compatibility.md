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

Dates and times have the following functions:

- `:datetime`
  - defaults to `dateStyle=short timeStyle=short`
- `:date`
  - defaults to `dateStyle=short`
  - Does not permit any of these options:
    - `timeStyle`
    - `hour`
    - `minute`
    - `second`
    - `fractionalSecondDigits`
    - `hourCycle`
- `:time`
  - defaults to `timeStyle=short`
  - Does not permit any of these options:
    - `dateStyle`
    - `weekday`
    - `era`
    - `year`
    - `month`
    - `day`

#### Operands

The operand of a date/time function is either 
an implementation-defined date/time type (passed in as an argument)
or a literal that can be parsed to an implementation-defined date/time type.

Date/time literals are required to be an XMLSchema 
[dateTime](https://www.w3.org/TR/xmlschema11-2/#dateTime),
[time](https://www.w3.org/TR/xmlschema11-2/#time),
or [date](https://www.w3.org/TR/xmlschema11-2/#date).
The `timezoneOffset` of each of these formats is optional. 
When the offset is not present, conversion to incremental time types is required
to treat the offset identically to UTC.
Conversion of such values to floating time types
(such as Java's `java.time.LocalDateTime`) should omit time zone.
For more information, see [Working with Timezones](https://w3c.github.io/timezone).

> [!NOTE]
> True time zone support in serializations is expected to coincide with the adoption
> of Temporal in JavaScript.
> The form of these serializations is known and is a de facto standard.
> Support for these extensions is expected to be required in the post-tech preview.
> See: https://datatracker.ietf.org/doc/draft-ietf-sedate-datetime-extended/

#### Options

The following options provide high-level control over date/time formats:
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
- `calendar` (default is locale-specific)
  - valid [Unicode Calendar Identifier](https://cldr-smoke.unicode.org/spec/main/ldml/tr35.html#UnicodeCalendarIdentifier)
- `numberingSystem` (default is locale-specific)
   - valid [Unicode Number System Identifier](https://cldr-smoke.unicode.org/spec/main/ldml/tr35.html#UnicodeNumberSystemIdentifier)
- `timeZone` (default is system default time zone or UTC)
  - valid identifier per [BCP175](https://www.rfc-editor.org/rfc/rfc6557)
- `hourCycle` (default is locale-specific)
  - `h11`
  - `h12`
  - `h23`
  - `h24`
 
The following options are used to construct date/time formats in a manner analogous to skeletons. 
They do not have default values because the value must be specified.
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
- `timeZoneName`
  - `long`
  - `short`
  - `shortOffset`
  - `longOffset`
  - `shortGeneric`
  - `longGeneric`

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
