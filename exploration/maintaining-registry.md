# Maintaining the Function Registry

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@aphillips</dd>
		<dt>First proposed</dt>
		<dd>2024-02-12</dd>
		<dt>Pull Requests</dt>
                <dd>#634</dd>
	</dl>
</details>

## Objective

_What is this proposal trying to achieve?_

Describe how to manage the default function registry
as well was related function registries intended to promote interoperability.

## Background

_What context is helpful to understand this proposal?_

MessageFormat v2 includes a "default function registry".
Implementations are required to implement all of the _selectors_ 
and _formatters_ in this registry,
including _operands_, _options_, and option values.
Our goal is to be as universal as possible, 
making MFv2's message syntax available to developers in many different
runtimes in a wholly consistent manner.
Because we want broad adoption in many different programming environments
and because the capabilities 
and functionality available in these environments vary widely,
the default function registry must be conservative in what it requires.

At the same time, we want to promote message interoperability.
Even when a given feature or function cannot be adopted by all platforms,
diversity in the function names, operands, options, error behavior,
and so forth remains undesirable.
Another way to say this is that, ideally, there should be only one way to
do a given formatting or selection operation in terms of the syntax of a message.

This suggests that there exist a registry besides the "default function registry"
that contains the "templates" for functions that go beyond those every implementation 
must provide or which contain additional, optional features (options, option values)
that implementations can provide if they are motivated and capable of doing so.
This lower level of registry is normative for the functionality that it provides,
but not obligatory.
This lower level of registry uses the default namespace and can serve to incubate
functions or options that might be promoted to the default registry over time.

### Examples

_Function Incubation_

CLDR and ICU have defined locale data and formatting for personal names.
This functionality is new in CLDR and ICU.
Because it is new, few, if any, non-ICU implementations are currently prepared to implement
a function such as a `:person` formatter or selector.
Implementation and usage experience is limited in ICU.
Where functionality is made available, we don't want it to vary from
platform to platform.

_Option Incubation_

In the Tech Preview (LDML45) release, options for `:number` (and friends)
and `:datetime` (and friends) were omitted, including `currency` for `:number`
and `timeZone` for `:datetime`.
The options and their values were reserved, possibly for the LDML46 release as required,
but they also might be retained at a lower level of maturity.

## Use-Cases

_What use-cases do we see? Ideally, quote concrete examples._

As an implementer, I want to know what functions, options, and option values are
required to claim support for MF2:
- I want to know what options I am required to implement.
- I want to know what the values of each option are.
- I want to know what the options and their values mean.
- I want to be able to implement all of the required functions using my runtime environment
  without difficulty.
- I want to be able to use my local I18N APIs, which might use an older release of CLDR
  or might not be based on CLDR data at all.
  This could mean that my output might not match that of an CLDR-based implementation.

As an implementer, user, translator, or tools author I expect functions, options
and option values to be stable.
The meaning and use of these, once established, should never change.
Messages that work today must work tomorrow.
This doesn't mean that the output is stabilized or that selectors won't
produce different results for a given input or locale.

As an implementer, I want to track best practices for newer I18N APIs
(such as implementing personal name formatting/selection)
without being required to implement any such APIs that I'm not ready for.

As an implementer, I want to be assured that functions or options added in the future
will not conflict with functions or options that I have created for my local users.

As a developer, I want to be able to implement my own local functions or local options
and be assured that these do not conflict with future additions by the core standard.

As a tools developer, I want to track both required and optional function development
so that I can produce consistent support for messages that use these features.

As a translator, I want messages to be consistent in their meaning.
I want functions and options to work consistently.
I want to selection and formatting rules to be consistent so that I only have
to learn them once and so that there are no local quirks.

As a user, I want to be able to use required functions and their options in my messages.
I want to be able to quickly adopt new additions as my implementation supports them
or be able to choose plug-in or shim implementations.
I never want to have to rewrite a message because a function or its options have changed.

As an implementer or user, I want to be able to suggest useful additions to MF2 functionality
so that users can benefit from consistent, standardized features.
I want to understand the status of my proposal (and those of others) and know that a public,
structured, well-managed process has been applied.

