import {FormattedPart, OpaquePart} from "./Formattable.js";
import {FormattingContext} from "./FormattingContext.js";
import {Message} from "./model.js";
import {RuntimeValue} from "./RuntimeValue.js";

export * from "./Formattable.js";
export * from "./FormattingContext.js";
export * from "./Matchable.js";
export * from "./RuntimeValue.js";

export function formatMessage(
	message: Message,
	vars: Record<string, RuntimeValue<unknown>>
): string {
	let ctx = new FormattingContext(message.lang, message, vars);
	let variant = ctx.selectVariant(message.variants, message.selectors);
	return ctx.formatPattern(variant.value);
}

export function* formatToParts(
	message: Message,
	vars: Record<string, RuntimeValue<unknown>>
): IterableIterator<FormattedPart | OpaquePart> {
	let ctx = new FormattingContext(message.lang, message, vars);
	let variant = ctx.selectVariant(message.variants, message.selectors);
	for (let value of ctx.resolvePattern(variant.value)) {
		yield* value.formatToParts(ctx);
	}
}
