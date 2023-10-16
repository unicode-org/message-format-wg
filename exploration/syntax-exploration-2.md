# Syntax Exploration v2

In the 2023-10-16 teleconference, we narrowed the options being considered for text-mode syntax to "1a", "2a", and "3a". 
Each of these syntax candidates has been adjusted based on our conversation.

One open issue, separately considered here, is the use of an additional sigil for some of the syntaxes.
We have generally used `#` as the placeholder for this sigil in the previous iteration.


## Comparison Matrix

... goes here...

## Candidates

### Candidate 1a

**Description:** Invert for Text Mode, distinguish statements from placeholders

- Placeholders and expressions use `{`/`}`:
  > `{$var}`, `{unquoted}`, `{|quoted|}`, `{$var :function}`
- Non-placeholders use `{#`/`}`:
  > `{#input $user}`, `{#local $var=$foo :expr}`, `{#match {$foo}}`, `{#when * *}`

The use of `#` as the sigil is intentional here.
This sigil might be replaced, but does not require additional escaping, as code is enclosed in `{`/`}`.
Note that the `#` sigil might also be considered to be part of the keyword, e.g. `#when`, `#local` vs.
allowing whitespace to appear between them.

Patterns in this syntax are generally unquoted,
but MAY be quoted with the 2023-10-09 consensus `{{`/`}}` quotes.

ASCII whitespace trimming is assumed, but is a hot topic.

**Examples**
```
Hello world!
```
```
Hello {$user}
```
```
{#input $user :person type=informal}
Hello {$user}

{#input $user :person type=informal}Hello {$user}
```
```
{#input $var :function option=value}
{#local $foo = $bar :function option=value}
Hello {$var}, you have a {$foo}

{#input $var :function option=value}{#local $foo = $bar :function option=value}Hello {$var}, you have a {$foo}
```
```
{#match {$foo}}
{#when foo} Hello {$foo} you have a {$var}
{#when *} {$foo} hello you have a {$var}

{#match {$foo}}{#when foo}Hello {$foo} you have a {$var}{#when *}{$foo} hello you have a {$var}
```
```
{#match {$foo :function option=value} {$bar :function option=value}}
{#when a b} {{  {$foo} is {$bar}  }}
{#when x y} {{  {$foo} is {$bar}  }}
{#when * *} {|  |}{$foo} is {$bar}{|  |}

{#match {$foo :function option=value}{$bar :function option=value}}{#when a b}{{  {$foo} is {$bar}  }}{#when x y}{{  {$foo} is {$bar}  }}{#when * *}{|  |}{$foo} is {$bar}{|  |}
```

### Candidate 2a

**Description**: Text First, Current Syntax for "Complex" Messages

Starts in text mode, but switches to the current "code-mode" syntax for any message containing declarations or selectors.

- "Simple" messages (lacking declarations or selectors) are unquoted patterns.
- Patterns with declarations (`input`, `local`), selectors (`match`/`when`) or both quote all patterns.
- Pattern whitespace is always significant.
  Note that "pattern whitespace" is only that whitespace that appears inside the quoting `{`/`}`
  for quoted patterns.

> The use in the previous iteration of `{{` and `}}` surrounding code-mode messages was identified as a potential negative, 
> as the closing `}}` are superfluous to the message.

The use of `>>` to represent the "starting code-mode sigil" is **_not_** final.
**_Do not fixate on the specific character sequence when choosing (or not) this design._**

**Examples**
```
Hello world!
```
```
Hello {$user}
```
```
>>input {$user :function option=value}
{Hello {$user}}

>>input {$user :function option=value}{Hello {$user}}
```
```
>>input {$var :function option=value}
local $foo = {$bar :function option=value}
{Hello {$var}, you have a {$foo}}

>>input {$var :function option=value}local $foo = {$bar :function option=value}{Hello {$var}, you have a {$foo}}
```
```
>>match {$foo}
when foo {Hello {$foo} you have a {$var}}
when * {{$foo} hello you have a {$var}}

>>match {$foo}when foo{Hello {$foo} you have a {$var}}when *{{$foo} hello you have a {$var}}
```

```
>>match {$foo :function option=value} {$bar :function option=value}
when a b {  {$foo} is {$bar}  }
when x y {  {$foo} is {$bar}  }
when * * {  {$foo} is {$bar}  }

>>match {$foo :function option=value}{$bar :function option=value}when a b{  {$foo} is {$bar}  }when x y{  {$foo} is {$bar}  }when * *{  {$foo} is {$bar}  }
```

### Candidate 3a

**Description:** Use sigils for code mode, use `{`/`}` for keys

- Starts in text mode. 
- Uses a sigil for code statements. 
  - Requires the code-mode sigil to be escaped in **_unquoted_** patterns.
  - Quoted patterns do not require this sigil to be escaped.
  - Note that decisions about auto-trimming affect the escaping situation. 
    If quoting the pattern is required, no additional escapes are needed.
- Placeholders and expressions use `{`/`}`:
  > `{$var}`, `{unquoted}`, `{|quoted|}`, `{$var :function}`

The use of `%` as the sigil is **_not_** an inherent part of the design here.
The actual sigil or sigil sequence needs to be decided. 
Note that using a doubled-sigil reduces the need for escaping.

Patterns in this syntax are generally unquoted,
but MAY be quoted with the 2023-10-09 consensus `{{`/`}}` quotes.

Patterns lacking declarations, selectors, or both, are **_not_** auto-trimmed.
Whitespace in quoted patterns is significant.
Whitespace in unquoted patterns may or may not be significant (hot topic).

```
Hello world!
```
```
Hello {$user}!
```
```
%input {$var :function option=value}
Hello {$var}

%input {$var :function option=value}Hello {$var}
```
```
~input {$var :function option=value}
~local $foo = {$bar :function option=value}
Hello {$var}, you have a {$foo}

~input {$var :function option=value}~local $foo = {$bar :function option=value}Hello {$var}, you have a {$foo}
```
```
~match {$foo} {$bar}
~when{foo bar} Hello {$foo} you have a {$var}
~when{  *   *} {$foo} hello you have a {$var}

~match {$foo}{$bar}~when{foo bar} Hello {$foo} you have a {$var}~when{* *} {$foo} hello you have a {$var}
```

```
~match {$foo :function option=value} {$bar :function option=value}
~when {a b} {{  {$foo} is {$bar}  }}
~when {x y} {||}  {$foo} is {$bar}  {||}
~when {* *} {|  |}{$foo} is {$bar}{|  |}

~match {$foo :function option=value}{$bar :function option=value}~when {a b}{{  {$foo} is {$bar}  }}~when {x y} {||}{$foo} is {$bar}  {||}~when {* *}{|  |}{$foo} is {$bar}{|  |}
```
