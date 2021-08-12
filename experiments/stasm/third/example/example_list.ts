import {Context, format, resolve_arg, resolve_param} from "../messageformat2/context.js";
import {Argument, Message, Parameter} from "../messageformat2/model.js";
import {REGISTRY} from "../messageformat2/registry.js";

REGISTRY["PLURAL_LEN"] = function (
	ctx: Context,
	args: Array<Argument>,
	scope: Record<string, Parameter>
): string {
	let value = resolve_arg(ctx, args[0]);
	if (!Array.isArray(value)) {
		throw new TypeError();
	}

	let plural_rules = new Intl.PluralRules(ctx.locale);
	return plural_rules.select(value.length);
};

REGISTRY["LIST"] = function (
	ctx: Context,
	args: Array<Argument>,
	scope: Record<string, Parameter>
): string {
	let value = resolve_arg(ctx, args[0]);
	if (!Array.isArray(value)) {
		throw new TypeError();
	}

	let declension = resolve_param(ctx, scope["CASE"]);
	if (typeof declension !== "string") {
		throw new TypeError();
	}

	let values: Array<string> = [];
	switch (declension) {
		case "dative": {
			values = value.map((x) => dative(ctx.locale, x));
			break;
		}
	}

	// @ts-ignore
	let lf = new Intl.ListFormat(ctx.locale);
	return lf.format(values);
};

function dative(locale: string, name: string) {
	if (locale !== "ro") {
		throw new Error("Only Romanian supported");
	}

	let data: Record<string, string> = {
		Maria: "Mariei",
		Ileana: "Ilenei",
		Petre: "lui Petre",
	};

	return data[name] || name;
}

console.log("==== Romanian ====");

{
	// gifts [PLURAL_LEN $names : other] =
	//     [one] "I-am dat cadouri {LIST $names CASE dative}."
	//     [other] "Le-am dat cadouri {LIST $names CASE dative}."
	let message: Message = {
		type: "Message",
		id: "gifts",
		phrases: {},
		selectors: [
			{
				expr: {
					type: "FunctionCall",
					name: "PLURAL_LEN",
					args: [{type: "VariableReference", name: "names"}],
					scope: {},
				},
				default: {type: "StringValue", value: "other"},
			},
		],
		variants: [
			{
				keys: [{type: "StringValue", value: "one"}],
				value: [
					{type: "StringValue", value: "I-am dat cadouri  "},
					{
						type: "FunctionCall",
						name: "LIST",
						args: [{type: "VariableReference", name: "names"}],
						scope: {CASE: {type: "StringValue", value: "dative"}},
					},
					{type: "StringValue", value: "."},
				],
			},
			{
				keys: [{type: "StringValue", value: "other"}],
				value: [
					{type: "StringValue", value: "Le-am dat cadouri "},
					{
						type: "FunctionCall",
						name: "LIST",
						args: [{type: "VariableReference", name: "names"}],
						scope: {CASE: {type: "StringValue", value: "dative"}},
					},
					{type: "StringValue", value: "."},
				],
			},
		],
	};
	console.log(
		format("ro", message, {
			names: ["Maria", "Ileana", "Petre"],
		})
	);
}
