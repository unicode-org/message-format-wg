# Message Selection

Message selection is the process of identifying a single message from a set of Message Resources,
given a Resource identifier and a key path from the root of that Resource.
While this process MAY be used by an implementation's API
when initially selecting a message for formatting,
it MUST be used when resolving a MessageRef pattern element.

As an implementation may use a different internal representation of messages than Message Resources,
Message Selection is presented here in terms of a minimal shared interface, MessageResourceReader.
The construction and internal behaviour of its methods are presented based on Message Resources.

```ts
interface MessageResourceReader {
  getId(): string
  getMessage(path: string[]): Message | undefined
}
```

## MessageResourceReader Methods

The methods of a MessageResourceReader MUST be synchronous,
to ensure that message formatting can be fast.
If some asynchrony is needed e.g. due to loading or parsing source files,
This asynchrony should be handled before or during
the construction of a MessageResourceReader instance.

### MessageResourceReader#getId()

The getId method is called with no arguments.
It returns the string identifier of the current message resource.

With an implementation constructed with CreateMessageResourceReader(_resource_),
the following steps are taken:

1. Let _reader_ be the **this** value.
1. Let _resource_ be _reader_.\[\[Data]].
1. Return _resource_.id.

### MessageResourceReader#getMessage(_path_)

The getMessage method is called with an argument
_path_ (which must be a list of strings).
It returns either a Message object corresponding to the _path_,
or **undefined** if not such Message exists.

With an implementation constructed with CreateMessageResourceReader(_resource_),
the following steps are taken:

1. If _path_ is an empty list,
   1. Return **undefined**.
1. Let _reader_ be the **this** value.
1. Let _msg_ be _reader_.\[\[Data]].
1. For each string _key_ of _path_, do:
   1. If _msg_ is **undefined** or _msg_.type is **"message"** or **"select"**, then
      1. Return **undefined**.
   1. Let _entries_ be _msg_.entries.
   1. Set _msg_ to the value of the property _key_ in _entries_ or
      **undefined** if no such property exists.
1. If _msg_ is not **undefined** and _msg_.type is **"message"** or **"select"**, then
   1. Return _msg_.
1. Else,
   1. Return **undefined**.

## Abstract Operations

### CreateMessageResourceReader(_resource_)

The CreateMessageResourceReader abstract operation is called with an argument
_resource_ (which must be a Resource object).
It returns a MessageResourceReader object.
The following steps are taken:

1. Let _reader_ be a new MessageResourceReader instance with
   an internal slot \[\[Data]].
1. Set _reader_.\[\[Data]] as _resource_.
1. Return _reader_.

### GetMessage(_readers_, _resId_, _path_)

The GetMessage abstract operation is called with arguments
_readers_ (which must be a list of MessageResourceReader objects that allows for synchronous iteration),
_resId_ (which must be a string), and
_path_ (which must be a list of strings).
It returns a Message object or **undefined**.

GetMessage will return the first Message that it finds in a Resource
with the given identifier that contains an entry at its full key path.
In other words, the order of resources determines priority,
if multiple Resources use the same identifier and
each provide a message at the same key path.

The following steps are taken:

1. For each _reader_ of _readers_, do:
   1. Let _id_ be the result of calling _reader_.getId().
   1. If _id_ and _resId_ are equal, then
      1. Let _msg_ be the result of calling _reader_.getMessage(_path_).
      1. If _msg_ is not **undefined**, then
         1. Return _msg_.
1. Return **undefined**.

