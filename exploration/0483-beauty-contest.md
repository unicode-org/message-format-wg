# Syntax Variation Beauty Contest

As discussed in the 2023-09-25 teleconference, we need to choose a syntax to proceed with.
This page hosts various options for considering in the 2023-10-02 call.

## Current

This is the current syntax.
The list of messages in this section also serves as the basis for all other examples.

```
{Hello world!}

{Hello {$user}}

input $var :function option=value
{Hello {$var}}

input $var :function option=value
local $foo = {$bar :function option=value}
{Hello {$var}, you have a {$foo}}

match {$foo} {$bar}
when foo bar {Hello {$foo} you have a {$var}}
when * * {{$foo} hello you have a {$var}}

match {$foo :function option=value} {$bar :function option=value}
when a b {  {$foo} is {$bar}  }
when x y {  {$foo} is {$bar}  }
when * * {  {$foo} is {$bar}  }

input $var :function option=value local $foo = {$bar :function option=value}{Hello {$var}, you have a {$foo}}

match {$foo} {$bar} when foo bar {Hello {$foo} you have a {$var}} when * * {{$foo} hello you have a {$var}}

match {$foo :function option=value} {$bar :function option=value}when a b {  {$foo} is {$bar}  }when x y {  {$foo} is {$bar}  }when * * {  {$foo} is {$bar}  }
```

## Invert for Text Mode

Consumes exterior whitespace.

```
Hello world!

Hello {$user}

{input $var :function option=value}
Hello {$var}

{input $var :function option=value}
{local $foo = $bar :function option=value}
Hello {$var}, you have a {$foo}

{match {$foo} {$bar}}
{when foo bar} Hello {$foo} you have a {$var}
{when * *} {$foo} hello you have a {$var}

{match {$foo :function option=value} {$bar :function option=value}}
{when a b} {  {$foo} is {$bar}  }
{when x y} {  {$foo} is {$bar}  }
{when * *} {|  |}{$foo} is {$bar}{|  |}

{input $var :function option=value}{local $foo = $bar :function option=value}Hello {$var}, you have a {$foo}

{match {$foo} {$bar}}{when foo bar} Hello {$foo} you have a {$var}{when * *} {$foo} hello you have a {$var}

{match {$foo :function option=value}{$bar :function option=value}}{when a b} {  {$foo} is {$bar}  }{when x y} {  {$foo} is {$bar}  }{when * *} {|  |}{$foo} is {$bar}{|  |}
```

## Text First, but Code After

This is @mihnita's proposal, mentioned in the 2023-10-02 call.

```
Hello world!

Hello {$user}

{input $var :function option=value}
{Hello {$var}}

{input $var :function option=value}
{local $foo = $bar :function option=value}
{Hello {$var}, you have a {$foo}}

{match {$foo} {$bar}}
{when foo bar} {Hello {$foo} you have a {$var}}
{when * *} {{$foo} hello you have a {$var}}

{match {$foo :function option=value} {$bar :function option=value}}
{when a b} {  {$foo} is {$bar}  }
{when x y} {  {$foo} is {$bar}  }

{input $var :function option=value}{local $foo = $bar :function option=value}{Hello {$var}, you have a {$foo}}

{match {$foo} {$bar}}{when foo bar} Hello {$foo} you have a {$var}{when * *}{{$foo} hello you have a {$var}}

{match {$foo :function option=value}{$bar :function option=value}}{when a b} {  {$foo} is {$bar}  }{when x y} {  {$foo} is {$bar}  }
```

## Use sigils for code mode

Try to redues the use of `{`/`}` to just expressions and placeholders instead of the three
uses we have now (the other use is for patterns). This requires escaping whitespace or using
a placeholder for it. See #486 for a discussion of whitespace options.

The sigil `#` was chosen because `#define` type constructs are fairly common.
Introduces `[`/`]` for keys.

```
#input {$var :function option=value}
Hello {$var}

#input {$var :function option=value}
#local $foo = {$bar :function option=value}
Hello {$var}, you have a {$foo}

#match {$foo} {$bar}
#when[foo bar] Hello {$foo} you have a {$var}
#when[  *   *] {$foo} hello you have a {$var}

#match {$foo :function option=value} {$bar :function option=value}
#when [a b] \ \ {$foo} is {$bar}\ \
#when [x y] {||}  {$foo} is {$bar}  {||}
#when [* *] {|  |}{$foo} is {$bar}{|  |}

#{input $var :function option=value}#local $foo = {$bar :function option=value}Hello {$var}, you have a {$foo}

#match {$foo} {$bar}#when[foo bar] Hello {$foo} you have a {$var}#when[* *] {$foo} hello you have a {$var}

#match {$foo :function option=value} {$bar :function option=value}#when [a b] \ \ {$foo} is {$bar}\ \ #when [x y] {||}  {$foo} is {$bar}  {||}#when [* *] {|  |}{$foo} is {$bar}{|  |}
```

