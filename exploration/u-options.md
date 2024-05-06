# Contextual Options

Status: **Accepted**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@eemeli</dd>
		<dt>First proposed</dt>
		<dd>2023-05-06</dd>
		<dt>Pull Requests</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/780">#780</a></dd>
	</dl>
</details>

## Objective

Provide common definitions for contextual options.

## Background

Function options may influence the resolution, selection, and formatting of annotated expressions.
These provide a great solution for options like `minFractionDigits`, `dateStyle`,
or other similar factors that influence the formatted result.

Such options naturally correspond to function arguments or builder-style function constructors.
Each option is specific to the associated API.
Users (message authors, translators, developers) should not expect
that a given option name has the same meaning between functions
or that its behavior stays the same.

To reduce the learning curve for users and improve consistency,
it would be useful to have common options 
(generally those related to the formatting context)
shared between all functions.

## Use-Cases

At least the following function and markup options should be considered:

- An identifier for the expression or markup.
  This is included in the formatted part,
  and allows the parts of an expression to be explicitly addressed.

  > Example identifying two literal numbers:
  >
  > ```
  > The first number was {1234 :number u:id=first} and the second {56789 :number u:id=second}.
  > ```

- An override for the locale used to format the expression.

  > Example embedding a French date in an English message:
  >
  > ```
  > In French, this date would be displayed as {|2024-05-06| :date u:locale=fr}
  > ```

- An override for the LTR/RTL/auto directionality of the expression.

  > Example explicitly isolating the directionality of a placeholder
  > for a custom user-defined function:
  >
  > ```
  > Welcome, {$user :x:username u:dir=auto}
  > ```

## Requirements

Common options or attributes should work the same way in different functions.

Special options or attributes should not conflict with other option names.

## Constraints

User-defined functions are free to use un-namespaced option names
even if the function identifier does use a namespace.

The `u` namespace is reserved for future standardization.

No literal syntax is provided for values that are lists or sequences of scalar values.

## Proposed Design

Define the expected values and handling for the following options
wherever they are used:

- `u:id` — A string value that is included as an `id` or other suitable value
  in the formatted part(s) for the placeholder,
  or any other structured formatted results.
  Ignored when formatting to a string, but could show up in error messages.
- `u:locale` — A comma-delimited list of BCP 47 language tags,
  or an implementation-defined list of such tags.
  The tags are parsed, and they replace the _locale_
  defined in the _formatting context_ for this expression or markup.
- `u:dir` — One of the string values `ltr`, `rtl`, or `auto`.
  Replaces the character directionality
  defined in the _formatting context_ for this expression or markup.

Error handling should be well defined for invalid values.

Additional restrictions could be imposed,
e.g. requiring that each `u:id` is unique within a formatted message.

Drop variable values from the `attribute` rule:

```diff
-attribute      = "@" identifier [[s] "=" [s] (literal / variable)]
+attribute      = "@" identifier [[s] "=" [s] literal]
```

## Alternatives Considered

### Do nothing

Continue to [caution](https://github.com/unicode-org/message-format-wg/blob/d38ff326d2381b3ef361e996c3431d1b251518d6/spec/syntax.md#attributes)
function authors and other implementers away from creating function-specific or implementation-specific option values
for the use cases presented above.

As should be obvious, the current situation is not tenable in the long term, and should be resolved.

### Do not provide any guidance

Do not include in the spec rules or guidance for declaring formatted part identifiers,
or overriding the message locale or directionality.

This would mean not defining anything for default registry functions either,
effectively requiring implementation-specific options like `icu:locale`.

Other functions could use their own definitions and handling for similar options,
such as `locale` or `x:lang`.

Formatted parts for markup would not be able to directly include an identifier.

### Define options for default registry only

Define at least `locale` and `dir` as options for default registry functions,
with handling internal to each function implementation.

Other functions could use their own definitions and handling for similar options,
such as `locale` or `x:lang`.

Formatted parts for markup would not be able to directly include an identifier.

### Use expression attributes

Use option-like syntax `@id=foo` instead of `u:id=foo`, as described in the
[Expression Attributes](https://github.com/unicode-org/message-format-wg/blob/d38ff326d2381b3ef361e996c3431d1b251518d6/exploration/expression-attributes.md) design document.

Same runtime effects as with the proposed solution.

Requires expression attribute values to accept variables,
for use like `@locale=$locale`.

Defines a formatting runtime use for expression attributes.
