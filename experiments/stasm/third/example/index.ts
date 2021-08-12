import {format, resolve_arg, resolve_param} from "../messageformat2/context.js";
import {en_accord, en_phrases, en_they_wave, en_you_see} from "./messages_en.js";
import {REGISTRY} from "../messageformat2/registry.js";
import {Context} from "../messageformat2/context.js";
import {get_term} from "./glossary.js";
import {Argument, Parameter} from "../messageformat2/model";
import {pl_accord, pl_phrases, pl_they_wave, pl_you_see} from "./messages_pl.js";

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
console.log(format("en", en_phrases, {userName: "Mary", userGender: "feminine", photoCount: 34}));
console.log(format("en", en_accord, {item: "t-shirt", color: "red"}));
console.log(format("en", en_you_see, {monster: "dinosaur"}));
console.log(format("en", en_they_wave, {monster: "ogre"}));

console.log();
console.log("==== polski ====");
console.log(format("pl", pl_phrases, {userName: "Mary", userGender: "feminine", photoCount: 34}));
console.log(format("pl", pl_accord, {item: "t-shirt", color: "red"}));
console.log(format("pl", pl_you_see, {monster: "dinosaur"}));
console.log(format("pl", pl_they_wave, {monster: "ogre"}));
