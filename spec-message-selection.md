# Message Selection

Message selection is the process of identifying a single message from a set of Message Resources,
given a Resource identifier and a key path from the root of that Resource.
While this process MAY be used by an implementation's API
when initially selecting a message for formatting,
it MUST be used when resolving a MessageRef pattern element.

Message selection is presented here in terms of an abstract operation GetMessage,
which takes a list of resources as an argument.
If an implementation uses a different internal representation of messages than Message Resources,
it MUST provide a description of how the messages in its representation
would map to a Message Resource object.

The execution of the GetMessage operation MUST be synchronous,
to ensure that message formatting is guaranteed to be a synchronous operation itself.
If some asynchrony is needed e.g. due to loading or parsing source files,
This asynchrony should be handled before or during
the construction of a Message Resource.

## GetMessage(_resources_, _resId_, _path_)

The GetMessage abstract operation is called with arguments
_resources_ (which must be a list of MessageResource objects that allows for synchronous iteration),
_resId_ (which must be a string), and
_path_ (which must be a list of strings).
It returns a Message object or **undefined**.

GetMessage will return the first Message that it finds in a Resource
with the given identifier that contains an entry at its full key path.
In other words, the order of resources determines priority,
if multiple Resources use the same identifier and
each provide a message at the same key path.

The following steps are taken:

1. For each _resource_ of _resources_, do:
   1. Let _id_ be the string value of the property **"id"** of _resource_.
   1. If _id_ and _resId_ are equal, then
      1. Let _msg_ be the result of calling _reader_.getMessage(_path_).
      1. If _msg_ is not **undefined**, then
         1. Return _msg_.
1. Return **undefined**.

## GetMessageFromResource(_resource_, _path_)

The getMessage method is called with arguments
_resource_ (which must be a MessageResource object),
_path_ (which must be a list of strings).
It returns either a Message object corresponding to the _path_,
or **undefined** if not such Message exists.

The following steps are taken:

1. If _path_ is an empty list,
   1. Return **undefined**.
1. Let _msg_ be _resource_.
1. For each string _key_ of _path_, do:
   1. If _msg_ is **undefined**, then
      1. Return **undefined**.
   1. Let _type_ be the string value of the property **"type"** of _msg_.
   1. If _type_ is **"message"** or **"select"**, then
      1. Return **undefined**.
   1. Let _entries_ be the value of the property **"entries"** of _msg_.
   1. Set _msg_ to the value of the property _key_ in _entries_ or
      **undefined** if no such property exists.
1. If _msg_ is **undefined**, then
   1. Return **undefined**.
1. Let _type_ be the string value of the property **"type"** of _msg_.
1. If _type_ is **"message"** or **"select"**, then
   1. Return _msg_.
1. Else,
   1. Return **undefined**.
