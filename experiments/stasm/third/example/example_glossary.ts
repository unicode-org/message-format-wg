import {StringValue} from "../messageformat2/runtime.js";
import {formatMessage} from "../messageformat2/index.js";
import {REGISTRY} from "../messageformat2/registry.js";
import {FormattingContext} from "../messageformat2/runtime.js";
import {get_term} from "./glossary.js";
import {Argument, Message, Parameter} from "../messageformat2/model.js";

REGISTRY["NOUN"] = function get_noun(
	ctx: FormattingContext,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): string {
	let noun_name = ctx.toRuntimeValue(args[0]);
	if (!(noun_name instanceof StringValue)) {
		throw new TypeError();
	}

	let noun = get_term(ctx.locale, noun_name.value);
	let value = noun["singular_nominative"].toString();

	let capitalized = ctx.toRuntimeValue(opts["CAPITALIZED"]);
	if (capitalized.value) {
		return value[0].toUpperCase() + value.slice(1);
	}

	return value;
};

REGISTRY["ADJECTIVE"] = function get_adjective(
	ctx: FormattingContext,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): string {
	let adj_name = ctx.toRuntimeValue(args[0]);
	if (!(adj_name instanceof StringValue)) {
		throw new TypeError();
	}

	switch (ctx.locale) {
		case "en": {
			let adjective = get_term(ctx.locale, adj_name.value);
			return adjective["nominative"].toString();
		}
		case "pl": {
			let noun_name = ctx.toRuntimeValue(opts["ACCORD_WITH"]);
			if (!(noun_name instanceof StringValue)) {
				throw new TypeError();
			}

			let noun = get_term(ctx.locale, noun_name.value);
			let adjective = get_term(ctx.locale, adj_name.value);
			return adjective["singular_" + noun["gender"]].toString();
		}
		default:
			return adj_name.toString();
	}
};

REGISTRY["ACTOR"] = function get_noun(
	ctx: FormattingContext,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): string {
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
				return value[0].toUpperCase() + value.slice(1);
			}

			return value;
		}
		case "pl": {
			let declension = ctx.toRuntimeValue(opts["CASE"]);
			if (!(declension instanceof StringValue)) {
				throw new TypeError();
			}

			let value = term[declension.value].toString();

			let capitalized = ctx.toRuntimeValue(opts["CAPITALIZED"]);
			if (capitalized.value) {
				return value[0].toUpperCase() + value.slice(1);
			}

			return value;
		}
		default:
			return name.value;
	}
};

console.log("==== English ====");

{
	let message: Message = {
		type: "Message",
		id: "accord",
		phrases: {},
		selectors: [{expr: null, default: {type: "StringLiteral", value: "default"}}],
		variants: [
			{
				keys: [{type: "StringLiteral", value: "default"}],
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
		formatMessage("en", message, {
			item: new StringValue("t-shirt"),
			color: new StringValue("red"),
		})
	);
}

{
	let message: Message = {
		type: "Message",
		id: "you-see",
		phrases: {},
		selectors: [{expr: null, default: {type: "StringLiteral", value: "default"}}],
		variants: [
			{
				keys: [{type: "StringLiteral", value: "default"}],
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
		formatMessage("en", message, {
			monster: new StringValue("dinosaur"),
		})
	);
}

{
	let message: Message = {
		type: "Message",
		id: "they-wave",
		phrases: {},
		selectors: [{expr: null, default: {type: "StringLiteral", value: "default"}}],
		variants: [
			{
				keys: [{type: "StringLiteral", value: "default"}],
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
		formatMessage("en", message, {
			monster: new StringValue("ogre"),
		})
	);
}

console.log("==== polski ====");

{
	let message: Message = {
		type: "Message",
		id: "accord",
		phrases: {},
		selectors: [{expr: null, default: {type: "StringLiteral", value: "default"}}],
		variants: [
			{
				keys: [{type: "StringLiteral", value: "default"}],
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
		formatMessage("pl", message, {
			item: new StringValue("t-shirt"),
			color: new StringValue("red"),
		})
	);
}

{
	let message: Message = {
		type: "Message",
		id: "you-see",
		phrases: {},
		selectors: [{expr: null, default: {type: "StringLiteral", value: "default"}}],
		variants: [
			{
				keys: [{type: "StringLiteral", value: "default"}],
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
		formatMessage("pl", message, {
			monster: new StringValue("dinosaur"),
		})
	);
}

{
	let message: Message = {
		type: "Message",
		id: "they-wave",
		phrases: {},
		selectors: [{expr: null, default: {type: "StringLiteral", value: "default"}}],
		variants: [
			{
				keys: [{type: "StringLiteral", value: "default"}],
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
		formatMessage("pl", message, {
			monster: new StringValue("ogre"),
		})
	);
}
