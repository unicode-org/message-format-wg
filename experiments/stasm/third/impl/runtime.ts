import {FormattingContext} from "./context.js";
import {Message, PatternElement, VariantKey} from "./model.js";

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
	abstract match(ctx: FormattingContext, key: VariantKey): boolean;
}

export class StringValue extends RuntimeValue<string> {
	formatToString(ctx: FormattingContext): string {
		return this.value;
	}

	*formatToParts(ctx: FormattingContext): IterableIterator<FormattedPart> {
		yield {type: "literal", value: this.value};
	}

	match(ctx: FormattingContext, key: VariantKey): boolean {
		return this.value === key.value;
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

	match(ctx: FormattingContext, key: VariantKey): boolean {
		if (key.type === "IntegerLiteral") {
			return this.value === parseInt(key.value);
		}
		return false;
	}
}

export class PluralValue extends RuntimeValue<Intl.LDMLPluralRule> {
	public count: number;

	constructor(value: Intl.LDMLPluralRule, count: number) {
		super(value);
		this.count = count;
	}

	formatToString(ctx: FormattingContext): string {
		throw new TypeError("PluralValue is not formattable.");
	}

	*formatToParts(ctx: FormattingContext): IterableIterator<FormattedPart> {
		throw new TypeError("PluralValue is not formattable.");
	}

	match(ctx: FormattingContext, key: VariantKey): boolean {
		switch (key.type) {
			case "StringLiteral": {
				return this.value === key.value;
			}
			case "IntegerLiteral": {
				return this.count === parseInt(key.value);
			}
		}
	}
}

export class BooleanValue extends RuntimeValue<boolean> {
	formatToString(ctx: FormattingContext): string {
		throw new TypeError("BooleanValue is not formattable.");
	}

	*formatToParts(ctx: FormattingContext): IterableIterator<FormattedPart> {
		throw new TypeError("BooleanValue is not formattable to parts.");
	}

	match(ctx: FormattingContext, key: VariantKey): boolean {
		throw new TypeError("BooleanValue cannot match.");
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

	match(ctx: FormattingContext, key: VariantKey): boolean {
		throw new TypeError("PatternValue cannot match.");
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
