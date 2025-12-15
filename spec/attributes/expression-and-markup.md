## Expression and Markup Attributes

> [!IMPORTANT]
> This part of the specification is under incubation by the MessageFormat WG,
> and may end up being finalized elsewhere.
> It is non-normative.

The Unicode MessageFormat syntax and data model allow for _attributes_
to be defined on _expressions_ and _markup_.
These MUST NOT have any impact on the _formatting_ of a message,
and are intended to inform users, such as translators, and tools
about the specific _expressions_ or _markup_ to which they are attached.
_Attributes_ MAY be stripped from _expressions_ and _markup_
with no effect on the message's _formatting_.

As all _attributes_ with _reserved identifiers_ are reserved,
definitions are provided here for common _attribute_ use cases.
Use a _custom identifier_ for other (custom) _attributes_,
preferably one with an appropriate _namespace_.

### @can-copy

_Value:_ `yes` or `no`.

Indicates whether or not the _expression_ or the _markup_ and its contents can be copied.

> For example:
>
> ```
> Have a {#span @can-copy}great and wonderful{/span @can-copy} birthday!
> ```

### @can-delete

_Value:_ `yes` or `no`.

Indicates whether or not the _expression_ or the _markup_ and its contents can be deleted.

### @can-overlap (Markup only)

_Value:_ `yes` or `no`.

Indicates whether or not the _markup_ and its contents where this _attribute_ is used
can enclose partial _markup_
(i.e. a _markup-open_ without its corresponding _markup-end_,
or a _markup-end_ without its corresponding _markup-start_).

### @can-reorder (Markup only)

_Value:_ `yes` or `no`.

Indicates whether or not the _markup_ and its contents can be re-ordered.

### @comment

_Value_: A non-empty string.

Associates a freeform comment with an _expression_ or _markup_.

> For example:
>
> ```
> The {$device @comment=|Possible values: Printer or Stacker|} has been enabled.
> ```
>
> ```
> Click {#link @comment=|Rendered as a button|}here{/link} to continue.
> ```

### @example (Expression only)

_Value_: A non-empty string.

An example of the value the _expression_ might take.

> For example:
>
> ```
> Error: {$details @example=|Failed to fetch RSS feed.|}
> ```

### @term

_Value_: A non-empty string, or a URI.

Identifies a well-defined term.
The value may be a short definition of the term,
or a URI pointing to such a definition.

> For example:
>
> ```
> He saw his {|doppelgänger| @term=|https://en.wikipedia.org/wiki/Doppelg%C3%A4nger|}.
> ```
>
> ```
> He saw his {#span @term=|https://en.wikipedia.org/wiki/Doppelg%C3%A4nger|}doppelgänger{/span}.
> ```

### @translate

_Value:_ `yes` or `no`.

Indicates whether the _expression_ or the _markup_ and its contents are translatable or not.

> For example:
>
> ```
> He saw his {|doppelgänger| @translate=no}.
> ```
>
> ```
> He saw his {#span @translate=no}doppelgänger{/span}.
> ```
