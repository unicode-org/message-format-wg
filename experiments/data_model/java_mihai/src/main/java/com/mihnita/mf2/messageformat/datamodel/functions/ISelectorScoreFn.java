package com.mihnita.mf2.messageformat.datamodel.functions;

import com.mihnita.mf2.messageformat.datamodel.ISelectorMessage.ISelectorVal;

/*
A "Selector" is a kind of function (like plural, gender, select, politeName, gramar, ...)
"function name" => used to get the function from a map of registered functions (used extensible)
then take that function and call it
in: locale, parameter value, other (for example offset for plurals)
returns: "something" that has a toString, fromString, equals (what else?)

Example:
selectors [polite(user), greaterThan(count, 100)]
{
  [ true,  true] : 'Hello {user.title} {user.last}, you have a lot of followers'
  [ true, false] : 'Hello {user.title} {user.last}, you have a few followers'
  [false,  true] : 'Hello {user.first}, you have a lot followers'
  [false, false] : 'Hello {user.first}, you have a few followers'
}

The "polite" function takes a user object that might have a first name, last name, title,
and a preference to use the polite or informal adress mode.

The above would be the short version, but the {user.title} would in fact also be functions, on placeholders.
... {'user', 'userField', { field: 'title' }} {'user', 'userField', { field: 'last' }} ...

"userField" would map to a user defined function that takes an object of type user and returns a certain field.

Not sure how to represent this idea in TS (yet).
*/

//Functions used for selection
//This needs more refining.
//Should the return type be a `SelectorVal`, or maybe a Map<SelectorVal, Number>` (val => score) ?
public interface ISelectorScoreFn { // DRAFT
	int select(Object value1, ISelectorVal value2, String locale);
}
