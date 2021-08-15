import {Argument, Parameter} from "./model.js";
import {FormattingContext, NumberValue, PluralValue, RuntimeValue, StringValue} from "./runtime.js";

export type RegistryFunc<T> = (
	ctx: FormattingContext,
	args: Array<Argument>,
	opts: Record<string, Parameter>
) => RuntimeValue<T>;

// The built-in functions.
export const REGISTRY: Record<string, RegistryFunc<unknown>> = {
	PLURAL: get_plural,
	PHRASE: get_phrase,
};

function get_plural(
	ctx: FormattingContext,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): PluralValue {
	let count = ctx.toRuntimeValue(args[0]);
	if (!(count instanceof NumberValue)) {
		throw new TypeError();
	}

	return new PluralValue(count.value);
}

function get_phrase(
	ctx: FormattingContext,
	args: Array<Argument>,
	opts: Record<string, Parameter>
): StringValue {
	let phrase_name = ctx.toRuntimeValue(args[0]);
	if (!(phrase_name instanceof StringValue)) {
		throw new TypeError();
	}

	let phrase = ctx.message.phrases[phrase_name.value];
	let variant = ctx.selectVariant(phrase.variants, phrase.selectors);
	return new StringValue(ctx.formatPattern(variant.value));
}
