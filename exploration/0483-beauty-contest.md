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

## Use sigils for code mode

Try to redues the use of `{`/`}` to just expressions and placeholders instead of the three
uses we have now (the other use is for patterns). This requires escaping whitespace or using
a placeholder for it.

The sigil `#` was chosen because `#define` type constructs are fairly common. Introduces `[`/`]` for keys.

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
#when [x y] \ \ {$foo} is {$bar}\ \
#when [* *] {|  |}{$foo} is {$bar}{|  |}

#{input $var :function option=value}#local $foo = {$bar :function option=value}Hello {$var}, you have a {$foo}

#match {$foo} {$bar}#when[foo bar] Hello {$foo} you have a {$var}#when[* *] {$foo} hello you have a {$var}

#match {$foo :function option=value} {$bar :function option=value}#when [a b] \ \ {$foo} is {$bar}\ \ #when [x y] \ \ {$foo} is {$bar}\ \ #when [* *] {|  |}{$foo} is {$bar}{|  |}
```

## Reducing keywords

Avoids keywords in favor of entirely sigil based parsing.

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

```
{#
  input {$var :function option=value}
}
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
}
{
match {$foo :function option=value} {$bar :function option=value}
[a b] {  {$foo} is {$bar}  }
[x y] {  {$foo} is {$bar}  }
[* *] {|  |}{$foo} is {$bar}{|  |}
}

{#input {$var :function option=value}}Hello {$var}

{#input {$var :function option=value} local $foo = {$bar :function option=value}}Hello {$var}, you have a {$foo}

{match {$foo} {$bar}[ foo bar] Hello {$foo} you have a {$var}[ *     *] {$foo} hello you have a {$var}}

{#input $foo :function option=value}{match {$foo :function option=value} {$bar :function option=value}[a b] {  {$foo} is {$bar}  }[x y] {  {$foo} is {$bar}  }[* *] {|  |}{$foo} is {$bar}{|  |}}
```

## Use "statements"

Many languages delimit statements using a terminator, such as `;`.
In some languages, the terminator is the newline and lines can be extended using an escape like `\`.
Here we use `#` as a terminator.

Here the last example is repeated showing `when` as an independent statement.

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
