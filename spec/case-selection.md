## Variant Case Selection

> This is a fragment of the full MessageFormat 2 specification,
> intended for later merge into a complete spec document.

### Prerequisites

The following assumptions are made about the **data model** and **function registry**,
as prerequisites for the following algorithm:

1. The data model supports a message type that allows for selecting
   one variant **case** of a message based on the value of one or more **selectors**.

2. The value of a selector may be determined by a literal value,
   a function defined in the function registry,
   a dynamic variable provided at runtime,
   the formatted value of another message,
   or some subset of these.
   The process for determining the value of any of the above is defined elsewhere.

3. For each selector, a default or **fallback** value is defined.
   This may be a fixed value such as `"other"`,
   or a string or integer value defined separately for each selector.

4. In the data model, the selectors are defined by an ordered list.

5. In the data model, the variant cases are defined by an ordered list of entries.
   In addition to the case's actual message **value**,
   each entry contains the **key** for the case as an ordered list of string and integer values.
   These key values are aligned with the selectors.
   The length of any key list is not greater than the length of the selector list.

6. If the function registry contains a `plural` selector function,
   that function may be called with one number argument,
   and be expected to return a list of string and integer values.
   The returned values correspond to the numerical value of the argument as well as
   the identifier of the cardinal plural category of the argument.

7. The cases are sorted, such that numerical keys are before string keys and
   default or fallback key values are after all other key values.
   If a fallback key has a number value, it is sorted after all non-fallback keys.

### Algorithm

1. The value `s` of each selector is determined:

   1. The initial value `v` of the selector is resolved (see prereq. 2)
   2. If `v` is a string value or a list of string and integer values, `s = v` is set.
   3. Else if `v` is a number and a `plural` function is defined, `s = plural(v)` is set.
   4. Else if `v` is a number, `s = v` is set.
   5. Else, `v` is forcibly stringified: `s = String(v)`.

   At this point, we have a list `S` of selector values,
   each of which is a string, number, or a list of a string and integer values.

2. For each case (in order), its key `K` is compared to the selector values.
   Each string or integer `k` in `K` is compared to its corresponding selector value `s`
   as well that selector's fallback value `d`:

   1. If `s` is a string or number and `k == s`, the match succeeds.
   2. Else if `s` if a list of string and integer values and `k` is in `s`, the match succeeds.
   3. Else if `k == d`, the match succeds.
   4. Else, the match fails.

   If the match succeeds for all `k` in `K`,
   the case is selected and its value is selected as the value of the whole message.

3. If no case matches the selector value, an empty string is selected as the message value.
