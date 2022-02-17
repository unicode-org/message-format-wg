# Syntax

A reasonably human-friendly syntax is needed to enable the representation of
messages made possible by MF2, as certain aspects of the specification allow for
features that are not available or present in other existing message formatting syntaxes.
This should not – and does not! – preclude MF2 from being used together with
practically speaking any other syntax, such as ICU MessageFormat.

This syntax is built with the general expectation that it will primarily
be generated and edited by hand in the source language by developers.
Most translators/localisers will not interact with it directly,
though that may be made possible by some systems and workflows.
To that end, many of the conventions used as a base for the syntax are from
programming languages, and their practices.

Structurally, this document defines the syntax starting from the details and
ending with the overall resource format,
defining a syntax for individual messages along the way.

The full EBNF notation for the syntax is available separately as
[syntax.ebnf](./syntax.ebnf).

## Overview & Examples

### Simple Messages

A simple message without any variables:

    Hello, world!

The same message defined in a `.properties` file:

```properties
app.greetings.hello = Hello, world!
```

The same message defined inline in JavaScript:

```js
const hello = new MessageFormat('Hello, world!')
hello.format()
```

The same message, when defined within a message resource file:

```properties
greeting = Hello, world!
```

### Simple Placeholders

A message with an interpolated variable:

    Hello, {$userName}!

The same message defined in a `.properties` file:

```properties
app.greetings.hello = Hello, {$userName}!
```

The same message defined inline in JavaScript:

```js
let hello = new MessageFormat('Hello, {$userName}!')
hello.format({ userName: 'Anne' })
```

### Formatting Functions

A message with an interpolated `$date` variable formatted with a custom `datetime` function:

    Today is {datetime $date weekday:long}

A message with an interpolated `$userName` variable formatted with a custom `name` function
capable of declension (using either a fixed dictionary, algorithmic declension, ML, etc.):

    Hello, {name $userName case:vocative}!

A message with an interpolated `$userObj` variable formatted with a custom `name` function
capable of plucking the first name from the object representing a person:

    Hello, {name $userObj first:full}!

A message with a date range defined by interpolated `$start` and `$end` variables,
formatted with a custom `range` function:

    Your tickets are valid {range $start $end dateStyle:medium}.

### Selection

A standalone message with a single selector:

    [number $count] =
        [one] You have one notification.
        [other] You have {$count} notifications.

The same message, when defined within a message resource file:

```
notifications [number $count] =
    [one] You have one notification.
    [other] You have {$count} notifications.
```

A standalone message with a single selector
which is an invocation of a custom function named `platform`,
formatted on a single line:

    [platform] = [windows] Settings [_] Preferences

A standalone message with a single selector and a custom `hasCase` function
which allows the message to query for presence of grammatical cases required for each variant:

    [hasCase $userName] =
        [vocative] Hello, {name $userName case:vocative}!
        [accusative] Please welcome {name $userName case:accusative}!
        [_] Hello!

A message with two selectors:

    [number $photoCount, $userGender] =
        [one, masculine] {$userName} added a new photo to his album.
        [one, feminine] {$userName} added a new photo to her album.
        [one, other] {$userName} added a new photo to their album.
        [other, masculine] {$userName} added {$photoCount} photos to his album.
        [other, feminine] {$userName} added {$photoCount} photos to her album.
        [other, other] {$userName} added {$photoCount} photos to their album.

### Complex Messages

