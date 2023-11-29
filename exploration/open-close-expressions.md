# Open/Close Expressions

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@eemeli</dd>
		<dd>@aphillips</dd>
		<dd>@stasm</dd>
		<dt>First proposed</dt>
		<dd>2023-09-05</dd>
		<dt>Pull Requests</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/470">#470</a></dd>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/516">#516</a></dd>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/517">#517</a></dd>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/535">#535</a></dd>
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
  > Click {#link}here{/link}.
  > ```

- As an app author, I want to be able to interpolate standalone markup elements into the translation: `img`, `hr`, `input`.
  On runtime, I expect these markup elements to produce live UI elements.

  > ```
  > This is a giraffe: {#img src=giraffe.gif/}.
  > ```

- I want to be able to use minimal markup to inform XLIFF interchange.

  > ```
  > Click {#ph}<a href="">{/ph}here{#ph}</a>{/ph}.
  > ```

- As an app author, I want to be able to pass certain attributes to markup elements, including dynamic values, such as coming from variables.

  > ```
  > Click {#link href=$url}here{/link}.
  > ```

- As a translator, I want to be able to translate content around and between markup elements.

  > ```
  > Kliknij {#link}tutaj{/link}.
  > ```

- As a translator, I want to be able to translate certain markup attributes.

  > ```
  > Click {#link title=|Hey you!|}here{/link}
  > ```

- As a developer or as a translator, I want to protect placeholders from modification and deletion.

- Paired markup elements should be protected from reordering, i.e. an open element must always come before the close element (if they are both present in the message).

- As a developer working in certain domains, I want to be able to use markup such as TTML or SSML.

- As a developer, I want to be able to produce "attributed strings" appropriate for my environment, which may include features such as overlapping or enclosing properties.

- As a developer in certain environments, I want to be able to include TTY formatting escapes (?!) in my strings.

- As a developer, I want to be able to split up text between strings, such as open or close elements are in separate strings.
- As a translator or tool, I want to be able to segment larger messages or process messages "segmented" from larger blocs of text, such that markup is split between messages or segments.

- As a translator, I want my tools to be able to leverage translations where the text differs only in markup, e.g.:

  > ```
  > This is {#b}sure{/b} good.
  >
  > This is {#i}sure{/i}good.
  > ```

- As a CAT tool, I want to use the concepts of open, close, and standalone that I am already familiar with, to provide certain functionalities above.

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
  > {#popup-info img=|img/alt.png| data-text=|Your card validation code (CVC) is an extra security feature — it is the last 3 or 4 numbers on the back of your card.|}{/popup-info}
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

Markup may have localisable options,
such as `Click <a title="Link tooltip">here</a> to continue`.

As with function options,
markup options should be defined in a registry so that they can be validated.

Provide a way to tell open and standalone elements apart.

## Constraints

Due to segmentation,
markup may be split across messages so that it opens in one and closes in another.

Following previously established consensus,
the resolution of the value of an _expression_ may only depend on its own contents,
without access to the other parts of the selected pattern.

Any information stored in the registry is not available on runtime,
and may be unavailable in tooling.

## Proposed Design

This design relies on the recognition that the formatted output of MF2
may be further processed by other tools before presentation to a user.

### Syntax

Let us add _markup_ as a new type of _placeholder_,
in parallel with _expression_:

```abnf
pattern = "{" *(text / placeholder) "}"
placeholder = expression / markup

markup       = "{" [s] markup-body [s] "}"
markup-body  = (markup-open *(s option))
             / markup-close
markup-open  = "#" name
markup-close = "/" name
```

This is similar to [Mustache](http://mustache.github.io/mustache.5.html)'s control flow syntax.

```
This is {#strong}bold{/strong} and this is {#img alt=|an image|}.
```

Markup names are _namespaced_ by their use of the pound sign `#` and the forward slash `/` sigils.
They are distinct from `$variables`, `:functions`, and `|literals|`.

This allows for placeholders like `{#b}`, and `{#a title=|Link tooltip|}`.
Unlike annotations, markup expressions may not have operands.

Markup is not valid in _declarations_ or _selectors_.

#### Pros

* Leverages the familiarity of the forward slash `/` used for closing spans.

* Doesn't conflict with any other placeholder expressions.

* Prior art exists: Mustache.

#### Cons

* Introduces two new sigils, the pound sign `#` and the forward slash `/`.

* In Mustache, the `{{#foo}}`...`{{/foo}}` syntax is used for *control flow* statements rather than printable data.

### Standalone Markup

_Standalone_ markup remains an open question.
Three alternatives have been suggested:

* Introduce additional syntax inspired by XML: `{#foo/}`.

  This approach encodes the _standalone_ aspect in the data model, and doesn't rely on external sources of truth,
  at the expense of introducing new syntax, which is admittedly a bit clunky.

  It also creates a dichotomy between standalone _markup_ and regular _placeholders_, which can be argued to be _standalone_ as well.

* Differentiate _open_ and _standalone_ elements based on the information stored in the registry,
  or based on some other external source of truth
  (e.g. the structure of the source to which the message is applied).

  This approach offers a cleaner syntax at the expense of relying on external sources of truth for telling open and standalone elements apart.
  Without the access to these sources of truth (e.g. a custom registry), standalone markup will be interpreted as open elements.

* Re-use regular placeholders with regular function calls: `{:img src=logo.png}`.

  This approach leverages the fact that regular placeholders can also be thought of as being _standalone_.
  It also doesn't introduce any new syntax, instead relying on the function call syntax: `:img`.

  Namespacing is a concern: to ensure forward compatibility, implementations and users should avoid introducing new symbols to the default, anonymous namespace.
  Thus, a custom function representing a standalone element should be namespaced: `:html:img` or `:moz:img`.
  While a good practice in general, it results in more verbose syntax,
  possibly also for the _open_ and _close_ markup, which would be namespaced for consistency: `{#html:link}...{/html:link}`.

  In this approach there's also no way to enforce the lack of operands to standalone markup at the syntax level.
  Instead, access to a custom registry is required to know that `:img` does not accept any operands.

### Runtime Behavior

#### Formatting to a String

When formatting to a string,
markup placholders format to an empty string by default.
An implementation may customize this behaviour,
e.g. emitting XML-ish tags for each open/close placeholder.

#### Formatting to Parts

When formatting to parts (as proposed in <a href="https://github.com/unicode-org/message-format-wg/pull/463">#463</a>),
markup placeholders format to an object including the following properties:

- The `type` of the markup: `"markup" | "markup-close"`
- The `name` of the markup, e.g. `"b"` for `{#b}`
- For _markup_,
  the `options` with the resolved key-value pairs of the expression options

To make use of _markup_,
the message should be formatted to parts or to some other target supported by the implementation,
and the desired shape constructed from the parts.
For example, the message

```
Click {+a title=|Link tooltip|}here{-a} to continue
```

would format to parts as

```coffee
[
  { type: "text", value: "Click " },
  { type: "markup", name: "a", options: { title: "Link tooltip" } },
  { type: "text", value: "here" },
  { type: "markup-close", name: "a" },
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

### A1. Do Nothing

We could choose to not provide any special support for spannables or markup.
This would delegate the problem to tools and downstream processing layers.

```
This is <strong>bold</strong> and this is <img alt="an image" src="{$imgsrc}">.
```

#### Pros:

* No work required from us right now. We can always add support later, provided we reserve adequate placeholder syntax.
* We already allow (and are required to allow) in-line literal markup and other templating syntax in messages, since they are just character sequences.
* Unlike other solutions, does not require MessageFormat to reinterpret or process markup to create the desired output.
* It's HTML.
* The least surprising syntax for developers and translators.
* Some CAT tools already support HTML and other markup in translations.

#### Cons:

* Requires quoting in XML-based containers.
* Relies on a best-effort convention; is not a standard.
* Markup becomes a completely alien concept in MessageFormat:
  * It cannot be validated via the AST nor the reigstry.
  * It cannot be protected, unless put inside literal expressions.
  * It is not supported by `formatToParts`, which in turn makes double-parsing difficult.
* It requires special handling when inserting messages into the DOM.
* It requires "sniffing" the message to detect embedded markup. XSS prevention becomes much more complicated.

### A2. XML Syntax

> `<foo>`, `</foo>`, or `<foo/>`

We could parse the HTML syntax as part of MessageFormat parsing,
and represent markup as first-class data-model concepts of MessageFormat.

```
This is <strong>bold</strong> and this is <img alt="an image">.
```

To represent HTML's auto-closing tags, like `<img>`,
we could follow HTML's syntax to the letter, similer to the snippet above,
and use the *span-open* syntax for them.
This would be consistent with HTML, but would require:

* Either the parser to hardcode which elements are standalone;
  this approach wouldn't scale well beyond the current set of HTML elements.

* Or, the validation and processing which leverages the open/close and standalone concepts
  to be possible only when the registry is available.

Alternatively, we could diverge from proper HTML,
and use the stricter XML syntax: `<img/>`.

```
This is <html:strong>bold</html:strong> and this is <html:img alt="an image" />.
```

The same approach would be used for self-closing elements defined by other dialects of XML.

#### Pros:

* Looks like HTML.
* The least surprising syntax for developers and translators.

#### Cons:

* Looks like HTML, but isn't *exactly* HTML, unless we go to great lengths to make it so.
  See the differences between HTML and React's JSX as a case-study of consequences.
* Requires quoting in XML-based containers.
* It only supports HTML.

### A3. XML-like syntax

> `{foo}`, `{/foo}`, `{foo/}`

The goal of this solution is to avoid adding new sigils to the syntax.
Instead, it leverages the familiarity of the `foo`...`/foo` idiom,
inspired by HTML and BBCode.

This solution consists of adding new placeholder syntax:
`{foo}`, `{/foo}`, and `{foo/}`.
The data model and the runtime considerations are the same as in the proposed solution.

```
This is {html:strong}bold{/html:strong} and this is {html:img alt=|an image|/}.
```

Markup names are *effectively namespaced* due to their not using any sigils;
they are distinct from `$variables`, `:functions`, and `|literals|`.

> [!NOTE]
> This requires dropping unquoted non-numeric literals as operands,
> so that `{foo}` is not parsed as `{|foo|}`.
> See [#518](https://github.com/unicode-org/message-format-wg/issues/518).

The exact meaning of the new placeholer types is as follows:

* `{foo}` is a span-open.
* `{/foo}` is a span-close.
* `{foo/}` is a standalone element.

#### Pros

* Only adds `/` as a new sigil,
  which is universally known thanks to the wide-spread use of HTML.

* Using syntax inspired by HTML makes it familiar to most translators.
  Prior art for a similar inspiration can be found in the [BBCode](https://en.wikipedia.org/wiki/BBCode) syntax,
  which uses `[foo]` and `[/foo]` as tags.
  Despite being a niche language, BBCode can be argued to be many people's first introduction to markup-like syntax.

* Avoids the issues of using JSX-style syntax, `<foo>`...`</foo>`,
  which looks *exactly* like HTML, but has different semantics and behavior.

#### Cons

* May still be confusing because it looks almost like HTML, but doesn't use the familiar angle brackets.

* Requires changes to the existing MF2 syntax: dropping unquoted literals as expression operands.

* Regular placeholders, e.g. `{$var}`, use the same `{...}` syntax, and may be confused for *open* elements.

### A4. Plus & Minus

> `{+foo}`, `{-foo}`, `{#foo}`

Use `+` for opening an element, `-` for closing, and `#` for standalone.

The data model and the runtime considerations are the same as in the proposed solution.

```
This is {+strong}bold{-strong} and this is {#img alt=|an image|/}.
```

#### Pros

* Doesn't conflict with any other placeholder expressions.

* Agnostic syntax, different from HTML or other markup and templating systems.

#### Cons

* Adds two new sigils to the expression syntax (three with `#standalone`).

* Because they're agnostic, the meaning of the sigils must be learned or deduced.

* Requires the special-casing of negative numeral literals,
  to distinguish `{-foo}` and `{-42}`.

### A5. Square Brackets

> `[foo]`, `[/foo]`, `[foo/]`

```
This is [html:strong]bold[/html:strong] and this is [html:img alt=|an image|/].
```

#### Pros

* Concise and less noisy than the alternatives.

* Doesn't add new sigils except for the forward slash `/`,
  which is universally known thanks to the wide-spread use of HTML.

* Leverages the familiarity of the forward slash `/` used for closing spans.

* Makes it clear that `{42}` and `[foo]` are different concepts:
  one is a standalone placeholder and the other is an open-span element.

* Makes it clear that markup and spans are not expressions,
  and thus cannot be used in declarations nor selectors.

* Established prior art: the [BBCode](https://en.wikipedia.org/wiki/BBCode) syntax.
  Despite being a niche language, BBCode can be argued to be many people's first introduction to markup-like syntax.

#### Cons

* Requires making `[` (and possibly `]`) special in text.
  Arguably however, markup is more common in translations than the literal `[ ... ]`.
