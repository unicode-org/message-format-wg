import {test} from "tap";
import {Argument, Message, Parameter} from "../impl/model.js";
import {REGISTRY_FORMAT, REGISTRY_MATCH} from "../impl/registry.js";
import {
	formatMessage,
	Formattable,
	FormattedPart,
	FormattingContext,
	formatToParts,
	Matchable,
	MatchablePlural,
	RuntimeString,
	RuntimeValue,
} from "../impl/runtime.js";

class Person {
	firstName: string;
	lastName: string;

	constructor(firstName: string, lastName: string) {
		this.firstName = firstName;
		this.lastName = lastName;
	}
}

// TODO(stasm): This is generic enough that it could be in impl/Formattable.ts.
class FormattableList<T> extends RuntimeValue<Array<T>> implements Formattable {
	private opts: Intl.ListFormatOptions;

	constructor(value: Array<T>, opts: Intl.ListFormatOptions = {}) {
		super(value);
		this.opts = opts;
	}

	formatToString(ctx: FormattingContext): string {
		// TODO(stasm): Cache ListFormat.
		let lf = new Intl.ListFormat(ctx.locale, this.opts);
		return lf.format(this.value);
	}

	*formatToParts(ctx: FormattingContext): IterableIterator<FormattedPart> {
		let lf = new Intl.ListFormat(ctx.locale, this.opts);
		yield* lf.formatToParts(this.value);
	}
}

REGISTRY_MATCH["PLURAL_LEN"] = function (
	ctx: FormattingContext,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): Matchable {
	let elements = ctx.toRuntimeValue(args[0]);
	if (!(elements instanceof FormattableList)) {
		throw new TypeError();
	}

	// TODO(stasm): Cache PluralRules.
	let pr = new Intl.PluralRules(ctx.locale);
	let category = pr.select(elements.value.length);
	return new MatchablePlural(category, elements.value.length);
};

REGISTRY_FORMAT["PEOPLE_LIST"] = function (
	ctx: FormattingContext,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): FormattableList<string> {
	if (ctx.locale !== "ro") {
		throw new Error("Only Romanian supported");
	}

	let elements = ctx.toRuntimeValue(args[0]);
	if (!(elements instanceof FormattableList)) {
		throw new TypeError();
	}

	let name_format = ctx.toRuntimeValue(opts["NAME"]);
	if (!(name_format instanceof RuntimeString)) {
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

	let list_style = ctx.toRuntimeValue(opts["STYLE"]);
	if (!(list_style instanceof RuntimeString)) {
		throw new TypeError();
	}

	let list_type = ctx.toRuntimeValue(opts["TYPE"]);
	if (!(list_type instanceof RuntimeString)) {
		throw new TypeError();
	}

	return new FormattableList(names, {
		// TODO(stasm): Add default options.
		style: list_style.value,
		type: list_type.value,
	});

	function decline(name: string): string {
		let declension = ctx.toRuntimeValue(opts["CASE"]);
		if (!(declension instanceof RuntimeString)) {
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

test("Fancy list formatting, first names only", (tap) => {
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

	tap.equal(
		formatMessage(message, {
			names: new FormattableList([
				new Person("Maria", "Stanescu"),
				new Person("Ileana", "Zamfir"),
				new Person("Petre", "Belu"),
			]),
		}),
		"Le-am dat cadouri Mariei, Ilenei și lui Petre."
	);

	tap.same(
		formatToParts(message, {
			names: new FormattableList([
				new Person("Maria", "Stanescu"),
				new Person("Ileana", "Zamfir"),
				new Person("Petre", "Belu"),
			]),
		}),
		[
			{type: "literal", value: "Le-am dat cadouri "},
			{type: "element", value: "Mariei"},
			{type: "literal", value: ", "},
			{type: "element", value: "Ilenei"},
			{type: "literal", value: " și "},
			{type: "element", value: "lui Petre"},
			{type: "literal", value: "."},
		]
	);

	tap.end();
});

test("Fancy list formatting, full names", (tap) => {
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

	tap.equal(
		formatMessage(message, {
			names: new FormattableList([
				new Person("Maria", "Stanescu"),
				new Person("Ileana", "Zamfir"),
				new Person("Petre", "Belu"),
			]),
		}),
		"Le-am dat cadouri Mariei Stanescu, Ilenei Zamfir sau lui Petre Belu."
	);

	tap.same(
		formatToParts(message, {
			names: new FormattableList([
				new Person("Maria", "Stanescu"),
				new Person("Ileana", "Zamfir"),
				new Person("Petre", "Belu"),
			]),
		}),
		[
			{type: "literal", value: "Le-am dat cadouri "},
			{type: "element", value: "Mariei Stanescu"},
			{type: "literal", value: ", "},
			{type: "element", value: "Ilenei Zamfir"},
			{type: "literal", value: " sau "},
			{type: "element", value: "lui Petre Belu"},
			{type: "literal", value: "."},
		]
	);

	tap.end();
});
