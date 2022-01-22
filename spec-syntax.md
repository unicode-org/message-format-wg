# Syntax

A reasonably human-friendly syntax is needed to enable the representation of
messages made possible by MF2,
as certain aspects of the specification allow for
features that are not available or present in other existing message formatting syntaxes.
This should not – and does not! – preclude MF2 from being used together with
practically speaking any other syntax, such as ICU MessageFormat.

This syntax is built with the general expectation that it will primarily
be generated and edited by hand in the source language by developers.
Most translators/localisers will not interact with it directly,
though that may be made possible by some systems and workflows.
To that end, many of the conventions used as a base for the syntax are from
programming languages, and their practices.

Structurally,
this document defines the syntax starting from the details and
ending with the overall resource format,
defining a syntax for individual messages along the way.

The full EBNF notation for the syntax is available separately as
[syntax.ebnf](./syntax.ebnf).

## Pattern Elements

A simple message consists of a sequence of pattern elements,
which from a syntax point of view are classified into three categories:
literal values, placeholders, and display or markup elements.
Each pattern element needs separate consideration and handling.

```ebnf
pattern = { msg_literal | placeholder | element }
```

### Literals

Literal values ought to be as simple as possible
and have the least possible limitations on its contents;
the default assumption when parsing a message should be that
the contents are a part of a Literal.

```ebnf
msg_literal = { msg_literal_char }
msg_literal_char = any_char - ( "{" | "<" | esc )
                 | escaped_char
any_char = \p{Any}
```

In addition to direct message contents,
literal values may be used as e.g.
metadata values, formatting function arguments, or variable path parts.
In such use, literals should by default be considered as non-translatable content.
This is implicitly communicated by the requirement for
the value of such inner literals to either consist of word characters only,
or to be surrounded by double quotes `"…"`.

```ebnf
literal = word | quoted_literal
word = word_char { word_char }
word_char = \p{Letter} | \p{Number} | "_"
quoted_literal = '"' { any_char - '"' } '"'
```

### Placeholders

Variable, Function and Message References need to be separated from
the surrounding message by some syntax.
There is no reason to diverge from the customary use of curly braces `{ … }` as that separator.

```ebnf
placeholder = "{" { ws }
              [ "*" word { ws } ( ":" | "=" ) { ws } ]
              ( quoted_literal | variable | function | msgref | alias )
              { ws { ws } ( meta | comment ) }
              { ws } "}"
```

Treating certain characters as special means that their use as a Literal
will need to be allowed somehow;
for this, let's use the backslash or reverse solidus `\`,
which will need to escape at least curly braces `\{` `\}` and double quotes `\"`,
as well as itself `\\`.
While the ending curly brace and double quote do not need escaping outside braced blocks,
that should still be allowed.
Message-level and double-quoted literal values should support
using `\u` to escape all characters using their Unicode code points,
either as `\uNNNN` with exactly four hexadecimal digits `N`,
or `\u{N+}` for a variable number of digits.

```ebnf
escaped_char = esc "{" | esc "}"
             | esc "<" | esc ">"
             | esc "[" | esc "]"
             | esc '"'
             | esc "n" | esc "r"
             | esc "t" | esc " "
             | esc "u" hex hex hex hex
             | esc "u" "{" hex { hex } "}"
             | esc esc
esc = "\\"
hex = \p{Hex_Digit}
```

### Whitespace

Directly within a message,
inner whitespace should in general be considered significant.
Within a braced block,
white space should be ignored unless it has an explicit syntactical significance
or if it's within an inner double-quoted block.
White space in or around a message pattern should be trimmed in the following cases:

- The beginning of the pattern
- The end of the pattern
- Spaces and tabs following a line break within a pattern

Outside literal message content, extraneous spaces and tabs `\t` at line ends should be ignored.
In resources,
spaces and tabs at the beginning of a line with non-empty content
always indicate that the line contents continue the value of
the nearest preceding line with non-empty content.

Where reference is made to a “line break”,
that means either the line-feed character (LF) `\n`,
or the carriage-return line-feed sequence (CR+LF) `\r\n`.
Where reference is made to “whitespace”,
that should be understood to be a sequence of characters consisting of
spaces ` `, horizontal tabs `\t`, and line breaks.
All other Unicode characters with the property `White_Space=yes`
should be considered significant content,
including a carriage-return `\r` when not immediately followed by a line-feed `\n`.

```ebnf
ws = sp | nl
nl = "\n" | "\r" "\n" | EOF
sp = " " | "\t"
```

### Separate Namespaces

In order to keep the
function, variable, and message reference namespaces separate from each other,
the first character of their identifier acts as a signifier:
the dollar sign `$` for variables and a hyphen `-` for messages.
Therefore `$var` is a reference to the variable “var”,
`-foo` is a reference to the message “foo”,
and all leading alphabetic characters identify a formatting function.
Formatting function identifiers must not include white space or other non-word characters,
such that their names never need to be escaped.
This allows for initial word characters to start function references.

