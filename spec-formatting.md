# Formatting Behaviour

## Message Pattern Selection

When resolving and formatting a SelectMessage,
it is necessary to first select the PatternMessage of one of its `cases`.

Case selection is done by first resolving the value of
each of the SelectMessage `select` values,
and then looking for the first `cases` entry for which all the keys provide a match.
Each Selector may define a `fallback` value to use if an exact match is not found.
If a `fallback` is not defined, the default value **"other"** is used.

To perform case selection:

1. Resolve the value of each `select` entry.
1. Consider each `key` of `cases` in their specified order.
1. If every `key` value matches the corresponding resolved value of `select` or its fallback value,
   select the `value` of the current case.
   If the selection made use of at least one fallback value,
   include a `meta` value `selectResult: 'fallback'` in the resolved value of this message.
1. If no case is selected:
   1. Report an error in an implementation-specified manner.
   1. Use a fallback representation as the resolved value of the current message,
      including a `meta` value `selectResult: 'no-match'`.

This algorithm relies on `cases` being in an appropriate order,
as the first full match will be selected.
Therefore, cases with more precise key values should precede more general values.
A case with an empty list as its `key` will always be selected,
unless an earlier case was matched first.

In order to compare a selector value with its corresponding string key value,
either the selector value must itself be a string,
it must be representable as a string, or
the implementation must provide special handling for its value type.
If none of these applies for a selector,
its value cannot provide a match for any key value.

### Plural Category Selectors

In order to support plural category selection,
an implementation MUST provide special handling for selectors which resolve to numerical values,
as well as selectors which resolve to some representation of a numerical value combined with formatting options.

For such numerical values,
if a key value is one of the CLDR plural categories
`zero`, `one`, `two`, `few`, `many` or `other`,
the corresponding plural category of the selector value MUST be determined for the current locale,
and the given key value compared to it rather than a string representation of the value itself.
If the selector value includes any formatting options,
these must be accounted for when determining the plural category.

Specifically, the formatting options described here may include
an option specifying a minimum number of fraction digits,
as well as an option specifying ordinal (rather than the default cardinal) plurals to be used.
In many locales, these options affect the plural category of a numerical value.

Separately from the CLDR plural category values,
if a key value consists entirely of a string representation of a decimal integer,
this integer value is compared to the selector's numerical value
instead of the customary string comparison.
Notably, in this comparison any formatting options of the numerical value are not considered.

### MessageRef as Selector

If a MessageRef is used as a selector value,
it will match a key value if the resolved message's formatted-string output matches the corresponding key value exactly.
If the selector message's resolution or formatting resulted in any errors,
it will not match any key value.

## Message Pattern Resolution

The resolution and formatting of a message may be dependent on
a number of environmental or runtime factors.
Some of this context -- in particular, information about the current locale --
is common to all pattern elements,
while other parts are specific to each pattern element.

It may be useful for an implementation to consider the resolution of pattern element values
as a separate step from their formatting.
For example, selector values that resolve to numerical values need special handling.
Separating formatting from resolution also allows for formattable data types to
be handled independently of their origin.

As formatting a message often requires interaction with external and user-controlled values,
contextual access SHOULD be limited as much as possible during value resolution and formatting.

The Literal and Alias pattern elements
do not require any external context for their resolution.

### Locale Information

The exact shape of locale information is implementation-dependent,
but must be made available when resolving or formatting each part of a message.
Locale information MUST at least include the tag of a preferred locale,
but MAY also include additional information such as a list of fallback tags.
Implementations SHOULD NOT assume that a message in a resource with a specific locale
will always be formatted with that exact locale.

### VariableRef

Resolving the value of a variable requires access to variables.
At its simplest,
this may be achieved by having the formatting call include
a map of variable values as an argument.

As a VariableRef may include a `var_path` array with more than one value,
its resolution may require accessing inner properties of an object value.
For example, a path with a resolved value of `['user', 'name']` would either
require something like `{ name: 'Kat' }` as the value of the `'user'` variable,
or a more complex data structure as the map of variable values.

### FunctionRef

A MessageFormat implementation MUST provide a way for
formatting functions to be defined by its users.
As the same formatting functions are expected to be used relatively widely,
such functions may well be shared across multiple MessageFormat instances.

All functions share a single namespace,
and in the data model their `func` identifiers are static strings.
This allows for (but does not require) an implementation to check while loading a resource
whether all of the FunctionRefs included in its messages
refer to known registered functions.

Formatting functions MUST be pure, i.e.
provide the same outputs for the same input arguments and options,
and have no side effects.
This does not forbid such formatting functions from internally memoizing or sharing
formatters or other functions,
as long as this has no external visibility.

As formatting functions are often custom code written for a specific user,
implementations SHOULD take this into account in their treatment of formatting functions
and the development of their security models.
The contextual access of a formatting function SHOULD be limited as much as possible,
and the access level required to define a new function SHOULD be higher than the access level
required to introduce a new message to be formatted.

Formatting functions MUST NOT treat their inputs differently depending on their origin.
This means that a formatting function that is (for example) given a string value as an argument
MUST provide the same output independently of whether the string is the resolved value of
a Literal or a VariableRef pattern element.

### MessageRef

The resolution of a MessageRef requires access to the currently available messages.
Resolving a MessageRef with a `res_id` value requires
access not only to messages in the current resource, but also to other message resources.

The shape and requirements of the context required for this
are presented in the [Message Selection](./spec-message-selection.md) section.

### Element

Resolving an Element and its corresponding ElementEnd (if any) requires
a function capable of transforming
the element's name, resolved `options`, and any body contents into an appropriate representation.

