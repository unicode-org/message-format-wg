# Semantic Skeletons Design

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@sffc</dd>
    <dd>@aphillips</dd>
		<dt>First proposed</dt>
		<dd>2024-04-06</dd>
		<dt>Pull Requests</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/1067">#1067</a></dd>
	</dl>
</details>

## Objective

_What is this proposal trying to achieve?_

### Provide support for formatting date/time values using semantic skeletons

"Semantic skeletons" are a method introduced in CLDR 46 for programmatically selecting a datetime pattern for formatting. 
There is a fixed set of acceptable semantic skeletons.

Previously, ICU MessageFormat provided support for "classical skeletons",
using a microsyntax derived from familiar picture strings (see below)
combined with code in ICU (`DateTimePatternGenerator`) to produce the desired date/time value format.
`Intl.DateTimeFormat` uses "option bags" to provide a similar capability.
A classical skeleton allowed users to express the desired fields and field widths in a formatted date/time value.
The runtime uses locale data to determine minutiae such as 
field-order, 
separators, 
spacing, 
field-length, 
etc. to produce the desired output.

Advantages of semantic skeletons over classical skeletons:

- A smaller set of acceptable options focused on producing outputs that are sensical
- Allows for a more efficient implementation
- Allows for a more clear, ergonomic API
- More future-proof since CLDR recently added them (??)


### Avoid 'picture strings'

The MFWG early on considered including support for "picture strings" in the formatting of date/time values.
There is a Working Group consensus **_not_** to support picture strings in Unicode MessageFormat, if possible.
Many date/time formatting regimes provide for "picture strings".
A "picture string" is a pattern using a microsyntax in which the user (developer, translator, UX designer)
exactly specifies the desired format of the date/time value.
In a picture string, separators, spaces, and other formatting are explicitly specified.
This provides a lot of power to the devleoper or user experience designer, in terms of specifying formatting.
For example: `MMM dd, yyyy` or `yyyy-dd-MM'T'HH:mm:ss`
  
Picture strings require translators to interact with and "translate" the picture string
which is embedded into the _placeholder_ in order to get appropriately localized output.
For example, in MF1 you might see: `Today is {myDate,date,MMM dd, yyyy}`

Translating picture strings can result in non-functional messages.
The exotic microsyntax can be unfamiliar to translators, as it is designed for developers.
Unlike "picture strings", skeletons (classical or semantic) do not require the translator or
developer to alter them for each locale or to know about the specifics, 
such as spaces or separators in each locale.
  
Here are some picture strings with their output vs. common skeletons:

| Picture String | Locale | Output | Skeleton yMMMd | Skeleton yMMd |
|---|---|---|---|---|
|MMM dd, yyyy| en-US | Apr 22, 2025| Apr 22, 2025| 04/22/2025|
| | fr-FR | avr. 22, 2025| 22 avr. 2025| 22/04/2025|
| | ja-JP | 4月 22, 2025| 2025年4月22日| 2025/04/22|
|dd MMM, yyyy| en-US | 22 Apr, 2025| Apr 22, 2025| 04/22/2025|
| | fr-FR | 22 avr., 2025| 22 avr. 2025| 22/04/2025|
| | ja-JP | 22 4月, 2025| 2025年4月22日| 2025/04/22|
|MM/dd/yyyy| en-US | 04/22/2025| Apr 22, 2025| 04/22/2025|
| | fr-FR | 04/22/2025| 22 avr. 2025| 22/04/2025|
| | ja-JP | 04/22/2025| 2025年4月22日| 2025/04/22|
|dd-MM-yyyy| en-US | 22-04-2025| Apr 22, 2025| 04/22/2025|
| | fr-FR | 22-04-2025| 22 avr. 2025| 22/04/2025|
| | ja-JP | 22-04-2025| 2025年4月22日| 2025/04/22|
  
## Background

_What context is helpful to understand this proposal?_