In certain cases it may make sense to encode a single literal in a braced block,
such that the messages `foo` and `{ "foo" }` are both parsed as a single Literal “foo”.
Within such a quoted block,
curly braces and all other characters except for the terminal `"`
lose their special status and do not need to be escaped.

### Variable and Message Paths

As variables and messages may both be identified by a path rather than a single key,
a separator is needed for path parts: the period `.`.
This means that `-foo.bar` is a reference to the message “bar” in the message group “foo”.
If a message or variable key includes any non-word characters,
it must be escaped with double quotes;
`$var."the.var"` is a variable reference with two path parts “var” and “the.var”.

To support dynamic references,
parts of the path may themselves be defined by variable references.
Such variable references need to be wrapped in curly braces `{ … }`.
For instance, `-group.{$var}.other` is a reference to a message “other”
in a message group identified by the variable reference “var”,
itself in a message group “group”.
Such a braced section may only contain a variable reference.

```ebnf
variable = "$" var_path
var_path = var_part { { sp } "." { sp } var_part }
var_part = literal | "{" { sp } variable { sp } "}"
```

References to messages in other message resources need to identify that resource
with an initial part that's separate from the rest of its path with a colon `:`.
This part must be a literal,
but it may be quoted if it contains a non-word character;
`-res:foo` and `-"res":foo` are both references to the message “foo” in a message resource “res”.
If a resource identifier is not provided,
the message must be found in the current resource,
with its path starting from the resource root.

### Function Arguments and Options

MF2 allows for formatting functions to have both positional and named arguments,
which may have values determined by literals or variables.
To support that,
a braced block that starts with a function identifier
may be followed first by space-separated positional arguments,
and then space-separated named arguments (aka options).

```ebnf
function = word
           { ws { ws } ( argument | comment ) }
           { ws { ws } ( option | comment ) }
argument = literal | variable | alias
option = literal { ws } ( ":" | "=" ) { ws } argument
```

An argument with a literal value needs to be double quoted `"…"`
if it contains any non-word characters;
otherwise it may be included directly.
An argument with a variable value needs to start with
a dollar sign $ and then a valid path, as defined above.

The key of a named option must be a literal value,
and must be double quoted `"…"` if it contains any non-word characters.
The value of an option must be separated from its key with
a colon `:` or equals sign `=` which may have white space around it.
The order of named options must not be significant,
and their keys must not repeat.
Named options must not be followed by positional options.

Put together, this means that the message

    Pi is about { number $pi maximumFractionDigits: 2 }

should format in US English to a string as “Pi is about 3.14”,
presuming a mathematically appropriate runtime value of the variable “pi”.

### Parametric Message References

As it's possible to set or override runtime variable values
during the resolution of a message reference,
a braced block that starts with a message reference
may include after the message identifier a space-separated set of named arguments.
These follow the same structure and syntax as formatting function options,
i.e. while the variable name must be a literal,
its value may be a literal or itself a variable reference.

```ebnf
msgref = "-" [ literal ":" ] var_path
         { ws { ws } ( option | comment ) }
```

No capability exists for explicitly setting in a message reference
the value of a variable within an object, or of creating such an object.

### Local Value Aliases

Select messages in particular often need to refer to the same value multiple times,
for example using it both as a selector and as a formatted part of the message.
To that end,
placeholders and selectors may define and use a local alias for their value.
These are identified by using an asterisk `*` as a prefix for an alias name,
which must consist of word characters only.

The definition of an alias is a sequence consisting of
an asterisk `*`, the alias name, an optionally space-separated colon `:` or equals sign `=`,
and then the alias value,
which may be any valid placeholder value except for another alias.
An alias definition does not change the value of its source selector or placeholder.

```ebnf
alias = "*" word
```

An alias may be used as a placeholder value,
with the syntax of an asterisk `*` followed by the alias name.
Alias names must be unique within a message,
and each must be defined exactly once.
A definition does not need to come before its first use.
Creating a referential loop where the value of an alias
in some way depends on its own value is not allowed.

    [*num = number $count minimumFractionDigits:1] =
      [0] No bananas.
      [other] { *num } bananas.

As an example, the above message would,
with an input value of `42` for the “count” variable,
format to a US English string as “42.0 bananas.”

### Display and Markup Elements

Separately from formatting functions,
MF2 allows for messages to include display and markup elements,
i.e. pattern elements that could represent anything from
HTML tags to instructions for a translator to keep an inner span as untranslated.

