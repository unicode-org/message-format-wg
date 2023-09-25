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
