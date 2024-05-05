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
Even though a feature cannot be adopted by all platforms,
diversity in the function names, operands, options, error behavior,
and so forth remains undesirable.
This suggests that there exist a registry at a lower level of normativeness
with "templates" for functions that implementations can implement 
when they have the wherewithal to support them.

An example of this might be "personal name formatting",
whose functionality is new in CLDR and ICU.
Few if any non-ICU implementations are currently prepared to implement
a function such as `:person`
and implementation and usage experience is limited in ICU.
Where functionality is made available, we don't want it to vary from
platform to platform.

Finally, we need to establish mechanisms for managing proposals
for the various types of function registry.

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
  This means that my output might not match that of an CLDR-based implementation.

As an implementer, user, translator, or tools author I expect functions, options
and option values to be stable.
The meaning and use of these, once established, should never change.
Messages that work today should work tomorrow.
This doesn't mean that the output is stabilized or that selectors won't
produce different results for a given input/locale.

As an implementer, I want to track best practices for newer I18N APIs
(such as implementing personal name formatting/selection)
without being required to implement other APIs that I'm not ready for.

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
  Such entries will be limited in scope to functions that can be
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
  Unicode extensions use the namespace `:u` (which should be reserved).
  This is also intended as a useful means of incubating functionality before
  adding it to the default or RGI registries in future releases.
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
- a machine-readable default registry
- a machine-readable RGI registry
- a machine-readable Unicode extension registry
- a specification normatively incorporated into MF2 describing all entries
  in the machine readable registries listed just above

Proposals for additions to any of the above registries include the following:
- a design document, which MUST contain:
   - the exact text to include in the MF2 specification using a template to be named later
   - the desired maturity level (RGI or default)
- a machine-readable registry file matching the design

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
