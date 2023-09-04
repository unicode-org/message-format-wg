# Expression Attributes

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@eemeli</dd>
		<dt>First proposed</dt>
		<dd>2023-08-27</dd>
		<dt>Pull Request</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/458">#458</a></dd>
	</dl>
</details>

## Objective

Define how attributes may be attached to expressions.

## Background

Function options may influence the resolution, selection, and formatting of annotated expressions.
These provide a great solution for options like `minFractionDigits`, `dateStyle`,
or other similar factors that influence the formatted result.

However, this single bag of options is not appropriate in all cases,
in particular for attributes that pertain to the expression as a selector or a placeholder.
For example, many of the [XLIFF 2 inline element] attributes don't really make sense as function options.

[XLIFF 2 inline element]: http://docs.oasis-open.org/xliff/xliff-core/v2.1/os/xliff-core-v2.1-os.html#inlineelements

## Use-Cases

At least the following expression attributes should be considered:

- Attributes with a formatting runtime impact:

  - `fallback` — A value to use instead of the default fallback,
    should the expression's primary formatting fail in some way.
  - `locale` — An override for the locale used to format the expression.
    Should be expressed as a non-empty sequence of BCP 47 language codes.
  - `dir` — An override for the LTR/RTL/auto directionality of the expression.

- Attributes relevant for translators, tools, and other message operations,
  but with no runtime impact:

  - `example` — A literal value representing
    what the expression's formatted value will look like.
  - `note` — A comment on the expression for translators.
  - `translate` — A boolean `yes`/`no` indicator communicating to translators
    whether the expression should or should not be localised.
  - `canCopy`, `canDelete`, `canOverlap`, `canReorder`, etc. — Flags supported by
    XLIFF 2 inline elements

## Requirements

Attributes can be assigned to any expression,
including expressions without an annotation.

Attributes are distinct from function options.

Common attributes are defined by the MF2 specification
and must be supported by all implementations.

Users may define their own attributes.

Implementations may define their own attributes.

Some attributes may have an effect on the formatting of an expression.
These cannot be defined within comments either within or outside a message.

Each attribute relates to a specific expression.

An attribute's scope is limited to the expression to which it relates.

Multiple attributes should be assignable to a single expression.

Attributes should be assignable to all expressions, not just placeholders.

## Constraints

If supported by new syntax,
the syntax should be easy to parse by both humans and machines.

If supported by new syntax at the end of an expression,
the reserved/private-use rules will need to be adjusted to support attributes.

## Proposed Design

Add support for option-like `@key=value` attribute pairs at the end of any expression.

If the syntax for function options is extended to support flag-like options
(see <a href="https://github.com/unicode-org/message-format-wg/issues/386">#386</a>),
also extend expression attribute syntax to match.

To distinguish expression attributes from options,
require `@` as a prefix for each attribute asignment.
Examples: `@translate=yes` and `@locale=$exprLocale`.

Define the meaning and supported values of some expression attributes in the specification,
including at least `@dir` and `@locale`.

To support later extension of the specified set of attributes while allowing user extensibility,
require custom attribute names to include a U+002D Hyphen-Minus `-`.
Examples: `@can-copy=no`, `@note-link=|https://...|`.

Allow expression attributes to influence the formatting context,
but do not directly pass them to user-defined functions.

## Alternatives Considered

### Do not support expression attributes

If not explicitly defined, less information will be provided to translators.

Function options may be used as a workaround,
but each implementation and user will end up with different practices.

### Use function options, but with some suggested prefix like `_`

A bit less bad than the previous, but still mixes attributes and options into the same namespace.

At least a no-op function is required for otherwise unannotated expressions.

### Rely on semantic comments

These will be defined within the message resource spec,
so we introduce a dependence on that.

Referring to specific expressions from outside the message is hard,
esp. if a similar expression is used in multiple variants.

Comments should not influence the runtime behaviour of a formatter.

### Define `@attributes` as above, but do not namespace custom attributes

Later spec versions will not be able to define _any_ new attributes
without a danger of breaking implementations or users already using those names.
