import {Context, NumberValue, StringValue} from "./runtime.js";
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
	let count = ctx.resolveValue(args[0]);
	if (!(count instanceof NumberValue)) {
		throw new TypeError();
	}

	// TODO(stasm): Cache PluralRules.
	// TODO(stasm): Pass options.
	let pr = new Intl.PluralRules(ctx.locale);
	return pr.select(count.value);
}

function get_phrase(ctx: Context, args: Array<Argument>, opts: Record<string, Parameter>): string {
	let phrase_name = ctx.resolveValue(args[0]);
	if (!(phrase_name instanceof StringValue)) {
		throw new TypeError();
	}

	let phrase = ctx.message.phrases[phrase_name.value];
	let variant = ctx.selectVariant(phrase.variants, phrase.selectors);
	return ctx.formatPattern(variant.value);
}