To underline the difference between elements and formatting functions,
these use a syntax much closer to HTML or XML,
separated from the rest of the message by the less-than and greater-than chevrons `<` and `>`.
Starting elements `< … >` are expected to be concluded by an ending element `</ … >`,
while standalone elements `< … />` are self-closing.
As with braced blocks,
whitespace is generally ignored within the element.

```ebnf
element = "<" { ws } word
          { ws { ws } ( argument | comment ) }
          { ws { ws } ( option | comment ) }
          { ws { ws } ( meta | comment ) }
          { ws } [ "/" ] ">"
        | "<" "/" { ws } word { ws comment } { ws } ">"
```

Within a starting and standalone display element's chevron block,
the same syntax is used as for formatting functions.
An ending element must only contain the name of the element that it's closing;
again as with formatting functions,
said name must only contain word characters.

### Comments and Metadata

The MF2 syntax supports comments within brace and chevron blocks,
as well as outside of message content in resources.
These are primarily intended to contain contextual and other information to a translator.
Line comments start with a hash # character and continue until the next line break.
Block comments start with a triple-hash `###` and continue until
the next appearance of a triple-hash `###`.
Comments are not included in the resolved value of the corresponding pattern element.

```ebnf
comment = comment_block | comment_line
comment_block = "#" "#" "#" { cb_char } "#" "#" "#"
cb_char = ? any_char, but with no ("#" "#" "#") sequences ?
comment_line = "#" { any_char - nl }
```

Metadata values may be assigned to any non-empty brace or chevron block
with syntax similar to named arguments,
using an at-sign `@` as a prefix,
immediately followed by a literal metadata key,
then an optionally space-separated colon `:` or equals sign `=`,
and finally a literal value.
For example, a brace block `{ $foo @gender:female }` would resolve with
the value of a variable “foo”,
with its “gender” metadata value set to “female”.

```ebnf
meta = "@" literal { ws } ( ":" | "=" ) { ws } literal
```

## Select Messages

In addition to single-pattern messages,
MF2 also supports messages where the body is selected
based on the resolved value of one or more selectors:

    [$count] =
      [one] You have one message.
      [other] You have {$count} messages.

Select messages use square brackets `[ … ]`
as wrappers around the selectors and the select keys.
The selector block is separated from the cases by an equals sign `=`.

Selector values may be
any pattern element that would also be valid within a curly brace block,
i.e. anything except for a display element.
If the selector uses a default case key other than other,
that may be indicated in the selector by
adding an equals sign `=` after the selector value, followed by a literal value.
With multiple selectors a comma `,` is used as a separator.

Select case keys must be literal values,
and must be double-quoted if they contain any non-word characters.
With multiple selectors, a comma `,` is used as a separator.
White space next to the brackets or a comma is ignored.

    [$name_case = nominative, $count] =
      [possessive, one] This is {$name} cat.
      [possessive, other] These are {$name} cats.
      [nominative, one] This cat belongs to {$name}.
      [nominative, other] These cats belong to {$name}.

The canonical syntax for a select message uses multiple lines,
with each line after the equals sign `=` starting with an indented select case key block,
followed by its corresponding value,
separated from the key by a single space.
Messages spanning multiple lines will need to escape any open square brackets `[`
that occur before any other non-white-space characters on their line.

```ebnf
select = select_head
         { sp } "=" { sp } nl
         { sp { sp } select_case }
select_head = "[" { sp } selector { { sp } "," { sp } selector } "]"
selector = [ "*" word { ws } ( ":" | "=" ) { ws } ]
           ( quoted_literal | variable | function | msgref | alias )
           [ { sp } "=" { sp } literal ]

select_case = { comment { sp } nl sp { sp } }
              select_key { sp }
              { msg_meta { sp } nl sp { sp } }
              select_value nl
select_key = "[" { sp } literal { { sp } "," { sp } literal } "]"
select_value = ? like pattern, but with no ( nl { sp } "[" ) sequences ?
```

## Single-Message Syntax

An alternative message syntax is available for situations where
a single message is being parsed, rather than a complete resource.
With this syntax variant,
select cases do not require any preceding white space,
and the whole message may be represented on a single line.
All open square brackets in the message body need to then be escaped `\[`.

    [$count] = [one] You have one message. [other] You have {$count} messages.

```ebnf
one_message = { comment wsc { wsc } }
              { ( msg_meta | msg_alias ) wsc { wsc } }
              ( one_select | one_pattern )
wsc = ws | ","
one_select = select_head
             { ws } "=" { ws }
             { one_select_case }
one_select_case = { comment ws { ws } }
                  select_key { ws }
                  { meta ws { ws } }
                  one_case_value
one_case_value = ? pattern, but with no unescaped "[" characters ?
one_pattern = ? pattern, but a first msg_literal must start with a word or escaped_char ?
```

