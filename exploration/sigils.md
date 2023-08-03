# A comprehensive and deliberate sigil design

Today, we understand MF2's goals, requirements, design constraints, and the feature set sufficiently well to attempt to holistically design an important aspect of MF2's syntax: the special characters (sigils) identifying different "parts of speech", i.e. different grammar productions.

So far, we designed iteratively, and each decision limited the possibility space of other decisions.
Let's zoom out and be deliberate in the design.
This document is an attempt to describe the requirements and available alternatives, so that we can pick the best sigil for each use-case.

## Summary

The current design of open and close function annotations should be revisited, taking into account the intended use-cases and requirements.
In particular, while the current syntax strongly suggests that open, close, and standalone are properties of *functions*, there are good reasons to consider them as properties of *expressions* or even *placeholders*.
Once we agree on what requirements open and close properties should meet, we can design the syntax for them.
I've attempted to present some possible approaches in the final part of the document.

## Agreed Constraints

Already established decisions which impose limitations on the design, sometimes in a good way.

### C01: `|` is the delimiter for quoted literals.

### C02: Unquoted literals are `nmtokens`, but they cannot start with `:` and `-`.

### C03: `*` is the catch-all variant key.

### C04: `$` is the sigil for variables.

In contrast to ICU MessageFormat (1.0), we want ot decorate variables with a sigil to make them stand out visually, and to make it clearer that their names are "code" and should not be translated.

### C05: The operand in annotated expressions comes before the annotation.

However, due to R06, we can't assume all expressions start with the operand.

### C06: Expressions are not allowed to nest.

It's safe to assume that expression operands, option values, and variant keys are scalar values, and that they are not nested expressions.

### C07: Functions cannot be passed by name to other functions as operands or option values.

For example, we don't support something like `{$amounts :map fn=:number}`.

### C08: We recognize the cost of adding new sigils to the syntax.

We should attempt to have as few sigils as possible, due to the high cognitive cost and the visual burden of each new sigil.
Sigils are inherently not intuitive and require external documentation to imbue meaning into them.
They are not discoverable and difficult to search for.
Some of them also have cryptic names.

## Proposed Constraints

These are hopefully reasonable decisions which impose limitations to anchor other decision making.
They have benefits but they don't address any particular requirements.

### A01: Use XML's Name and Nmtoken.

XML is a well-established standard and already defines convenient and flexible productions for names and nmtokens.
There's already guidance about using the colon for namespaces.

Technically, the current syntax is compatible with XML to the extent that it's possible to encode all valid MessageFormat 2.0 names and nmtokens inside a registry defined in XML.
That's because our definitions are strictly *narrower* than XML's.

> [!IMPORTANT]
> Implication: no sigils can be valid first characters of `nmtoken`, including `:` and `-`.

> [!WARNING]
> This contradicts the current design of the function sigils: `:` for standalone and `-` for closing.

## Agreed Requirements

The following requirements are the result of the previous consensus.
Some of them may seem obvious, but I'm listing them regardless so that we're able to lean on them if we need to step back.

### R01: Sigils must uniquely identify the parts of the syntax they correspond to, regardless of where they are used, even if such use was unambiguous grammatically.

Since our syntax is small, we can take advantage of the many special characters available on most keyboards.
If we pick a particular sigil to denote a specific production in the syntax, the same sigil should not be allowed to mean something else in other parts of the syntax — outside literal text, of course.
For example, when we choose `$` as the variable sigil, it should consistently be used to introduce variables, and variables only, everywhere in the message body.
It should not be used to introduce, let's say, annotations, even if doing so would not cause parsing ambiguities.
	
> [!IMPORTANT]
> * We must not reuse sigils.

### R02: Both quoted and unquoted literals must be allowed as expression operands, option values, and variant keys. There must be no difference between them with regards to where they can be used.

We expect literals to be the most common values of function options and variant keys.
Less so for expression operands.
In all use-cases,
we want unquoted literals for convenience -- because option values and variant keys are likely to come from a closed set,
and we want quoted literals for completeness -- to allow any text input if needed.

> [!IMPORTANT]
> * `|` must uniquely identify the start of a quoted literal.
> * Variable and function sigils must come from outside the set of allowed start characters for unquoted literals.

### R03: Variables must be allowed as expression operands.

Both input and local variables must be allowed as operands inside placeholders for the purpose of formatting them and interpolating into the message.
They must also be allowed as operands inside selectors for the purpose of selecting a variant based on the value of the variable.

> [!IMPORTANT]
> * Variable names must not collide with quoted nor unquoted literals.

### R04: Variables must be allowed as option values.

Both input and local variables must be allowed as option values in order to allow passing complex dynamic data into annotations.
Examples: `{$color :adjective accord=$item}`, `{:range begin=$a end=$b}`.

> [!IMPORTANT]
> * Variable names must not collide with quoted nor unquoted literals.

### R05: The syntax must reserve a number of _private use_ annotation sigils without attributing any meaning to them.

Private-use annotations can be used by a specific implementation or by private agreement between multiple implementations to define their own meaning.
Messages with private-use syntax must be considered well-formed and valid.

