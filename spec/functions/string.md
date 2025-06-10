### String Value Selection and Formatting

#### The `:string` function

The function `:string` provides string selection and formatting.

##### Operands

The _operand_ of `:string` is either any implementation-defined type
that is a string or for which conversion to a string is supported,
or any _literal_ value.
All other values produce a _Bad Operand_ error.

> For example, in Java, implementations of the `java.lang.CharSequence` interface
> (such as `java.lang.String` or `java.lang.StringBuilder`),
> the type `char`, or the class `java.lang.Character` might be considered
> as the "implementation-defined types".
> Such an implementation might also support other classes via the method `toString()`.
> This might be used to enable selection of a `enum` value by name, for example.
>
> Other programming languages would define string and character sequence types or
> classes according to their local needs, including, where appropriate,
> coercion to string.

##### Options

The function `:string` has no _options_.

> [!NOTE]
> While `:string` has no built-in _options_,
> _options_ in the `u:` _namespace_ can be used.
> For example:
>
> ```
> {$s :string u:dir=ltr u:locale=fr-CA}
> ```

##### Resolved Value

The _resolved value_ of an _expression_ with a `:string` _function_
contains the string value of the _operand_ of the annotated _expression_,
together with its resolved locale and directionality.
None of the _options_ set on the _expression_ are part of the _resolved value_.

##### Selection

When implementing [`resolvedSelector.match(key)`](/spec/formatting.md#operations-on-resolved-values)
where `resolvedSelector` is the _resolved value_ of a _selector_
and `key` is a string,
the `:string` selector function performs as described below.

1. Let `compare` be the string value of `resolvedSelector`
   in Unicode Normalization Form C (NFC) [\[UAX#15\]](https://www.unicode.org/reports/tr15)
1. If `key` and `compare` consist of the same sequence of Unicode code points, then
   1. Return true.
1. Return false.

When implementing [`resolvedSelector.compare(key1, key2)`](/spec/formatting.md#operations-on-resolved-values)
where `resolvedSelector` is the _resolved value_ of a _selector_
and `key1` and `key2` are strings,
the `:string` selector function performs as described below.

1. ASSERT: `resolvedSelector.match(key1)`.
1. ASSERT: `resolvedSelector.match(key2)`.
1. Return `SAME`.


> [!NOTE]
> Unquoted string literals in a _variant_ do not include spaces.
> If users wish to match strings that include whitespace
> (including U+3000 `IDEOGRAPHIC SPACE`)
> to a key, the `key` needs to be quoted.
>
> For example:
>
> ```
> .input {$string :string}
> .match $string
> | space key | {{Matches the string " space key "}}
> *             {{Matches the string "space key"}}
> ```

##### Formatting

The `:string` function returns the string value of the _resolved value_ of the _operand_.

> [!IMPORTANT]
> The function `:string` does not perform Unicode Normalization of its formatted output.
> Users SHOULD encode _messages_ and their parts in Unicode Normalization Form C (NFC)
> unless there is a very good reason not to.
