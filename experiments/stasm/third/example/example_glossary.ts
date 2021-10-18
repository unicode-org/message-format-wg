import {test} from "tap";
import {Argument, Message, Parameter} from "../impl/model.js";
import {REGISTRY_FORMAT} from "../impl/registry.js";
import {
	formatMessage,
	Formattable,
	FormattableString,
	FormattingContext,
	formatToParts,
	RuntimeString,
} from "../impl/runtime.js";
import {get_term} from "./glossary.js";

REGISTRY_FORMAT["NOUN"] = function get_noun(
	ctx: FormattingContext,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): Formattable {
	let noun_name = ctx.toRuntimeValue(args[0]);
	if (!(noun_name instanceof RuntimeString)) {
		throw new TypeError();
	}

	let noun = get_term(ctx.locale, noun_name.value);
	let value = noun["singular_nominative"].toString();

	let capitalized = ctx.toRuntimeValue(opts["CAPITALIZED"]);
	if (capitalized.value) {
		return new FormattableString(value[0].toUpperCase() + value.slice(1));
	}

	return new FormattableString(value);
};

REGISTRY_FORMAT["ADJECTIVE"] = function get_adjective(
	ctx: FormattingContext,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): Formattable {
	let adj_name = ctx.toRuntimeValue(args[0]);
	if (!(adj_name instanceof RuntimeString)) {
		throw new TypeError();
	}

	switch (ctx.locale) {
		case "en": {
			let adjective = get_term(ctx.locale, adj_name.value);
			return new FormattableString(adjective["nominative"].toString());
		}
		case "pl": {
			let noun_name = ctx.toRuntimeValue(opts["ACCORD_WITH"]);
			if (!(noun_name instanceof RuntimeString)) {
				throw new TypeError();
			}

			let noun = get_term(ctx.locale, noun_name.value);
			let adjective = get_term(ctx.locale, adj_name.value);
			return new FormattableString(adjective["singular_" + noun["gender"]].toString());
		}
		default:
			return new FormattableString(adj_name.toString());
	}
};

REGISTRY_FORMAT["ACTOR"] = function get_noun(
	ctx: FormattingContext,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): Formattable {
	let name = ctx.toRuntimeValue(args[0]);
	if (!(name instanceof RuntimeString)) {
		throw new TypeError();
	}

	let term = get_term(ctx.locale, "actor_" + name.value);

	switch (ctx.locale) {
		case "en": {
			let value: string;
			if (ctx.toRuntimeValue(opts["DEFINITE"]).value) {
				value = term["definite"].toString();
			} else if (ctx.toRuntimeValue(opts["INDEFINITE"]).value) {
				value = term["indefinite"].toString();
			} else {
				value = term["bare"].toString();
			}

			if (ctx.toRuntimeValue(opts["CAPITALIZED"]).value) {
				return new FormattableString(value[0].toUpperCase() + value.slice(1));
			}

			return new FormattableString(value);
		}
		case "pl": {
			let declension = ctx.toRuntimeValue(opts["CASE"]);
			if (!(declension instanceof RuntimeString)) {
				throw new TypeError();
			}

			let value = term[declension.value].toString();

			let capitalized = ctx.toRuntimeValue(opts["CAPITALIZED"]);
			if (capitalized.value) {
				return new FormattableString(value[0].toUpperCase() + value.slice(1));
			}

			return new FormattableString(value);
		}
		default:
			return new FormattableString(name.value);
	}
};

test("NOUN is ADJECTIVE (English)", (tap) => {
	let message: Message = {
		lang: "en",
		id: "accord",
		phrases: {},
		selectors: [],
		variants: [
			{
				keys: [],
				value: [
					{type: "StringLiteral", value: "The "},
					{
						type: "FunctionCall",
						name: "NOUN",
						args: [{type: "VariableReference", name: "item"}],
						opts: {},
					},
					{type: "StringLiteral", value: " is "},
					{
						type: "FunctionCall",
						name: "ADJECTIVE",
						args: [{type: "VariableReference", name: "color"}],
						opts: {},
					},
					{type: "StringLiteral", value: "."},
				],
			},
		],
	};

	tap.equal(
		formatMessage(message, {
			item: new FormattableString("t-shirt"),
			color: new FormattableString("red"),
		}),
		"The T-shirt is red."
	);

	tap.same(
		formatToParts(message, {
			item: new FormattableString("t-shirt"),
			color: new FormattableString("red"),
		}),
		[
			{type: "literal", value: "The "},
			{type: "literal", value: "T-shirt"},
			{type: "literal", value: " is "},
			{type: "literal", value: "red"},
			{type: "literal", value: "."},
		]
	);

	tap.end();
});

