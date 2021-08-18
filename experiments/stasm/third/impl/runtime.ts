import {FormattingContext} from "./context.js";
import {Message, PatternElement} from "./model.js";

export interface FormattedPart {
	type: string;
	value: string;
}

export interface OpaquePart {
	type: "opaque";
	value: unknown;
}

// A value passed in as a variable to format() or to which literals are resolved
// at runtime. There are a number of built-in runtime value types in this
// implementation: StringValue, NumberValue, etc. Other implementations may
// introduce additional types, e.g. Uint32Value.  RuntimeValue can also be
// inherited from in the userspace code to create new variable types; see
// example_list's ListValue type and example_opaque's WrappedValue.
export abstract class RuntimeValue<T> {
	public value: T;

	constructor(value: T) {
		this.value = value;
	}

	abstract formatToString(ctx: FormattingContext): string;
	abstract formatToParts(ctx: FormattingContext): IterableIterator<FormattedPart | OpaquePart>;
}

export class StringValue extends RuntimeValue<string> {
	formatToString(ctx: FormattingContext): string {
		return this.value;
	}

	*formatToParts(ctx: FormattingContext): IterableIterator<FormattedPart> {
		yield {type: "literal", value: this.value};
	}
}

export class NumberValue extends RuntimeValue<number> {
	private opts: Intl.NumberFormatOptions;

	constructor(value: number, opts: Intl.NumberFormatOptions = {}) {
		super(value);
		this.opts = opts;
	}

	formatToString(ctx: FormattingContext): string {
		// TODO(stasm): Cache NumberFormat.
		return new Intl.NumberFormat(ctx.locale, this.opts).format(this.value);
	}

	*formatToParts(ctx: FormattingContext): IterableIterator<FormattedPart> {
		yield* new Intl.NumberFormat(ctx.locale, this.opts).formatToParts(this.value);
	}
}

export class PluralValue extends RuntimeValue<number> {
	private opts: Intl.PluralRulesOptions;

	constructor(value: number, opts: Intl.PluralRulesOptions = {}) {
		super(value);
		this.opts = opts;
	}

	formatToString(ctx: FormattingContext): string {
		// TODO(stasm): Cache PluralRules.
		let pr = new Intl.PluralRules(ctx.locale, this.opts);
		return pr.select(this.value);
	}

	*formatToParts(ctx: FormattingContext): IterableIterator<FormattedPart> {
		throw new TypeError("Pluralvalue is not formattable to parts.");
	}
}

export class BooleanValue extends RuntimeValue<boolean> {
	formatToString(ctx: FormattingContext): string {
		throw new TypeError("BooleanValue is not formattable.");
	}

	*formatToParts(ctx: FormattingContext): IterableIterator<FormattedPart> {
		throw new TypeError("BooleanValue is not formattable to parts.");
	}
}

export class PatternValue extends RuntimeValue<Array<PatternElement>> {
	formatToString(ctx: FormattingContext): string {
		return ctx.formatPattern(this.value);
	}

	*formatToParts(ctx: FormattingContext): IterableIterator<FormattedPart | OpaquePart> {
		for (let value of ctx.resolvePattern(this.value)) {
			yield* value.formatToParts(ctx);
		}
	}
}

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
