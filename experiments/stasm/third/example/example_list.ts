import {Argument, Message, Parameter} from "../messageformat2/model.js";
import {REGISTRY} from "../messageformat2/registry.js";
import {
	formatMessage,
	FormattingContext,
	PluralValue,
	RuntimeValue,
	StringValue,
} from "../messageformat2/runtime.js";

class ArrayValue extends RuntimeValue<Array<string>> {
	format(ctx: FormattingContext): string {
		// TODO(stasm): Better list formatting.
		return this.value.join(", ");
	}
}

REGISTRY["PLURAL_LEN"] = function (
	ctx: FormattingContext,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): PluralValue {
	let elements = ctx.toRuntimeValue(args[0]);
	if (!(elements instanceof ArrayValue)) {
		throw new TypeError();
	}

	return new PluralValue(elements.value.length);
};

REGISTRY["LIST"] = function (
	ctx: FormattingContext,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): StringValue {
	let elements = ctx.toRuntimeValue(args[0]);
	if (!(elements instanceof ArrayValue)) {
		throw new TypeError();
	}

	let declension = ctx.toRuntimeValue(opts["CASE"]);
	if (!(declension instanceof StringValue)) {
		throw new TypeError();
	}

	let values: Array<string> = [];
	switch (declension.value) {
		case "dative": {
			values = elements.value.map((x) => dative(ctx.locale, x));
			break;
		}
	}

	// @ts-ignore
	let lf = new Intl.ListFormat(ctx.locale);
	return new StringValue(lf.format(values));
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
		id: "gifts",
		phrases: {},
		selectors: [
			{
				expr: {
					type: "FunctionCall",
					name: "PLURAL_LEN",
					args: [{type: "VariableReference", name: "names"}],
					opts: {},
				},
				default: {type: "StringLiteral", value: "other"},
			},
		],
		variants: [
			{
				keys: [{type: "StringLiteral", value: "one"}],
				value: [
					{type: "StringLiteral", value: "I-am dat cadouri  "},
					{
						type: "FunctionCall",
						name: "LIST",
						args: [{type: "VariableReference", name: "names"}],
						opts: {CASE: {type: "StringLiteral", value: "dative"}},
					},
					{type: "StringLiteral", value: "."},
				],
			},
			{
				keys: [{type: "StringLiteral", value: "other"}],
				value: [
					{type: "StringLiteral", value: "Le-am dat cadouri "},
					{
						type: "FunctionCall",
						name: "LIST",
						args: [{type: "VariableReference", name: "names"}],
						opts: {CASE: {type: "StringLiteral", value: "dative"}},
					},
					{type: "StringLiteral", value: "."},
				],
			},
		],
	};
	console.log(
		formatMessage("ro", message, {
			names: new ArrayValue(["Maria", "Ileana", "Petre"]),
		})
	);
}