> [!IMPORTANT]
> * Private-use sigils must not conflict with other function sigils.
> * Private-use sigils must not conflict with variable sigils.
> * Private-use sigils must not conflict with quoted and unquoted literals.

### R06: Functions must be allowed to accept zero arguments.

We want to be able to use nullary functions for procedures, i.e. functions which do something else than strictly format an operand:

	{:embed msgid=brand-name}

Or to select variants based on the environment:

	match {:platform} ...

Or for functions which require more than one argument:

	{:range begin=$x end=$y}

> [!IMPORTANT]
> * Function names must not collide with quoted nor unquoted literals.

> [!NOTE]
> The procedure use-case can also be satisfied by making one of the options an operand, e.g. `{brand-name :embed}`.

> [!NOTE]
> The environment use-case can also be satisfied by always-available variables, e.g. `match {$_PLATFORM :equals} ...`.

> [!NOTE]
> The more-than-one-argument can also be satisfied by using container objects as operands, e.g. `{$xy :range}`.

### R07: The syntax must be able to represent spans in the translated content.

This requirement is intentionally phrased in a more general manner; I'll attempt to be more specific below.
We have previously established that we want to be able to express the *open* and *close* concepts in the syntax.

* Spans don't need to be well-formed in the XML sense (i.e. properly nested and always closed).
* Spans can overlap and may be left unpaired.
* Spans are meant to aid formatting; using them in selectors is invalid.

> [!IMPORTANT]
> * We need a way to represent the open and close properties in syntax. In today's syntax this is done through the `+` and `-` function introducers.
> More generally, we can consider open and close as a property of functions, annotations, expressions, or placeholders. See below.
> * Standalone can probably be the default, i.e. the "regular" syntax represents standalone.

### R08: It should be possible to reject during parsing a message with a span used as selector as invalid, rather than produce a runtime error only when it's formatted.

In today's design, this can be achieved by tracing annotations of selectors and verifying that none of them is an open or close annotation.
However, such approach would increase the complexity of the spec (e.g. what about option values which reference local variables with open/close annotations?), as well as the complexity of implementations.

This would also be satisifed if we made open/close a property of placeholders rather than expressions.

> [!IMPORTANT]
> * Standalone, open, and close must be encoded in the syntax, rather than in names or in registry.

### R09: Tooling should be able to recognize standalone, open, and close properties to offer visual and authoring support.

### R10: Parts formatted at runtime must carry the information about whether they were produced by a standalone, open, or close placeholder.

### R11: It should be possible to define a single function in the registry and then specify its various possible signatures for formatting or matching.

### R12: Open and close functions must be able to specify different option baskets.

Even if open and close functions share the name, we want to be able to require different options for open signatures and close signatures.
In particular, close signatures may want to define no options at all, under the assumption that they merely close a span opened and configured by the corresponding open signature.
However, it may also be useful to allow options on close signatures, e.g. `id` to help match the close placeholder with an open one with the same identifier.

> [!IMPORTANT]
> This requirement has consequences for the identity of what we call "a function". Are open and close *different* functions, or are they different *signatures* of the same function, i.e. when invoked as "open", accept the following options?

## Proposed Requirements

### P01: The formatting signatures should define whether they're for standalone, open, or close uses.

They already do in the current design of the registry.
I'm listing this as an open question because I'm not sure if the current design was deliberate or accidental.

> [!IMPORTANT]
> Open/close is not a property of the function. It is at most the property of the annotation, i.e. the function's invocation, i.e. its signature.
> Alternative framing: it's a property of an expression in which a given signature of a function is allowed.

> [!WARNING]
> The current design of using different sigils for standalone, open, and close annotations suggests that open/close is, in fact, a property of the function. `+html` looks like a different function than `-html` and `:html`.

### P02: It should be possible to avoid repetition of open/close palceholders in the message body by assigning them to local variables.

We can already do this for standalone placeholders.

	// now
	let $x = {+html opt=val}
	{{$x}Hello{-html}}

	// better?
	let $x = {:html opt=val}
	{{+ $x}Hello{-html}}

	// better? But: what about opt=val being passed to "close"?
	let $x = {:html opt=val}
	{{+ $x}Hello{- $x}}

## Open Questions

### Q01: Should it be possible to specify open and close properties on *placeholders* without annotations?

This follows from P02 above:

	let $x = {:html opt=val}
	{{+ $x}Hello{-html}}
	
Is it also useful to allow open/close literals?
If formatted parts carry the open/close information, they could still be used by higher abstraction layers.
However, it would impair tooling.

	// without annotations, tooling doesn't know anything about "a"
	{{+ a}text{- a}}

> [!IMPORTANT]
> If so:
> Open/close is not a property of the annotation.
> It is at most a property of the expression, which can comprise just the operand.
> Or perhaps even a property of the placeholder (see below).

### Q02: Should it be possible to specify open/close on expressions used in local variable declarations?

