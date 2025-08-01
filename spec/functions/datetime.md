### Date and Time Value Formatting

This subsection describes the _functions_ and _options_ for date/time formatting.

> [!IMPORTANT]
> The _functions_ in this section have a status of **Draft**.
> They are proposed for inclusion in a future release and are not Stable.
> The _options_ and _option values_ used by `:datetime`, `:date`, and `:time`
> are based on [Semantic Skeletons], which are in technical preview.
> The set of _options_ and _option values_ will be extended by later versions of this specification.

> [!NOTE]
> Selection based on date/time types is not required by this release of MessageFormat.
> Use care when defining implementation-specific _selectors_ based on date/time types.
> The types of queries found in implementations such as `java.time.TemporalAccessor`
> are complex and user expectations might be inconsistent with good I18N practices.

[Semantic Skeletons]: https://www.unicode.org/reports/tr35/tr35-75/tr35-dates.html#Semantic_Skeletons

#### The `:datetime` function

The function `:datetime` is used to format a date/time value.
Its formatted result will always include both the date and the time,
and optionally a timezone.

If no options are specified, this function defaults to the following:

- `{$d :datetime}` is the same as<br>
  `{$d :datetime dateFields=year-month-day timePrecision=minute}`

> [!NOTE]
> The formatting behavior of `:datetime` is inconsistent with `Intl.DateTimeFormat`
> in JavaScript and with `{d,date}` in ICU MessageFormat 1.0.
> This is because, unlike those implementations, `:datetime` is distinct from `:date` and `:time`.

##### Operands

