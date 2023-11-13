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
		<dd>#495</dd>
	</dl>
</details>

## Objective

One of the [deliverables of the Message Format Working Group (MFWG)](https://github.com/unicode-org/message-format-wg/blob/main/docs/goals.md#deliverables) is:

> "A conformance test suite for parsing and formatting messages sufficient to ensure implementations can validate conformance to the specification(s) provided".

This design proposal captures the planned approach for the suite.

This approach includes _how_ tests are written: They should be captured in a single platform-agnostic format that can be utilized by all MF2 implementations. There should be no need to rewrite individual test cases for each platform.

This approach also includes _what_ kind of tests are written. We need to identify which parts of MF2 should be covered by different types of test as a minimum.

## Background

Several pre-existing test files have been considered before forming this proposal:

- [**Unicode's Data Driven Test framework**](https://github.com/unicode-org/conformance) is a project with a goal that aligns with that of MFWG's conformance test suite.

- [**message-format-wg XML test format**](https://github.com/unicode-org/message-format-wg/tree/514758923abac13a2c5eb71b6b6cdef4a181280e/test) includes a test schema and accompanying test examples from which we can take inspiration.

- [**Intl.MessageFormat polyfill tests**](https://github.com/messageformat/messageformat/tree/main/packages/mf2-messageformat/src) are implementation-specific but they capture the type of tests that we may want to include in the conformance test suite. The polyfill itself is an implementation that the test suite could be run against.

- [**ICU**](https://github.com/unicode-org/icu) also contains platform-specific MF2 test cases that could be reused for the conformance test suite, including the [ICU4J tests](https://github.com/unicode-org/icu/tree/main/icu4j/main/core/src/test/java/com/ibm/icu/dev/test/message2) and [Tim Chevalier's draft ICU4C tests](https://github.com/catamorphism/icu/blob/parser-plus-data-model-plus-full-api/icu4c/source/test/intltest/messageformat2test.cpp).

## Use-Cases

**Developers** of MF2 implementations need to easily verify that their completed implementation conforms to the specification. This needs to be fully automated and easily repeatable.

For incomplete and incorrect implementations, it is important for developers to easily understand where the specification is not being met and why.

The main platforms for which the tests should initially run are:

- Node.js
- ICU4J (Java)
- ICU4C (C++)

Other platforms, such as ICU4X (Rust) may be added later.

**Stakeholders** and **MF2 users** may use the conformance test suite as human-readable documentation of the specification. It needs to be easily navigable and legible for this purpose.

**Vendors** using tooling that conforms to the specification may want to run tests against it to verify that this is the case.

## Requirements

- Test framework

  - The test cases and assertions must be easy to read.
  - The test cases and assertions must be completely platform-agnostic.
  - The framework must include the platform-specific test executors as part of the solution.
  - The framework must be extendable with new executors (e.g. ICU4X) and it should be clear how to do this.

- Test content
  - **Syntax tests:** These test that valid patterns are evaluated correctly and that invalid patterns are identified. Where standard registry functions are used, they also test that the correct function is invoked with the expected arguments.
  - **Selector tests:** These test that the correct case of a `match` statement is selected, based on what follows the `when` keyword.

## Constraints

### External dependencies can impact portability

The platform-agnostic nature of the tests means that great caution must be taken around adding dependencies. The test suite must cater for a range of technology stacks and workflows with different restrictions around external dependencies.

### Errors and evaluation strategy may not be consistent

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

### The output of formatters may not be stable over time

Where possible, any parts of the suite that do not directly test the formatters should be independent of their output. This is to reduce the number of test failures caused by formatter output changes.

### Data model is not part of the specification

Although a standard data model is included in this repository, there is no requirement for all MF2 implementations to use it. This means that any data model tests included in the test suite may fail for otherwise standard-compliant implementations. If any tests of this type are included, they must be optional.

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
      "input": { "namedArg": "foo" } // Arguments to the function being tested, such as a message.formatToString() function. May vary with testType.
    }
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
    }
    // ...
  ]
}
```

### Test format

As per the 'Unicode & CLDR Data Driven Test' documentation, test and verification files are provided in JSON format. The proposal is to write tests in YAML and transpile them to JSON.

JSON does not support multiline strings so test files may need to include `\n` line breaks in order to capture multiline patterns, which may impact readability. This is the main reason not to author tests in JSON directly. Assuming both the source and JSON-format tests are committed to the repository, the JSON remains the single source of truth for the tests and it can be consumed by the test executor without the need for any transpilation at runtime.

The source format should offer the following:

- Precise control over whitespace as many MF2 tests concern this.
- Literal newlines for use in multiline patterns.
- Concise readable syntax.
- Comment syntax.
- Validation against a schema.
- (Optional) Editor integration for syntax highlighting and validation.

YAML fulfils these requirements and is widely used.

There is a [test generator](https://github.com/unicode-org/conformance/tree/main/testgen) included in the 'Unicode & CLDR Data Driven Test' repository. At the time of writing, this is specific to number format tests and is not easily adaptable to the needs of MF2. It does, however, demonstrate generating JSON from source files.

### Test content

#### Syntax tests

These tests evaluate the pattern based on the runtime arguments. Formatters are shown as stringified representations of the function because formatter output is tested separately.

Example:

```jsonc
{
  "label": "Renders multiple inputs in formatted string",
  "locale": "en-US",
  "pattern": "{{$strArg :string} and {$numArg :number minimumFractionDigits=2}}",
  "inputs": {
    "strArg": { "type": "string", "value": "foo" },
    "numArg": { "type": "number", "value": 123 }
  }
  // "verify":  "{ formatter: "string", value: "foo" } and { formatter: number, value: 123, minimumFractionDigits: 2 }"
}
```

#### Selector tests

These are extensive tests of the cases within a `match` statement. Testing of multiple selectors is included.

Single selector example:

```jsonc
{
  "label": "Matches numbers other than one",
  "locale": "en-US",
  "pattern": "match {$arg :number} when 1 {result 1} when * {result multi}",
  "inputs": {
    "arg": { "type": "number", "value": 2 }
  }
  // "verify": "result multi"
}
```

Multiple selector example:

```jsonc
{
  "label": "Matches wildcard strings and numbers other than one",
  "locale": "en-US",
  "pattern": "match {$name :string} {$count :number} when apple 1 {result apple 1} when apple * {result apple multi} when * 1 {result other 1} when * * {result other multi}",
  "inputs": {
    "name": { "type": "string", "value": "banana" },
    "count": { "type": "number", "value": 3 }
  }
  // "verify": "result other multi"
}
```

#### Formatter tests (optional)

These tests focus on the standard registry's formatters (e.g. `:number`, `:datetime`). They cover the different options that can be passed to each formatter (e.g. `offset`, `skeleton`).

If the output of a formatter changes in the future, these tests may need updating.

Example:

```jsonc
{
  "label": "Skeleton affects datetime format",
  "locale": "en-US",
  "pattern": "{$givenDateTime :datetime skeleton=yMMMdE}",
  "inputs": {
    "givenDateTime": { "type": "datetime", "value": "2000-12-31T00:00:00.000Z" }
  }
  // "verify":  "Sun, 31 Dec 2000"
}
```

#### Data model tests (optional)

There is no standard data model within the specification, which means that we cannot create mandatory data model tests.

If a particular implementation of MF2 exposes a standardized representation of [the data model](../spec/data-model/message.json), perhaps through a `mf2.toCanonicalJson();` function or similar, then we could create tests that assert against this.

## Alternatives Considered

### XML test syntax

As mentioned above, there are several advantages to writing tests in XML:

- It allows preservation of whitespace in strings, which is crucial for MF2 test cases.
- It allows literal newline characters in strings, which provides enhanced readability for multiline patterns.
- It supports a schema format, which can be used to validate test files.
- It is widely supported.

XML is fairly verbose though. It is better suited to writing markup, which is not our use-case.

### Gherkin test syntax and Cucumber runner

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

The [Cucumber framework](https://cucumber.io/) was considered because of its integration with the Gherkin syntax. Cucumber's approach of using platform-specific step definitions for Gherkin scenarios aligns with our goal of having a data-only representation of the test content. It may, however, be difficult to support Cucumber in certain technology stacks and workflows.

It would be possible to transpile Gherkin to JSON without using Cucumber, which would provide similar benefits to the YAML transpilation mentioned above. This can be discussed further.
