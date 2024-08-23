# Maintaining and Registering Functions

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

Describe how to manage the registration of functions and options under the 
auspices of MessageFormat 2.0.
This includes the Standard Functions which are normatively required by MF2.0,
functions or options in the Unicode `u:` namespace,
and functions/options that are recommended for interoperability.

## Background

_What context is helpful to understand this proposal?_

MessageFormat v2 originally included the concept of "function registries",
including a "default function registry" required of conformant implementations.

The terms "registry" and "default registry" suggest machine-readbility
and various relationships between function sets that the working group decided
was not appropriate.

MessageFormat v2 includes a standard set of functions.
Implementations are required to implement all of the _selectors_ 
and _formatters_ in this set,
including _operands_, _options_, and option values.
Our goal is to be as universal as possible, 
making MFv2's message syntax available to developers in many different
runtimes in a wholly consistent manner.
Because we want broad adoption in many different programming environments
and because the capabilities 
and functionality available in these environments vary widely,
this standard set of functions must be conservative in its requirements
such that every implementation can reasonably implement it.

Promoting message interoperability can and should go beyond this.
Even when a given feature or function cannot be adopted by all platforms,
diversity in the function names, operands, options, error behavior,
and so forth remains undesirable.
Another way to say this is that, ideally, there should be only one way to
do a given formatting or selection operation in terms of the syntax of a message.

This suggests that there exist a set of functions and options that
extends the standard set of functions.
Such a set contains the "templates" for functions that go beyond those every implementation 
must provide or which contain additional, optional features (options, option values)
that implementations can provide if they are motivated and capable of doing so.
These specifications are normative for the functionality that they provide,
but are optional for implementaters.

There also needs to be a mechanism and process by which functions in the default namespace
can be incubated for future inclusion in either the standard set of functions
or in this extended, optional set.

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

The Standard Function Set needs to describe the minimum set of selectors and formatters
needed to create messages effectively.
This must be compatible with ICU MessageFormat 1 messages.

There must be a clear process for the creation of new selectors that are required
by the Standard Function Set, 
which includes a maturation process that permits implementer feedback.

There must be a clear process for the creation of new formatters that are required
by the Standard Function Set, 
which includes a maturation process that permits implementer feedback.

There must be a clear process for the addition of options or option values that are required
by the Standard Function Set, 
which includes a maturation process that permits implementer feedback.

There must be a clear process for the deprecation of any functions, options, or option values
that are no longer I18N best practices.
The stability guarantees of our standard do not permit removal of any of these.

## Constraints

_What prior decisions and existing conditions limit the possible design?_

## Proposed Design

_Describe the proposed solution. Consider syntax, formatting, errors, registry, tooling, interchange._

The MessageFormat WG will release a set of specifications
that standardize the implementation of functions and options in the default namespace of 
MessageFormat v2 beginning with the LDML46 release.
Implementations and users are strongly discouraged from defining 
their own functions or options that use the default namespace
Future updates to these sets of functions and options will coincide with LDML releases.

Each _function_ is described by a single specification document.
Each such document will use a common template.
A _function_ can be a _formatting function_,
a _selector_,
or both.

The specification will indicate if the _formatting function_,
the _selector function_, or, where applicable, both are `Standard` or `Optional`.
The specification must describe operands, including literal representations.

The specification includes all defined _options_ for the function.
Each _option_ must define which values it accepts.
An _option_  is either `Standard` or `Optional`.

_Functions_ or _options_ that have an `Optional` status
must have a maturity level assigned.
The maturity levels are:
- **Proposed**
- **Accepted**
- **Released**
- **Deprecated**

_Functions_ and _options_ that have a `Standard` status have only the
`Released` and `Deprecated` statuses.

* An _option_ can be `Standard` for an `Optional` function.
  This means that the function is optional to implement, but that, when implemented, must include the option.
* An _option_ can be `Optional` for a `Standard` function.
  This means that the function is required, but implementations are not required to implement the option.
* An _option_ can be `Optional` for an `Optional` function.
  This means that the function is optional to implement and the option is optional when implementing the function.

A function specification describes the functions _operand_ or _operands_,
its formatting options (if any) and their values,
its selection options (if any) and their values,
its formatting behavior (if any),
its selection behavior (if any),
and its resolved value behavior.

