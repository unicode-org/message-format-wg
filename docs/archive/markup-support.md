# Markup Support History

To understand the current state of MF2 markup support, the below captures
moments where markup support developed either key ideas or implementations
within the repository.

The following events track the "Status" of the markup feature. Status is a
perception of the group's collective sentiment, as well as a set of traits
desired from the feature.

The "Takeaway"s entries below are known imperfect. Takeaway bullets are meant to
represent how collective sentiment or code have tangibly shifted over the
project lifetime, not to represent the perfect synopsis of an event.

## History

### Apr 10, 2023

- Status: 1. XML-friendly syntax, 2. spans, 3. formatToParts, 4. runtime markup processing
- Topic: What's left to discuss on markup?
- Issue: <https://github.com/unicode-org/message-format-wg/issues/375>
- Takeway:
  - Calls for closure on outstanding issues
  - Revisited sentiment for which all sentiments have prior discussion.

### Feb 20, 2023

Nine months have since passed previous on the topic.

- Status: 1. XML-friendly syntax, 2. spans, 3. formatToParts, 4. runtime markup processing
- Topic: Clarify that standalone markup is permitted.
- Issue: <https://github.com/unicode-org/message-format-wg/issues/356>
- Takeway:

  - Agreement that not all raw HTML/markup is compliant, e.g. double quotes.
  - Agreement that enhancements can be done through all prior aformentioned function registry provisions.
  - Risk of message being _consumed_ without formatting functions _available_ briefly discussed.
  - Revisiting "can our syntax just be XML"-ish? Counter-assertion that XML-compat may be contributor bias.
  - Revisiting (implicitly) formatToParts

### Jun 13, 2022

- Status: 1. XML-friendly syntax, 2. spans, 3. formatToParts, 4. runtime markup processing
- Topic: Add +start and -end sigils for markup elements
- PR: <https://github.com/unicode-org/message-format-wg/pull/283>
- Takeaway:
  - `+/-` added as markup prefixes

### May 16, 2022

- Status: 1. XML-friendly syntax, 2. spans, 3. formatToParts, 4. runtime markup processing
- Topic: "Placeholders: What sigil(s) indicate them?"
- Issue: <https://github.com/unicode-org/message-format-wg/issues/269>
- Takeaway:
  - Conversation attempts to be about convergence with other templating systems, but ends up wisely focusing on reducing syntactic ambiguity with placeholder opening syntax. This directly inspires #283, which adds +/- to markup syntax.

### May 12, 2022

- Status: 1. XML-friendly syntax, 2. spans, 3. formatToParts, 4. runtime markup processing
- Topic: Do markup elements map to registered functions?
- Issue: <https://github.com/unicode-org/message-format-wg/issues/262>
- Takeaway:
  - Advocation for formalizing `formatToParts` style as part of the specification, to fill some of the need that markup exists for.
    - `> advocate for adopting the main output to be a sequence of parts that are to be consumed by the next layer - UI bindings, zbraniecki`
      - By this point, at least four participants have called for this (stasm, n..., m..., aphilps, zbraniecki)
  - Outputs of the spec (string vs formatToParts) re-visited casually
  - Deep drill down on how markup relates to runtime function invocations, including params/options
  - Conversations get a bit wonky/meta, but formatting _functions_ are less-and-less ambiguous as the (to-be-defined) mechanism.

### May 11, 2022 (#241)

- Status: 1. XML-friendly syntax, 2. spans, 3. formatToParts, 4. runtime markup processing
- Topic: "Markup: do we need a different sigil for display element names?"
- Issue: <https://github.com/unicode-org/message-format-wg/issues/241>
  - Basic discussion on syntax
  - Interest discussion is mainly around function behavior, with the following complaint standing out, given the other conversations of that day:
    - > The function that interprets / renders / formats the markup is not specified in this proposal

### May 11, 2022 (#240)

- Status: 1. XML-friendly syntax, 2. spans, 3. formatToParts, 4. runtime markup processing
- Topic: "Markup: can we use argument-less functions to represent standalone display elements?"
- Issue: <https://github.com/unicode-org/message-format-wg/issues/240>
- Takeaway:
  - > TL;DR: Argument-less functions and standalone markup elements could be synonymous if the function registry allows for pass-through "formatting" of type+name+options entries as parts.

### May 11, 2022 (#238)

