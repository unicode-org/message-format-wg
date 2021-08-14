import {RuntimeValue, FormattingContext} from "./runtime.js";
import {Message} from "./model.js";

export function formatMessage(
	locale: string,
	message: Message,
	vars: Record<string, RuntimeValue<unknown>>
): string {
	let ctx = new FormattingContext(locale, message, vars);
	let variant = ctx.selectVariant(message.variants, message.selectors);
	return ctx.formatPattern(variant.value);
}
