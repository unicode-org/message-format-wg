# Consensus Decisions

> [!NOTE]
> This document is historical. This mechanism was replaced with design documents and meeting notes.

During its proceedings, the working group has reached internal consensus on a number of issues.
This document enumerates those, and provides a reference for later actions.

### Sources

For more details on the process that lead to these decisions, please refer to the following:

- **Consensus 1 & 2:**
  Identified as prerequisites for maintaining backwards-compatibility with MessageFormat 1 once Consensus 3 & 4 are agreed upon.
  Reached during the meetings of the [issue #103](https://github.com/unicode-org/message-format-wg/issues/103) task-force, and codified during the [October 2020 task-force meeting](https://github.com/unicode-org/message-format-wg/blob/HEAD/meetings/task-force/%23103-2020-10-26.md).
  Accepted at the [November 2020 meeting](https://github.com/unicode-org/message-format-wg/blob/HEAD/meetings/2020/notes-2020-11-16.md) of the working group.
- **Consensus 3 & 4:**
  The core result of the [issue #103](https://github.com/unicode-org/message-format-wg/issues/103) task-force ([minutes](https://github.com/unicode-org/message-format-wg/tree/master/meetings/task-force)).
  Reached in principle during the [December 2020 meeting](https://github.com/unicode-org/message-format-wg/blob/HEAD/meetings/2020/notes-2020-12-14.md) of the working group.
  Codified in [issue #137](https://github.com/unicode-org/message-format-wg/issues/137).
  Discussed and accepted at the [January 2021](https://github.com/unicode-org/message-format-wg/issues/146) and [February 2021](https://github.com/unicode-org/message-format-wg/blob/HEAD/meetings/2021/notes-2021-02-15.md) meetings of the working group.
- **Consensus 5 & 6:**
  The solution for [issue #127](https://github.com/unicode-org/message-format-wg/issues/127).
  Codified in [issue #137](https://github.com/unicode-org/message-format-wg/issues/137) during the [January 2021 meeting](https://github.com/unicode-org/message-format-wg/issues/146) of the working group.
  Discussed and accepted at the [February 2021 meeting](https://github.com/unicode-org/message-format-wg/blob/HEAD/meetings/2021/notes-2021-02-15.md) of the working group.
- **Consensus 7:**
  Discussed at the [22 September 2021 meeting](https://github.com/unicode-org/message-format-wg/issues/196) of the working group.

## 1: Include message references in the data model.

**Discussion:**
The implementers would find a way to include references anyways, but including it in the data model (standard) can make it subject to best practices.
It will unfortunately still be possible, but much more difficult, for users to do “the wrong thing” by concatenating strings or messages.

One of the drawbacks of message references is that referenced messages effectively have a public API (names of parameters, variables, variants, etc.) which must be consistent across all callsites.
This leads us to consensus 2.

## 2: Allow message references to include parameters in a form that enables their validation.

**Discussion:**
The variables/fields passed should not be completely untyped and unchecked.
We want a validation mechanism that can allow providing early error feedback to the translators and developers.
We need to decide on when the validation can and should happen, including the meaning of “build time” and “run time” in regards to validation.

## 3: Allow for selectors to select a case depending on the value of one or more input arguments.

**Discussion:**
This is a prerequisite for top-level selectors to be able to represent complex messages, without requiring those messages to be split up in an unergonomic manner.
This is an extension or relaxation of what's allowed in MessageFormat 1.

While message references make it technically possible for the data model to represent multi-argument selectors otherwise, this requires the use of n²-1 artificial "messages", where n is the number of arguments. This is not desirable.

## 4: Only allow for selectors at the top level of a message.

**Discussion:**
Requiring selectors to only be available at the top level is a good way of helping to maintain the translatability of messages, as well as otherwise guiding MessageFormat 2 users towards good practices.

After an in-depth exploration of the problem space, we have determined that while selectors are a necessary feature of MessageFormat, it is not necessary for them to be available within the body of a message, or directly within a case of a parent selector.

All identified use cases of such constructions may be cleanly represented using a top-level selector that may use more than one input argument to select among a set of messages.
Furthermore, we may enable complete reversibility of message transformations to and from languages such as MessageFormat 1 and Fluent by using message references.

## 5: Top level selectors together with message references provides the same value as nested selectors at a lower cost.

**Discussion:**
Nested selectors provides capabilities that may be useful in avoiding variant permutation explosion in edge cases, but the use of them has not been evaluated in production localization systems to date.
The group believes that the known value of this feature can be sufficiently covered by the combination of message references and top level selection features, which together provide a sufficient feature set at a lower cost to the ecosystem than nested selectors would do.

## 6: The model will be designed to leave the door open for nested selectors being potentially reconsidered in the future.

**Discussion:**
The cost analysis of the nested selectors feature was performed in the absence of sufficient in-field experience of use in production systems.
In result, the group's decision to not currently incorporate the feature is based on the lack of sufficient known value that would require them, which the group recognizes may change in the future.
In result, it is the intent of the group to design MessageFormat 2 in a way that wouldn't prevent future revisions of the standard to be extended with nested selectors feature.

## 7: A valid MessageFormat implementation may require all formatting functions to be run without access to the runtime context.

**Discussion:**
It is theoretically possible for formatting functions to become an attack vector to a system,
as they are often handling user-controlled inputs.
It is important to ensure that it is possible for an implementation to consider formatting functions as untrusted code,
while not requiring that this is done.
An implementation that does limit formatting function access is still expected to
allow for e.g. message references and other parts of the specification to work.

The "runtime context" here refers to information about the current message,
other available messages,
the available formatting functions,
and any arguments or parameters that may have been made available when calling the message formatter.
The formatting function would in all cases still have access to the explicit values and options with which it was called.
