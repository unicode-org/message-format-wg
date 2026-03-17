## Message Attributes

> [!IMPORTANT]
> This part of the specification is under incubation by the MessageFormat WG,
> and may end up being finalized elsewhere.
> It is non-normative.

This specification does not define a means of attaching an _attribute_
to the _message_ as a whole.
In general, resource formats and containers of
Unicode MessageFormat _messages_ provide their own such mechanisms.

At least for now, the syntax of message attributes is
outside the scope of this specification.

### @allow-empty

_Value:_ `yes` or `no`.

Explicitly mark a message with an empty _pattern_ as valid.

Most empty messages are mistakes,
so being able to mark ones that can be empty is useful.

Empty _messages_ SHOULD be accompanied by an explanatory `@comment`.

### @obsolete

_Value:_ `yes` or `no`.

Explicitly mark a _message_ as obsolete.

This might be used in workflows where messages are not immediately removed
when they are no longer referenced by code,
but kept in to support patch releases for previous versions.
During translation, this can be used to de-prioritize such messages.

> [!NOTE]
> The value could include a way to note some version or timestamp when the removal happened,
> or be paired with a second `@removed-in` or similar tag.

### @param

_Value_: **TBD**

Documents a _variable_.

> [!NOTE]
> Having a well-defined structure for this attribute is pretty important,
> at least to identify the variable its description is pertaining to.
> In addition to describing the variable in words, it could include:
> - The variable's type -- is it a string, a number, something else?
> - A default example value to use for the variable.

### @schema

_Value:_ A valid URI.

Identify the _functions_ and _markup_ supported by the _message_ formatter.

### @translate

_Value:_ `yes` or `no`

Indicates whether the _message_ is translatable or not.

Some _messages_ may be required to have the same value in all locales.
