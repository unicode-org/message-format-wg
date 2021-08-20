import {FormattingContext} from "../impl/context.js";
import {Argument, Message, Parameter} from "../impl/model.js";
import {REGISTRY} from "../impl/registry.js";
import {formatMessage, formatToParts, StringValue} from "../impl/runtime.js";
import {get_term} from "./glossary.js";

REGISTRY["NOUN"] = function get_noun(
	ctx: FormattingContext,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): StringValue {
	let noun_name = ctx.toRuntimeValue(args[0]);
	if (!(noun_name instanceof StringValue)) {
		throw new TypeError();
	}

	let noun = get_term(ctx.locale, noun_name.value);
	let value = noun["singular_nominative"].toString();

	let capitalized = ctx.toRuntimeValue(opts["CAPITALIZED"]);
	if (capitalized.value) {
		return new StringValue(value[0].toUpperCase() + value.slice(1));
	}

	return new StringValue(value);
};

REGISTRY["ADJECTIVE"] = function get_adjective(
	ctx: FormattingContext,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): StringValue {
	let adj_name = ctx.toRuntimeValue(args[0]);
	if (!(adj_name instanceof StringValue)) {
		throw new TypeError();
	}

	switch (ctx.locale) {
		case "en": {
			let adjective = get_term(ctx.locale, adj_name.value);
			return new StringValue(adjective["nominative"].toString());
		}
		case "pl": {
			let noun_name = ctx.toRuntimeValue(opts["ACCORD_WITH"]);
			if (!(noun_name instanceof StringValue)) {
				throw new TypeError();
			}

			let noun = get_term(ctx.locale, noun_name.value);
			let adjective = get_term(ctx.locale, adj_name.value);
			return new StringValue(adjective["singular_" + noun["gender"]].toString());
		}
		default:
			return new StringValue(adj_name.toString());
	}
};

REGISTRY["ACTOR"] = function get_noun(
	ctx: FormattingContext,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): StringValue {
	let name = ctx.toRuntimeValue(args[0]);
	if (!(name instanceof StringValue)) {
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
				return new StringValue(value[0].toUpperCase() + value.slice(1));
			}

			return new StringValue(value);
		}
		case "pl": {
			let declension = ctx.toRuntimeValue(opts["CASE"]);
			if (!(declension instanceof StringValue)) {
				throw new TypeError();
			}

			let value = term[declension.value].toString();

			let capitalized = ctx.toRuntimeValue(opts["CAPITALIZED"]);
			if (capitalized.value) {
				return new StringValue(value[0].toUpperCase() + value.slice(1));
			}

			return new StringValue(value);
		}
		default:
			return new StringValue(name.value);
	}
};

console.log("==== English ====");

{
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
	console.log(
		formatMessage(message, {
			item: new StringValue("t-shirt"),
			color: new StringValue("red"),
		})
	);

	console.log(
		Array.of(
			...formatToParts(message, {
				item: new StringValue("t-shirt"),
				color: new StringValue("red"),
			})
		)
	);
}

{
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
	console.log(
		formatMessage(message, {
			monster: new StringValue("dinosaur"),
		})
	);
}

{
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
	console.log(
		formatMessage(message, {
			monster: new StringValue("ogre"),
		})
	);
}

console.log("==== polski ====");

{
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
	console.log(
		formatMessage(message, {
			item: new StringValue("t-shirt"),
			color: new StringValue("red"),
		})
	);
}

{
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
	console.log(
		formatMessage(message, {
			monster: new StringValue("dinosaur"),
		})
	);
}

{
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

	console.log(
		formatMessage(message, {
			monster: new StringValue("ogre"),
		})
	);
}
