import {Message, Parameter, PatternElement, Selector, StringLiteral, Variant} from "./model.js";
import {REGISTRY} from "./registry.js";

export interface FormattedPart {
	type: string;
	value: string;
}

export interface OpaquePart {
	type: "opaque";
	value: unknown;
}

// A value passed in as a variable to format() or to which literals are resolved
// at runtime. There are 4 built-in runtime value types in this implementation:
// StringValue, NumberValue, PluralValue, and BooleanValue. Other
// implementations may introduce additional types, e.g. Uint32Value.
// RuntimeValue can also be inherited from in the userspace code to create new
// variable types; see example_list's ArrayValue type.
export abstract class RuntimeValue<T> {
	public value: T;

	constructor(value: T) {
		this.value = value;
	}

	abstract format(ctx: FormattingContext): string;
	abstract formatToParts(ctx: FormattingContext): IterableIterator<FormattedPart | OpaquePart>;
}

export class StringValue extends RuntimeValue<string> {
	format(ctx: FormattingContext): string {
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

	format(ctx: FormattingContext): string {
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

	format(ctx: FormattingContext): string {
		// TODO(stasm): Cache PluralRules.
		let pr = new Intl.PluralRules(ctx.locale, this.opts);
		return pr.select(this.value);
	}

	*formatToParts(ctx: FormattingContext): IterableIterator<FormattedPart> {
		throw new TypeError("Pluralvalue is not formattable to parts.");
	}
}

export class BooleanValue extends RuntimeValue<boolean> {
	format(ctx: FormattingContext): string {
		throw new TypeError("BooleanValue is not formattable.");
	}

	*formatToParts(ctx: FormattingContext): IterableIterator<FormattedPart> {
		throw new TypeError("BooleanValue is not formattable to parts.");
	}
}

export class PatternValue extends RuntimeValue<Array<PatternElement>> {
	format(ctx: FormattingContext): string {
		return ctx.formatPattern(this.value);
	}

	*formatToParts(ctx: FormattingContext): IterableIterator<FormattedPart | OpaquePart> {
		for (let value of ctx.resolvePattern(this.value)) {
			yield* value.formatToParts(ctx);
		}
	}
}

// Resolution context for a single formatMessage() call.
export class FormattingContext {
	locale: string;
	message: Message;
	vars: Record<string, RuntimeValue<unknown>>;
	visited: WeakSet<Array<PatternElement>>;
	// TODO(stasm): expose cached formatters, etc.

	constructor(locale: string, message: Message, vars: Record<string, RuntimeValue<unknown>>) {
		this.locale = locale;
		this.message = message;
		this.vars = vars;
		this.visited = new WeakSet();
	}

	formatPattern(pattern: Array<PatternElement>): string {
		let output = "";
		for (let value of this.resolvePattern(pattern)) {
			output += value.format(this);
		}
		return output;
	}

	*resolvePattern(pattern: Array<PatternElement>): IterableIterator<RuntimeValue<unknown>> {
		if (this.visited.has(pattern)) {
			throw new RangeError("Recursive reference to a variant value.");
		}

		this.visited.add(pattern);
		let result = "";
		for (let element of pattern) {
			switch (element.type) {
				case "StringLiteral":
					yield new StringValue(element.value);
					continue;
				case "VariableReference": {
					yield this.vars[element.name];
					continue;
				}
				case "FunctionCall": {
					let callable = REGISTRY[element.name];
					yield callable(this, element.args, element.opts);
					continue;
				}
			}
		}

		this.visited.delete(pattern);
		return result;
	}

	selectVariant(variants: Array<Variant>, selectors: Array<Selector>): Variant {
		interface ResolvedSelector<T> {
			value: T | null;
			string: string | null;
			default: string;
		}

		let resolved_selectors: Array<ResolvedSelector<unknown>> = [];
		for (let selector of selectors) {
			if (selector.expr === null) {
				// A special selector which only selects its default value. Used in the
				// data model of single-variant messages.
				resolved_selectors.push({
					value: null,
					string: null,
					default: selector.default.value,
				});
				continue;
			}

			switch (selector.expr.type) {
				case "VariableReference": {
					let value = this.vars[selector.expr.name];
					resolved_selectors.push({
						value: value.value,
						string: value.format(this),
						default: selector.default.value,
					});
					break;
				}
				case "FunctionCall": {
					let callable = REGISTRY[selector.expr.name];
					let value = callable(this, selector.expr.args, selector.expr.opts);
					resolved_selectors.push({
						value: value.value,
						string: value.format(this),
						default: selector.default.value,
					});
					break;
				}
				default:
					// TODO(stasm): Should we allow Literals as selectors?
					throw new TypeError();
			}
		}

		// TODO(stasm): Add NumberLiterals as keys (maybe).
		function matches_corresponding_selector(key: StringLiteral, idx: number) {
			return (
				key.value === resolved_selectors[idx].string ||
				key.value === resolved_selectors[idx].default
			);
		}

		for (let variant of variants) {
			if (variant.keys.every(matches_corresponding_selector)) {
				return variant;
			}
		}

		throw new RangeError("No variant matched the selectors.");
	}

	toRuntimeValue(node: Parameter): RuntimeValue<unknown> {
		if (typeof node === "undefined") {
			return new BooleanValue(false);
		}

		switch (node.type) {
			case "StringLiteral":
				return new StringValue(node.value);
			case "IntegerLiteral":
				return new NumberValue(parseInt(node.value));
			case "DecimalLiteral":
				return new NumberValue(parseFloat(node.value));
			case "BooleanLiteral":
				return new BooleanValue(node.value);
			case "VariableReference":
				return this.vars[node.name];
			default:
				throw new TypeError("Invalid node type.");
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
