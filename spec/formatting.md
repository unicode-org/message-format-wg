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
These are divided into the following categories:

- **Syntax errors** occur when the syntax representation of a message is not well-formed.
- **Data Model errors** occur when a message is invalid due to
  violating one of the following semantic requirements on its structure:

  - **Variant Key Mismatch errors** occur when the number of keys on a Variant
    does not equal the number of Selectors.
  - **Missing Fallback Variant errors** occur when the message
    does not include a Variant with only catch-all keys.

- **Resolution errors** occur when the runtime value of a part of a message
  cannot be determined.

  - **Unresolved Variable errors** occur when a variable reference cannot be resolved.

- **Selection errors** occur when message selection fails.

  - **Selector errors** are failures in the matching of a key to a specific selector.

- **Formatting errors** occur during the formatting of a resolved value,
  for example when encountering a value with an unsupported type
  or an internally inconsistent set of options.

Syntax and Data Model errors must be emitted as soon as possible.

During selection, an Expression handler must only emit Resolution and Selection errors.
During formatting, an Expression handler must only emit Resolution and Formatting errors.

In all cases, when encountering an error,
a message formatter must provide some representation of the message.
An informative error or errors must also be separately provided.

When an error occurs in the resolution of an Expression or Markup Option,
the Expression or Markup in question is processed as if the option were not defined.
This may allow for the fallback handling described below to be avoided,
though an error must still be emitted.

When an error occurs within a Selector,
the selector must not match any VariantKey other than the catch-all `*`
and a Selector error is emitted.
When selection fails to match any Variant,
an empty string is used as the formatted string representation of the message
and a Missing Fallback error is emitted.

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
- Otherwise: The U+FFFD REPLACEMENT CHARACTER `�` character

For example, the formatted string representation of the expression `{$foo :bar}`
would be `{$foo}` if the variable could not be resolved.

The formatted string representation of a message with a Syntax or Data Model error
is the concatenation of U+007B LEFT CURLY BRACKET `{`,
a fallback string,
and U+007D RIGHT CURLY BRACKET `}`.
If a fallback string is not defined,
the U+FFFD REPLACEMENT CHARACTER `�` character is used,
resulting in the string `{�}`.
