import {RuntimeValue, Context, resolve_variant, resolve_parts} from "./runtime.js";
import {Message} from "./model.js";

export function format_message(
	locale: string,
	message: Message,
	vars: Record<string, RuntimeValue<unknown>>
): string {
	let ctx = new Context(locale, message, vars);
	let variant = resolve_variant(ctx, message.variants, message.selectors);
	return resolve_parts(ctx, variant.value);
}
