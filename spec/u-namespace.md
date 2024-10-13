# MessageFormat 2.0 Unicode Namespace

The `u:` namespace is reserved for use by the Unicode Consortium.

## Options

This section describes common **_<dfn>`u:` options</dfn>_** which each implementation SHOULD support
for all _functions_ and _markup_.

### `u:id`

A string value that is included as an `id` or other suitable value
in the formatted parts for the _placeholder_,
or any other structured formatted results.

Ignored when formatting a message to a string.

Accepts string values, or values which can be stringified without error.
For other values, a _Bad Option_ error is emitted
and the `u:id` option is ignored.

### `u:locale`

A comma-delimited list consisting of
well-formed [BCP 47](https://www.rfc-editor.org/rfc/bcp/bcp47.txt)
language tags,
or an implementation-defined list of such tags.

Replaces the _locale_ defined in the _function context_ for this _expression_.
The value is ignored when set on _markup_.

During processing, the `u:locale` option
is always removed from the resolved mapping of _options_.

Values matching the following ABNF are always accepted:
```abnf
u-locale-option = langtag *(o "," o langtag)
```
using `langtag` as defined in [BCP 47](https://www.rfc-editor.org/rfc/bcp/bcp47.txt).
Note that `langtag` is the rule for "normal language tags",
and does not include private-use or grandfathered tags.

Implementations MAY support additional language tags,
such as private-use or grandfathered tags,
or tags using `_` instead of `-` as a separator.
When the value of `u:locale` is set by a _variable_,
implementations MAY support non-string values otherwise representing locales.

For unsupported values, a _Bad Option_ error is emitted
and the value of the `u:locale` option is ignored.

### `u:dir`

Replaces the base directionality defined in
the _function context_ for this _expression_.
The value is ignored when set on _markup_.

During processing, the `u:dir` option
is always removed from the resolved mapping of _options_.

Accepts the following string values:
- `ltr`: left-to-right directionality
- `rtl`: right-to-left directionality
- `auto`: directionality determined from _expression_ contents

For other values, a _Bad Option_ error is emitted
and the value of the `u:dir` option is ignored.
