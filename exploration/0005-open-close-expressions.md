# Open/Close Expressions

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@eemeli</dd>
		<dd>@aphillips</dd>
		<dt>First proposed</dt>
		<dd>2023-09-05</dd>
		<dt>Pull Request</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/470">#470</a></dd>
	</dl>
</details>

## Objective

_What is this proposal trying to achieve?_

Describe the use cases and requirements for _expressions_
that enclose parts of a pattern
and develop a design that satisfies these needs.

## Background

_What context is helpful to understand this proposal?_

## Use-Cases

- Representing markup, such as HTML, as expressions in a pattern
  rather than as plain character sequences embedded in the _text_
  of a pattern. This also allows parts of a markup sequence to be
  programmable.

- As an app author, I want to be able to use minimal markup for formatting.
  On runtime, I expect these markup elements to produce live UI elements.

  > ```
  > {Click {+link}here{-link}.}
  > ```

- As an app author, I want to be able to interpolate standalone markup elements into the translation: `img`, `hr`, `input`.
  On runtime, I expect these markup elements to produce live UI elements.

  > ```
  > {This is a giraffe: {:img src=giraffe.gif}.}
  > ```

- I want to be able to use minimal markup to inform XLIFF interchange.

  > ```
  > {Click {+ph}<a href="">here</a>{-ph}.}
  > ```

- As an app author, I want to be able to pass certain attributes to markup elements, including dynamic values, such as coming from varriables.

  > ```
  > {Click {+link href=$url}here{-link}.}
  > ```

- As a translator, I want to be able to translate content around and between markup elements.

  > ```
  > {Kliknij {+link}tutaj{-link}.}
  > ```

- As a translator, I want to be able to translate certain markup attributes.

  > ```
  > {Click {+link title=|Hey you!|}here{-link}}
  > ```

- As developers and translators, I want to protect placeholders from modification and deletion.

- Paired markup elements should be protected from reordering, i.e. an open element must always come before the close element (if they are both present in the message).

- Use TTS annotations.

- Attributed strings (overlapping, enclosing).

- TTY formatting escapes (?!)

- Segmented markup.

- Leveraging.

- CAT tools support the concepts of open, close, and standalone, to provide certain functionalities above.

- As a developer, I want to connect message markup with existing element instances in the UI.

- As a developer, I want to sanitize translations without removing the markup important to the message.

  > Source HTML:
  >
  > ```
  > <popup-info img="img/alt.png" data-text="Your card validation code (CVC) is an extra security feature — it is the last 3 or 4 numbers on the back of your card."></popup-info>
  > ```
  >
  > Message:
  >
  > ```
  > {+popup-info img=|img/alt.png| data-text=|Your card validation code (CVC) is an extra security feature — it is the last 3 or 4 numbers on the back of your card.|}{-popup-info}
  > ```

**_Non-markup use cases to consider (which may or may not be addressed by the design)_**

- Represent templating language constructs so that they can pass through
  the translation process and are not exposed to translation. For example,
  Mustache templates.

- Represent translation metadata, such as XLIFF placeholders, so that
  portions of a message are "protected" or otherwise hinted in the
  translation process.

## Requirements

Be able to indicate that some identified markup applies to
a non-empty sequence of pattern parts (text, expressions).

Markup spans may be nested,
as in `<b>Bold and <i>also italic</i></b>`.

Markup spans may be improperly nested,
as in `<b>Bold <i>and</b> italic</i>`.

Markup may have localisable options,
such as `Click <a title="Link tooltip">here</a> to continue`.

As with function options,
markup options should be defined in a registry so that they can be validated.

## Constraints

Due to segmentation,
markup may be split across messages so that it opens in one and closes in another.

Following previously established consensus,
the resolution of the value of an _expression_ may only depend on its own contents,
without access to the other parts of the selected pattern.

## Proposed Design

This design relies on the recognition that the formatted output of MF2
may be further processed by other tools before presentation to a user.

Let us add _markup_ as a new type of _placeholder_,
in parallel with _expression_:

```abnf
pattern = "{" *(text / placeholder) "}"
placeholder = expression / markup

markup       = "{" [s] markup-body [s] "}"
markup-body  = (markup-start *(s option))
             / markup-end
markup-start = "+" name
markup-end   = "-" name
```

This allows for placeholders like `{+b}`, `{-i}`, and `{+a title=|Link tooltip|}`.
Unlike annotations, markup expressions may not have operands.

Markup is not valid in _declarations_ or _selectors_.

When formatting to a string,
markup placholders format to an empty string by default.
An implementation may customize this behaviour,
e.g. emitting XML-ish tags for each start/end placeholder.

When formatting to parts (as proposed in <a href="https://github.com/unicode-org/message-format-wg/pull/463">#463</a>),
markup placeholders format to an object including the following properties:

- The `type` of the markup: `"start" | "end"`
- The `name` of the markup, e.g. `"b"` for `{+b}`
- For _markup-start_, the `options` with the resolved key-value pairs of the expression options

To make use of _markup_,
the message should be formatted to parts or to some other target supported by the implementation,
and the desired shape constructed from the parts.
For example, the message

```
{Click {+a title=|Link tooltip|}here{-a} to continue}
```

would format to parts as

```coffee
[
  { type: "text", value: "Click " },
  { type: "start", name: "a", options: { title: "Link tooltip" } },
  { type: "text", value: "here" },
  { type: "end", name: "a" },
  { type: "text", value: " to continue" }
]
```

and a post-MessageFormat step could then reconstruct this into an appropriate shape,
potentially merging in non-localizable attributes such as a link URL.
Rendered as React this could become:

```coffee
[
  "Click ",
  createElement("a", { href: "/next", title: "Link tooltip" }, "here"),
  " to continue"
]
```

## Alternatives Considered

_What other solutions are available?_
_How do they compare against the requirements?_
_What other properties they have?_
