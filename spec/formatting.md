# WIP DRAFT MessageFormat 2.0 Formatting Behaviour

## Introduction

This document defines the behaviour of a MessageFormat 2.0 implementation
when formatting a message for display in a user interface, or for some later processing.

The document is part of the MessageFormat 2.0 specification,
the successor to ICU MessageFormat, henceforth called ICU MessageFormat 1.0.

## Variable Resolution

To resolve the value of a Variable,
its Name is used to identify either a local variable,
or a variable defined elsewhere.
If a local variable and an externally defined one use the same name,
the local variable takes precedence.

It is an error for a local variable definition to
refer to a local variable that's defined after it in the message.

## Error Handling

During the formatting of a message,
various errors may be encountered.
These are divided to the following categories:

- **Syntax errors** occur when the syntax representation of a message is invalid.
- **Resolution errors** occur when the runtime value of a part of a message
  cannot be determined.
- **Unresolved variable errors** are a sub-category of resolution errors,
  and occur when a variable reference cannot be resolved.
- **Formatting errors** are thrown by expression handlers,
  for example when encountering a value with an unsupported type
  or an internally inconsistent set of options.

In all cases, when encountering an error,
a message formatter must provide some representation of the message.
An informative error must also be separately provided.

When an error occurs in the syntax or resolution of an Expression or MarkupStart Option,
the Expression or MarkupStart in question is processed as if the option was not defined.
This may allow for the fallback handling described below to be avoided,
though an error must still be emitted.

When an error occurs within a Selector,
the selector may only match the catch-all VariantKey `*`.

When an error occurs in a Placeholder that is being formatted,
the fallback string representation of the Placeholder
always starts with U+007B LEFT CURLY BRACKET `{`
and ends with U+007D RIGHT CURLY BRACKET `}`.
Between the brackets, the following contents are used:

- Expression with Literal Operand: U+0028 LEFT PARENTHESIS `(`
  followed by the value of the Literal,
  and then by U+0029 RIGHT PARENTHESIS `)`
- Expression with Variable Operand: U+0024 DOLLAR SIGN `$`
  followed by the Variable Name of the Operand
- Expression with no Operand: U+003A COLON `:` followed by the Expression Name
- Markup start: U+002B PLUS SIGN `+` followed by the MarkupStart Name
- Markup end: U+002D HYPHEN-MINUS `-` followed by the MarkupEnd Name
- Otherwise: Three U+003F QUESTION MARK `?` characters, i.e. `???`

For example, the formatted string representation of the expression `{$foo :bar}`
would be `{$foo}` if the variable could not be resolved.

The formatted string representation of a message with an unrecoverable syntax error
is the concatenation of U+007B LEFT CURLY BRACKET `{`,
a string identifier for the message,
and U+007D RIGHT CURLY BRACKET `}`.
If an identifier is not available,
it is replaced with three U+003F QUESTION MARK `?` characters,
resulting in the string `{???}`.