When using the single-message single-line variant of the syntax,
a line break is not required to separate the message body from
the preceding metadata and alias definitions.
For clarity, a comma `,` is treated as white space in this case.

If such a message starts with a literal
which includes a non-word character as its first character,
it will need to be escaped.

## Message Resources

As messages are practically never used just one-by-one,
MF2 includes a definition of a message resource as a collection of messages.
The syntax representation of such a resource is designed to be easy to parse,
and to be resilient to human errors.

```ebnf
resource = [ res_head ]
           { group | res_message | res_comment | empty_line }
res_head = { res_comment | res_meta | empty_line } empty_line
res_comment = comment { sp } nl
res_meta = msg_meta { sp } nl
empty_line = { sp } nl
```

### Messages

In a message resource,
each message starts with its identifier at the very beginning of a line.
For pattern messages,
this is followed by an equals sign `=`, and then the body of the message.
For select messages,
the identifier is followed immediately by the full message.

    status = This is fine.
    banana_report [$count] =
      [0] No bananas!
      [one] One banana.
      [other] Many bananas.

```ebnf
res_message = { comment { sp } nl }
              { ( msg_meta | msg_alias ) { sp } nl }
              msg_key { sp } msg_body
              { sp } nl
msg_meta = "@" literal { sp } ( ":" | "=" ) { sp } literal
msg_alias = "*" literal { sp } ( ":" | "=" ) { sp } ( literal | placeholder )
msg_key = literal
msg_body = select | "=" { sp } pattern
```

The contents of each message must be indented by
at least one non-line break whitespace character from the beginning of its line.
When parsing a message resource,
this means that for multi-line messages,
the initial whitespace of each line must be escaped,
or it will be trimmed.

    long_msg = This can
      go on
        for many lines

With the above, the body of the message would be parsed as
“This can`\n`go on`\n`for many lines”,
with `\n` representing newline characters.

Lines immediately before a message may contain
line-break-separated comments, metadata and aliases
that are associated with the message.
ach metadata and alias field may take a single literal or braced placeholder as its value.
Literal values that contain non-word characters must be double quoted.
Comments must be placed before any metadata and alias declarations.

    # An encouragement
    *thing: { $project }
    @style: inspiring
    msg = Let’s start the {*thing}!

Using the single-message variant of the syntax,
the above message may be equivalently represented as:

    ### An encouragement ### *thing: { $project }, @style: inspiring, Let’s start the {*thing}!

### Message Groups

In order to group messages within a resource into message groups,
a group header starts a block of messages which all belong to the same group.
A header consists of a period `.` separated path of literal keys,
followed by a line break and another line with
at least three repetitions of the hyphen `-` or equals sign `=` characters.
Literals must be double-quoted if not all word characters.
The specific visual “underline” character used has no significance.

```ebnf
group = group_path { sp } nl
        ( "-" "-" "-" { "-" } | "=" "=" "=" { "=" } ) { sp } nl
        [ res_head ]
group_path = literal { { sp } "." { sp } literal }
```

Group headers may be immediately followed by comment and metadata lines,
which must be separated from following content by at least one empty line.
Local variable aliases may only be defined for individual messages.

Re-defining a message or a message group is an error.
If necessary, intermediate message groups are created.
Messages and message groups may both exist at the same level.
The order of messages and message groups is not significant.
In a resource that contains message groups,
messages that belong to the root level of the resource
must be defined before the first message group.

Comments and metadata at the very beginning of a resource
are associated with the entire message resource,
and must be separated from following content by at least one empty line.

    # These messages are vital.

    brand
    =====
    # We may need to pivot later to other fruit.

    product [ $plural ] =
      [one] banana
      [other] bananas

    report."final results"
    ----------------------
    title = Product Results
    ready [$count] =
      [one] The {-brand.product plural:one} is ready.
      [other] The {-brand.product plural:other} are ready.

With the above resource,
formatting the “report” “final results” “ready” message to a string
with a value `1` for the variable “count” would result in
the output “The banana is ready.”
The first comment would be associated with the resource,
while the second would be associated with the “brand” message group.

## Notes on the EBNF Notation

There are two primary entry points for the EBNF notation of the syntax;
`resource` when parsing a complete message resource,
and `one_message` when parsing a single message.
There is a minor difference between the two,
as the latter does not expect an initial equals sign `=` for pattern messages,
and allows for the single-line select message variant.

For simplicity,
the definition of the `ws` and `msg_literal` rules
as used within a `res_message` are left slightly incomplete,
as they should not greedily swallow up space between messages.
When parsing a `resource`,
the source contents of a multi-line message are always indented by
at least one space or tab character,
while all resource-level content starts from the first column.

The full EBNF notation for the syntax is available separately as
[syntax.ebnf](./syntax.ebnf).
