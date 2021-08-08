import {Formattable, Func, Pattern, Primitive, Selector} from "./model.js";
import {REGISTRY} from "./registry.js";

export type Variable = string | number;

export interface Context {
	locale: string;
	formattable: Formattable;
	vars: Record<string, Variable>;
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

	function matches_corresponding_selector(key: Primitive, idx: number) {
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
	value: Primitive | null;
	default: Primitive;
}

function resolve_selector(ctx: Context, selector: Selector): ResolvedSelector {
	if (selector.expr) {
		let value = call(ctx, selector.expr);
		return {value, default: selector.default};
	} else {
		return {value: null, default: selector.default};
	}
}

function resolve_pattern(ctx: Context, pattern: Pattern): string {
	let result = "";
	for (let part of pattern) {
		if (typeof part === "string") {
			result += part;
			continue;
		}

		// Otherwise it's a function call.
		result += call(ctx, part).toString();
	}
	return result;
}

function call(ctx: Context, func: Func): Primitive {
	let callable = REGISTRY[func.name];
	return callable(ctx, func.args, func.scope);
}
