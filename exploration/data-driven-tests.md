# Data-driven tests

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@mradbourne</dd>
		<dt>First proposed</dt>
		<dd>2023-09-28</dd>
		<dt>Pull Request</dt>
		<dd>#000</dd>
	</dl>
</details>

## Objective

Establish a suitable approach for testing that different implmentations of MessageFormat 2 align with the specification.

This approach includes _how_ tests are written: They should be captured in a single platform-agnostic format that can be utilized by all MF2 implementations. There should be no need to rewrite individual test cases for each platform.

This approach also includes _what_ kind of tests are written. We need to identify which parts of MF2 should be covered by different types of test as a minimum.

## Background

Several pre-existing test files have been considered before forming this proposal:

- [Unicode's Data Driven Test framework](https://github.com/unicode-org/conformance)
- [message-format-wg XML test format](https://github.com/unicode-org/message-format-wg/tree/514758923abac13a2c5eb71b6b6cdef4a181280e/test)
- [Intl.MessageFormat polyfill tests](https://github.com/messageformat/messageformat/tree/main/packages/mf2-messageformat/src)
- [ICU4J test examples](https://github.com/unicode-org/icu/tree/main/icu4j/main/core/src/test/java/com/ibm/icu/dev/test/message2)
- [Tim Chevalier's draft ICU4C tests](https://github.com/catamorphism/icu/blob/parser-plus-data-model-plus-full-api/icu4c/source/test/intltest/messageformat2test.cpp)

## Use-Cases

The main platforms for which the tests should initially run are:
- Node.js
- ICU4J (Java)
- ICU4C (C++)

Other platforms, such as ICU4X (Rust) may be added later.

## Requirements

- Test framework
  - The test cases and assertions must be easy to read.
  - The test cases and assertions must be completely platform-agnostic.
  - The framework must include the platform-specific test executors as part of the solution.
  - The framework must be extendable with new executors (e.g. ICU4X) and it should be clear how to do this. 

- Test content
  - Syntax tests: Testing which standard registry functions are invoked when different arguments are passed to a given pattern.
  - Formatter tests: Testing the output of each of the standard registry's formatting functions.
  - Selector tests: Testing which case of a `match` statement is selected, based on what follows the `when` keyword.

## Constraints

### External dependencies

Due to the platform-agnostic nature of the tests, we must ensure that they are easily adaptable to new technologies. This means that any external dependency must be introduced with a great deal of caution because it may impact the portability of the test framework.

### Data model is not part of the specification

Although a standard data model is included in this repository, there is no requirement for all MF2 implementation to use it. This means that any data model tests included in the test suite may fail for standard-compliant implementations. If any tests of this type are included, they must be optional.

### Errors and evaluation strategy

It is important to test error cases for each of the test types mentioned above but, because variable evaluation is not captured within the standard, we cannot guarantee what kind of error will be raised in all cases.

For example, the pattern below may or may not result in an error depending on how lazily the expression is evaluated. This presents a challenge for testing.

```
local $foo = {$bar}
{Hello world!}
```

Similarly, this pattern may show a different error depending on evaluation. The initial error could be located on either line 1 or 2.

```
local $foo = {$bar}
{Hello, {$bar}!}
```

## Proposed Design

### Test framework

The MF2 test framework should follow the ['Unicode & CLDR Data Driven Test'](https://github.com/unicode-org/conformance) framework.

As per the project's [README.md](https://github.com/unicode-org/conformance#readme):
> "The goal of this work is an easy-to-use framework for verifying that an implementation of ICU functions agrees with the required behavior. When a DDT test passes, it a strong indication that output is consistent across platforms. [...] Data Driven Test (DDT) focuses on functions that accept data input such as numbers, date/time data, and other basic information."

This aligns closely with the goals and characteristics of the MF2 tests. Parity with ICU procedures is an added advantage.

The README specifies that test cases and expected results are to be located in separate files (including the rationale for this).

#### Test file example

`example_1_test.json`
```jsonc
{
  "Test scenario": "example_1",
  "description": "Test cases for XYZ",
  "testType": "syntax", // Tests will require different setup steps or function calls depending on their purpose.
  "tests": [
    {
      "label": "0000",
      "locale": "en-US",
      "pattern": "{Some MF2 pattern}",
      "options": {}, // Optional configuration
      "input": { "namedArg": "foo" }, // Arguments to the function being tested, such as a message.formatToString() function. May vary with testType.
    },
    // ...
  ]
}
```
#### Verification file example

`example_1_verify.json`
```jsonc
{
 "Test scenario": "example_1",
 "verifications": [
  {
   "label": "0000",
   "verify": "Expected result"
  },
  // ...
 ]
}
```

### YAML-to-JSON test transpilation (optional)

JSON does not support multiline strings. Test files may need to include `\n` line breaks in order to capture multiline patterns, which could cause readability issues. YAML syntax offers improved readability in this situation.

We can include a script that converts YAML-formatted "test" and "verify" files to JSON. Assuming both the YAML- and JSON-format tests are committed, the JSON can remain the single source of truth for the tests, which aligns with the expectations of Unicode Data Driven Tests.

### Test content

#### Syntax tests

These tests evaluate the pattern based on the runtime arguments. Formatters are shown as stringified representations of the function because formatter output is tested separately.

Example: 
```jsonc
{
  "label": "Renders multiple inputs in formatted string",
  "locale": "en-US",
  "pattern": "{{$strArg :string} and {$numArg :number}}",
  "inputs": {
    "strArg": { "type": "string", "value": "foo" },
    "numArg": { "type": "number", "value": 123 }
  }
  // "verify":  "{ formatter: "string", value: "foo" } and { formatter: number, value: 123 }"
}
```

#### Formatter tests

These tests focus on the standard registry's formatters (e.g. `:number`, `:datetime`). They cover the different options that can be passed to each formatter (e.g. `offset`, `skeleton`).

Example:
```jsonc
{
  "label": "Skeleton affects datetime format",
  "locale": "en-US",
  "pattern": "{$givenDateTime :datetime skeleton=yMMMdE}",
  "inputs": {
    "givenDateTime": { "type": "datetime", "value": "2000-12-31T00:00:00.000Z" }
  },
  // "verify":  "Sun, 31 Dec 2000"
}
```

#### Selector tests

These are extensive tests of the cases within a `match` statement. Testing of multiple selectors is included.


Example:
```jsonc
{
  "label": "Matches numbers other than one",
  "locale": "en-US",
  "pattern": "match {$arg :number} when one {one} when * {*}",
  "inputs": {
    "arg": { "type": "number", "value": 3 }
  }
  // "verify": "*"
}
```

#### Data model tests (optional)

There is no standard data model within the specification, which means that we cannot create mandatory data model tests.

If a particular implementation of MF2 exposes a standardized representation of [the data model](../spec/data-model/message.json), perhaps through a `mf2.toCanonicalJson();` function or similar, then we could create tests that assert against this.

## Alternatives Considered

### Gherkin syntax and Cucumber runner

Based on the readability concerns mentioned above, the Gherkin syntax was also considered.

Example:
```feature
Feature: Multi-selector messages

  Background: 
    Given the username is "Matt"
    And the source is:
      """
      match {$photoCount :number} {$userGender :equals}
      when 1 masculine {{$userName} added a new photo to his album.}
      when 1 feminine  {{$userName} added a new photo to her album.}
      when 1 *         {{$userName} added a new photo to their album.}
      when * masculine {{$userName} added {$photoCount} photos to his album.}
      when * feminine  {{$userName} added {$photoCount} photos to her album.}
      when * *         {{$userName} added {$photoCount} photos to their album.}
      """

  Scenario: One item - male
    When the message is resolved with params:
      | key        | value     |
      | photoCount |         1 |
      | userGender | masculine |
    Then the string output is "Matt added a new photo to his album."
```

The [Cucumber framework](https://cucumber.io/) was considered because of its integration with the Gherkin syntax. Cucumber's approach of using platform-specific step definitions for Gherkin scenarios aligns with our goal of having a data-only representation of the test content. Unfortunately, the MF2 test runner may need to target a wide range of platforms in future. In this case, integrating with Cucumber would incur additional overhead.

It would, however, be possible to transpile Gherkin to JSON without using Cucumber, which would provide similar benefits to the YAML transpilation mentioned above. This can be discussed further.
