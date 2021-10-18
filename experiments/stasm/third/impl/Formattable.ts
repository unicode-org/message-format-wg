import {FormattingContext} from "./FormattingContext.js";
import {PatternElement} from "./model.js";
import {RuntimeNumber, RuntimeString, RuntimeValue} from "./RuntimeValue.js";

export interface FormattedPart {
	type: string;
	value: string;
}

export interface OpaquePart {
	type: "opaque";
	value: unknown;
}

// A value passed in as a variable to format() or to which literals are resolved
// at runtime. There are a number of built-in formattable types in this
// implementation: StringValue, NumberValue, etc. Other implementations may
// introduce additional types, e.g. Uint32Value.  Formattable can also be
// inherited from in the userspace code to create new variable types; see
// example_list's ListValue type and example_opaque's WrappedValue.
export interface Formattable {
	formatToString(ctx: FormattingContext): string;
	formatToParts(ctx: FormattingContext): IterableIterator<FormattedPart | OpaquePart>;
}

export function isFormattable(instance: object): instance is Formattable {
	return "formatToString" in instance && "formatToParts" in instance;
}

export class FormattableString extends RuntimeString implements Formattable {
	formatToString(ctx: FormattingContext): string {
		return this.value;
	}

	*formatToParts(ctx: FormattingContext): IterableIterator<FormattedPart> {
		yield {type: "literal", value: this.value};
	}
}

export class FormattableNumber extends RuntimeNumber implements Formattable {
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

export class FormattablePattern extends RuntimeValue<Array<PatternElement>> implements Formattable {
	formatToString(ctx: FormattingContext): string {
		return ctx.formatPattern(this.value);
	}

	*formatToParts(ctx: FormattingContext): IterableIterator<FormattedPart | OpaquePart> {
		for (let value of ctx.resolvePattern(this.value)) {
			yield* value.formatToParts(ctx);
		}
	}
}
