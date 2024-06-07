# Error Handling

Status: **Proposed**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@echeran</dd>
		<dt>First proposed</dt>
		<dd>2024-06-02</dd>
        <dt>Issues</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/issues/782">#782</a></dd>
		<dt>Pull Requests</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/795">#795</a></dd>
	</dl>
</details>

## Objective

Decide whether and what implementations "MUST" / "SHOULD" / "MAY" perform after a runtime error, regarding:

1. information about error(s)
    - including, if relevant, the minimum number of errors for which such information is expected
1. a fallback representation of the message

## Background

In practice,
runtime errors happen when formatting messages.
It is useful to provide information about any errors back to the callsite.
It is useful to the end user to provide a best effort fallback representation of the message.
Specifying the behavior in such cases promotes consistent results across conformant implementations.

However, implementations of MessageFormat 2.0 will be faced with different constraints due to various reasons:

* Programming language: the language of the implementation informs idiomatic patterns of error handling.
In Java, errors are thrown and subsequently caught in `try...catch` block.
In Rust, fallible callsites (those which can return errors) should return a `Result<T, Err>` monad. 
In both languages, built-in error handling assumes a singular error.
* Environment constriants: as mentioned in [feedback from ICU4X](https://github.com/unicode-org/message-format-wg/issues/782#issuecomment-2103177417),
ICU4X operates in low resource environments for which returning at most 1 error is desirable
because returning more than 1 error would require heap allocation.
* Programming conventions and idioms: in [feedback from ICU-TC](https://docs.google.com/document/d/11yJUWedBIpmq-YNSqqDfgUxcREmlvV0NskYganXkQHA/edit#bookmark=id.lx4ls9eelh99),
they found over the 25 years of maintaining the library that there was more cost than benefit in additionally providing error information with a default best effort return value compared to just returning the default best effort value.
The additional constraint in ICU4C's C++ style to return an error code rather than throwing errors using the STL further complicates the usefulness and likelihood to be used correctly during nested calls.

## Proposed Design

The following spec text is proposed:

> In all cases, when encountering an error,
> a message formatter MUST be able to signal an error or errors.
> It MAY also provide the appropriate fallback representation of the _message_ defined
> in this specification.

This solution requires implementations to be able to signal an error occurred,
which can be accomplished in different ways. Ex:

* an API that throws or returns an Error object when encountering an error
* an API that includes a read/write `ErrorCode` argument 
* two APIs, a permissive one that always returns a best-effort formatted result
and a stricter one that throws or returns an Error object when encountering an error
* an API that always returns a best-effort formatted result
and a global `boolean` values

This does not give implementations full freedom to return _nothing_ or some other behavior.

## Alternatives Considered

### Current spec: require information from error(s) and a representative best effort message

The current spec text says:

> In all cases, when encountering a runtime error,
> a message formatter MUST provide some representation of the message.
> An informative error or errors MUST also be separately provided.

This alternative places constraints on implementations to provide multiple avenues of useful information (to the callsite and user).

This alternative establishes constraints that would contravene the constraints that exist in projects that have implemented MF 2.0 (or likely will soon), based on:
* programming language idioms/constraints
* execution environment constraints
* experience-based programming guidelines

### Allow implementations to determine all details

> When encountering an error during formatting,
> a message formatter MAY provide some representation of the message,
> or it MAY provide an informative error or errors.
> An implementation MAY provide both.

This alternative places no expectations on implementations,
which supports the constraints we know now,
as well as any possible constraints in the future
(ex: new programming languages, new execution environments).

This alternative does not assume or assert that some type of useful information
(error info, representative message)
will be possible and should be returned.

### Alternate wording

> When an error is encountered during formatting,
> a message formatter can provide an informative error (or errors)
> or some representation of the message or both.