## Requirements

_What properties does the solution have to manifest to enable the use-cases above?_

The default registry needs to describe the minimum set of selectors and formatters
needed to create messages effectively.
This must be compatible with ICU MessageFormat 1 messages.

There must be a clear process for the creation of new selectors that are required
by the default registry, 
which includes a maturation process that permits implementer feedback.

There must be a clear process for the creation of new formatters that are required
by the default registry, 
which includes a maturation process that permits implementer feedback.

There must be a clear process for the addition of options or option values that are required
by the default registry, 
which includes a maturation process that permits implementer feedback.

There must be a clear process for the deprecation of any functions, options, or option values
that are no longer I18N best practices.
The stability guarantees of our standard do not permit removal of any of these.

## Constraints

_What prior decisions and existing conditions limit the possible design?_

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

To address the above requirements, in addition to the default registry,
create a template for registry functions
and a process for proposing and evaluating these functions for inclusion
into the MessageFormat v2 function registry.

There would be three levels of expected maturity:

- **Default Registry** includes functions that are normatively required by all implementations.
  Such entries will be limited in scope to functions that can reasonably be
  implemented in nearly any programming environment.
  > Examples: `:string`, `:number`, `:datetime`, `:date`, `:time`
- **Recommended for General Implementation**
  ("RGI", deliberately similar to RGI in emoji, although we probably want to change the name
  as the words inside the acronym are themselves different)
  RGI includes functions that are not
  normatively required but whose names, operands, and options are recommended.
  Implementations SHOULD use these function signatures
  when implementing the described functionality.
  This will promote message interoperability
  and reduce the learning curve for developers, tools, and translators.
  > Examples: We don't currently have any, but potential work here
  > might includes personal name formatting, gender-based selectors, etc.

  RGI also includes _options_ that are not normatively required for MF2 conformance,
  but which implementers SHOULD implement.
  These should be used as test cases to populate RGI as soon as possible in the
  Tech Preview period.
  There are a number of these in the LDML45 Tech Preview:
  - `:number`/`:integer` have: `currency`, `unit`, `currencyDisplay`, `currencySign`, and `unitDisplay`
  - `:datetime` (et al) have: `calendar`, `numberingSystem`, and `timeZone`
- **Unicode Extensions** includes optional functionality that implementations
  may adopt at their discretion.
  These are provided as a reference.
  Unicode extensions use the namespace `:u` (which is reserved by the specification).
  Entries in the Unicode extension are stable and subject to the stability policy.
  That is, they will never be removed (but may be deprecated).
  Unicode extensions can be used to incubate functionality before
  promotion (removing the `u:` namespace) to the RGI or default registries in future releases,
  although, in general, this should be avoided.
  > Examples: Number and date skeletons are an example of Unicode extension
  > possibilities.
  > Providing a well-documented shorthand to augment "option bags" is
  > popular with some developers,
  > but it is not universally available and could represent a barrier to adoption
  > if normatively required.

Having RGI means providing a process for developing and evaluating proposals.
Since RGI functions and options are normative and stabilized,
there should be a mechanism for making an RGI proposal
that includes a beta period.

### RGI registry process and design

The timing of official releases of the default and RGI registries is the same as CLDR.
Each CLDR release will include:
- a specification for the default registry
- a specification for the RGI registry
- a specification for the Unicode extension registry
- a section of the MF2 specification specifically incorporating versions of the above

Proposals for additions to any of the above registries include the following:
- a design document, which MUST contain:
   - the exact text to include in the MF2 specification using a template to be named later
   - the desired maturity level (RGI or default)

Each proposal is stored in a directory indicating indicating its maturity level.
The maturity levels are:
- **Approved** Items waiting for the next CLDR release.
- **Feedback** Complete designs that are in their implementation test period.
- **Proposed** Proposals that have not yet been considered by the MFWG.
- **Rejected** Proposals that have been rejected by the MFWG in the past.

## Alternatives Considered

_What other solutions are available?_
_How do they compare against the requirements?_
_What other properties they have?_
