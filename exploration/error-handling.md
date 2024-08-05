# Error Handling

Status: **Accepted**

<details>
	<summary>Metadata</summary>
	<dl>
		<dt>Contributors</dt>
		<dd>@echeran</dd>
		<dt>First proposed</dt>
		<dd>2024-06-02</dd>
        <dt>Issues</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/issues/782">#782</a></dd>
		<dd><a href="https://github.com/unicode-org/message-format-wg/issues/830">#830</a></dd>
		<dd><a href="https://github.com/unicode-org/message-format-wg/issues/831">#831</a></dd>
		<dt>Pull Requests</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/795">#795</a></dd>
		<dd><a href="https://github.com/unicode-org/message-format-wg/pull/804">#804</a></dd>
		<dt>Meeting Notes</dt>
		<dd><a href="https://github.com/unicode-org/message-format-wg/blob/main/meetings/2024/notes-2024-05-06.md">2024-05-06</a></dd>
		<dd><a href="https://github.com/unicode-org/message-format-wg/blob/main/meetings/2024/notes-2024-05-13.md">2024-05-13</a></dd>
		<dd><a href="https://github.com/unicode-org/message-format-wg/blob/main/meetings/2024/notes-2024-05-20.md">2024-05-20</a></dd>
		<dd><a href="https://github.com/unicode-org/message-format-wg/blob/main/meetings/2024/notes-2024-07-15.md">2024-07-15</a></dd>
		<dd><a href="https://github.com/unicode-org/message-format-wg/blob/main/meetings/2024/notes-2024-07-22.md">2024-07-22</a></dd>
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
The additional constraint in ICU4C's C++ style to return an error code rather than throwing errors using the STL further complicates the usefulness and likelihood to be used correctly by developers, especially during nested calls.

> [!NOTE]
> The wording in this document uses the word "signal" in regards to providing
> information about an error rather than "return" or "emit" when referring to
> a requirement that an implementation must at least indicate that an error has
> occurred.
> The word "signal" better accomodates more alternatives in the solution space
> like those that only choose to indicate that an error occurred,
> while still including those that additionally prefer to return the error
> itself as an error object.
> (By contrast, "return an error" implies that an error object will be thrown or
> returned, and "emit an error" is ambiguous as to what is or isn't performed.)
## Use Cases

As a software developer, I want message formatting calls to signal runtime errors
in a manner consistent with my programming language/environment.
I would like error signals to include diagnostic information that allows me to debug errors.

As a software developer, I sometimes need to be able to emit a formatted message
even if a runtime error has occurred.

As a software developer, I sometimes want to avoid "fatal" error signals,
such as might occur due to unconstrained inputs,
errors in translation of the message,
or other reasons outside my control.
For example, in Java, throwing an Exception is a common means of signaling an error.
However, `java.text.NumberFormat` provide both throwing and non-throwing
`parse` methods to allow developers to avoid a "fatal" throw of `ParseException`
(if the exception were uncaught).

As a MessageFormat implementer, I want to be able to signal errors in an idiomatic way
for my language and still be conformant with MF2 requirements.

## Accepted Design

The following design was selected in #830.

### MUST signal errors and MUST provide fallback

* Implementations MUST provide a mechanism for signaling errors. There is no specific requirement for what form signaling an error takes.
* Implementations MUST provide a mechanism for getting a fallback representation of a message that produces a formatting or selection error. Note that this can be entirely separate from the first requirement.
* An implementation is not conformant unless it provides access to both behaviors. It is compliant to do both in a single formatting attempt.

> In all cases, when encountering an error,
> a message formatter MUST be able to signal an error or errors.
> It MUST also provide the appropriate fallback representation of the _message_ defined
> in this specification.

This alternative requires that an implementation provide both an error signal
and a means of accessing a "best-effort" fallback message.
This slightly relaxes the requirement of "returning" an error
(to allow a locally-appropriate signal of the error).

Under this alternative, implementations can be conformant by providing
two separate formatting methods or functions,
one of which returns the fallback string and one of which signals the error.

Similar to the current spec text,
this alternative requires implementations to provide useful information:
both a signal that an error occurred and a best effort message.
A downside to this alternative is that these requirements together assume that
all implementations will want to pay the cost of constructing a representative mesage
after the occurrence of an error.

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

For example, in ICU, 
[the suggested practice](https://docs.google.com/document/d/11yJUWedBIpmq-YNSqqDfgUxcREmlvV0NskYganXkQHA/edit#bookmark=id.lx4ls9eelh99)
is to avoid additionally returning optional error codes when providing best-effort formatted results.

### MUST signal errors and SHOULD provide fallback

* Implementations MUST provide a mechanism for signaling errors. There is no specific requirement for what form signaling an error takes.
* Implementations SHOULD provide a mechanism for getting a fallback representation of a message that produces a formatting or selection error. Note that this can be entirely separate from the first requirement.
* Implementations are conformant if they only signal errors.

###  SHOULD signal errors and MUST provide fallback

* Implementations SHOULD provide a mechanism for signaling errors. There is no specific requirement for what form signaling an error takes.
* Implementations MUST provide a mechanism for getting a fallback representation of a message that produces a formatting or selection error. Note that this can be entirely separate from the first requirement.
* Implementations are conformant if they only provide a fallback representation of a message.


### Error handling is not a normative requirement

* Implementations are not required by MF2 to signal errors or to provide access to a fallback representation.
    - The specification provides guidance on error conditions; on what error types exist; and what the fallback representation is.

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