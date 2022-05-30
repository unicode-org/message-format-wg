# MF2.0 compromise syntax

# Intro

This syntax builds on the one from https://github.com/unicode-org/message-format-wg/pull/230
but modified to address
[@markusicu’s comments there](https://github.com/unicode-org/message-format-wg/pull/230#issuecomment-1116903103).

# Basic syntax

Messages need to delineate between literal text, placeholders, and other “code”.
We should start in “code mode” and always enclose “patterns” (text+placeholders) in curly braces.
```
{Hello world!}
{Hello {$name}!}
```

This is unusual for formatting syntaxes, but useful.
We anyway need to support selecting from among multiple patterns,
and delimiting the patterns makes it unambiguous
what white space is part of the pattern vs. serves as delimiters of “code” tokens.
For consistency, we should always enclose a pattern,
even if the message consists only of that pattern.
That also helps with embedding messages in various resource file formats,
because they can freely trim surrounding white space without
requiring escapes when a message pattern wants to start or end with spaces.

By contrast, consider the experience with the existing ICU MessageFormat syntax
which does start in “text mode”.
ICU MessageFormat has pioneered the selection among multiple patterns based on run-time arguments.
It represents selection using complex placeholders,
which has the side effect of allowing literal text and other placeholders
before and after the top-level selection placeholder.
However, for reliable translations,
there should be no translatable contents before or after the selection placeholder;
instead, each selectable pattern should form one complete “translation unit”.
Because the existing ICU MessageFormat starts in “text mode”,
even though it looks like there is no extraneous text,
spurious white space creeps in from developers’ line breaking of long message strings.
The remedy is to always use syntax to indicate the start of translatable contents.

We use curly braces to delimit patterns because
`{}` are the paired ASCII punctuation characters least commonly used in normal text.
For the same reason, we also use them for embedding placeholders in patterns.

Literal text can use any characters except for curly braces,
and except for the backslash, which we use as usual for escaping.
That is, the only special characters inside a pattern are `{}\`.
The only allowed escape sequences are `\{`, `\}`, and `\\`.
It is an error if `\` is followed by any other character.

The message syntax does not use `'` or `"`,
so that it is easy to hard-code message strings in programming language source code.

# Placeholders

Formatting a message replaces placeholders with values based on run-time arguments or special functions.
We also allow for value literals specified inside the placeholder,
instead of using an argument name;
and we also allow for invoking functions without using argument names or value literals.
```
{$name}
{$count :number}
{$fraction :number style=percent minFractions=2}
{<25> :number}
{:specialFunction optionKey=optionValue key2=<value with spaces>}
```

An argument name is a `$` immediately followed by an identifier.
A message formatting function will typically accept a Map of argument keys to values
where the keys match argument name identifiers in the patterns of the message.

TODO: For the definition of identifiers we should consult with the Unicode Source Code Working Group.

If the placeholder specifies only an argument name,
then the formatting function is inferred from the run-time type of the argument value.
For example, a string value would simply be inserted,
and a numeric type could be formatted using some kind of default number formatter.
- TODO: In the registry, specify the default formatters for a small set of value types.

The function is specified via a `:` immediately followed by an identifier.
If an argument name or a value literal is given,
then the function is usually a formatter for its expected input types.
- TODO: There still seems to be discussion about the function prefix character.
  It could be some other ASCII punctuation, for example `@`.
- TODO: Functions must be listed in a registry.
- TODO: Functions that accept value literals must specify their syntax.
- TODO: Reserve a naming convention for private use functions (not in the standard registry). Examples:
  - Starts with `_`
  - Starts with `x`
  - Contains interior dots – e.g., com.google.fancyNumber

When a function is specified, it can be optionally followed by options which are key-value pairs,
with `=` (and no white space) between the key identifier and the value.
The option value can contain any character other than curly braces and white space,
unless delimited like literal values.
- TODO: Each registered function must define the available options and their value syntax.
- TODO: If we allow white space in option values, then we need optional delimiters for such values. Probably the same delimiters as for literal values.

Options are not allowed when no function is specified.

Value literals are important for developers to control the output.
For example, certain strings may need to be inlined as literals so that
they are not changed during translation.
Numeric constants need to be formatted differently depending on the target language
(e.g., which digits and separators, and the grouping style).
Date constants need to be formatted according to the target language’s calendar system.

If only a value literal is given, without specifying a function,
then its string value is used verbatim and it is read-only for translators.
- TODO: Value literals need to be delimited (they may contain spaces),
  and the starting delimiter needs to be distinct from the prefixes for
  argument names and functions.
  Reasonable choices include `<>`, `()`, `[]`, or `||`.
  Consider that the same delimiters should also be usable (not visually confusing)
  when used in a list of selection values (see below); that probably excludes `||` and `[]`.
- TODO: Define escaping inside constant values.
  Probably the pattern escapes plus escapes for the constant delimiters.

A placeholder must not be an empty pair of `{}` braces.

Any character that does not fit defined syntax is an error.
This leaves room for future extensions.
For example, a placeholder must start with `{` immediately followed by
the prefix character for an argument name, literal value, or function;
and after the function name there must be only white-space-separated options which
start with identifier-start characters.

# Syntactic white space

We use white space inside placeholders and in “code mode” (outside patterns) as token separators.
White space is a sequence of one or more of the characters TAB, LF, CR, SP, and maybe some more.
- TODO: For the definition of white space we should consult with the Unicode Source Code Working Group.
- TODO: Decide whether to use Unicode Pattern_White_Space or otherwise allow RLM and LRM characters.

White space can also be useful for line breaking long messages, indentation, and alignment.
However, we should not allow white space everywhere possible,
because that just leads to confusing variations in style,
and the creation of formatting tools to enforce certain styles.
For example, there is no reason to allow white space between a name or function prefix and its identifier,
around the `=` of an option, after the `{` of a placeholder, or before the `}` of a placeholder.

# Pattern selection

Messages need the ability to choose among variants of a pattern based on certain argument values.
Common examples include selecting the right plural form, and variants for different person genders.

There should be a single level of selection (not nested like in ICU MessageFormat).
It needs to support multiple selectors.

In this syntax, a list of N selectors is followed by a list of pairs where
the first element of each pair is a list of N value literals and
the second element of each pair is a pattern.
A `*` is a wildcard value that always matches.
The last variant must have a list of all wildcard values.
```
[{$count :plural offset=1 grouping=always} {$gender}]
[1 female] {{$name} added you to her circles.}
[1 male] {{$name} added you to his circles.}
[1 *] {{$name} added you to their circles.}
[* *] {{$name} added you and {#count} others to their circles.}
```

Lists are enclosed in square brackets, reminiscent of Python lists.
The opening `[` also distinguishes the selection syntax from a simple pattern.

TODO: Decide whether to enclose each value literal in
the same pair of delimiters as literals in placeholder (for consistency),
or whether to make that optional.
(The `[]` value list syntax already indicates that value literals are enclosed.)
Some literals may require it if they contain spaces.
The `*` should probably never be enclosed in literal delimiters.

Selector syntax follows placeholder syntax,
except that a function must be specified.
For the purpose of selection, there are three types of functions:
1. Select-and-format functions combine the two functionalities,
   and the selection is informed by the formatting.
   For example, selectors for plural variants
   (different selectors for cardinal-number vs. ordinal-number variants)
   have to take into account how the number is formatted.
2. Format-only functions can be used as selectors via
   simple string matching of their output with the variant values.
3. Select-only functions select among variant values, but they cannot be used in pattern placeholders.

There is a simple format-only function that can be used for simple string matching.
TODO: Decide on a name for this format-only function. Consider `:string`.

Inside a selection-variant pattern,
there is a special placeholder syntax for inserting the formatting result of a select-and-format function.
This placeholder only specifies the selector’s argument name with a distinct prefix.
It must not specify a function.
In the example above, the `{#count}` value is the input $count minus the offset,
like the `#` in an ICU PluralFormat, which is the input to the plural rules evaluation.
This is not allowed for argument names used in select-only functions.
- TODO: Bike-shedding on the prefix character, shown as `#` here.

Inside selected patterns,
the selector argument variables must not be used with the normal `$` placeholder syntax –
for example, the patterns in the preceding example must not use `{$count}`.
Allowing that would be doubly confusing:
- It would not be clear which value is inserted.
  In the example, the plural offset is subtracted from the input value,
  and the formatted version of that is what is used for
  evaluating the plural rules and inserting into the pattern.
- It would not be clear what formatting is applied.
  The formatting function and options specified in the selector must be used,
  but `{$count}` would look like the default formatter might be used.
  Allowing a function-and-options specification here would be even worse.
- (If a developer does need a pattern with both the selector-modified and also the original value,
  then they can pass the value twice into the message formatting function,
  under different argument names.)

# Named expressions

When a message contains many variants, it is tedious, verbose, and error-prone to
repeat complicated placeholders in many of those variants.
We allow the definition of named expressions before the selection.
The patterns could then use those names.
```
$relDate={$date :relativeDateTime fields=Mdjm}
[{$count :plural offset=1} {$gender}]
[1 female] {{$name} added you to her circles {$relDate}.}
[1 male] {{$name} added you to his circles {$relDate}.}
[1 *] {{$name} added you to their circles {$relDate}.}
[* *] {{$name} added you and {#count} others to their circles {$relDate}.}
```

When a named expression is used in a pattern placeholder, then no function must be specified.
The formatting is determined by the given expression.
- TODO: Decide whether to use a different prefix for
  a pattern placeholder that refers to a named expression.
  Using `$` looks familiar, but
  a distinct prefix would signal that this is not a normal placeholder,
  and it would allow for a syntax definition (in the BNF) limited to
  only the named-expression insertion.

The expression name must not be the same as that for any placeholder argument.
