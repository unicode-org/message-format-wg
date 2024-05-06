# Expression Attributes

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@eemeli</dd>
		<dt>First proposed</dt>
		<dd>2023-08-27</dd>
		<dt>Pull Requests</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/458">#458</a></dd>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/772">#772</a></dd>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/780">#780</a></dd>
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

- Attributes relevant for translators, tools, and other message operations,
  but with no runtime impact:

  - `example` — A literal value representing
    what the expression's formatted value will look like.

    > Example providing a translator with an example for `$place`:
    >
    > ```
    > Hello {$place @example=world}
    > ```

  - `note` — A comment on the expression for translators.

    > Example providing a translator with an example for `$place`:
    >
    > ```
    > Welcome to {$place @note=|The user's current location|}
    > ```

  - `translate` — A boolean `yes`/`no` indicator communicating to translators
    whether the expression should or should not be localised.
    The values here correspond to those used for this property in HTML and elsewhere.

    > Example embedding a non-translatable CLI command in a message:
    >
    > ```
    > Use {+code @translate=no}git ls-files{-code} to list all files in a repository.
    > ```

  - `canCopy`, `canDelete`, `canOverlap`, `canReorder`, etc. — Flags supported by
    XLIFF 2 inline elements

- Attributes used to represent features of other localization syntaxes
  when parsed to a MessageFormat 2 data model.

  - `source` — A literal value representing the source syntax of an expression.

    > Example selector representing an Xcode stringsdict `NSStringLocalizedFormatKey` value:
    >
    > ```
    > .match {$count :number @source=|%#@count@|}
    > ```

## Requirements

Attributes can be assigned to any expression,
including expressions without an annotation.

Attributes are distinct from function options.

Users may define their own attributes.

Implementations may define their own attributes.

Each attribute relates to a specific expression.

Multiple attributes should be assignable to a single expression.

Attributes should be assignable to all expressions, not just placeholders.

## Constraints

If supported by new syntax,
the syntax should be easy to parse by both humans and machines.

If supported by new syntax at the end of an expression,
the reserved/private-use rules will need to be adjusted to support attributes.

## Proposed Design

Add support for `@key` attributes at the end of any expression or markup.
These may consist only of an attribute name,
or an option-like `@key=value` pair with a literal value.

To distinguish expression attributes from options,
require `@` as a prefix for each attribute asignment.
Examples: `@translate=yes` and `@xliff:canCopy`.

Do not allow expression or markup attributes to influence the formatting context,
or pass them to function handlers.

## Alternatives Considered

### Do not support expression attributes

If not explicitly defined, less information will be provided to translators.

Function options may be used as a workaround,
but each implementation and user will end up with different practices.

### Use function options, but with some suggested "discard" namespace like `_`

Examples: `_:translate=yes` and `_:example=|World|`.

Requires reserving an additional namespace.

Requires cooperation from implementers to ignore all options using the namespace.

Makes defining namespaced attributes difficult.

At least a no-op function is required for otherwise unannotated expressions.

### Rely on semantic comments

These will be defined within the message resource spec,
so we introduce a dependence on that.

Referring to specific expressions from outside the message is hard,
esp. if a similar expression is used in multiple variants.

Comments should not influence the runtime behaviour of a formatter.

### Define `@attributes` as above, but explicitly namespace custom attributes

As namespacing may also be required for function names and function option names,
and because we want to allow at least for custom function options
to be definable on default formatters,
the namespace rules for parts of the specification would end up differing.

By suggesting instead of requiring,
we rely on our stability policy to guide implementations to keep clear of the namespace
that may be claimed by later versions of the specification.

### Enable function chaining within a single expression

By allowing for multiple annotation functions on a single expression,
it becomes possible to consider some of them to have passthrough behaviour during formatting
but have an impact during translation.

For example, with an expression like

```
{42 :locale set=fr :number :xliff can-copy=yes}
```

the locale may be set separately from other options,
and a custom attribute applied during a conversion to XLIFF.

This approach may produce the same result as the proposed design,
but has a few caveats:

- The order of operations matters,
  and an attribute such as the locale must be set before others that are influenced by it.
- It's not clear whether the functions will be evaluated
  left-to-right or right-to-left.
- During formatting,
  passthrough functions such as `:xliff` must be explicitly provided.
- Localization tools need to be aware and understand named functions,
  rather than being able to detect un-namespaced `@` attributes.
