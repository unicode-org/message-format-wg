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

The value of the `u:id` _option_ MUST be a _literal_ or a
_variable_ whose _resolved value_ is either a string
or can be resolved to a string without error.
For other values, a _Bad Option_ error is emitted
and the `u:id` option is ignored.

### `u:locale`

Replaces the _locale_ defined in the _function context_ for this _expression_.

A comma-delimited list consisting of
well-formed [BCP 47](https://www.rfc-editor.org/rfc/bcp/bcp47.txt)
language tags,
or an implementation-defined list of such tags.

If this option is set on _markup_, a _Bad Option_ error is emitted
and the value of the `u:locale` option is ignored.

During processing, the `u:locale` option
MUST be removed from the resolved mapping of _options_
before calling the _function handler_.

Values matching the following ABNF are always accepted:
```abnf
u-locale-option = unicode_bcp47_locale_id *(o "," o unicode_bcp47_locale_id)
```
using `unicode_bcp47_locale_id` as defined for
[Unicode Locale Identifier](https://cldr-smoke.unicode.org/spec/main/ldml/tr35.html#unicode_bcp47_locale_id).

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

If this option is set on _markup_, a _Bad Option_ error is emitted
and the value of the `u:dir` option is ignored.

During processing, the `u:dir` option
MUST be removed from the resolved mapping of _options_
before calling the _function handler_.

The value of the `u:dir` _option_ MUST be one of the following _literal_ values
or a _variable_ whose _resolved value_ is one of these _literals_:
- `ltr`: left-to-right directionality
- `rtl`: right-to-left directionality
- `auto`: directionality determined from _expression_ contents

For other values, a _Bad Option_ error is emitted
and the value of the `u:dir` option is ignored.