test("NOUN is ADJECTIVE (Polish; requires according the gender of the adjective)", (tap) => {
	let message: Message = {
		lang: "pl",
		id: "accord",
		phrases: {},
		selectors: [],
		variants: [
			{
				keys: [],
				value: [
					{
						type: "FunctionCall",
						name: "NOUN",
						args: [{type: "VariableReference", name: "item"}],
						opts: {
							CAPITALIZED: {type: "BooleanLiteral", value: true},
						},
					},
					{type: "StringLiteral", value: " jest "},
					{
						type: "FunctionCall",
						name: "ADJECTIVE",
						args: [{type: "VariableReference", name: "color"}],
						opts: {
							ACCORD_WITH: {type: "VariableReference", name: "item"},
						},
					},
					{type: "StringLiteral", value: "."},
				],
			},
		],
	};

	tap.equal(
		formatMessage(message, {
			item: new FormattableString("t-shirt"),
			color: new FormattableString("red"),
		}),
		"Tiszert jest czerwony."
	);

	tap.same(
		formatToParts(message, {
			item: new FormattableString("t-shirt"),
			color: new FormattableString("red"),
		}),
		[
			{type: "literal", value: "Tiszert"},
			{type: "literal", value: " jest "},
			{type: "literal", value: "czerwony"},
			{type: "literal", value: "."},
		]
	);

	tap.end();
});

test("Subject verb OBJECT (English)", (tap) => {
	let message: Message = {
		lang: "en",
		id: "you-see",
		phrases: {},
		selectors: [],
		variants: [
			{
				keys: [],
				value: [
					{type: "StringLiteral", value: "You see "},
					{
						type: "FunctionCall",
						name: "ACTOR",
						args: [{type: "VariableReference", name: "monster"}],
						opts: {
							INDEFINITE: {type: "BooleanLiteral", value: true},
						},
					},
					{type: "StringLiteral", value: "!"},
				],
			},
		],
	};

	tap.equal(
		formatMessage(message, {
			monster: new FormattableString("dinosaur"),
		}),
		"You see a dinosaur!"
	);

	tap.same(
		formatToParts(message, {
			monster: new FormattableString("dinosaur"),
		}),
		[
			{type: "literal", value: "You see "},
			{type: "literal", value: "a dinosaur"},
			{type: "literal", value: "!"},
		]
	);

	tap.end();
});

test("Subject verb OBJECT (Polish; requires the accusative case)", (tap) => {
	let message: Message = {
		lang: "pl",
		id: "you-see",
		phrases: {},
		selectors: [],
		variants: [
			{
				keys: [],
				value: [
					{type: "StringLiteral", value: "Widzisz "},
					{
						type: "FunctionCall",
						name: "ACTOR",
						args: [{type: "VariableReference", name: "monster"}],
						opts: {
							CASE: {type: "StringLiteral", value: "accusative"},
						},
					},
					{type: "StringLiteral", value: "!"},
				],
			},
		],
	};

	tap.equal(
		formatMessage(message, {
			monster: new FormattableString("dinosaur"),
		}),
		"Widzisz dinozaura!"
	);

	tap.same(
		formatToParts(message, {
			monster: new FormattableString("dinosaur"),
		}),
		[
			{type: "literal", value: "Widzisz "},
			{type: "literal", value: "dinozaura"},
			{type: "literal", value: "!"},
		]
	);

	tap.end();
});

test("SUBJECT verb (English)", (tap) => {
	let message: Message = {
		lang: "en",
		id: "they-wave",
		phrases: {},
		selectors: [],
		variants: [
			{
				keys: [],
				value: [
					{
						type: "FunctionCall",
						name: "ACTOR",
						args: [{type: "VariableReference", name: "monster"}],
						opts: {
							DEFINITE: {type: "BooleanLiteral", value: true},
							CAPITALIZED: {type: "BooleanLiteral", value: true},
						},
					},
					{type: "StringLiteral", value: " waves at you!"},
				],
			},
		],
	};

	tap.equal(
		formatMessage(message, {
			monster: new FormattableString("ogre"),
		}),
		"The ogre waves at you!"
	);

	tap.same(
		formatToParts(message, {
			monster: new FormattableString("ogre"),
		}),
		[
			{type: "literal", value: "The ogre"},
			{type: "literal", value: " waves at you!"},
		]
	);

	tap.end();
});

test("SUBJECT verb (Polish)", (tap) => {
	let message: Message = {
		lang: "pl",
		id: "they-wave",
		phrases: {},
		selectors: [],
		variants: [
			{
				keys: [],
				value: [
					{
						type: "FunctionCall",
						name: "ACTOR",
						args: [{type: "VariableReference", name: "monster"}],
						opts: {
							CASE: {type: "StringLiteral", value: "nominative"},
							CAPITALIZED: {type: "BooleanLiteral", value: true},
						},
					},
					{type: "StringLiteral", value: " macha do ciebie!"},
				],
			},
		],
	};

	tap.equal(
		formatMessage(message, {
			monster: new FormattableString("ogre"),
		}),
		"Ogr macha do ciebie!"
	);

	tap.same(
		formatToParts(message, {
			monster: new FormattableString("ogre"),
		}),
		[
			{type: "literal", value: "Ogr"},
			{type: "literal", value: " macha do ciebie!"},
		]
	);

	tap.end();
});
