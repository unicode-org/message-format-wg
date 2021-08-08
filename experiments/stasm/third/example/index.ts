import {format} from "../messageformat2/context.js";
import {en_accord, en_phrases} from "./messages_en.js";
import {REGISTRY} from "../messageformat2/registry.js";
import {Context} from "../messageformat2/context.js";
import {get_term} from "./glossary.js";
import {Primitive} from "../messageformat2/model";
import {pl_accord, pl_phrases} from "./messages_pl.js";

REGISTRY["NOUN"] = function get_noun(
	ctx: Context,
	args: Array<string>,
	scope: Record<string, Primitive>
): string {
	let var_name = args[0];
	let noun_name = ctx.vars[var_name];

	if (typeof noun_name !== "string") {
		throw new TypeError();
	}

	let noun = get_term(ctx.locale, noun_name);
	let value = noun["singular_nominative"].toString();

	if (scope["capitalized"]) {
		return value[0].toUpperCase() + value.slice(1);
	}

	return value;
};

REGISTRY["ADJECTIVE"] = function get_adjective(
	ctx: Context,
	args: Array<string>,
	scope: Record<string, Primitive>
): string {
	let var_name = args[0];
	let adj_name = ctx.vars[var_name];

	if (typeof adj_name !== "string") {
		throw new TypeError();
	}

	switch (ctx.locale) {
		case "en": {
			let adjective = get_term(ctx.locale, adj_name);
			return adjective["nominative"].toString();
		}
		case "pl": {
			if (typeof scope["accord_with"] !== "string") {
				throw new TypeError();
			}
			let noun_name = ctx.vars[scope["accord_with"]];
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

console.log(format("en", en_phrases, {userName: "Mary", userGender: "feminine", photoCount: 34}));
console.log(format("en", en_accord, {item: "t-shirt", color: "red"}));

console.log(format("pl", pl_phrases, {userName: "Mary", userGender: "feminine", photoCount: 34}));
console.log(format("pl", pl_accord, {item: "t-shirt", color: "red"}));
