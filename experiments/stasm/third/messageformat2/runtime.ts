import {Message, Parameter, Part, Phrase, Selector, StringLiteral, Variant} from "./model.js";
import {REGISTRY} from "./registry.js";

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
}

export class StringValue extends RuntimeValue<string> {
	format(ctx: FormattingContext): string {
		return this.value;
	}
}

export class NumberValue extends RuntimeValue<number> {
	format(ctx: FormattingContext): string {
		// TODO(stasm): Cache NumberFormat.
		// TODO(stasm): Pass options.
		return new Intl.NumberFormat(ctx.locale).format(this.value);
	}
}

export class PluralValue extends RuntimeValue<number> {
	format(ctx: FormattingContext): string {
		// TODO(stasm): Cache PluralRules.
		// TODO(stasm): Pass options.
		let pr = new Intl.PluralRules(ctx.locale);
		return pr.select(this.value);
	}
}

export class BooleanValue extends RuntimeValue<boolean> {
	format(ctx: FormattingContext): string {
		throw new TypeError("BooleanValue is not formattable.");
	}
}

// Resolution context for a single formatMessage() call.
export class FormattingContext {
	locale: string;
	message: Message;
	vars: Record<string, RuntimeValue<unknown>>;
	visited: WeakSet<Array<Part>>;
	// cached formatters,

	constructor(locale: string, message: Message, vars: Record<string, RuntimeValue<unknown>>) {
		this.locale = locale;
		this.message = message;
		this.vars = vars;
		this.visited = new WeakSet();
	}

	formatPhrase(phrase: Phrase): string {
		let variant = this.selectVariant(phrase.variants, phrase.selectors);
		return this.formatPattern(variant.value);
	}

	formatPattern(parts: Array<Part>): string {
		if (this.visited.has(parts)) {
			throw new RangeError("Recursive reference to a variant value.");
		}

		this.visited.add(parts);
		let result = "";
		for (let part of parts) {
			switch (part.type) {
				case "StringLiteral":
					result += part.value;
					continue;
				case "VariableReference": {
					let value = this.vars[part.name];
					result += value.format(this);
					continue;
				}
				case "FunctionCall": {
					let callable = REGISTRY[part.name];
					let value = callable(this, part.args, part.opts);
					result += value.format(this);
					continue;
				}
			}
		}

		this.visited.delete(parts);
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
			case "NumberLiteral":
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
