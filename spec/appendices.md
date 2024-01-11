# DRAFT Appendices

## Security Considerations

MessageFormat 2.0 _patterns_ are meant to allow a _message_ to include any string value
which users might normally wish to use in their environment.
Programming languages and other environments vary in what characters are permitted
to appear in a valid string.
In many cases, certain types of characters, such as invisible control characters,
require escaping by these host formats.
In other cases, strings are not permitted to contain certain characters at all.
Since _messages_ are subject to the restrictions and limitations of their 
host environments, their serializations and resource formats,
that might be sufficient to prevent most problems.
However, MessageFormat itself does not supply such a restriction.

MessageFormat _messages_ permit nearly all Unicode code points,
with the exception of surrogates, to appear in a _pattern_.
This means that it can be possible for a _message_ to contain invisible unquoted
control characters that abnormally affect the display of the _message_
but do not generate errors from MessageFormat parsers or processing APIs.

Bidirectional text containing right-to-left characters (such as used for Arabic or Hebrew) 
also poses a potential source of confusion for users. 
Since MessageFormat 2.0's syntax makes use of 
keywords and symbols that are left-to-right or consist of neutral characters 
(including characters subject to mirroring under the Unicode Bidirectional Algorithm), 
it is possible to create messages that,
when displayed in various contexts, have a misleading appearance
or are difficult to parse visually.

For more information, see \[[UTS#55](https://unicode.org/reports/tr55/)\] 
<cite>Unicode Source Code Handling</cite>.
