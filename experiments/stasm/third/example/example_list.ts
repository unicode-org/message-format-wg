import {Argument, Message, Parameter} from "../impl/model.js";
import {REGISTRY} from "../impl/registry.js";
import {
	formatMessage,
	FormattingContext,
	PluralValue,
	RuntimeValue,
	StringValue,
} from "../impl/runtime.js";

class Person {
	firstName: string;
	lastName: string;

	constructor(firstName: string, lastName: string) {
		this.firstName = firstName;
		this.lastName = lastName;
	}
}

class PeopleValue extends RuntimeValue<Array<Person>> {
	format(ctx: FormattingContext): string {
		throw new RangeError("Must be formatted via PEOPLE_LIST.");
	}
}

REGISTRY["PLURAL_LEN"] = function (
	ctx: FormattingContext,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): PluralValue {
	let elements = ctx.toRuntimeValue(args[0]);
	if (!(elements instanceof PeopleValue)) {
		throw new TypeError();
	}

	return new PluralValue(elements.value.length);
};

REGISTRY["PEOPLE_LIST"] = function (
	ctx: FormattingContext,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): StringValue {
	if (ctx.locale !== "ro") {
		throw new Error("Only Romanian supported");
	}

	let elements = ctx.toRuntimeValue(args[0]);
	if (!(elements instanceof PeopleValue)) {
		throw new TypeError();
	}

	let name_format = ctx.toRuntimeValue(opts["NAME"]);
	if (!(name_format instanceof StringValue)) {
		throw new TypeError();
	}

	let names: Array<string> = [];
	switch (name_format.value) {
		case "first":
			names = elements.value.map((p) => decline(p.firstName));
			break;
		case "last":
			names = elements.value.map((p) => decline(p.lastName));
			break;
		case "full":
			// Decline only the first name.
			names = elements.value.map((p) => decline(p.firstName) + " " + p.lastName);
			break;
	}

	// @ts-ignore
	let lf = new Intl.ListFormat(ctx.locale, {
		// TODO(stasm): Type-check these.
		// TODO(stasm): Add default options.
		style: ctx.toRuntimeValue(opts["STYLE"]).value,
		type: ctx.toRuntimeValue(opts["TYPE"]).value,
	});
	return new StringValue(lf.format(names));

	function decline(name: string): string {
		let declension = ctx.toRuntimeValue(opts["CASE"]);
		if (!(declension instanceof StringValue)) {
			throw new TypeError();
		}

		if (declension.value === "dative") {
			switch (true) {
				case name.endsWith("ana"):
					return name.slice(0, -3) + "nei";
				case name.endsWith("ca"):
					return name.slice(0, -2) + "căi";
				case name.endsWith("ga"):
					return name.slice(0, -2) + "găi";
				case name.endsWith("a"):
					return name.slice(0, -1) + "ei";
				default:
					return "lui " + name;
			}
		} else {
			return name;
		}
	}
};

console.log("==== Romanian ====");

{
	// gifts [PLURAL_LEN $names : other] =
	//     [one] "I-am dat cadouri {PEOPLE_LIST $names STYLE long TYPE conjunction CASE dative NAME first}."
	//     [other] "Le-am dat cadouri {PEOPLE_LIST $names STYLE long TYPE conjunction CASE dative NAME first}."
	let message: Message = {
		lang: "ro",
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
						name: "PEOPLE_LIST",
						args: [{type: "VariableReference", name: "names"}],
						opts: {
							STYLE: {type: "StringLiteral", value: "long"},
							TYPE: {type: "StringLiteral", value: "conjunction"},
							CASE: {type: "StringLiteral", value: "dative"},
							NAME: {type: "StringLiteral", value: "first"},
						},
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
						name: "PEOPLE_LIST",
						args: [{type: "VariableReference", name: "names"}],
						opts: {
							STYLE: {type: "StringLiteral", value: "long"},
							TYPE: {type: "StringLiteral", value: "conjunction"},
							CASE: {type: "StringLiteral", value: "dative"},
							NAME: {type: "StringLiteral", value: "first"},
						},
					},
					{type: "StringLiteral", value: "."},
				],
			},
		],
	};
	console.log(
		formatMessage(message, {
			names: new PeopleValue([
				new Person("Maria", "Stanescu"),
				new Person("Ileana", "Zamfir"),
				new Person("Petre", "Belu"),
			]),
		})
	);
}

{
	// gifts [PLURAL_LEN $names : other] =
	//     [one] "I-am dat cadouri {PEOPLE_LIST $names STYLE long TYPE disjunction CASE dative NAME full}."
	//     [other] "Le-am dat cadouri {PEOPLE_LIST $names STYLE long TYPE disjunction CASE dative NAME full}."
	let message: Message = {
		lang: "ro",
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
						name: "PEOPLE_LIST",
						args: [{type: "VariableReference", name: "names"}],
						opts: {
							STYLE: {type: "StringLiteral", value: "long"},
							TYPE: {type: "StringLiteral", value: "disjunction"},
							CASE: {type: "StringLiteral", value: "dative"},
							NAME: {type: "StringLiteral", value: "full"},
						},
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
						name: "PEOPLE_LIST",
						args: [{type: "VariableReference", name: "names"}],
						opts: {
							STYLE: {type: "StringLiteral", value: "long"},
							TYPE: {type: "StringLiteral", value: "disjunction"},
							CASE: {type: "StringLiteral", value: "dative"},
							NAME: {type: "StringLiteral", value: "full"},
						},
					},
					{type: "StringLiteral", value: "."},
				],
			},
		],
	};
	console.log(
		formatMessage(message, {
			names: new PeopleValue([
				new Person("Maria", "Stanescu"),
				new Person("Ileana", "Zamfir"),
				new Person("Petre", "Belu"),
			]),
		})
	);
}
