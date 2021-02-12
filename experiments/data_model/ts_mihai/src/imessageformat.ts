export interface IMeta { // xliff:notes
	comment: string;
	// Should be able to attach it to the main types (group of messages, message, placeholder, maybe plain_text?)
	// TBD what exactly we put here
	// But we would probably have things like
	//   - comments (with at lease category)
	//   - examples
	//   - restrictions (width, storage size, charset, see https://www.w3.org/TR/its20/)
	//   - links to screenshots, demos, help, etc (or even "embedded" screenshots?)

	// Beneficiaries of the meta:
	//   - translators & translation tools (think validation)
	//   - developers, dev tools (think lint)
	//   - in general dropped from runtime (at compile time, or ignored when doing the format)
}

export interface IMessageGroup { // xliff:group
	id: string;
	locale: string;
	messages: IMessage[];
}

export interface IMessage { // xliff:unit
	id: string;
	locale: string;
}

export interface ISimpleMessage extends IMessage { // xliff:unit
	parts: IPart[];
}

// The order matters.
// So we need a "special map" that keeps the insertion order.
export type OrderedMap<K, V> = Map<K, V>;

export interface ISelectorMessage extends IMessage { // Xliff spec need extesion. Proposal in the works.
	selectorArgs: ISelectorArg[];
	messages: OrderedMap<ISelectorVal[], ISimpleMessage>;
}

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

export interface ISelectorArg { // Xliff spec need extesion. Proposal in the works.
	name: string; // the variable to select on
	selector_name: string; // plural, ordinal, gender, select, ..
}

export type ISelectorVal = string | number; // Xliff spec need extesion. Proposal in the works.

export type IPart = string | IPlainText | IPlaceholder;

export interface IPlainText { // we can attach some "meta" to it, if we want
	value: string;
}

/** This also has a function associated with it. */
export interface IPlaceholder { // xliff: ph, pc, sc, ec. No cp, mrk, sm, em
	// Think `{expDate, date, ::dMMMy}` in ICU MessageFormat
	name: string; // icu:`expDate` ::: The name of the thing I format. "The thing": in param, evn, xref
	formatter_name: string; // (function_name? formatter_name?) icu:`date` ::: What name of the formatter to use. Registry.
	options: Map<string, string>; //  icu:`::dMMMy` ::: How to format
}

// === Some function signatures. Not really part of the data model.
// Also, need updating to return something other than `string`
// (think format-to-parts, or tts info)

// Formats a message
export interface IMessageFormatter {
	format(message: IMessage, parameters: Map<string, unknown>): string;
}

// Formats a placeholder
export interface IPlaceholderFormatter {
	(ph: IPlaceholder, locale: string, parameters: Map<string, unknown>): string;
}

// Functions used for selection
// This needs more refining.
// Should the return type be a `SelectorVal`, or maybe a map `{"val": SelectorVal, "score": number}` ?
export interface ISelectorScoreFn { // DRAFT
	(value1: unknown, value2: unknown, locale: string): number;
}

/*
Would be nice to be able to "define" placeholders for reuse.

```
   define cf = {count, number, {minFraction: 2, maxFraction: 4}}
   define ed = {expDate, date, {::dMMMy}}
   ... {cf, plural,
	      =1 {You have {cf} dollar left on your card, expiring on {ed}}
	     few {You have {cf} dollars left on your card, expiring on {ed}}
	   other {You have {cf} dollars left on your card, expiring on {ed}}
   } ...
```

Passing `cf` give enough info to the selector on how things are formatted, because it matters (`1 dollar` vs. `1.00 dollars`)
The plural selector function can be smart enough to look at setting (min/max Fraction) to make the plural decision,
without doing the formatting proper.

Another benefit is consistency between the value used for selection and the one showing to the user.
And also consistency across message variants (I can use `{cf}` or `{ed}` without repeating all the options, skeletons, etc.)
*/
