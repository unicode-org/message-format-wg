# Data-driven tests

Status: **Accepted**

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

This design proposal captures the planned approach for the suite:

- It captures _what_ kind of tests are written by identifying the aspects of the MessageFormat 2 (MF2) specification that must be tested and the categories of test that do this.

- It also captures _how_ tests are written by describing the single platform-agnostic format that can be used by any MF2 test runner.

## Background

Several pre-existing test suites have been considered before forming this proposal:

- [**Unicode's Data Driven Test framework**](https://github.com/unicode-org/conformance) is a project with a goal that aligns with that of MFWG's conformance test suite.

- [**message-format-wg XML test format**](https://github.com/unicode-org/message-format-wg/tree/514758923abac13a2c5eb71b6b6cdef4a181280e/test) includes a test schema and accompanying test examples from which we can take inspiration.

- [**Intl.MessageFormat polyfill tests**](https://github.com/messageformat/messageformat/blob/ee1bc08826f0855d00a9ace4db001c06a8679983/packages/mf2-messageformat/src/messageformat.test.ts) are implementation-specific but they capture the type of tests that we may want to include in the conformance test suite. The polyfill itself is an implementation that the test suite could be run against.

- [**ICU**](https://github.com/unicode-org/icu) also contains platform-specific MF2 test cases that could be reused for the conformance test suite, including the [ICU4J tests](https://github.com/unicode-org/icu/blob/4f75c627675b426938f569003ee9dc0ea43490bb/icu4j/main/core/src/test/java/com/ibm/icu/dev/test/message2/MessageFormat2Test.java) and [ICU4C tests](https://github.com/unicode-org/icu/blob/6d5555a739179b5d177e73db7c111c5ef1cac22d/icu4c/source/test/intltest/messageformat2test.cpp).

## Use-Cases

**Developers** of MF2 implementations need to easily verify that their completed implementation conforms to the specification. This needs to be fully automated and easily repeatable. For incomplete and incorrect implementations, it is important for developers to easily understand where the specification is not being met and why.

**Stakeholders** and **MF2 users** may use the tests as human-readable documentation of the specification. They need to be easily navigable and legible for this purpose.

**Vendors** using tooling that conforms to the specification may want to run tests against it to verify that this is the case.

## Requirements

### Test the specification, not necessarily the final output

Every piece of the specification should be testable. In order to test the specification in isolation, the test suite should be independent of Unicode CLDR locale data.

### Provide tests, not runners

Unlike the test suites within [ICU](https://github.com/unicode-org/icu), this suite does not target a specific implementation and is not tied to any particular executor. It is completely platform-agnostic. Consumers of the tests can decide how they are run.

### Use a versatile format

The tests should be captured in a format that is highly portable and easily integrable with a wide range of technologies. The format should be easy to read while being flexible enough to capture the necessary detail of all test input and output.

## Constraints

### Function output can differ between implementations

The behaviour of default registry functions such as `:number` and `:datetime` is dependent on locale-specific data and may vary between implementations. [Test functions](https://github.com/unicode-org/message-format-wg/blob/6414b6c7d9faed6c1b4645b92b3548a8ea0ad332/test/README.md) should be used to write more isolated tests.

### Errors and evaluation strategy may not be consistent

Variable evaluation is not captured within the standard so we cannot guarantee the order in which errors are encountered.

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

For this reason, error tests should capture all errors present in each test case.

### Data model is not part of the specification

Although a standard data model is included in this repository, there is no requirement for all MF2 implementations to use it. Tests that rely on the structure of this data model may fail for standard-compliant implementations. If any tests of this type are included, they must be treated as optional.

## Proposed Design

### Test format

Tests should be written in JSON. This format aligns with the requirements above around versatility, as well as providing a favorable editing experience. It offers:

- Precise control over whitespace - tests are needed around whitespace handling.
- Concise readable syntax.
- Validation against a schema.
- Editor integration for syntax highlighting and validation.

Other considerations around using JSON:

- It does not support multiline strings. Test files may need to include `\n` line breaks in order to capture multiline patterns, which may impact readability.
- It does not include a syntax for comments. The test schema should include an explicit field to capture test descriptions.


### Test schema

__JSON Schema__ should be used to capture the structure of test files. `"$comment"` properties can be used within the schema for any additional documentation required.

The proposed schema is included under [test/schemas/v0/](https://github.com/unicode-org/message-format-wg/tree/b4fd5a666a02950c57f0a454f65bf16a0bf03bf4/test/schemas/v0). Its version can be incremented to v1 when the proposal is accepted.

It is important that the schema is versioned. The version number should be captured within the schema files themselves because these files may be copied and used out of the context of this repository. By using a __version directory__ and __$id property__ for the schema, we can bump a schema version by changing one directory name and updating the `$id` property in the schema file(s) to match.

Although the use of [semantic versioning](https://semver.org/) has been discussed, it is likely to be overkill for our purposes.

In order to reduce the verbosity of test files that contain multiple similar tests, the MF2 schema should include a `defaultTestProperties` property. This is an object that specifies properties to be used for every test case in the file (unless overridden in individual tests).

Default properties can be used for expected outputs as well as inputs. For example:

```jsonc
// The given locale for every test case is "en-US".
"defaultTestProperties": { "locale": "en-US" }

// The expected string output for every test case is "Hello"
// and no test cases result in an error.
"defaultTestProperties": { "exp": "Hello", "expErrors": false }
```

### Test content

#### Syntax tests

These tests evaluate the pattern `src` using the given runtime `params`. Assertions are made on the output, which can be formatted as either a single string or parts, and any resulting errors. Syntax tests are the core of the test suite.

#### Function tests

There are two types of function test:

- __Selector tests__ test the cases within a `match` statement. Testing of multiple selectors is included.
- __Formatter tests__  test the standard registry's formatters (e.g. `:number`, `:datetime`). They cover the different options that can be passed to each formatter (e.g. `offset`, `skeleton`).

As mentioned above, the behaviour of some of the default registry functions such as `:number` and `:datetime` is dependent on locale-specific data and may vary between implementations. There are special functions designed for test use only, which include `:test:select` and `:test:format` for replacing selectors and formatters respectively in the syntax tests. More information on these test functions can be found [here](https://github.com/unicode-org/message-format-wg/blob/6414b6c7d9faed6c1b4645b92b3548a8ea0ad332/test/README.md#test-functions).

#### Data model tests (optional)

There is no standard data model within the specification, which means that we cannot create mandatory data model tests.

If a particular implementation of MF2 exposes a standardized representation of [the data model](../spec/data-model/message.json), perhaps through a `mf2.toCanonicalJson();` function or similar, then we could create tests that assert against this in future.

## Alternatives Considered

### YAML test syntax

YAML has some advantages over JSON:

- It is extremely readable.
- It supports multiline strings.
- It supports comments.

However, the flexibility of the syntax means that there is a risk of introducing ambiguity into the test cases. This makes it unsuitable.


### XML test syntax

There are several advantages to writing tests in XML:

- It allows preservation of whitespace in strings, which is crucial for MF2 test cases.
- It allows literal newline characters in strings, which provides enhanced readability for multiline patterns.
- It supports a schema format, which can be used to validate test files.

XML is fairly verbose though. It is better suited to writing markup.
