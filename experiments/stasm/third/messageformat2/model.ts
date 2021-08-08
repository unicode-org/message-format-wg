export type Formattable = Message | Phrase;

export interface Message {
	type: "Message";
	id: string;
	selectors: Array<Selector>;
	variants: Array<Variant>;
	phrases: Record<string, Phrase>;
}

export interface Phrase {
	type: "Phrase";
	selectors: Array<Selector>;
	variants: Array<Variant>;
}

export interface Selector {
	expr: Func | null;
	default: string;
}

export interface Variant {
	keys: Array<string>;
	value: Array<Part>;
}

export interface Func {
	name: string;
	args: Array<string>;
	scope: Record<string, Primitive>;
}

export type Primitive = boolean | string | number;
export type Pattern = Array<Part>;
export type Part = string | Func;
