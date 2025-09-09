## Expression, Markup, and Message Attributes

> [!IMPORTANT]
> This part of the specification is under active development,
> and is non-normative.

The Unicode MessageFormat syntax and data model allow for _attributes_
to be defined on _expressions_ and _markup_.
These MUST NOT have any impact on the formatting of a message,
and are intended to inform users, such as translators, and tools
about the specific _expressions_ or _markup_ to which they are attached.
_Attributes_ MAY be stripped from _expressions_ and _markup_
with no effect on the message's formatting.

While the specification does not define how an _attribute_ could be attached
to the _message_ as a whole,
this SHOULD be provided for by a resource container for Unicode MessageFormat messages.

As all _attributes_ with _reserved identifiers_ are reserved,
definitions are provided here for common _attribute_ use cases.
Custom _attributes_ SHOULD use a _custom identifier_,
preferably one with an appropriate _namespace_.

### Attribute Values

_Attributes_ are not required to have a value.
For _attributes_ defined here that explicitly support `yes` as a value,
an _attribute_ with no value is considered synonymous
with the same _attribute_ with the value `yes`.

### Expression Attributes

#### @comment

_Value_: A non-empty string.

Associates a freeform comment with the _expression_.

> For example:
>
> ```
> The {$device @comment=|Possible values: Printer or Stacker|} has been enabled.
> ```

#### @example

_Value_: A non-empty string.

An example of the value the _expression_ might take.

> For example:
>
> ```
> Error: {$details @example=|Failed to fetch RSS feed.|}
> ```

#### @term

_Value_: A non-empty string, or a URI.

Identifies a well-defined term.
The value may be a short definition of the term,
or a URI pointing to such a definition.

> For example:
>
> ```
> He saw his {|doppelgänger| @term=|https://en.wikipedia.org/wiki/Doppelg%C3%A4nger|}.
> ```

#### @translate

_Value:_ `yes` or `no`.

Indicates whether the _expression_ is translatable or not.

> For example:
>
> ```
> He saw his {|doppelgänger| @translate=no}.
> ```

### Markup Attributes

#### @can-copy

_Value:_ `yes` or `no`.

Indicates whether or not the _markup_ and its contents can be copied.

> For example:
>
> ```
> Have a {#span @can-copy}great and wonderful{/span @can-copy} birthday!
> ```

#### @can-delete

_Value:_ `yes` or `no`.

Indicates whether or not the _markup_ and its contents can be deleted.

#### @can-overlap

_Value:_ `yes` or `no`.

Indicates whether or not the _markup_ and its contents where this _attribute_ is used
can enclose partial _markup_
(i.e. a _markup-open_ without its corresponding _markup-end_,
or a _markup-end_ without its corresponding _markup-start_).

#### #can-reorder

_Value:_ `yes` or `no`.

Indicates whether or not the _markup_ and its contents can be re-ordered.

#### @comment

_Value_: A non-empty string.

Associates a freeform comment with the _markup_.

> For example:
>
> ```
> Click {#link @comment=|Rendered as a button|}here{/link} to continue.
> ```

#### @term

_Value_: A non-empty string, or a URI.

Identifies a well-defined term.
The value may be a short definition of the term,
or a URI pointing to such a definition.

> For example:
>
> ```
> He saw his {#span @term=|https://en.wikipedia.org/wiki/Doppelg%C3%A4nger|}doppelgänger{/span}.
> ```

#### @translate

_Value:_ `yes` or `no`.

Indicates whether the _markup_ and its contents are translatable or not.

> For example:
>
> ```
> He saw his {#span @translate=no}doppelgänger{/span}.
> ```

### Message Attributes

#### @allow-empty

_Value:_ `yes` or `no`.

Explicitly mark a message with an empty _pattern_ as valid.

Most empty messages are mistakes,
so being able to mark ones that can be empty is useful.

Should be accompanied by an explanatory `@comment`.

#### @max-length

_Value:_ A strictly positive integer, followed by a space, followed by one of the following:
- `chars`
- `lines`

Limits the length of a _message_.

#### @obsolete

_Value:_ `yes` or `no`.

Explicitly mark a _message_ as obsolete.

This might be used in workflows where messages are not immediately removed
when they are no longer referenced by code,
but kept in to support patch releases for previous versions.
During translation, this can be used to de-prioritize such messages.

> [!NOTE]
> The value could include a way to note some version or timestamp when the removal happened,
> or be paired with a second `@removed-in` or similar tag.

#### @param

_Value_: **TBD**

Documents a _variable_.

> [!NOTE]
> Having a well-defined structure for this attribute is pretty important,
> at least to identify the variable its description is pertaining to.
> In addition to describing the variable in words, it could include:
> - The variable's type -- is it a string, a number, something else?
> - A default example value to use for the variable.

#### @schema

_Value:_ A valid URI.

Identify the _functions_ and _markup_ supported by the _message_ formatter.

#### @source

_Value_: A string.

Provides the _message_ in its source locale.

#### @translate

_Value:_ `yes` or `no`

Indicates whether the _message_ is translatable or not.

Some _messages_ may be required to have the same value in all locales.

#### @version

_Value_: A string.

Explicitly versions a source string.

This allows for differentiating typo fixes from actual changes in message contents.
The (message id, version) tuple can be used by tooling instead of just the message id
to uniquely identify a message and its translations.
