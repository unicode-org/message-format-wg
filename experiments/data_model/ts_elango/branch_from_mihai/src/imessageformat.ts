export interface IMessage {
	id: string;
	locale: string;
	format(parameters: Map<string, unknown>): string;
}

export interface ISimpleMessage extends IMessage {
	parts: IPart[];
}

export interface ISelectorMessage extends IMessage {
	switches: ISwitch[];
	// The order matters. So we need a "special map" that keeps the order
	messages: Map<ICase[], ISimpleMessage>;
}

/*
A "Switch" is a kind of function (like plural, gender, select, politeName, gramar, ...)
"function name" => used to get the function from a map of registered functions (used extensible)
then take that function and call it
in: locale, parameter value, other (for example offset for plurals)
returns: "something" that has a toString, fromString, equals (what else?)

Example:
switches [polite(user), greaterThan(count, 100)]
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

export interface ISwitch {
	name: string; // the variable to switch on
	type: string; // plural, ordinal, gender, select, ..
}

export type ICase = string | number;

export type IPart = IPlainText | IPlaceholder;

export interface IPlainText {
	value: string;
}

/** This also has a function associated with it. */
export interface IPlaceholder {
	name: string;
	type: string;
	flags: Map<string, string>;
	// I don't think we want this in the data model, but keeping it for now
	format(locale: string, parameters: Map<string, unknown>): string;
}