As the intended use and formatted representation of an Element may be highly variable,
an implementation MAY transform the Element and ElementEnd pattern elements individually,
rather than considering them and their body contents to have a single value.

An implementation MAY use additional context when formatting an Element and its body,
for example to overlay option values with those provided in the Element.

#### Improperly Nested Elements

If Element/ElementEnd pattern element pairs are improperly nested
an implementation MUST do one of the following:

1. Consider this an error and use a fallback representation for some or all of the Element and ElementEnd pattern elements.
2. Resolve the impropriety somehow, potentially removing or duplicating some of the pattern elements.
3. Do nothing, as the Element formatter and the output target may support such content directly.

For example, an input message

    This is <b>bold <i>both</b> italic</i>

could be formatted the same as any of the following, depending on the implementation and the target format:

    This is bold both italic
    This is <b>bold <i>both</i></b><i> italic</i>
    This is <b>bold <i>both</b> italic</i>

#### Element Without Corresponding ElementEnd

It is an error for an Element to expect to be followed by a later ElementEnd,
and for no such ElementEnd to be available during formatting.

In such a case, an implementation MUST resolve the message as if the expected ElementEnd was included
immediately before the first other ElementEnd corresponding to an Element before the current one,
or at the end of the current pattern,
whichever comes first.

## Message Formatting

After a message is resolved to a single sequence of values,
it may be formatted.
Each implementation MAY support any number of formatting targets.
While the shape of the resolved formattable values is entirely implementation-defined,
implementations SHOULD include at least one output format other than a concatenated string,
which is able to represent the resolved type and metadata information of the message's parts.

If a resolved value is numeric,
an implementation MUST format it as if it were the single argument of a `number` formatter with no options.
If a resolved value is a datetime value,
an implementation MUST format it as if it were the single argument of a `datetime` formatter with no options.
And implementation MAY define other similar rules for other data types.

## Error Handling

A MessageFormat implementation MUST provide a formatter interface that will always
return at least some fallback representation in the expected target form,
despite any errors during its resolution or formatting.
An implementation SHOULD provide for a side channel of some description for reporting and handling such errors,
while still returning output in the expected form.

The specifics of the error side channel are left for each implementation,
but the following string fallback representations MUST be used with any string formatting target.
In a concatenated string output,
any failed parts except for elements MUST be preceded by U+007B LEFT CURLY BRACKET `{` and
followed by U+007D RIGHT CURLY BRACKET `}` characters.

### VariableRef

If a variable is undefined or its resolution or formatting fails for some other reason,
represent it with a U+0024 DOLLAR SIGN `$` followed by the variable's resolved path,
joined together with a U+002E FULL STOP `.` character between each part.

### FunctionRef

If a formatting function is not available,
throws an error when called,
returns `undefined`, or
its resolution or formatting fails for some other reason,
represent it with its name followed by the characters U+0028 LEFT PARENTHESIS `(` and U+0029 RIGHT PARENTHESIS `)`.

An implementation MAY allow for a formatting function to include
the resolved values of its arguments between the parenthesis characters,
separated by a U+002C COMMA `,` followed by a U+0020 SPACE (SP) ` `.

### MessageRef

If a message is not available,
is a SelectMessage that does not resolve to any of its cases, or
its resolution or formatting fails for some other reason,
represent it with a U+002D HYPHEN-MINUS `-` followed by its resolved path,
joined together with a U+002E FULL STOP `.` character between each part.
If the MessageRef included a `res_id` value other than that of the current resource,
include it immediately after then hyphen `-`, followed by a U+003A COLON `:`.

### Alias

If an alias is not defined or
its resolution or formatting fails for some other reason,
represent it with an U+002A ASTERISK `*` followed by its name.

### Element & ElementEnd

If an element formatter is not available,
throws an error when called, or
its resolution or formatting fails for some other reason,
represent the individual Element and ElementEnd as empty strings.

Implementations MAY choose to use this representation for all elements,
effectively considering all such elements to be discarded during formatting.

### Unknown Pattern Element

If a message includes a pattern element that is not supported or recognised,
represent it with its `type` value.

## Default Formatting Functions

In general, implementations and their users are free to define formatting functions,
with two exceptions:

- An implementation MUST provide a `number` formatter as specified here.
- If the programming language of the implementation provides a native datetime type,
  the implementation MUST provide a `datetime` formatter as specified here.

### number

The `number` formatter MUST accept a single numeric argument as its input.
The formatter MUST support at least the following options:

- `minimumFractionDigits` with a non-negative integer value
- `maximumFractionDigits` with a non-negative integer value
- `type` with either `'cardinal'` or `'ordinal'` as its value

An implementation MAY support additional options,
as well as additional values for the above options.

If `minimumFractionDigits` is defined, the formatted representation MUST include
at least that many fraction digits.
If `maximumFractionDigits` is defined, the formatted representation MUST NOT include
more than that many fraction digits.
If `maximumFractionDigits` is less than `minimumFractionDigits`,
that SHOULD be considered an error.
A `type` value MUST NOT influence the formatted representation of the numeric value,
but MUST be detectable if a `number` formatter is used as a SelectMessage selector value.

### datetime

The `datetime` formatter MUST accept a single datetime argument as its input.
The formatter MUST support at least the following options:

- `dateStyle` with either `'long'`, `'medium'`, or `'short'` as its value
- `timeStyle` with either `'long'`, `'medium'`, or `'short'` as its value

An implementation MAY support additional options,
as well as additional values for the above options.

If `dateStyle` is defined, the formatted representation MUST include
a representation of the date value of a corresponding length.
If `timeStyle` is defined, the formatted representation MUST include
a representation of the time value of a corresponding length.
