# Message Parse Mode

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@eemeli</dd>
		<dt>First proposed</dt>
		<dd>2023-09-13</dd>
		<dt>Pull Request</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/474">#474</a></dd>
	</dl>
</details>

## Objective

Decide whether text patterns or code statements should be enclosed in MF2.

## Background

Existing message and template formatting languages tend to start in "text" mode,
and require special syntax like `{{` or `{%` to enter "code" mode.

ICU MessageFormat and Fluent both support inline selectors
separated from the text using `{ ... }` for multi-variant messages.

[Mustache templates](https://mustache.github.io/mustache.5.html)
and related languages wrap "code" in `{{ ... }}`.
In addition to placeholders that are replaced by their interpolated value during formatting,
this also includes conditional blocks using `{{#...}}`/`{{/...}}` wrappers.

[Handlebars](https://handlebarsjs.com/guide/) extends Mustache expressions
with operators such as `{{#if ...}}` and `{{#each ...}}`,
as well as custom formatting functions that become available as e.g. `{{bold ...}}`.

[Jinja templates](https://jinja.palletsprojects.com/en/3.1.x/templates/) separate
`{% statements %}` and `{{ expressions }}` from the base text.
The former may define tests that determine the inclusion of subsequent text blocks in the output.

A cost that the message formatting and templating languages mentioned above need to rely on
is some rule or behaviour that governs how to deal with whitespace at the beginning and end of a pattern,
as statements may be separated from each other by newlines or other constructs for legibility.

Other formats supporting multiple message variants tend to rely on a surrounding resource format to define variants,
such as [Rails internationalization](https://guides.rubyonrails.org/i18n.html#pluralization) in Ruby or YAML
and [Android String Resources](https://developer.android.com/guide/topics/resources/string-resource.html#Plurals) in XML.
These formats rely on the resource format providing clear delineation of the beginning and end of a pattern.

## Use-Cases

Most messages in any localization system do not contain any expressions, statements or variants.
These should be expressible as easily as possible.

Many messages include expressions that are to be interpolated during formatting.
For example, a greeting like "Hello, user!" may be formatted in many locales with the `user`
being directly set by an input variable.

Sometimes, interpolated values need explicit formatting within a message.
For example, formatting a message like "You have eaten 3.2 apples"
may require the input numerical value
to be formatted with an explicit `minimumFractionDigits` option.

Some messages require multiple variants.
This is often related to plural cases, such as "You have 3 new messages",
where the value `3` is an input and the "messages" needs to correspond with its plural category.

Rarely, messages needs to include leading or trailing whitespace due to
e.g. how they will be concatenated with other text,
or as a result of being segmented from some larger volume of text.

## Requirements

Easy things should be easy, and hard things should be possible.

Developers and translators should be able to read and write the syntax easily in a text editor.

As MessageFormat 2 will be at best a secondary language to all its users,
it should conform to user expectations and require as little learning as possible.

The syntax should avoid footguns,
in particular as it's passed through various tools during formatting.

## Constraints

Limiting the range of characters that need to be escaped in plain text is important.
Following past precedent,
this design doc will only consider encapsulation styles which
start with `{` and end with `}`.

The current syntax includes some plain-ascii keywords:
`input`, `local`, `match`, and `when`.

The current syntax and active proposals include some sigil + name combinations,
such as `:number`, `$var`, `|literal|`, `+bold`, and `@attr`.

The current syntax supports unquoted literal values as operands.

Messages themselves are "simple strings" and must be considered to be a single
line of text. In many containing formats, newlines will be represented as the local
equivalent of `\n`.

## Proposed Design

TBD

## Alternatives Considered

### Start in code, encapsulate text

This approach treats messages as something like a resource format for pattern values.
Keywords are declared directly at the top level of a message,
and patterns are surrounded by `{...}`.

Whitespace in patterns is never trimmed.

Some code statements (variable declarations and match statements)
also use `{...}` to surround values at the top level,
so counting `{` instances is not sufficient to identify if a value is "code" or "text".

The `{...}` are required for all messages,
including ones that only consist of text.
Delimiters of the resource format are required in addition to this,
so messages may appear wrapped as e.g. `"{...}"`.

Examples:

```
{Hello world}
```

```
{Hello {$user}}
```

```
input {$count :number minimumFractionDigits=1}
{You have eaten {$count} apples}
```

```
input {$count :number}
match {$count}
when 0 {You have no new message}
when one {You have {$count} new message}
when * {You have {$count} new messages}
```

```
{ and some more}
```

### Start in text, encapsulate code

The approach treats messages as template strings,
which may include statements and expressions surrounded by `{...}`.
Multi-variant messages require `match` and `when` statements that are followed by text at the top level.

Whitespace around statements may need to be trimmed
as e.g. `input` statements may be more readable when placed on a separate line,
where they would be followed by a newline.
At least the following trimming strategies may be considered:

1. Do not trim any whitespace.
1. Trim a minimal set of defined spaces:
   - All spaces before and between variable statements.
   - For single-variant messages, one newline after the last variable statement.
   - For multivariant messages,
     one space after a `when` statement and
     one newline followed by any spaces before a subsequent `when` statement.
1. Trim all leading and trailing whitespace.

All "code" statements are surrounded by `{...}`,
and all "text" is outside them.

Simple messages are not surrounded by any delimiters
other that what may be required by the resource format.

Depending on the details of the syntax of code inside the `{...}`,
unquoted non-numeric literals may need to be removed from the syntax.

Examples using either "minimal" or "all" trimming:

```
Hello world
```

```
Hello {$user}
```

```
{input $count :number minimumFractionDigits=1}
You have eaten {$count} apples
```

```
{input $count :number}
{match {$count}}
{when 0} You have no new message
{when one} You have {$count} new message
{when *} You have {$count} new messages
```

```
{| |}and some more
```

### Start with text, formalize for code

_(From an exercise we did 2023-09-12 with @stasm, @mihnita, @aphillips.
This section is highly experimental, was produced with the help of beer and tapas,
and is preserving a conversation from Slack)_

This approach assumes that most users want any string message to be
a valid message format pattern with the minimal amount of special decoration.
"Code" elements can be accessed with a minimum of special decoration.

**Make the keywords start with a distinct character**

```
#input $count :number
#local $date1 = $date   :datetime  dateStyle=long
#match $count :number minFracDigits=2, $gender
#when 1, masculine {You received one message on {$date}}
#when *, masculine {You received {$count} messages on {$date}}
```

**Make the block-start keywords start with a distinct character**

```
#input $count :number minFracDigits=2 #local $date1 = $date   :datetime  dateStyle=long
#match $count :number minFracDigits=2, $gender
when 1, masculine {You received one message on {$date}}
when *, masculine {You received {$count} messages on {$date}}
```

**Have a "message starts in code mode" sigil**

```
#input {$count :number}
local $date1 = {$date   :datetime  dateStyle=long}
match {$count :number minFracDigits=2} {$gender}
when 1 masculine {You received one message on {$date}}
when * masculine {You received {$count} messages on {$date}}
```

**_Permuations_**

```
#input {$count :number}
#local $date1 = {$date   :datetime  dateStyle=long}
#match {$count :number minFracDigits=2} $gender $foo
when 1 masculine {You received one message on {$date}}
when * masculine {You received {$count} messages on {$date}}

#input {$count :number dateStyle=long foo=bar}
#local $date1 = {$date   :datetime  dateStyle=long}
#match {$count :number minFracDigits=2} {$gender}
1 masculine {You received one message on {$date}}
* masculine {You received {$count} messages on {$date}}

#input {$count :number dateStyle=long foo=bar}
#local $date1 = {$date   :datetime  dateStyle=long}
#match {$count :number minFracDigits=2}
#match {$gender}
1 masculine {You received one message on {$date}}
* masculine {You received {$count} messages on {$date}}
```

**Remove most {} except to delimit placeholders and patterns**

```
#input $count:number(dateStyle=long foo=bar)
#local $date1 = $date:datetime(dateStyle=long)
#match [$count:number(minFracDigits=2) $gender]
[1 masculine] {You received one message on {$date}}
[* masculine] {You received {$count:number()} messages on {$date}}
```

**Avoid keywords, use the sigils to signal code mode**

```
$count:number(dateStyle=long, foo=bar,)
$count :number
$date1 = {$date   :datetime  dateStyle=long}
?? {$count :number minFracDigits=2} $gender $foo
[1 masculine] {You received one message on {$date}}
[* masculine] {You received {$count} messages on {$date}}
```

**Exploration of options side-by-side**
...or really _one above the other_...

-- current syntax

```
{Hello, {$username}!}
```

-- start in text mode

```
Hello, {$username}!
{$username}, welcome!
```

-- current syntax

```
input {$dist :number unit=km}
{The distance is {$dist}.}
```

-- start in text mode, switch to code, stay until end of input

```
#input {$dist :number unit=km}
{The distance is {$dist}.}
```

-- or, start in text mode, switch to code, exit back into text (makes newline meaningful)

```
#input {$dist :number unit=km}The distance is {$dist}.
```
```
#input {$dist :number unit=km}
{$dist} is the distance.
```
```
#input {$dist :number unit=km}
{:number foo=bar} is the distance.
```
```
#input {$dist :number unit=km}
{42 :number} is the distance.
```
quote the pattern to get starting whitespace:
```
#input {$dist :number unit=km}
{ {42 :number} is the distance.}
```
**Evil experiments with literal quoting**
```
This horse is a {fast camel digits=foo}
This horse is a {fast :camel}
This horse is a {|fast | camel}
This horse is a {MY_BUNDLE_KEY :camel}
This horse is a {'fast' camel}
You can't have a {fast camel title="can\'t have a fast camel"}
You can\'t have a {fast camel aria-foo=$foo title=\"can\\'t have fast camel\"}
```

-- start in text mode

```
#input {$count :number minFracDigits=2}
#match {$count}
1 {One apple.}
* {{$count} apples.}
```

-- current syntax

```
input {$count :number minFracDigits=2}
match {$count}
when 1 {One apple.}
when \* {{$count} apples.}
```

===============================================================================

```
#input {$item :noun case=accusative}
#input {$color :adjective accord=$item}
{You bought a {$color} {$item}.}

{You bought a {$color :adjective gender=$item.gender case=accusative} {$item :noun case=accusative}.}

#input {$item :noun case=accusative}
{You bought a {$color :adjective agree=$item} {$item}.}
```

While editing, notice the "single line" format of the above:

> #input {$item :noun case=accusative}#input {$color :adjective accord=$item}{You bought a {$color} {$item}.}

> #input {$item :noun case=accusative}{You bought a {$color :adjective agree=$item} {$item}.}

> input {$count :number minFracDigits=2} match {$count} when 1 {One apple.} when \* {{$count} apples.}


---
[x] spannable and standalone non-placeholders
   [?] proposed syntax with three sigils +/-/#
[x] non mutable shared namespace using input and local keywords
[x] start in text mode for messages with no declarations and match
    [x] need to write set of core example messages
[x] format to parts
   [?] design for shape of formatted parts for embedded 
[x] expression attributes use cases
   [ ] design
[X!!] logo
[ ] Nmtoken
[ ] Overriding functions, extending functions, potentially namespacing
[x] have a stability policy
    [?] actual stability policy (in progress)
[x] lazy/eager evaluation - we will not prescribe it and will attempt to avoid forcing eager
    - annotations are available post declaration
[x] TAG review is a goal for ~November
[x] Received valuable external input and actually listened to it

