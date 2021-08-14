import {
	FunctionCall,
	Parameter,
	Selector,
	VariableReference,
	StringLiteral,
	Part,
	Message,
	Variant,
	Phrase,
} from "./model.js";
import {REGISTRY} from "./registry.js";

// A value passed in as a variable to format() or to which literals are resolved
// at runtime. There are 3 built-in runtime value types in this JavaScript
// implementation: StringValue, NumberValue, BooleanValue. Other implementations
// may introduce additional types, e.g. Uint32Value. RuntimeValue can also be
// inherited from in the userspace code to create new variable types; see
// example_list's ArrayValue type.
export abstract class RuntimeValue<T> {
	public value: T;

	constructor(value: T) {
		this.value = value;
	}

	abstract format(ctx: Context): string;
}

export class StringValue extends RuntimeValue<string> {
	format(ctx: Context): string {
		return this.value;
	}
}

export class NumberValue extends RuntimeValue<number> {
	format(ctx: Context): string {
		// TODO(stasm): Cache NumberFormat.
		// TODO(stasm): Pass options.
		return new Intl.NumberFormat(ctx.locale).format(this.value);
	}
}

export class BooleanValue extends RuntimeValue<boolean> {
	format(ctx: Context): string {
		throw new TypeError("BooleanValue is not formattable.");
	}
}

// Resolution context for a single format_message() call.
export class Context {
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
				case "VariableReference":
					result += format_var(this, part);
					continue;
				case "FunctionCall":
					result += call_func(this, part);
					continue;
			}
		}

		this.visited.delete(parts);
		return result;
	}

	selectVariant(variants: Array<Variant>, selectors: Array<Selector>): Variant {
		interface ResolvedSelector {
			value: string | null;
			default: string;
		}

		let resolved_selectors: Array<ResolvedSelector> = [];
		for (let selector of selectors) {
			if (selector.expr === null) {
				// A special selector which only selects its default value. Used in the
				// data model of single-variant messages.
				resolved_selectors.push({value: null, default: selector.default.value});
				continue;
			}

			switch (selector.expr.type) {
				case "VariableReference": {
					// TODO(stasm): Should selection logic format the selector?
					let value = format_var(this, selector.expr);
					resolved_selectors.push({value, default: selector.default.value});
					break;
				}
				case "FunctionCall": {
					let value = call_func(this, selector.expr);
					resolved_selectors.push({value, default: selector.default.value});
					break;
				}
				default:
					// TODO(stasm): Should we allow Literals as selectors?
					throw new TypeError();
			}
		}

		function matches_corresponding_selector(key: StringLiteral, idx: number) {
			return (
				key.value === resolved_selectors[idx].value ||
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

	resolveValue(node: Parameter): RuntimeValue<unknown> {
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

function call_func(ctx: Context, func: FunctionCall): string {
	let callable = REGISTRY[func.name];
	return callable(ctx, func.args, func.opts);
}

function format_var(ctx: Context, variable: VariableReference): string {
	let value = ctx.vars[variable.name];
	return value.format(ctx);
}
