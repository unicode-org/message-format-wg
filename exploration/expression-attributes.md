# Expression Attributes

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@eemeli</dd>
		<dd>@aphillips</dd>
		<dt>First proposed</dt>
		<dd>2023-08-27</dd>
		<dt>Pull Requests</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/458">#458</a></dd>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/772">#772</a></dd>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/780">#780</a></dd>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/792">#792</a></dd>
	</dl>
</details>

## Objective

Define how attributes may be attached to expressions.

## Background

Function options may influence the resolution, selection, and formatting of annotated expressions.
These provide a great solution for options like `minFractionDigits`, `dateStyle`,
or other similar factors that influence the formatted result.

Such options naturally correspond to function arguments or builder-style function constructors.
Each option is specific to the associated API.
Message authors such as translators and developers want consistent ways to do common tasks, 
such as providing hints to translation tools or overriding the locale,
but, unless MessageFormat provides otherwise, cannot rely on implementations
to consistently implement these.

To reduce the learning curve for users and improve consistency,
it would be useful to have common options
(generally those related to the formatting context)
shared between all functions.

Separately from formatting concerns,
it is often useful to attach other information to message expressions and markup.
For example, presenting how an example value could be formatted can be very useful for the message's translation,
and providing the original source representation of a placeholder may be essential for being able to format a non-MF2 message,
if it has been transformed to MF2 to provide translators with a unified experience.
As a specific example, many of the [XLIFF 2 inline element] attributes have no meaning
to the function that they appear as options or annotations of.

[XLIFF 2 inline element]: http://docs.oasis-open.org/xliff/xliff-core/v2.1/os/xliff-core-v2.1-os.html#inlineelements

## Use-Cases

### User Story: Formatting Context Override
As a message author, I want to override values in the _formatting context_ for a specific _expression_.
I would like to do this in a consistent, effective manner that does not require a change to the
_function_ or _markup_ support code in order to be effective.
As far as the code is concerned, it just reads the value from the _formatting context_ normally.

A common example of this is the _locale_.
Overriding the locale used by a function might be needed if I want a specific locale chosen:
```
You format {42 :number @locale=fr} like this in French.
```
Or if I want to supply it in a variable:
```
You format {42 :number @locale=$userSpecified} like this in {$userSpecified}
```

Other examples include _direction_ or the _time zone_:
```
The MAC address is always LTR: {$mac :string @dir=ltr}
I don't want the system default time zone or the one in $d: {$d :date @timezone=|America/Phoenix|}
```

An implementation might want to override a custom contextual value:
```
You format this specially: {42 :number @amzn:marketplace=US}
```

### User Story: Translation Tooling
As a translator or developer, I want to ensure that instructions to CAT tools,
including information for human translators or that help MT can be included into
the message and preserved through the translation process.

In general, such instructions, metadata, etc. do not effect the runtime formatting of the message.
Implementers of functions or markup do not wish to access these and might be annoyed if
the names of translation-related fields conflict with the normal naming of options.
Message compilers might remove these expression attributes when creating messages for use by the runtime.

Some examples include:
- In addition to supporting a limited set of HTML elements,
  Android String Resources use `<xliff:g>` to wrap
  [nontranslatable content](https://developer.android.com/guide/topics/resources/localization#mark-message-parts).
  This is best represented in MF2 with a `@translate=no` attribute.
- Web extension `messages.json` files allow for named [placeholders](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/i18n/Locale-Specific_Message_reference#placeholders)
  that are mapped to indexed arguments.
  These may include an example, which is best represented in MF2 as an `@example=...` attribute.

- In #772, @eemeli calls out:
  > While working on [moz.l10n](https://github.com/mozilla/moz-l10n/),
  > a new Python localization library that uses the MF2 message and
  > [resource data model](https://github.com/eemeli/message-resource-wg/pull/16) to represent messages
  > from a number of different current syntaxes,

  Apple's Xcode supports localization of plural messages via `.stringsdict` XML files,
  which encode the plural variable's name as a `NSStringLocalizedFormatKey` value,
  where it appears as e.g. `%#@countOfFoo@` or similar.
  To display only the relevant "countOfFoo" name of this variable to localizers as context,
  it's best to use a `@source=...` attribute on the selector.

### General Use Cases
At least the following expression attributes should be considered:

- Attributes with a formatting runtime impact:

  - `id` — An identifier for the expression or markup.
    This is included in the formatted part,
    and allows each part of a message to be explicitly addressed.

    > Example identifying two literal numbers:
    >
    > ```
    > The first number was {1234 :number u:id=first} and the second {56789 :number u:id=second}.
    > ```

  - `locale` — An override for the locale used to format the expression.

    > Example embedding a French date in an English message:
    >
    > ```
    > In French, this date would be displayed as {|2024-05-06| :date u:locale=fr}
    > ```

  - `dir` — An override for the LTR/RTL/auto directionality of the expression.

    > Example explicitly isolating the directionality of a placeholder
    > for a custom user-defined function:
    >
    > ```
    > Welcome, {$user :x:username u:dir=auto}
    > ```

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

Common options or attributes should work the same way in different functions.

Special options or attributes should not conflict with other option names.

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

Solve the two disparate use cases separately,
so that their namespaces are not comingled.

### Contextual options

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

### Attributes

Add support for standalone `@key` as well as
option-like `@key=value` attribute pairs with a literal value
at the end of any expression or markup.

To distinguish attributes from options,
require `@` as a prefix for each attribute asignment.
Examples: `@translate=yes` and `@xliff:canCopy`.

Do not allow expression or markup attributes to influence the formatting context,
or pass them to function handlers.

Drop variable values from the `attribute` rule:

```diff
-attribute = "@" identifier [[s] "=" [s] (literal / variable)]
+attribute = "@" identifier [[s] "=" [s] literal]
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

Do not define a common way to communicate information
about an expression or markup to translators or tools.

This would mean not defining anything for default registry functions either,
effectively requiring implementation-specific options like `icu:locale`.

Other functions could use their own definitions and handling for similar options,
such as `locale` or `x:lang`.

Formatted parts for markup would not be able to directly include an identifier.

If not explicitly defined, less information will be provided to translators.

Function options may be used as a workaround,
but each implementation and user will end up with different practices.

### Define options for default registry only

Define at least `locale` and `dir` as options for default registry functions,
with handling internal to each function implementation.

Other functions could use their own definitions and handling for similar options,
such as `locale` or `x:lang`.

Formatted parts for markup would not be able to directly include an identifier.

Do not define a common way to communicate information
about an expression or markup to translators or tools.

### Use attributes also for contextual options

Add support for standalone `@key` as well as
option-like `@key=value` attribute pairs with a literal or variable values
at the end of any expression or markup.

To distinguish attributes from options,
require `@` as a prefix for each attribute asignment.
Examples: `@translate=yes` and `@locale=$exprLocale`.

Define the meaning and supported values of some attributes in the specification,
including at least `@dir` and `@locale`.

To support later extension of the specified set of attributes while allowing user extensibility,
require custom attribute names to be namespaced.
Examples: `@xliff:can-copy=no`, `@note:link=|https://...|`.

Allow expression attributes to influence the formatting context,
but do not directly pass them to user-defined functions.

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
