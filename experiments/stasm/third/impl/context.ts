import {Message, Parameter, PatternElement, Selector, StringLiteral, Variant} from "./model.js";
import {REGISTRY} from "./registry.js";
import {BooleanValue, NumberValue, RuntimeValue, StringValue} from "./runtime.js";

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
			output += value.formatToString(this);
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
		let selector_values: Array<RuntimeValue<unknown>> = [];
		let selector_defaults: Array<StringLiteral> = [];

		for (let selector of selectors) {
			switch (selector.expr.type) {
				case "VariableReference": {
					let value = this.vars[selector.expr.name];
					selector_values.push(value);
					selector_defaults.push(selector.default);
					break;
				}
				case "FunctionCall": {
					let callable = REGISTRY[selector.expr.name];
					let value = callable(this, selector.expr.args, selector.expr.opts);
					selector_values.push(value);
					selector_defaults.push(selector.default);
					break;
				}
				default:
					// TODO(stasm): Should we allow Literals as selectors?
					throw new TypeError();
			}
		}

		for (let variant of variants) {
			// When keys is an empty array, every() always returns true. This is
			// used single-variant messages to return their only variant.
			if (
				variant.keys.every(
					(key, idx) =>
						// Key matches corresponding selector value…
						selector_values[idx].match(this, key) ||
						// … or the corresponding default.
						key.value === selector_defaults[idx].value
				)
			) {
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
