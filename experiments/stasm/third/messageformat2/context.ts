import {
	Formattable,
	FunctionCall,
	Pattern,
	Parameter,
	Selector,
	VariableReference,
} from "./model.js";
import {REGISTRY} from "./registry.js";

export interface RuntimeVariable {
	valueOf(): any;
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

	function matches_corresponding_selector(key: Parameter, idx: number) {
		return key === resolved_selectors[idx].value || key === resolved_selectors[idx].default;
	}

	for (let variant of formattable.variants) {
		if (variant.keys.every(matches_corresponding_selector)) {
			return resolve_pattern(ctx, variant.value);
		}
	}

	throw new RangeError();
}

interface ResolvedSelector {
	value: Parameter | null;
	default: Parameter;
}

function resolve_selector(ctx: Context, selector: Selector): ResolvedSelector {
	if (selector.expr === null) {
		// A special selector which only selects its default value. Used in the
		// data model of single-variant messages.
		return {value: null, default: selector.default};
	}

	switch (selector.expr.type) {
		case "VariableReference": {
			let value = format_var(ctx, selector.expr);
			return {value, default: selector.default};
		}
		case "FunctionCall": {
			let value = call_func(ctx, selector.expr);
			return {value, default: selector.default};
		}
	}
}

function resolve_pattern(ctx: Context, pattern: Pattern): string {
	let result = "";
	for (let part of pattern) {
		if (typeof part === "string") {
			result += part;
			continue;
		}

		if (part.type === "VariableReference") {
			result += format_var(ctx, part).toString();
			continue;
		}

		if (part.type === "FunctionCall") {
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

export function resolve_arg(
	ctx: Context,
	arg: string | VariableReference
): string | RuntimeVariable {
	if (typeof arg === "string") {
		return arg;
	} else {
		return ctx.vars[arg.name];
	}
}

export function resolve_param(
	ctx: Context,
	param: Parameter
): string | number | boolean | RuntimeVariable {
	if (typeof param === "string" || typeof param === "number" || typeof param === "boolean") {
		return param;
	} else {
		return ctx.vars[param.name];
	}
}