R08 is about making open/close invalid in selectors.
Perhaps also forbid open/close in local variable declarations and only allow them in placeholders inside patterns?

	// Local variables must be standalone annotations.
	let $x = {:html opt=val}

	// Syntax TBD; assuming open/close is a property of the placeholder.
	{{+ $x}Hello{- $x}}

	// Or perhaps repeat the annotation?
	{{$x +html}Hello{$x -html}}

> [!IMPORTANT]
> If so:
> Open/close is not a property of the annotation.
> It is at most a property of the expression, which can comprise just the operand.
> Or perhaps even a property of the placeholder (see below).

### Q03: Should it be possible to change the open/close role once assigned?

Assuming we allow Q02 above.
We can require a data model error be emitted when this happens.

	let $x = {em +html}
	{{$x -html}}

### Q04: Should formatting and selectors annotations have different syntax?

See [#260](https://github.com/unicode-org/message-format-wg/issues/260).

### Q05: Do we need namespaced local variables?

See [#403](https://github.com/unicode-org/message-format-wg/issues/403).

## Alternatives for the syntax

Once we answer the open questions, we can design the sigils and the syntax for open/close.
Some options.

### Function prefix

Single char sigils in front of function names.

	{img :html}
	{img +html}
	{img -html}

* at odds with P01; is the function called `html` or `:html`?

Double char sigils to group similar sigils under a common introducer.

	{img :html}
	{img ::html}
	{img :/html}
	     ||
	     +-- general function introducer
	      +- open/close specifier

* at odds with P01; is the function called `html` or `:html`?

Double char sigils, but the open/close specifier is first.

	{img %:html}
	{img /:html}
	     ||
	     +-- open/close specifier
	      +- function prefix

* satisfies P01; specifically, we can talk about the `:html` function used in the open or close context.

### Operator

The current `:` sigils orignally started as an *operator* for calling functions.
The following syntax was meant to be read as "pass `img` into the `html` function".
This is similar to the Unix pipe syntax, except that we can't use `|` due to C01 and R02.

	{img : html}

This approach would make open/close a property of the annotation, i.e. the function call.

	{img % html} ... {img / html}

### Operand prefix

Perhaps put the open/close sigil on the operand rather than the function name?

	{+a :html}

* satisfies P01 and P02
* not compatible with R06, i.e. with functions without operands.

### Extra expression syntax

Rather than putting open/close on the function name or the operand, let it take its own spot in the expression syntax.

As the first token inside the expression:

	{% em :html} ... {/ em :html}

Mirrored on both sides of the enclosed content:

	{strong #html ~} ... {~ strong #html}

Using paired curly braces:

	{{strong #html} ... {strong #html }}

* low visibility
* looks like a typo
* overloading the meaning of `{` and `}`
* can use `{{foo}}` for standalone placeholders

Using paired square brackets:

	{[strong #html} ... {strong #html]}

* slightly better visibility
* looks like a typo
* new special characters: `[` and `]`
* can use `{[foo]}` for standalone placeholders

### Extra placeholder-only syntax

This is the same as above, but applied only to placeholders.
Possible with the following change to our ABNF:

```diff
-expression = "{" [s] ((operand [s annotation]) / annotation) [s] "}"
+expression = (operand [s annotation]) / annotation
+selector = "{" [s] expression [s] "}"
+placeholder = "{" [s] expression [s] "}"
```

### Separate expression and placehodler syntax

Delimit expressions with one pair of curly braces and then embed them into placeholders which use another pair of curly braces as delimiters.

	{{ foo }}
	||_____|| expression
	|_______| placeholder

* standalone placeholders look sensible: `{{foo}}`
* curly-braced expressions can still be used in local declarations and selectors
* creates a natural place to introduce placeholder-specific syntax, e.g.

		{% {$x}} ... {/ {$x}}

* can forbid open/close in local declarations and selectors on the syntax level
* a large depature from the current syntax
* visually noisy, especially near the edges of a pattern: `{{{$username}}}` may be considered a bit excessive
* another meaning for `{` and `}`

Delimit only annotations, i.e. the inner braces become the "function call" syntax.

	let $foo = 42
	let $bar = {$foo :number}
	let $baz = $bar
	match $foo $bar {$baz :plural} ...

	{... {$foo} ... {{$baz :number}} ...}
	{% $x} ... {/ $x}

* an even larger depature from the current syntax
* discourages adding annotations inside patterns, because it requires wrapping the expression in curly braces
* instead, encourages lifting annotation to local declarations?

Delimit expressions with square brackets, placeholders with curly braces.

	let $foo = [$count :number]
	match [$foo :plural]
	when one {One thing}
	when * {{[$foo]} things}

* standalone placeholders look sensible: `{[foo]}`
* creates a natural place to introduce placeholder-specific syntax, e.g.

		{% [em :html]} ... {/ [em :html]}

* can forbid open/close in local declarations and selectors on the syntax level
* may be combined with the brackets-as-the-function-call approach detailed above: `let $foo = [$count :number]` but `let $foo = $count`.
* a very large depature from the current syntax
* visually noisy
* new special chars: `[` and `]`

### Keywords

Use literal `open` and `close` keywords:

	{open em :html} ... {close em :html}

* in-line with the fact that there exist other keywords already
* dangerously close to unquoted literals