## Reducing keywords

Avoids keywords in favor of sigil based parsing.
The theory here is that the syntactic sugar of `match` and `when` are nice the first time you use them
but the benefit is lost or reduced after that.

```
#$var = {$var :function option=value}
Hello {$var}

#$var = {$var :function option=value}
#$foo = {$bar :function option=value}
Hello {$var}, you have a {$foo}

?? {$foo} {$bar}
::[ foo bar] Hello {$foo} you have a {$var}
::[ *     *] {$foo} hello you have a {$var}

?? {$foo :function option=value} {$bar :function option=value}
::[a b] {  {$foo} is {$bar}  }
::[x y] {  {$foo} is {$bar}  }
::[* *] {|  |}{$foo} is {$bar}{|  |}

#$var = {$var :function option=value}#$foo = {$bar :function option=value}Hello {$var}, you have a {$foo}

??{$foo}{$bar}::[foo bar] Hello {$foo} you have a {$var}::[* *] {$foo} hello you have a {$var}

??{$foo :function option=value}{$bar :function option=value}::[a b] {  {$foo} is {$bar}  }::[x y] {  {$foo} is {$bar}  }::[* *] {|  |}{$foo} is {$bar}{|  |}
```

## Use "blocks" for declarations and body

Use code-mode "blocks" to introduce code. _(This section has an additional example)_

The theory here is that a "declarations block" would be a natural add-on and it doesn't
require additional typing for each declaration.

Note too that this syntax could be extended to allow other types of blocks,
such as comments or different types of statement.

```
{#
  input {$var :function option=value}
}
Hello {$var}

// might be more natural as:
{#input {$var :function option=value}}
Hello {$var}

{#
   input {$var :function option=value}
   local $foo = {$bar :function option=value}
}
Hello {$var}, you have a {$foo}

{
  match {$foo} {$bar}
  [ foo bar] Hello {$foo} you have a {$var}
  [ *     *] {$foo} hello you have a {$var}
}

{#
   input $foo :function option=value
}{
  match {$foo :function option=value} {$bar :function option=value}
  [a b] {  {$foo} is {$bar}  }
  [x y] {  {$foo} is {$bar}  }
  [* *] {|  |}{$foo} is {$bar}{|  |}
}

{#input {$var :function option=value}}Hello {$var}

{#input {$var :function option=value} local $foo = {$bar :function option=value}}Hello {$var}, you have a {$foo}

{match {$foo} {$bar}[ foo bar] Hello {$foo} you have a {$var}[* *] {$foo} hello you have a {$var}}

{#input $foo :function option=value}{match {$foo :function option=value} {$bar :function option=value}[a b] {  {$foo} is {$bar}  }[x y] {  {$foo} is {$bar}  }[* *] {|  |}{$foo} is {$bar}{|  |}}
```

## Use "statements"

Many languages delimit statements using a terminator, such as `;`.
In some languages, the terminator is the newline and lines can be extended using an escape like `\`.
Here we use `#` as a terminator.
Note that the closing `#` on `match` might be optional.

_Here the last example is repeated showing `when` as an independent statement._

```
#input {$var :function option=value}#
Hello {$var}

#input {$var :function option=value}#
#local $foo = {$bar :function option=value}#
Hello {$var}, you have a {$foo}

#match {$foo} {$bar}
when [ foo bar] Hello {$foo} you have a {$var}
when [ *     *] {$foo} hello you have a {$var}
#

#match {$foo :function option=value} {$bar :function option=value}
   when [a b] {  {$foo} is {$bar}  }
   when [x y] {  {$foo} is {$bar}  }
   when [* *] {|  |}{$foo} is {$bar}{|  |}
#

#match {$foo :function option=value} {$bar :function option=value}#
#when a b#  {$foo} is {$bar}
#when x y#  {$foo} is {$bar}
#when * *# {|  |}{$foo} is {$bar}{|  |}


#input {$var :function option=value}##local $foo = {$bar :function option=value}#Hello {$var}, you have a {$foo}

#match {$foo} {$bar}when [ foo bar] Hello {$foo} you have a {$var}when [ *     *] {$foo} hello you have a {$var}#

#match {$foo :function option=value} {$bar :function option=value}when [a b] {  {$foo} is {$bar}  }when[x y] {  {$foo} is {$bar}  }when[* *] {|  |}{$foo} is {$bar}{|  |}#

#match {$foo :function option=value} {$bar :function option=value}##when a b#  {$foo} is {$bar}  #when x y#  {$foo} is {$bar}  #when * *# {|  |}{$foo} is {$bar}{|  |}
```
