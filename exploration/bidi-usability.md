# Bidi Usability

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@aphillips</dd>
		<dt>First proposed</dt>
		<dd>2024-03-27</dd>
		<dt>Pull Requests</dt>
		<dd>#000</dd>
	</dl>
</details>

## Objective

_What is this proposal trying to achieve?_

The MessageFormat v2 syntax uses whitespace as a required delimiter
as well as permitting the use of whitespace to make _messages_ easier to read.
In addition, a _message_ can include bidirectional text in identifiers and literal values.

MessageFormat's syntax also uses a variety of "sigils" and markers to form the structure of a _message_.
These sigils are ASCII punctuation characters that have neutral directionality.
This means that the inclusion of right-to-left ("RTL") identifiers or literals in a _message_
can result in the syntax looking "scrambled" or, in extreme cases, appearing to have a different meaning
due to [spillover](https://www.w3.org/TR/i18n-glossary/#dfn-spillover-effects).

To prevent spillover effects and to allow users (particularly RTL language users)
to author _messages_ in a straightforward way, we want to allow the syntax to include appropriate
bidirectional support and to recommend to tool and translation technology implementers
mechanisms to make _messages_ that include RTL characters easy to work with
without introducing spoofing or "Trojan Source" attack vectors.

## Background

_What context is helpful to understand this proposal?_

If you are unfamiliar with bidirectional or right-to-left text, there is a basic introduction 
[here](https://www.w3.org/International/articles/inline-bidi-markup/uba-basics).

## Use-Cases

_What use-cases do we see? Ideally, quote concrete examples._

## Requirements

_What properties does the solution have to manifest to enable the use-cases above?_

To prevent RTL _literals_ from having spillover effects with surrounding syntax,
it should be possible to bidi isolate a _quoted_ or _unquoted_ _literal_.

>```
> .local $title = {|البحرين مصر الكويت!|}
> .local $egypt = {مصر :string}
>```

To prevent _patterns_ from having spillover effects with other parts of a _message_,
particularly with _keys_ in a _variant_,
it should be possible to bidi isolate a _quoted-pattern_.

>```
> .match {$foo :string}
> isolate {{البحرين مصر الكويت!}}
>```

To prevent _placeholders_ or _expressions_ from having spillover effects with other parts of a _message_
it should be possible to bidi isolate the contents of an _expression_.

To prevent RTL identifiers from having spillover effects with other parts of an _expression_,
it should be possible to include "local effect" bidi controls following an _identifier_,
_name_,
_option value_,
or _literal_.
These controls must not be included into the _identifier_, _name_, _option value_, or _literal_,
that is, it must be possible to distinguish these characters from the value in question.

## Constraints

_What prior decisions and existing conditions limit the possible design?_

Users cannot be expected to create or manage bidirectional controls or
marks in _messages_, since the characters are invisible and can be difficult
to manage.
Tools (such as resource editors or translation editors)
and other implementations of MessageFormat 2 serialization are strongly
encouraged to provide paired isolates around any right-to-left
syntax as described in this design so that _messages_ display appropriately as plain text.

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

## Alternatives Considered

_What other solutions are available?_
_How do they compare against the requirements?_
_What other properties they have?_