- Status: 1. XML-friendly syntax, 2. spans, 3. formatToParts, 4. runtime markup processing
- Topic: "Markup: how do ensure non-HTML display elements are first class?"
- Issue: <https://github.com/unicode-org/message-format-wg/issues/238>
- Takeaway:
  - Assumption of "first class markup in MF2" manifests in some design conflict between members.
    - > HTML is first class citizen, any other format are second class citizen.
  - Observation that any markup processing would be handled by upstream systems (aphilips)
  - Proposal of markup namespacing
  - Introduction/suggestion of markup as functions

### May 11, 2022 (#230)

May 11 sees a large spike in community dialog, all driven by the opening
of this PR. This PR makes concrete some aspects of vague prior proposals. Most
of the May 11 conversations hone in on _function_ formatting as a cornerstone of
the markup solution. Runtime function formatting behavior is _not_ associated
with the actual PR that adds markup syntax and presumptive markup documentation.

- Status: 1. XML-compat syntax, 2. spans, 3. formatToParts
- Topic: Add syntax proposal with EBNF #230
- Issue: <https://github.com/unicode-org/message-format-wg/pull/230>
- Takeaway:
  - This PR is the most influential of all other threads in defining markup in MF2. Markup is codified as `Placeable` (`placeholder`) in the grammar, and documentation furnished suggesting that runtimes may process them. At this moment:
    - Markup does not use +/- delimiters, but uses `/` closing char: `{b}hi{/b}`
    - Markup entries are not presumed to be function. Thus, the associated documentation (still to this day), do not suggest or introduce arguments, options, or any runtime concerns.
    - The introduced documentation explicitly calls out that parsed markup output may be used by "the runtime ... to construct a document tree structure for a UI framework"
      - This directly supports the formatToParts proposal. It does not directly support (or reject) the markup as functions proposal.

### Mar 2, 2022

- Status: 1. XML-compat syntax, 2. spans, 3. formatToParts
- Topic: Meeting Agenda : 2022-03-07 (Display/Markup Elements)
- Issue: https://github.com/unicode-org/message-format-wg/issues/223
- Takeaway:
  - [First concrete proposal](https://github.com/unicode-org/message-format-wg/blob/ez-spec/spec-syntax.md#display-and-markup-elements) to allow MF2 syntax to permit explicit inlined markup. Please note that no correlation to MF2 runtime behavior is established.
  - [First concrete proposal](https://docs.google.com/document/d/1kqD0gy5x1mfiF2PAegjcNCAc98snTAqtbxccxfLcpNo/edit#heading=h.93qjwqomt7pu) to allow MF2 markup-style placeholders.

### Feb 11, 2020

- Status: 1. XML-compat syntax, 2. spans, 3. formatToParts
- Topic: formatToParts-like Iterator
- Issue: <https://github.com/unicode-org/message-format-wg/issues/41>
- Takeaway:
  - First concrete discussions of non-string oriented UI primitive take shape
  - Runtime-applied enhancements first discussed using markup placeholders as the indicator/means

### Jan 30, 2020

- Status: XML-compat syntax, spans, span function formatting (pre-formatToParts)
- Topic: Extendable inline markup
- Issue: <https://github.com/unicode-org/message-format-wg/issues/26>
- Takeaway:
  - Call for embedded spans
  - Spans proposed as untranslated metadata, embedded inside of messages

### Jan 27, 2020

- Status: XML-compat syntax, span function formatting (pre-formatToParts)
- Topic: Support custom / pluggable "formatters"
- Issue: <https://github.com/unicode-org/message-format-wg/issues/22>
- Takeaway:
  - First suggestion of markup processors applied from runtimes

### Jan 23, 2020

- Status: General interest in XML friendly markup support
- Topic: Support messages in HTML
- Issue: <https://github.com/unicode-org/message-format-wg/issues/15>
- Takeaway:

  - > Based on this morning's meeting, it's probably best to just make sure that the syntax doesn't conflict with HTML.

### 27 Nov, 2019

- Status: Calls for explicit XML/HTML support
- Topic: Requirements - MF wishlist
- Issue: <https://github.com/unicode-org/message-format-wg/issues/3>
- Takeaway:
  - Requests for first class HTML/XML in the specification
  - Minor counter feedback is offered
    - > Markup to me seems to be more on the integration side when you consume the output of the syntax.
