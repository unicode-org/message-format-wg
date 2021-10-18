import {FormattingContext} from "./context.js";
import {VariantKey} from "./model.js";
import {RuntimeNumber, RuntimeString, RuntimeValue} from "./RuntimeValue.js";

export interface Matchable {
	match(ctx: FormattingContext, key: VariantKey): boolean;
}

export function isMatchable(instance: object): instance is Matchable {
	return "match" in instance;
}

export class MatchableString extends RuntimeString implements Matchable {
	match(ctx: FormattingContext, key: VariantKey): boolean {
		return this.value === key.value;
	}
}

export class MatchableNumber extends RuntimeNumber implements Matchable {
	private opts: Intl.NumberFormatOptions;

	constructor(value: number, opts: Intl.NumberFormatOptions = {}) {
		super(value);
		this.opts = opts;
	}

	match(ctx: FormattingContext, key: VariantKey): boolean {
		if (key.type === "IntegerLiteral") {
			return this.value === parseInt(key.value);
		}
		return false;
	}
}

export class MatchablePlural extends RuntimeValue<Intl.LDMLPluralRule> implements Matchable {
	public count: number;

	constructor(value: Intl.LDMLPluralRule, count: number) {
		super(value);
		this.count = count;
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