`Standard` functions are stable and subject to stability guarantees.
Such entries will be limited in scope to functions that can reasonably be
implemented in nearly any programming environment.
> Examples: `:string`, `:number`, `:datetime`, `:date`, `:time`


`Optional` functions are stable and subject to stability guarantees once they
reach the status of **Released**.
Implmentations are not required to implement _functions_ or _options_ with an `Optional` status
when claiming MF2 conformance.
Implementations MUST NOT implement functions or options that conflict with `Optional` functions or options.

`Optional` values may have their status changed to `Standard`,
but not vice-versa.

> Option Examples `:datetime` might have a `timezone` option in LDML46.
> Function Examples: We don't currently have any, but potential work here
> might includes personal name formatting, gender-based selectors, etc.

The CLDR-TC reserves the `u:` namespace for use by the Unicode Consortium.
This namespace can contain _functions_ or _options_.
Implementations are not required to implement these _functions_ or _options_
and may adopt or ignore them at their discretion,
but are encouraged to implement these items.

Items in the Unicode Reserved Namespace are stable and subject to stability guarantees.
This namespace might sometimes be used to incubate functionality before
promotion to the default namespace in a future release.
In such cases, the `u:` namespace version is retained, but deprecated.
> Examples: Number and date skeletons are an example of Unicode extension
> possibilities.
> Providing a well-documented shorthand to augment "option bags" is
> popular with some developers,
> but it is not universally available and could represent a barrier to adoption
> if normatively required.

All `Standard`, `Optional`, and Unicode namespace function or option specifications goes through 
a development process that includes these levels of maturity:

1. **Proposed** The _function_ or _option_, along with necessary documentation,
   has been proposed for inclusion in a future release.
2. **Accepted** The _function_ or _option_ has been accepted but is not yet released.
   During this period, changes can still be made.
3. **Released** The _function_ or _option_ is accepted as of a given LDML release that MUST be specified.
4. **Deprecated** The _function_ or _option_ was previously _released_ but has been deprecated.
   Implementations are still required to support `Standard` functions or options that are deprecated.
5. **Rejected** The _function_ or _option_ was considered and rejected by the MF2 WG and/or the CLDR-TC.
   Such items are not part of any standard, but might be maintained for historical reference.

A proposal can seek to modify an existing function.
For example, if a _function_ `:foo` were an `Optional` function in the LDMLxx release,
a proposal to add an _option_ `bar` to this function would take the form
of a proposal to alter the existing specification of `:foo`.
Multiple proposals can exist for a given _function_ or _option_.

### Process

Proposals for additions are made via pull requests in a unicode-org github repo
using a specific template TBD.
Proposals for changes are made via pull requests in a unicode-org github repo
using a specific template TBD against the existing specification for the function or option.

Proposals must be made at least _x months_ prior to the release date to be included
in a specific LDML release.
The CLDR-TC will consider each proposal using _process details here_ and make a determination.
The CLDR-TC may delegate approval to the MF2 WG.
Decisions by the MF2 WG may be appealed to the CLDR-TC.
Decisions by the CLDR-TC may be appealed using _existing process_.

Technical discussion during the approval process is strongly encouraged.
Changes to the proposal, 
such as in response to comments or implementation experience, are permitted
until the proposal has been approved.
Once approved, changes require re-approval (how?)


The timing of official releases of the Standard Function Set and Optional Set is the same as CLDR/LDML.
Each LDML release will include:
- **Released** specifications in the Standard Function Set
- **Released** specifications in the Unicode reserved namespace
- a section of the MF2 specification specifically incorporating versions of the above
- **Accepted** entries for each of the above available for testing and feedback

Proposals for additions to any of the above include the following:
- a design document, which MUST contain:
   - the exact text to include in the MF2 specification using a template to be named later

Each proposal is stored in a directory indicating indicating its maturity level.
The maturity levels are:
- **Accepted** Items waiting for the next CLDR release.
- **Released** Complete designs that are released.
- **Proposed** Proposals that have not yet been considered by the MFWG or which are under active development.
- **Rejected** Proposals that have been rejected by the MFWG in the past.

## Alternatives Considered

_What other solutions are available?_
_How do they compare against the requirements?_
_What other properties they have?_
