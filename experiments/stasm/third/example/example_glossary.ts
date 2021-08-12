import {format, resolve_arg, resolve_param} from "../messageformat2/context.js";
import {REGISTRY} from "../messageformat2/registry.js";
import {Context} from "../messageformat2/context.js";
import {get_term} from "./glossary.js";
import {Argument, Message, Parameter} from "../messageformat2/model.js";

REGISTRY["NOUN"] = function get_noun(
	ctx: Context,
	args: Array<Argument>,
	scope: Record<string, Parameter>
): string {
	let noun_name = resolve_arg(ctx, args[0]);
	if (typeof noun_name !== "string") {
		throw new TypeError();
	}

	let noun = get_term(ctx.locale, noun_name);
	let value = noun["singular_nominative"].toString();

	if (scope["CAPITALIZED"]) {
		return value[0].toUpperCase() + value.slice(1);
	}

	return value;
};

REGISTRY["ADJECTIVE"] = function get_adjective(
	ctx: Context,
	args: Array<Argument>,
	scope: Record<string, Parameter>
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
			let noun_name = resolve_param(ctx, scope["ACCORD_WITH"]);
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
	scope: Record<string, Parameter>
): string {
	let name = resolve_arg(ctx, args[0]);
	if (typeof name !== "string") {
		throw new TypeError();
	}

	let term = get_term(ctx.locale, "actor_" + name);

	switch (ctx.locale) {
		case "en": {
			let value: string;
			if (scope["DEFINITE"]) {
				value = term["definite"].toString();
			} else if (scope["INDEFINITE"]) {
				value = term["indefinite"].toString();
			} else {
				value = term["bare"].toString();
			}

			if (scope["CAPITALIZED"]) {
				return value[0].toUpperCase() + value.slice(1);
			}

			return value;
		}
		case "pl": {
			let declension = resolve_param(ctx, scope["CASE"]);
			if (typeof declension !== "string") {
				throw new TypeError();
			}

			let value = term[declension].toString();
			if (scope["CAPITALIZED"]) {
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
		selectors: [{expr: null, default: "default"}],
		variants: [
			{
				keys: ["default"],
				value: [
					"The ",
					{
						type: "FunctionCall",
						name: "NOUN",
						args: [{type: "VariableReference", name: "item"}],
						scope: {},
					},
					" is ",
					{
						type: "FunctionCall",
						name: "ADJECTIVE",
						args: [{type: "VariableReference", name: "color"}],
						scope: {
							ACCORD_WITH: {type: "VariableReference", name: "item"},
						},
					},
					".",
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
		selectors: [{expr: null, default: "default"}],
		variants: [
			{
				keys: ["default"],
				value: [
					"You see ",
					{
						type: "FunctionCall",
						name: "ACTOR",
						args: [{type: "VariableReference", name: "monster"}],
						scope: {
							INDEFINITE: true,
						},
					},
					"!",
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
		selectors: [{expr: null, default: "default"}],
		variants: [
			{
				keys: ["default"],
				value: [
					{
						type: "FunctionCall",
						name: "ACTOR",
						args: [{type: "VariableReference", name: "monster"}],
						scope: {
							DEFINITE: true,
							CAPITALIZED: true,
						},
					},
					" waves at you!",
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
		selectors: [{expr: null, default: "default"}],
		variants: [
			{
				keys: ["default"],
				value: [
					{
						type: "FunctionCall",
						name: "NOUN",
						args: [{type: "VariableReference", name: "item"}],
						scope: {CAPITALIZED: true},
					},
					" jest ",
					{
						type: "FunctionCall",
						name: "ADJECTIVE",
						args: [{type: "VariableReference", name: "color"}],
						scope: {
							ACCORD_WITH: {type: "VariableReference", name: "item"},
						},
					},
					".",
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
		selectors: [{expr: null, default: "default"}],
		variants: [
			{
				keys: ["default"],
				value: [
					"Widzisz ",
					{
						type: "FunctionCall",
						name: "ACTOR",
						args: [{type: "VariableReference", name: "monster"}],
						scope: {
							CASE: "accusative",
						},
					},
					"!",
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
		selectors: [{expr: null, default: "default"}],
		variants: [
			{
				keys: ["default"],
				value: [
					{
						type: "FunctionCall",
						name: "ACTOR",
						args: [{type: "VariableReference", name: "monster"}],
						scope: {
							CASE: "nominative",
							CAPITALIZED: true,
						},
					},
					" macha do ciebie!",
				],
			},
		],
	};

	console.log(format("pl", message, {monster: "ogre"}));
}
