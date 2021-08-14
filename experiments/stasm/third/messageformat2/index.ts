import {RuntimeValue, Context} from "./runtime.js";
import {Message} from "./model.js";

export function format_message(
	locale: string,
	message: Message,
	vars: Record<string, RuntimeValue<unknown>>
): string {
	let ctx = new Context(locale, message, vars);
	let variant = ctx.selectVariant(message.variants, message.selectors);
	return ctx.formatPattern(variant.value);
}
