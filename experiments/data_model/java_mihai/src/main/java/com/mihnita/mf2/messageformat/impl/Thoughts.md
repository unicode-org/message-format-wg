

Usage style (pseudo-code):
```
mf = new MessageFormat(locale, dataModel);
mf.format(parameters); => String
mf.formatToParts(parameters); => TBD
```

Or statics, does not matter right now.

But beyond the data model I think we need the following extra "plumbing" to make things work:

1. mapping of function names => placeholder formatting "callables" (stuff that can be called: functions, classes + methods, lambda, whatever)
2. mapping of function names => selector "callables" (functions, classes, lambda, whatever)
3. "something" to load a message given a message id. Think "resource manager"
4. "something" to store variables (so that we can use variable references)

Item 4 is kind of useless / syntactic sugar. There is no fundamental difference between that and parameters.

Example (pseudo-code, Java-like):

```
String userName = "John";
Date expirationDate = ...;
Map<String, Object> variableRef = { "userName": userName };
Map<String, Object> parameters = { "expDate": expirationDate };
mf.format("Hello {$userName}, your card expires on {expDate}", parameters);
```
and:
```
String userName = "John";
Date expirationDate = ...;
Map<String, Object> parameters = { "userName": userName, "expDate": expirationDate };
mf.format("Hello {userName}, your card expires on {expDate}", parameters);
```

It is technically the same thing, just syntactic sugar, with pros and cons.

The main difference would be scope. Variables would feel somewhat "global", you don't have to pass them explicitely to each message formatter.
