import {Context, format, resolve_arg} from "./context.js";
import {Argument, Parameter} from "./model";

export type RegistryFunc = (
	ctx: Context,
	args: Array<Argument>,
	scope: Record<string, Parameter>
) => string;

export const REGISTRY: Record<string, RegistryFunc> = {
	PLURAL: get_plural,
	PHRASE: get_phrase,
};

// Built-in functions.

function get_plural(ctx: Context, args: Array<Argument>, scope: Record<string, Parameter>): string {
	let value = resolve_arg(ctx, args[0]);
	if (typeof value !== "number") {
		throw new TypeError();
	}

	// TODO(stasm): Cache PluralRules.
	// TODO(stasm): Pass options.
	let pr = new Intl.PluralRules(ctx.locale);
	return pr.select(value);
}

function get_phrase(ctx: Context, args: Array<Argument>, scope: Record<string, Parameter>): string {
	if (ctx.formattable.type === "Phrase") {
		// Forbid referencing a phrase in a phrase.
		throw new TypeError();
	}

	let phrase_name = resolve_arg(ctx, args[0]).valueOf();
	if (typeof phrase_name !== "string") {
		throw new TypeError();
	}

	let phrase = ctx.formattable.phrases[phrase_name];
	return format(ctx.locale, phrase, {...ctx.vars, ...scope});
}
