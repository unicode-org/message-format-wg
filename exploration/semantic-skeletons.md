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

#### Avoid 'classical skeletons'

Previously, ICU MessageFormat provided support for "classical skeletons",
using a microsyntax derived from familiar 'picture strings' (see below)
combined with code in ICU (`DateTimePatternGenerator`) to produce the desired date/time value format.

`Intl.DateTimeFormat` provides options that provide a similar capability.
These aren't "skeletons" from the point of view that they don't use a dedicated microsyntax similar to 'picture strings',
but the effect is the same:
users specify which fields they want with which display options (such as width).
For example:
```javascript
options = {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  timeZone: "Australia/Sydney",
  timeZoneName: "short",
};
console.log(new Intl.DateTimeFormat("en-AU", options).format(date));
// "2:00:00 pm AEDT"
```

Classical skeleton solutions allow users to express the desired fields and field widths in a formatted date/time value.
The runtime uses locale data to determine minutiae such as 
field-order, 
separators, 
spacing, 
field-length, 
etc. to produce the desired output.

Advantages of semantic skeletons over classical skeletons:

- Provides all and only those combinations that make sense
   - Allows for more efficient implementation, since there is no need to support combinations like "month-hour"
     that are not useful to users
- Allows for a more clear, ergonomic placeholder syntax, since the number of options can be limited
- Easier for user experience designers to specify, developers to implement, and translators to interpret

#### Avoid 'picture strings'

Many date/time formatting regimes provide for "picture strings".
A "picture string" is a pattern using a microsyntax in which the user (developer, translator, UX designer)
exactly specifies the desired format of the date/time value.
In a picture string, separators, spaces, and other formatting are explicitly specified.
This provides a lot of power to the developer or user experience designer, in terms of specifying formatting.
For example: `MMM dd, yyyy` or `yyyy-dd-MM'T'HH:mm:ss`

The MFWG early on considered including support for "picture strings" in the formatting of date/time values.
There is a Working Group consensus **_not_** to support picture strings in Unicode MessageFormat, if possible.
  
Picture strings require translators to interact with and "translate" the picture string
which is embedded into the _placeholder_ in order to get appropriately localized output.
For example, in MF1 you might see: `Today is {myDate,date,MMM dd, yyyy}`

Translating picture strings can result in non-functional messages.
The exotic microsyntax can be unfamiliar to translators, as it is designed for developers.
Unlike "picture strings", skeletons (classical or semantic) do not require the translator or
developer to alter them for each locale or to know about the specifics, 
such as spaces or separators in each locale.
  
Here are some picture strings with their output vs. common skeletons,
showing how picture strings produce poorly localized output
while skeletons produce localized output:

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

