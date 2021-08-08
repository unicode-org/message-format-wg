import {Context, format} from "./context.js";
import {Primitive} from "./model";

export type RegistryFunc = (
	ctx: Context,
	args: Array<string>,
	scope: Record<string, Primitive>
) => string;

export const REGISTRY: Record<string, RegistryFunc> = {
	VAR: get_variable,
	PLURAL: get_plural,
	PHRASE: get_phrase,
};

function get_variable(ctx: Context, args: Array<string>, scope: Record<string, Primitive>): string {
	let var_name = args[0];
	let value = ctx.vars[var_name];

	switch (typeof value) {
		case "string":
			return value;
		case "number":
			// TODO(stasm): Cache NumberFormat.
			// TODO(stasm): Pass options.
			return new Intl.NumberFormat(ctx.locale).format(value);
	}
}

function get_plural(ctx: Context, args: Array<string>, scope: Record<string, Primitive>): string {
	let var_name = args[0];
	let value = ctx.vars[var_name];

	if (typeof value !== "number") {
		throw new TypeError();
	}

	// TODO(stasm): Cache PluralRules.
	// TODO(stasm): Pass options.
	let pr = new Intl.PluralRules(ctx.locale);
	return pr.select(value);
}

function get_phrase(ctx: Context, args: Array<string>, scope: Record<string, Primitive>): string {
	if (ctx.formattable.type === "Phrase") {
		throw new TypeError();
	}

	let phrase_name = args[0];
	let phrase = ctx.formattable.phrases[phrase_name];
	return format(ctx.locale, phrase, {...ctx.vars, ...scope});
}
