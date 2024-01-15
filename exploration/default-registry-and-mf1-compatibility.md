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

Implementations MAY provide other selectors or functions using the mechanisms defined by MF2
but these will not be considered for the LDML45 default registry.
The default registry is a foundational set of selectors and functions that an implementation
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

### Dates and Times

Function name: `:datetime`

Aliases:
- `:date` (with `style=...` option corresponding to `:datetime dateStyle=...`)
- `:time` (with `style=...` option corresponding to `:datetime timeStyle=...`)

Operand: "iso8601"

Options:
- `dateStyle` (`full` `long` `medium` `short`)
- `timeStyle` (`full` `long` `medium` `short`)
- `calendar` (buddhist chinese coptic dangi ethioaa ethiopic gregory hebrew indian islamic islamic-umalqura 
   islamic-tbla islamic-civil islamic-rgsa iso8601 japanese persian roc)
- `numberingSystem` (arab arabext bali beng deva fullwide gujr guru hanidec khmr knda laoo latn 
   limb mlym mong mymr orya tamldec telu thai tibt)
- `timezone` (tzid)
- `hourCycle` (`h11` `h12` `h23` `h24`)
- `weekday` (`long` `short` `narrow`)
- `era` (`long` `short` `narrow`)
- `year` (`numeric` `2-digit`)
- `month` (`numeric` `2-digit` `long` `short` `narrow`)
- `day` (`numeric` `2-digit`)
- `hour` (`numeric` `2-digit`)
- `minute` (`numeric` `2-digit`)
- `second` (`numeric` `2-digit`)
- `fractionalSecondDigits` (`1`, `2`, `3`)
- `timeZoneName` (`long` `short` `shortOffset` `longOffset` `shortGeneric` `longGeneric`)

(When no default is given, the default depends on the locale or implementation)

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

| MF1      | Syntax               | MF2                                                          | Comment |
|----------|----------------------|--------------------------------------------------------------|---------|
| String   | {var}                | {$var} {$var :string}                                        |         |
| Select   | {var,select...}      | .match {$var :string}                                        |         |
| Number   | {num,number}         | {$num :number}                                               |         |
| Integer  | {num,number,integer} | {$num :number maximumFractionDigits=0}<br/>{$num :integer}      |         |
| Percent  | {num,number,percent} | {$num :number style=percent}<br/>{$num :percent}                 |         |
| Currency | {num,number,currency} | {$num :number currency=$code}<br/>{$num :currency}              |         |
| Plural (selector)  | {num,plural, ...}    | .match {$num :number} {$num :plural}               |         |
| Ordinal (selector) | {num,selectordinal, ...} | .match {$num :ordinal}                         |         |
| Ordinal (format)   | {num,ordinal} |                                                           | missing |
| Date     | {date,date}          | {$date :datetime}                                            | short date is default |
| Date     | {date,date,short}    | {$date :datetime dateStyle=short}                            | also medium,long,full |
| Time     | {date,time}          | {$date :datetime timeStyle=short}                            | timeStyle required    |
| Date     | {date,time,short}    | {$date :datetime timeStyle=short}                            | also medium,long,full |
| Datetime | (requires picture or skeleton) | {$date :datetime dateStyle=short timeStyle=short}  | also medium,long,full |
| Datetime | {date,time,::skeleton} | {$date :datetime weekday=short etc.}                       | supported through options bag |
| Spellout | {num,spellout}       |                                                              | missing |
| Duration | {num,duration}       |                                                              | missing |
| Choice   | {num,choice, ...}    |                                                              | deprecated in MF1 |