The _operand_ of the `:datetime` function is either
an implementation-defined date/time type
or a _date/time literal value_, as defined in [Date and Time Operand](#date-and-time-operands).
All other _operand_ values produce a _Bad Operand_ error.

##### Options

The following _options_ are REQUIRED to be available on the function `:datetime`:

- `dateFields`
  - `weekday`
  - `day-weekday`
  - `month-day`
  - `month-day-weekday`
  - `year-month-day` (default)
  - `year-month-day-weekday`
- `dateLength`
  - `long`
  - `medium` (default)
  - `short`
- `timePrecision`
  - `hour`
  - `minute` (default)
  - `second`
- `timeZoneStyle`
  - `long`
  - `short`
- _Date/time override options_

If the `timeZoneStyle` _option_ is not included in the _expression_,
its formatted result will not include a timezone indicator.

Except for _date/time override options_,
each `:datetime` _option value_ MUST be set by a _literal_.
If such an _option value_ is a _variable_,
a _Bad Option Error_ is emitted and
the _option_ is ignored when formatting the _expression_.

If the _operand_ of the _expression_ is an implementation-defined date/time type,
it can include other option values.
Any _date/time override options_ of the operand are included in the resolved option values of the _expression_,
with _options_ on the _expression_ taking priority over any options of the _operand_.
Any _operand_ options not matching the _date/time override options_ are ignored.

##### Resolved Value

The _resolved value_ of an _expression_ with a `:datetime` _function_
contains an implementation-defined date/time value
of the _operand_ of the annotated _expression_,
together with the resolved options values.

#### The `:date` function

The function `:date` is used to format the date portion of date/time values.

If no options are specified, this function defaults to the following:

- `{$d :date}` is the same as `{$d :date fields=year-month-day length=medium}`

##### Operands

The _operand_ of the `:date` function is either
an implementation-defined date/time type
or a _date/time literal value_, as defined in [Date and Time Operand](#date-and-time-operands).
All other _operand_ values produce a _Bad Operand_ error.

##### Options

The following _options_ are REQUIRED to be available on the function `:date`:

- `fields`
  - `weekday`
  - `day-weekday`
  - `month-day`
  - `month-day-weekday`
  - `year-month-day` (default)
  - `year-month-day-weekday`
- `length`
  - `long`
  - `medium` (default)
  - `short`
- _Date/time override options_

The `fields` and `length` _option values_ MUST each be set by a _literal_.
If such an _option value_ is a _variable_,
a _Bad Option Error_ is emitted and
the _option_ is ignored when formatting the _expression_.

If the _operand_ of the _expression_ is an implementation-defined date/time type,
it can include other option values.
Any _date/time override options_ of the operand are included in the resolved option values of the _expression_,
with _options_ on the _expression_ taking priority over any options of the _operand_.
Any _operand_ options not matching the _date/time override options_ are ignored.

##### Resolved Value

The _resolved value_ of an _expression_ with a `:date` _function_
is implementation-defined.

An implementation MAY emit a _Bad Operand_ or _Bad Option_ error (as appropriate)
when a _variable_ annotated directly or indirectly by a `:date` _annotation_
is used as an _operand_ or an _option value_.

#### The `:time` function

The function `:time` is used to format the time portion of date/time values.
Its formatted result will always include the time,
and optionally a timezone.

If no options are specified, this function defaults to the following:

- `{$t :time}` is the same as `{$t :time precision=minute}`

##### Operands

The _operand_ of the `:time` function is either
an implementation-defined date/time type
or a _date/time literal value_, as defined in [Date and Time Operand](#date-and-time-operands).
All other _operand_ values produce a _Bad Operand_ error.

##### Options

The following _options_ are REQUIRED to be available on the function `:time`:

- `precision`
  - `hour`
  - `minute` (default)
  - `second`
- `timeZoneStyle`
  - `long`
  - `short`
- _Date/time override options_

If the `timeZoneStyle` _option_ is not included in the _expression_,
its formatted result will not include a timezone indicator.

The `precision` and `timeZoneStyle` _option values_ MUST each be set by a _literal_.
If such an _option value_ is a _variable_,
a _Bad Option Error_ is emitted and
the _option_ is ignored when formatting the _expression_.

If the _operand_ of the _expression_ is an implementation-defined date/time type,
it can include other option values.
Any _date/time override options_ of the operand are included in the resolved option values of the _expression_,
with _options_ on the _expression_ taking priority over any options of the _operand_.
Any _operand_ options not matching the _date/time override options_ are ignored.

##### Resolved Value

The _resolved value_ of an _expression_ with a `:time` _function_
is implementation-defined.

An implementation MAY emit a _Bad Operand_ or _Bad Option_ error (as appropriate)
when a _variable_ annotated directly or indirectly by a `:time` _annotation_
is used as an _operand_ or an _option value_.

#### Date and Time Operands

The _operand_ of a date/time function is either
an implementation-defined date/time type
or a _date/time literal value_, as defined below.
All other _operand_ values produce a _Bad Operand_ error.

A **_<dfn>date/time literal value</dfn>_** is a non-empty string consisting of an ISO 8601 date,
or an ISO 8601 datetime optionally followed by a timezone offset.
As implementations differ slightly in their parsing of such strings,
ISO 8601 date and datetime values not matching the following regular expression MAY also be supported.
Furthermore, matching this regular expression does not guarantee validity,
given the variable number of days in each month.

```regexp
(?!0000)[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])(T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]{1,3})?(Z|[+-]((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?)?
```

When the time is not present, implementations SHOULD use `00:00:00` as the time.
When the offset is not present, implementations SHOULD use a floating time type
(such as Java's `java.time.LocalDateTime`) to represent the time value.
For more information, see [Working with Timezones](https://w3c.github.io/timezone).

> [!IMPORTANT]
> The [ABNF](/spec/message.abnf) and [syntax](/spec/syntax.md) of Unicode MessageFormat
> do not formally define date/time literals.
> This means that a _message_ can be syntactically valid but produce
> a _Bad Operand_ error at runtime.

> [!NOTE]
> String values passed as variables in the _formatting context_'s
> _input mapping_ can be formatted as date/time values as long as their
> contents are date/time literals.
>
> For example, if the value of the variable `now` were the string
> `2024-02-06T16:40:00Z`, it would behave identically to the local
> variable in this example:
>
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

#### Date and Time Override Options

**_<dfn>Date/time override options</dfn>_** are _options_ that allow an _expression_ to
override values set by the current locale,
or provided by the _formatting context_ (such as the default time zone),
or embedded in an implementation-defined date/time _operand_ value.

> [!NOTE]
> These _options_ do not have default values because they are only to be used
> as overrides for locale-and-value dependent implementation-defined defaults.

The following _option_ is REQUIRED to be available on
the functions `:datetime`, `:date`, and `:time`.

- `timeZone`
  - A valid time zone identifier
    (see [TZDB](https://www.iana.org/time-zones)
    and [LDML](https://www.unicode.org/reports/tr35/tr35-dates.html#Time_Zone_Names)
    for information on identifiers)
  - `input`
  - `UTC`

The default value for `timeZone` is the default time zone provided by the _formatting context_.

The value `input` corresponds to the time zone of the _operand_.
If it is used and the _resolved value_ of the _operand_ does not include a time zone or offset,
a _Bad Operand_ error is emitted and the default time zone is used to format the _expression_.

If the _resolved value_ of the _operand_ includes a time zone or offset,
and the _resolved value_ of the `timeZone` _option_ is different from that,
an implementation SHOULD convert the _resolved value_ of the _operand_
to the time zone indicated by the _resolved value_ of the `timeZone` _option_.
If such conversion is not supported, an implementation MAY alternatively
emit a _Bad Option_ error and use a _fallback value_ as the _resolved value_ of the _expression_.

The following _option_ is REQUIRED to be available on
the functions `:datetime` and `:time`:

- `hour12`
  - `true`
  - `false`

The following _option_ is RECOMMENDED to be available on
the functions `:datetime`, `:date`, and `:time`.

- `calendar`
  - valid [Unicode Calendar Identifier](https://unicode.org/reports/tr35/tr35.html#UnicodeCalendarIdentifier)
