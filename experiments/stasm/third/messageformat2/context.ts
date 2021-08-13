import {
	Formattable,
	FunctionCall,
	Parameter,
	Selector,
	VariableReference,
	Argument,
	StringValue,
	Part,
} from "./model.js";
import {REGISTRY} from "./registry.js";

export interface RuntimeVariable {
	valueOf(): unknown;
	toString(): string;
}

export interface Context {
	locale: string;
	formattable: Formattable;
	vars: Record<string, RuntimeVariable>;
	// cached formatters,
}

export function format(
	locale: string,
	formattable: Formattable,
	vars: Record<string, any>
): string {
	let ctx: Context = {
		locale,
		formattable,
		vars,
	};

	let resolved_selectors: Array<ResolvedSelector> = [];
	for (let selector of formattable.selectors) {
		resolved_selectors.push(resolve_selector(ctx, selector));
	}

	function matches_corresponding_selector(key: StringValue, idx: number) {
		return (
			key.value === resolved_selectors[idx].value ||
			key.value === resolved_selectors[idx].default
		);
	}

	for (let variant of formattable.variants) {
		if (variant.keys.every(matches_corresponding_selector)) {
			return resolve_parts(ctx, variant.value);
		}
	}

	throw new RangeError();
}

interface ResolvedSelector {
	value: string | null;
	default: string;
}

function resolve_selector(ctx: Context, selector: Selector): ResolvedSelector {
	if (selector.expr === null) {
		// A special selector which only selects its default value. Used in the
		// data model of single-variant messages.
		return {value: null, default: selector.default.value};
	}

	switch (selector.expr.type) {
		case "VariableReference": {
			// TODO(stasm): Should selection logic format the selector?
			let value = format_var(ctx, selector.expr);
			return {value, default: selector.default.value};
		}
		case "FunctionCall": {
			let value = call_func(ctx, selector.expr);
			return {value, default: selector.default.value};
		}
		default:
			// TODO(stasm): Should we allow StringValue or NumberValue as selectors?
			throw new TypeError();
	}
}

function resolve_parts(ctx: Context, parts: Array<Part>): string {
	let result = "";
	for (let part of parts) {
		switch (part.type) {
			case "StringValue":
				result += part.value;
				continue;
			case "VariableReference":
				result += format_var(ctx, part).toString();
				continue;
			case "FunctionCall":
				result += call_func(ctx, part).toString();
				continue;
		}
	}
	return result;
}

function call_func(ctx: Context, func: FunctionCall): string {
	let callable = REGISTRY[func.name];
	return callable(ctx, func.args, func.scope);
}

function format_var(ctx: Context, variable: VariableReference): string {
	let value = ctx.vars[variable.name];
	switch (typeof value) {
		case "string":
			return value;
		case "number":
			// TODO(stasm): Cache NumberFormat.
			// TODO(stasm): Pass options.
			return new Intl.NumberFormat(ctx.locale).format(value);
		default:
			// TODO(stasm): How to format other variable types?
			throw new TypeError("Unknown variable type.");
	}
}

export function resolve_arg(ctx: Context, arg: Argument): unknown {
	switch (arg.type) {
		case "StringValue":
			return arg.value;
		case "VariableReference":
			return ctx.vars[arg.name].valueOf();
		default:
			throw new TypeError("Invalid argument type.");
	}
}

export function resolve_param(ctx: Context, param: Parameter): unknown {
	switch (param.type) {
		case "VariableReference":
			return ctx.vars[param.name].valueOf();
		default:
			return param.value;
	}
}