The ICU MessageFormat "classical skeleton" microsyntax uses strings supplied by the developers.
These strings specify the fields and field lengths that should appear in the formatted value.
See [here](https://unicode-org.github.io/icu/userguide/format_parse/datetime/#date-field-symbol-table)
The system then uses the string to perform date/time pattern generation,
arranging the specified fields in the correct order,
selecting locale-appropriate separators,
and producing a "picture string" that can be consumed by date/time formatters
such as `java.text.SimpleDateFormat`.

### FAQ

This section considers some potential arguments against the design
or captures frequently asked questions about it.

**What if semantic skeletons don't support the format I want?**

Unlike picture strings or classical skeletons,
semantic skeletons do not allow unrestricted composition of date/time formats.

If there were an overlooked format, it could be added in a future release.
However, the designers of semantic skeletons have considered the breadth of use cases.
If a skeleton is not available, there is probably a good reason for avoiding it.

**My UX designer wants to specify different separators/presentational details.
I could do that with picture strings, but not with any kind of skeleton. Help!**

Specialized formats might be constructed using individual fields or by using formatToParts.
In general, such specialized designs rapidly become examples of poor internationalization,
since examples of such adjustments do not consider the breadth of date/time representation.

**Semantic skeletons are too new. 
Implementation experience is limited.
Shouldn't we wait to adopt them?**

Unicode MessageFormat has a one-time opportunity to avoid "deprecated at birth" date/time formatting
and to provide a robust, internally-consistent mechanism that guides users away from
common date/time formatting pitfalls.

This is already ample experience with classical skeletons.
The difference with semantic skeletons is that it filters out "mistakes"
such as "11 PM April" (`jjMMMM` or `HHaMMMM`) or "2 2025" (`dyyyy`).

**What about specialized formats, such as ISO8601?**

These should be provided via other means than requiring a specialized pattern 
and the (optional) `u:locale` option.
Do you really want to support this,
given that it can then be used for other things:
```
{$now :datetime pattern=|yyyy-MM-dd'T'HH:mm:ss.sssz| u:locale=und timezone=UTC}
```

**What do we call a [floating time value](https://www.w3.org/TR/timezone/#dfn-floating-time)?**
Different platforms cannot agree on what to call a Floating Time Value: HTML and Java use `LocalXXX`,
JavaScript has adopted `PlainXXX`,
some others use different terms, such as `CivilXXX`.
This could affect what functions or options are named when dealing with floating times.

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

> [!NOTE]
> In the subsections below, we only show the `:datetime` function.
> Readers should assume that `:date` and `:time` also exist.

### Incremental (timestamp) values
As a developer, I want to format common incremental time values.
Examples of these are `java.util.Date`, JS `Date`, `time_t`, etc.
These are typically measured in millis or seconds in the UNIX epoch.
The UNIX epoch is measured from January 1, 1970 and uses the UTC time zone.
These values are "attached to the timeline", 
that is, they are not floating times.
These types are very common and are the only option for representing time in some programming languages.

Incremental values usually do not include time zone.
They occasionally include a _local time offset_ ("offset"), although most commonly they do not.

To format a timestamp an offset or a timezone is required.
Options for providing this are:
- Assume UTC
- Assume the runtime's current offset or time zone should be used
- Require offset or time zone be provided (or error)
- Assume the runtime's offset/time zone, but allow user to override

For the table below
- `$d` is the date value `0` (January 1, 1970 00:00:00 UTC);
- the runtime's time zone is `America/Los_Angeles`;
- the user has a time zone of `Europe/Helsinki`

| Option | Syntax | Output |
|---|---|---|
| Assume UTC            | `{$d :datetime}` | `Jan 1, 1970, 12:00:00 AM UTC` |
| Assume runtime zone   | `{$d :datetime}` | `Dec 31, 1969, 4:00:00 PM PST` |
| Require offset        | `{$d :datetime offset=\|02:00\|` | `Jan 1, 1970, 2:00:00 AM GMT+2` |
| Require zone...       | `{$d :datetime timezone=\|Europe/Helsinki\|}` |  `Jan 1, 1970, 2:00:00 AM EET` |
| ... or error          | `{$d :datetime}` | `Bad Operand` |
| Assume runtime...     | `{$d :datetime}` | `Dec 31, 1969, 4:00:00 PM PST` |
| ...but allow override | `{$d :datetime timezone=\|Europe/Helsinki\|}` |  `Jan 1, 1970, 2:00:00 AM EET` |

> [!NOTE]
> Time zone and offset option values can be specified using variables.

### Floating Time values
As a developer, I want to format floating time values.
I may need to force an incremental value to "float", since many platforms do not have a type for floating times,
they only have incremental values.
I may need to force a zoned value to "float" by removing the offset or zone.
I may also need to attach a floating value to the timeline by specifying an offset or time zone.

Floating/unfloating time values is a less-common requirement,
so functions/options might not need to be optimized for these cases.

For the table below:
- `$f` is a floating time value equivalent to `1970-01-01T00:00:00.00`
- `$d` is a timestamp equivalent to `1970-01-01T00:00:00.00Z`
- `$zoned` is a non-floating value equivalent to `1970-01-01T00:00:00.000Z[America/Los_Angeles]`
  (this value might also be represented as `1969-12-31T16:00:00.000-08:00[America/Los_Angeles]`)
- the option `offset` is an example only; the function `:localdatetime` is an example only.
  The function `:zoneddatetime` is one of the alternative designs for zoned values,
  which might make `:datetime` the equivalent of `:localdatetime`??

| Option | Syntax | Output |
|---|---|---|
| Format a floating time | `{$f :datetime}` | `Jan 1, 1970, 12:00:00 AM` |
| Float a timestamp      | `{$d :datetime offset=none}` | `Jan 1, 1970, 12:00:00 AM` |
| Float a zoned value    | `{$zoned :datetime offset=none}` | `Dec 31, 1969, 4:00:00 PM` |
| ... using floating function | `{$zoned :localdatetime}`   |  `Dec 31, 1969, 4:00:00 PM` |
| Attach a floating time to timeline | `{$f :datetime timezone=\|Europe/Helsinki\|}` | `Jan 1, 1970, 2:00:00 AM EET` |

### Zoned or Offset Time values
As a developer, I want to format time values that include an offset or time zone.

In the preceding subsections, the possibility of allowing time zone or offset
to be provided (in the case of timestamps)
or overridden (in the case of floating times or zoned/offsetted times)
was described.
If such behavior is permitted, it introduces tension between the options for offset/time zone
and the value itself.
That is, given a value `1970-01-01T00:00:00.000Z[UTC]`
and an expression `{$zoned :datetime timezone=\|Europe/Helsinki\|}`,
what is the format?
- `Jan 1, 1970, 12:00:00 AM UTC` (value wins; user cannot adjust)
- `Jan 1, 1970, 2:00:00 AM EET` (option wins; inconsistent with some Temporal behaviors on Java and JS)

### Inflection

```
new Intl.DateTimeFormat('fi', { month: 'long' }).format()
// 'toukokuu'

new Intl.DateTimeFormat('fi', { day: 'numeric', month: 'long' }).format()
// '2. toukokuuta'
```

As a developer, I need the formatted values to inflect fields and formats correctly,
depending on the combination chosen for display.
For example, as shown above, 
I want the month name to be inflected for standalone when used by itself,
but properly inflected when used in a month-day combination.

### Error Conditions and Value Forcing
One challenge with formatting date/time values is 
deciding what effect the function has on the resolved value of the operand.
For example, consider a _declaration_ that uses a function `:time`:
>```
>.local $myTime = {$d :time}
>```

Does the variable `$myTime` contain any date information, such as year or month?
What if `$d` (the original value) is an incremental time? Or a datetime value?
Does the declaration strip the visibility of the date fields, assuming that they _were_ previously present?

On the other hand, many combinations of functions and semantic skeletons seem to imply an implicit conversion.
Implementations that use, for example, `java.time` or JS `Temporal` types
have very specific requirements for some of their types.
Some operations on these types can produce error conditions in the function handler,
even if the _message_ itself is well-formed and other, differently-typed, values do not produce errors.

As noted elsewhere, many programming languages and operating environments do not have 
more-modern temporal-like date/time types.
Incremental values or field-based values in these environments 
use calendar and time zone information to compute the displayed field.
Users of these kinds of date/time values sometime can need access to calendar, time zone, and possibly offset controls
in order to achieve effects similar to what temporal types provide.

### Dealing with Field Widths

The current design of date/time functions includes "option bags" derived from `Intl.DateTimeFormat`.
These option bags serve as both classical skeletons _and_ as a source for field width.
The current options are specified as:

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

Notice that each of these options is specifically about field width or presentation.
The "skeleton" functionality in `Intl` is based on the idea that only the fields mentioned are formatted.
If a separate option specifies which fields to use,
then the above options could be used independently to control field presentation.

> Examples.
> ```
> {{{$d :datetime fields=YMDE month=short} prints Wednesday, Jun 4, 2025}}
> {{{$d :datetime fields=YMDE month=short weekday=short} prints Wed, Jun 4, 2025}}
> {{{$d :datetime fields=T timePrecision=minutes} prints 9:53 AM}}
> {{{$d :datetime fields=T timePrecision=seconds hour=2-digit} prints 09:53:00 AM}}
> {{{$d :datetime fields=T timePrecision=fractionalSeconds hour=2-digit fractionalSecondDigits=2} prints 09:53:00.17 AM}}
> ```

In the above design, it would be an error to specify a field width for a field that is not in the skeleton:
```
{{{$d :datetime fields=T month=short} is an error.}}
```

## Requirements

_What properties does the solution have to manifest to enable the use-cases above?_

Users want the most intuitive formats and outcomes to be the defaults.
They should not have to coerce or convert normal date/time types in order to do simple operations.

1. It should be possible to format operands consisting of locally-relevant date/time types, including:
   - Temporal values such as `java.time` or JS `Temporal` values,
   - incremental time types ("timestamps")
     (e.g. milliseconds since epoch times such as `java.util.Date`, `time_t`, JS `Date`, etc.),
   - field-based time types
     (e.g. those that contain separate values per field type in a date/time, such as a year-month),
   - [floating time](https://www.w3.org/TR/timezone/#dfn-floating-time) values
     (e.g. those that are not tied to a specific time zone, variously called local/plain/civil times),
   -  or other local exotica (Java `Calendar`, C `tm` struct, etc.)
1. Date/time formatter options should be able to impose restrictions on acceptable values,
   such as formatting a month requiring a date, and formatting an hour requiring a time.
1. Date/time formatters should not permit users to format bad combinations of fields
   (e.g. `MMMMmm` (month-minute), `yyyyjm` (year-hour-minute), etc.)
1. Date/time formatters should permit users to specify the desired width of indvidual fields
   in a manner similar to classical skeletons,
   while relying on locale data to prevent undesirable results.
   For example:
   | Classical Skeleton | `en-US` Output | 
   |---|---|
   | `yMd` | 04/06/2025 |
   | `yMMMd` | Apr 6, 2025 |
   | `yMMMMd` | April 6, 2025 |
1. Developers, translators, and UI designers should not have to learn
   multiple new microsyntaxes or multiple different sets of options for date/time value formatting.
1. Any microsyntax or option set specified should be easy to understand only from the expression.
1. Any microsyntax or option set specified should not _require_ translators to alter the values in most or all locales.
1. Message authors and developers should be able to manage 
   the formatting of date/time values such that
   processes running in an environment with a different time zone or local time offset
   from that needed to express or format the value
   can get the necessary results.

## Constraints

_What prior decisions and existing conditions limit the possible design?_

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

## Alternatives Considered

_What other solutions are available?_
_How do they compare against the requirements?_
_What other properties they have?_


### Design: Use Option Naming

In this design, we use a capability similar to `FieldSetBuilder` (proposed for ICU4X). 
These have the following built-in "fieldsets" (see [here](https://unicode-org.github.io/icu4x/rustdoc/icu/datetime/fieldsets/index.html)):

|  Fieldset  | Description |
|------------|-------------|
| `Combo`    | Struct for combining date/time fields with zone fields. |
| `D`        | “17” ⇒ day of month (standalone) |
| `DE`       | “17 Friday” ⇒ day of month and weekday |
| `DET`      | “17 Friday, 3:47:50 PM” ⇒ day of month and weekday with time |
| `DT`       | “17, 3:47:50 PM” ⇒ day of month (standalone) with time |
| `E`        | “Friday” ⇒ weekday (standalone) |
| `ET`       | “Friday 3:47:50 PM” ⇒ weekday (standalone) with time |
| `M`        | “May” ⇒ month (standalone) |
| `MD`       | “May 17” ⇒ month and day |
| `MDE`      | “Fri, May 17” ⇒ month, day, and weekday |
| `MDET`     | “Fri, May 17, 3:47:50 PM” ⇒ month, day, and weekday with time |
| `MDT`      | “May 17, 3:47:50 PM” ⇒ month and day with time |
| `T`        | “3:47:50 PM” ⇒ time (locale-dependent hour cycle) |
| `Y`        | “2024” ⇒ year (standalone) |
| `YM`       | “May 2024” ⇒ year and month |
| `YMD`      | “5/17/24” ⇒ year, month, and day |
| `YMDE`     | “Fri, 5/17/24” ⇒ year, month, day, and weekday |
| `YMDET`    | “Fri, 5/17/24, 3:47:50 PM” ⇒ year, month, day, and weekday with time |
| `YMDT`     | “5/17/24, 3:47:50 PM” ⇒ year, month, and day with time |


#### DateTime fields
Use the function `:datetime` and use an _option_ to indicate the fieldset.

The _option_ might have a generic name, such as `fields`,
or it might have sematic names such as `date`/`dateFields`/`time`/`timeFields`.
Option values would be as shown in the table above.

```
{$date :datetime dateFields=YMD}  
{$date :datetime date=YMD}  
{$date :datetime fields=YMD}
```

#### TimePrecision
Note that in the table above, there is only one fieldset of "time" values.
Use a `timePrecision` option to indicate which subfields of a time are desired.
Time formats within a locale don't generally have field lengths
(although zero- versus non-zero filled hours is a variation)
and thus it is sufficient to say what the "last field to show" would be.

The name `timePrecision` is a placeholder.
This option might be shortened to just `time`.

For example:
```
{$date :datetime timePrecision=minute}  ⇒  11:39 AM 
{$date :datetime time=second}           ⇒  11:39:00 AM
```

Pros:
- Reduces the number of skeleton strings and associated alphabet soup
  for message authors (developers, translators) to memorize

Cons:
- Different mechanism from that used for the date portion.
  Greater learning curve/cognitive burden for users?

#### Mixing the Above Solutions

Use `dateFields`, `timePrecisions` and `zoneStyle` to separately control the date, time, and zone
portions of a placeholder.

> A date formatter
>```
> {$d :datetime dateFields=YMD}
>```
> A time formatter
>```
> {$d :datetime timePrecision=minute}
>```
> A datetime formatter
>```
> {$d :datetime dateFields=YMD timePrecision=minute}
>```
> A zoned datetime formatter
>```
> {$d :datetime dateFields=YMD timePrecision=minute zoneStyle=generic}
>```

### Design: Use Separate Functions

Some choices:

#### A single `:datetime` function

_Pros_
- Everything is in one place

_Cons_
- More combinations of options that can form invalid skeletons
- Can require verbose placeholders

#### Use separate `:date`, `:time` and `:datetime` functions

_Pros_
- More tailored to specific user requirements
- `:date` and `:time` are somewhat self-documenting about the message author's formatting intention

_Cons_
- Not fully type-safe.
- The `:datetime` function might duplicate functionality

#### Use separate typed functions

`:date`, `:time`, `:datetime`, `:zoneddatetime`, *maybe* `:zoneddate`, `:zonedtime`, `:timezone`

Problem: Most users are likely to prefer date/time/datetime to zoneddate/zonedtime/zoneddatetime
as the default formatting functions.
Most "classical" time types are timestamps.
User intentions might not be met by these names.

_Pros_
- Helps users get the right results
- Could be less verbose
- Better at documenting the message author's intention

_Cons_
- More functions


#### Use separate skeleton functions

Define functions according to the available "field sets" or fields in the semantic skeletons spec.
Use options to handle field widths.
Such a list might look like:

- Standalone fields
  - `:day`, `:weekday`, `:month`, `:year`, `:hour`, `:minute`, `:second`, `:zone`, `:era`
- Common combinations
  - `:time` and `:date`
- Date Field Sets
  - `:day-weekday`, `:month-day`, `:month-day-weekday`, `:year-month-day`, `:year-month-day-weekday`
- Composite field sets
  - `:date-zone`, `:date-time-zone`, `:time-zone` (note: `time-zone` is two fields, not "timezone")

Examples:
```
Your package arrived on {$d :date} at {$d :time}.
    Your package arrived on Apr 27, 2025 at 10:50 AM.
Your package arrived on {$d :month-day-weekday} at {$d :time-zone}.
    Your package arrived on Sunday, April 27th at 10:50 AM PDT.
Your package arrived on {$d :month-day-weekday month=medium weekday=full} at {$d :time-zone display=full zone=short}.
    Your package arrive on Sunday, Apr 27th at 10:50 PDT.
```


_Pros_
- Options focused on field widths
- Self-documenting: obvious what fields are shown
- Reserves options for field width

_Cons_
- _Eighteen_ (or so) functions
- Names appear generative, but aren't actually
- Options might be baroque. Some option values might not be compatible with one another.
  - Expression-wide options (short/medium/long/full) and field-level options might both be needed together
- Providing easy-to-use standalone field functions 
  could lead to localization failures similar to picture strings,
  as naive users might use combinations of standalone functions to concatenate date/time values
  that are inappropriate in various other locales and require translator intervention.
  > For example, this message hard codes separators, field order, and
  > uses standalone representation of the fields:
  > ```
  > Today is {$d :month} {$d :day}, {$d :year} and it is {$d :hour}:{$d :minute} o'clock.
  >```

---


