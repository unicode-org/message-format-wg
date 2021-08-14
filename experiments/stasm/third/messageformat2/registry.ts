import {Context, format, NumberValue, resolve_value, StringValue} from "./context.js";
import {Argument, Parameter} from "./model";

export type RegistryFunc = (
	ctx: Context,
	args: Array<Argument>,
	opts: Record<string, Parameter>
) => string;

export const REGISTRY: Record<string, RegistryFunc> = {
	PLURAL: get_plural,
	PHRASE: get_phrase,
};

// Built-in functions.

function get_plural(ctx: Context, args: Array<Argument>, opts: Record<string, Parameter>): string {
	let count = resolve_value(ctx, args[0]);
	if (!(count instanceof NumberValue)) {
		throw new TypeError();
	}

	// TODO(stasm): Cache PluralRules.
	// TODO(stasm): Pass options.
	let pr = new Intl.PluralRules(ctx.locale);
	return pr.select(count.value);
}

function get_phrase(ctx: Context, args: Array<Argument>, opts: Record<string, Parameter>): string {
	if (ctx.formattable.type === "Phrase") {
		// Forbid referencing a phrase in a phrase.
		throw new TypeError();
	}

	let phrase_name = resolve_value(ctx, args[0]);
	if (!(phrase_name instanceof StringValue)) {
		throw new TypeError();
	}

	let phrase = ctx.formattable.phrases[phrase_name.value];
	return format(ctx.locale, phrase, ctx.vars);
}
