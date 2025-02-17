# MessageFormat 2.0 Unicode Namespace

The `u:` _namespace_ is reserved for the definition of _options_
which affect the _function context_ of the specific _expressions_
in which they appear,
or for the definition of _options_ that are universally applicable
rather than function-specific.
It might also be used to define _functions_ in a future release.

The CLDR Technical Committee of the Unicode Consortium
manages the specification for this namespace, hence the _namespace_ `u:`.

## Options

This section describes common **_<dfn>`u:` options</dfn>_** which each implementation SHOULD support
for all _functions_ and _markup_.

### `u:id`

A string value that is included as an `id` or other suitable value
in the formatted parts for the _placeholder_,
or any other structured formatted results.

Ignored when formatting a message to a string.

The value of the `u:id` _option_ MUST be a _literal_ or a
_variable_ whose _resolved value_ is either a string
or can be resolved to a string without error.
For other values, a _Bad Option_ error is emitted
and the `u:id` option is ignored.

### `u:dir`

Replaces the base directionality defined in
the _function context_ for this _expression_
and applies bidirectional isolation to it.

If this option is set on _markup_, a _Bad Option_ error is emitted
and the value of the `u:dir` option is ignored.

During processing, the `u:dir` option
MUST be removed from the resolved mapping of _options_
before calling the _function handler_.
Its value is retained in the _resolved value_ of the _expression_.

The value of the `u:dir` _option_ MUST be one of the following _literal_ values
or a _variable_ whose _resolved value_ is one of these _literals_:
- `ltr`: left-to-right directionality
- `rtl`: right-to-left directionality
- `auto`: directionality determined from _expression_ contents
- `inherit` (default): directionality inherited from the _message_
   or from the _resolved value_ of the _operand_ without
   requiring isolation of the _expression_ value.

For other values, a _Bad Option_ error is emitted
and the value of the `u:dir` option is ignored.
