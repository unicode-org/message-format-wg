import {format, resolve_arg, resolve_param} from "../messageformat2/context.js";
import {REGISTRY} from "../messageformat2/registry.js";
import {Context} from "../messageformat2/context.js";
import {get_term} from "./glossary.js";
import {Argument, Message, Parameter} from "../messageformat2/model.js";

REGISTRY["NOUN"] = function get_noun(
	ctx: Context,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): string {
	let noun_name = resolve_arg(ctx, args[0]);
	if (typeof noun_name !== "string") {
		throw new TypeError();
	}

	let noun = get_term(ctx.locale, noun_name);
	let value = noun["singular_nominative"].toString();

	if (opts["CAPITALIZED"]) {
		return value[0].toUpperCase() + value.slice(1);
	}

	return value;
};

REGISTRY["ADJECTIVE"] = function get_adjective(
	ctx: Context,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): string {
	let adj_name = resolve_arg(ctx, args[0]);
	if (typeof adj_name !== "string") {
		throw new TypeError();
	}

	switch (ctx.locale) {
		case "en": {
			let adjective = get_term(ctx.locale, adj_name);
			return adjective["nominative"].toString();
		}
		case "pl": {
			let noun_name = resolve_param(ctx, opts["ACCORD_WITH"]);
			if (typeof noun_name !== "string") {
				throw new TypeError();
			}
			let noun = get_term(ctx.locale, noun_name);
			let adjective = get_term(ctx.locale, adj_name);
			return adjective["singular_" + noun["gender"]].toString();
		}
		default:
			return adj_name.toString();
	}
};

REGISTRY["ACTOR"] = function get_noun(
	ctx: Context,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): string {
	let name = resolve_arg(ctx, args[0]);
	if (typeof name !== "string") {
		throw new TypeError();
	}

	let term = get_term(ctx.locale, "actor_" + name);

	switch (ctx.locale) {
		case "en": {
			let value: string;
			if (opts["DEFINITE"]) {
				value = term["definite"].toString();
			} else if (opts["INDEFINITE"]) {
				value = term["indefinite"].toString();
			} else {
				value = term["bare"].toString();
			}

			if (opts["CAPITALIZED"]) {
				return value[0].toUpperCase() + value.slice(1);
			}

			return value;
		}
		case "pl": {
			let declension = resolve_param(ctx, opts["CASE"]);
			if (typeof declension !== "string") {
				throw new TypeError();
			}

			let value = term[declension].toString();
			if (opts["CAPITALIZED"]) {
				return value[0].toUpperCase() + value.slice(1);
			}

			return value;
		}
		default:
			return name;
	}
};

console.log("==== English ====");

{
	let message: Message = {
		type: "Message",
		id: "accord",
		phrases: {},
		selectors: [{expr: null, default: {type: "StringValue", value: "default"}}],
		variants: [
			{
				keys: [{type: "StringValue", value: "default"}],
				value: [
					{type: "StringValue", value: "The "},
					{
						type: "FunctionCall",
						name: "NOUN",
						args: [{type: "VariableReference", name: "item"}],
						opts: {},
					},
					{type: "StringValue", value: " is "},
					{
						type: "FunctionCall",
						name: "ADJECTIVE",
						args: [{type: "VariableReference", name: "color"}],
						opts: {
							ACCORD_WITH: {type: "VariableReference", name: "item"},
						},
					},
					{type: "StringValue", value: "."},
				],
			},
		],
	};
	console.log(format("en", message, {item: "t-shirt", color: "red"}));
}

{
	let message: Message = {
		type: "Message",
		id: "you-see",
		phrases: {},
		selectors: [{expr: null, default: {type: "StringValue", value: "default"}}],
		variants: [
			{
				keys: [{type: "StringValue", value: "default"}],
				value: [
					{type: "StringValue", value: "You see "},
					{
						type: "FunctionCall",
						name: "ACTOR",
						args: [{type: "VariableReference", name: "monster"}],
						opts: {
							INDEFINITE: {type: "BooleanValue", value: true},
						},
					},
					{type: "StringValue", value: "!"},
				],
			},
		],
	};
	console.log(format("en", message, {monster: "dinosaur"}));
}

{
	let message: Message = {
		type: "Message",
		id: "they-wave",
		phrases: {},
		selectors: [{expr: null, default: {type: "StringValue", value: "default"}}],
		variants: [
			{
				keys: [{type: "StringValue", value: "default"}],
				value: [
					{
						type: "FunctionCall",
						name: "ACTOR",
						args: [{type: "VariableReference", name: "monster"}],
						opts: {
							DEFINITE: {type: "BooleanValue", value: true},
							CAPITALIZED: {type: "BooleanValue", value: true},
						},
					},
					{type: "StringValue", value: " waves at you!"},
				],
			},
		],
	};
	console.log(format("en", message, {monster: "ogre"}));
}

console.log();
console.log("==== polski ====");

{
	let message: Message = {
		type: "Message",
		id: "accord",
		phrases: {},
		selectors: [{expr: null, default: {type: "StringValue", value: "default"}}],
		variants: [
			{
				keys: [{type: "StringValue", value: "default"}],
				value: [
					{
						type: "FunctionCall",
						name: "NOUN",
						args: [{type: "VariableReference", name: "item"}],
						opts: {
							CAPITALIZED: {type: "BooleanValue", value: true},
						},
					},
					{type: "StringValue", value: " jest "},
					{
						type: "FunctionCall",
						name: "ADJECTIVE",
						args: [{type: "VariableReference", name: "color"}],
						opts: {
							ACCORD_WITH: {type: "VariableReference", name: "item"},
						},
					},
					{type: "StringValue", value: "."},
				],
			},
		],
	};
	console.log(format("pl", message, {item: "t-shirt", color: "red"}));
}

{
	let message: Message = {
		type: "Message",
		id: "you-see",
		phrases: {},
		selectors: [{expr: null, default: {type: "StringValue", value: "default"}}],
		variants: [
			{
				keys: [{type: "StringValue", value: "default"}],
				value: [
					{type: "StringValue", value: "Widzisz "},
					{
						type: "FunctionCall",
						name: "ACTOR",
						args: [{type: "VariableReference", name: "monster"}],
						opts: {
							CASE: {type: "StringValue", value: "accusative"},
						},
					},
					{type: "StringValue", value: "!"},
				],
			},
		],
	};
	console.log(format("pl", message, {monster: "dinosaur"}));
}

{
	let message: Message = {
		type: "Message",
		id: "they-wave",
		phrases: {},
		selectors: [{expr: null, default: {type: "StringValue", value: "default"}}],
		variants: [
			{
				keys: [{type: "StringValue", value: "default"}],
				value: [
					{
						type: "FunctionCall",
						name: "ACTOR",
						args: [{type: "VariableReference", name: "monster"}],
						opts: {
							CASE: {type: "StringValue", value: "nominative"},
							CAPITALIZED: {type: "BooleanValue", value: true},
						},
					},
					{type: "StringValue", value: " macha do ciebie!"},
				],
			},
		],
	};

	console.log(format("pl", message, {monster: "ogre"}));
}