Links:
- [Semantic Skeletons Specification](https://unicode.org/reports/tr35/tr35-dates.html#Semantic_Skeletons)
- [ICU4X Field Set Enum \(strongly typed\)](https://unicode-org.github.io/icu4x/rustdoc/icu/datetime/fieldsets/enums/enum.CompositeFieldSet.html)
- [ICU4X Field Set Builder \(more JS-like\)](https://unicode-org.github.io/icu4x/rustdoc/icu/datetime/fieldsets/builder/struct.FieldSetBuilder.html)


Semantic skeletons are not the first attempt to provide this functionality.
Previous skeleton mechanisms ("classical skeletons") used 
collections of field options (as in `Intl.DateTimeFormat`)
or a microsyntax (as in ICU4J).

The `Intl.DateTimeFormat` skeletons consist of "option bags"
such as `{ year: "numeric", month: "short", day: "numeric" }`
in which the user specifies the field and its width.
Only fields appearing in the options appear in the formatted date/time value.

The ICU microsyntax uses strings supplied by the developers.
These strings specify the fields and field lengths that should appear in the formatted value.
See [here](https://unicode-org.github.io/icu/userguide/format_parse/datetime/#date-field-symbol-table)
The system then uses the string to perform date/time pattern generation,
arranging the specified fields in the correct order,
selecting locale-appropriate separators,
and producing a "picture string" that can be consumed by date/time formatters
such as `java.text.SimpleDateFormat`.

## Use-Cases

_What use-cases do we see? Ideally, quote concrete examples._

As a developer, I want to format date, time, or date/time values to show specific fields
with specific appearance without having to learn a complex microsyntax
or modify my code or formatting directions for each locale.

As a translator, I want to understand what output a given date/time placeholder will produce 
in my language.

As a translator, I don't want to have to "translate" or modify a date/time placeholder to suit
my language's needs.
I should trust that the placeholder will produce appropriate results for my language.

## Requirements

_What properties does the solution have to manifest to enable the use-cases above?_

1. It should be possible to format common incremental time types
   (e.g. milliseconds since epoch times)
2. It should be possible to format field-based time types
   (e.g. those that contain seperate values per field type in a date/time, such as a year-month)
3. It should be possible to format [floating time](https://www.w3.org/TR/timezone/#dfn-floating-time) values
   (e.g. those that are not tied to a specific time zone)
4. Date/time formatters should not permit users to format fields that don't exist in the value
   (e.g. the "month" of a time, the "hour" of a date)
5. Date/time formatters should not permit users to format bad combinations of fields
   (e.g. `MMMMmm` (month-minute), `yyyyjm` (year-hour-minute), etc.)
6. Date/time formatters should permit users to control or influence the width of indvidual fields
   in a manner similar to classical skeletons
   (e.g. `yMMd` vs. `yMMMd` vs. `yMMMMd` => 04/06/2025 vs. Apr 6, 2025 vs. April 6, 2025)
7. Developers, translators, and UI designers should only have to learn a single "microsyntax" or set of options for date formatting.
   Such a syntax or option set should be easy to understand only from the placeholder.
   Such a syntax or option set should not require translators to alter the values in most or all locales.

## Constraints

_What prior decisions and existing conditions limit the possible design?_

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

## Alternatives Considered

_What other solutions are available?_
_How do they compare against the requirements?_
_What other properties they have?_


### Design: Use Option Naming

In this section, we use a scheme similar to `FieldSetBuilder` linked earlier.

#### DateTime fields

Options:

```
{$date :datetime dateFields="YMD"}  
{$date :datetime date="YMD"}  
{$date :datetime fields="YMD"}
```

#### TimePrecision

Options:
```
{$date :datetime timePrecision="minute"}  
{$date :datetime time="minute"}
```
(TODO: Add others)

### Design: Use Separate Functions

Some choices:

1. A single :datetime function  
   1. Pro: All in one place  
   2. Con: More combinations of options that form invalid skeletons  
2. :date, :time, and :datetime  
   1. Pro: More tailored and type-safe  
   2. Con: Not fully type-safe  
3. :date, :time, :datetime, :zoneddatetime, *maybe* :zoneddate, :zonedtime, :timezone  
   1. Pro: Most type-safe  
   2. Con: Lots of functions