A complex message with two selectors and local variable definitions:

    # *hostName The host's first name.
    # *guestName The first guest's first name.
    # *guestsOther The number of guests excluding the first guest.
    *hostName = {name $host first:full}
    *guestName = {name $guest first:full}
    *guestsOther = {number $guestCount ### Remove 1 from $guestCount ### offset:1}
    partypeople [gender $host, number $guestCount] =
        [female, 0] {*hostName} does not give a party.
        [female, 1] {*hostName} invites {*guestName} to her party.
        [female, 2] {*hostName} invites {*guestName} and one other person to her party.
        [female] {*hostName} invites {*guestName} and {*guestsOther} other people to her party.

        [male, 0] {*hostName} does not give a party.
        [male, 1] {*hostName} invites {*guestName} to his party.
        [male, 2] {*hostName} invites {*guestName} and one other person to his party.
        [male] {*hostName} invites {*guestName} and {*guestsOther} other people to his party.

        [other, 0] {*hostName} does not give a party.
        [other, 1] {*hostName} invites {*guestName} to their party.
        [other, 2] {*hostName} invites {*guestName} and one other person to their party.
        [other] {*hostName} invites {*guestName} and {*guestsOther} other people to their party.

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
quoted_literal = '"' { any_char - '"' | escaped_char } '"'
```

### Placeholders

Variable, Function and Message References need to be separated from
the surrounding message by some syntax.
The proposed syntax uses `{ … }` as that separator.

```ebnf
placeholder = "{" { ws }
              [ "*" word { ws } ( ":" | "=" ) { ws } ]
              [ quoted_literal | variable | function | msgref | alias ]
              { ws { ws } ( meta | comment ) }
              { ws } "}"
```

A placeholder that does not contain a value is only valid at the beginning of a pattern.
Its metadata and/or comments are considered to apply to the message as a whole.
During resolution and formatting,
only the metadata of a selected case's pattern will be used.
Whitespace before and after an empty placeholder is trimmed.

### Escaped Characters

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

### Variable References

As variables may be identified by a path rather than a single key,
a separator is needed for path parts: the period `.`.
This means that `$foo.bar` is a reference to the variable “bar” within an object “foo”.
If a variable key includes any non-word characters,
it must be escaped with double quotes `"…"`;
`$var."the.var"` is a variable reference with two path parts “var” and “the.var”.

```ebnf
variable = "$" literal { { sp } "." { sp } literal }
```

### Function References

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
a dollar sign `$` and then a valid path, as defined above.

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

### Message References

Similarly to variable references, messages may be identified by a path rather than a single key.
This means that `-foo.bar` is a reference to the message “bar” in the message group “foo”.

To support dynamic message references,
parts of the path may themselves be defined by variable references or aliases.
Such dynamic values need to be wrapped in curly braces `{ … }`.
For instance, `-group.{$var}.other` is a reference to a message “other”
in a message group identified by the variable reference “var”,
itself in a message group “group”.
Such a braced section may only contain a variable reference or an alias.

```ebnf
msgref = "-" msg_path
         { ws { ws } ( option | comment ) }
msg_path = msg_part { { sp } "." { sp } msg_part }
msg_part = literal | "{" { sp } variable | alias { sp } "}"
```

As it's possible to set or override runtime variable values
during the resolution of a message reference,
a braced block that starts with a message reference
may include after the message identifier a space-separated set of named arguments.
These follow the same structure and syntax as formatting function options,
i.e. while the variable name must be a literal,
its value may be a literal, variable reference, or an alias.

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
      [_] { *num } bananas.

As an example, the above message would,
with an input value of `42` for the “count” variable,
format to a US English string as “42.0 bananas.”

### Display and Markup Elements

Separately from formatting functions,
MF2 allows for messages to include display and markup elements,
i.e. pattern elements that could represent anything from
HTML tags, formatting information for the voice assistant,
to instructions for a translator to keep an inner span as untranslated.

To underline the difference between elements and formatting functions,
these use a syntax much closer to HTML or XML,
separated from the rest of the message by the less-than and greater-than chevrons `<` and `>`.
Starting elements `< … >` are expected to be concluded by an ending element `</ … >`,
while standalone elements `< … />` are self-closing.
As with braced blocks,
whitespace is generally ignored within the element.

```ebnf
element = "<" { ws } word
          { ws { ws } ( option | comment ) }
          { ws { ws } ( meta | comment ) }
          { ws } [ "/" ] ">"
        | "<" "/" { ws } word { ws comment } { ws } ">"
```

Within a starting and standalone display element's chevron block,
options and metadata are supported with the same syntax is used as for formatting functions.
An ending element must only contain the name of the element that it's closing;
again as with formatting functions,
said name must only contain word characters.

### Comments

The MF2 syntax supports comments within brace and chevron blocks,
as well as outside of message content in resources.
These are primarily intended to contain contextual and other information to a translator,
or other non-formatting users of messages.
Line comments start with a hash `#` character and continue until the next line break.
Block comments start with a triple-hash `###` and continue until
the next appearance of a triple-hash `###`.
Comments are not included in the resolved value of the corresponding pattern element,
and must not influence the formatted value of a message.

```ebnf
comment = comment_block | comment_line
comment_block = "#" "#" "#" { cb_char } "#" "#" "#"
cb_char = ? any_char, but with no ("#" "#" "#") sequences ?
comment_line = "#" { any_char - nl }
```

Comments may include semantic data fields.
The general form for a semantic comment is an identifier
that starts with one of the characters `@` / `$` / `*`,
followed by white space, and finally its value.
Each identifier must be the first non-empty content of the comment line or the comment block,
excluding any comment markers.
If a value contains multiple lines,
each line must be indented more than semantic comment's identifier.

Semantic comment identifiers starting with `@` must be followed by a single word.
Semantic comment identifiers starting with `$` or `*` must be followed by
the same representation of a variable reference or an alias as it is used in the message.

```ebnf
comment_body = { [ meta_comment | var_comment| alias_comment ] { any_char - nl } nl }
meta_comment = { sp } "@" word sp { sp }
var_comment = { sp } "$" var_name sp { sp }
var_name = ? a sequence of characters exactly matching that of a variable reference ?
alias_comment = { sp } "*" alias_name sp { sp }
alias_name = ? a sequence of characters exactly matching that of an alias ?
```

The `comment_body` rule may only be used to parse the value of
one or more contiguous comment lines and comment block,
each separated from the preceding by a newline `\n` character.
The value of a semantic comment is determined by concatenating
the remainder of the line that starts with its identifier
with all immediately subsequent `comment_body` lines that start with
characters matching its initial `{ sp }` characters.

### Metadata

Metadata values may be assigned to any brace or chevron block
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
If the selector uses a custom fallback case key,
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

select_case = select_key { sp } select_value nl
select_key = "[" { sp } literal { { sp } "," { sp } literal } "]"
select_value = ? like pattern, but with no ( nl { sp } "[" ) sequences ?
```

The process for selecting a case is described in the
[Message Pattern Selection](./spec-formatting.md#message-pattern-selection) section.

## Single-Message Syntax

An alternative message syntax is available for situations where
a single message is being parsed, rather than a complete resource.
With this syntax variant, select cases do not require any preceding white space,
and the whole message may be represented on a single line.
All open square brackets in the message body need to then be escaped `\[`.

    [$count] = [one] You have one message. [other] You have {$count} messages.

```ebnf
one_message = one_select | one_pattern
one_select = select_head
             { ws } "=" { ws }
             { one_select_case }
one_select_case = select_key { ws } one_case_value
one_case_value = ? pattern, but with no unescaped "[" characters ?
one_pattern = ? pattern, but a first msg_literal must start with a word or escaped_char ?
```

If a pattern message starts with an open square bracket,
it will need to be escaped `\[`.

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

The identifier is an important component of the error fallback system
as it also serves as a last resort display of a message reference,
similarly to how a variable identifier serves as a last resort display for a variable reference.
This means that if all else fails,
the message may be exposed to the user with a message identifier in place of where it should be resolved,
providing the best possible worst case scenario user experience.

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
Each metadata and alias field may take a single literal or braced placeholder as its value.
Literal values that contain non-word characters must be double quoted.
Comments must be placed before any metadata and alias declarations.

    # An encouragement
    *thing: { $project }
    @style: inspiring
    msg = Let’s start the {*thing}!

Using the single-message variant of the syntax,
the above message may be equivalently represented as:

    { @style: inspiring ### An encouragement ### } Let’s start the {*thing = $project}!

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

There are three primary entry points for the EBNF notation of the syntax:

- `resource` when parsing a complete message resource,
- `one_message` when parsing a single message, and
- `comment_body` when parsing semantic data in comments.

There is a minor difference between the first two,
as `one_message` does not expect an initial equals sign `=` for pattern messages,
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
