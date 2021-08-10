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
	expr: VariableReference | FunctionCall | null;
	default: string;
}

export interface Variant {
	keys: Array<string>;
	value: Array<Part>;
}

export interface FunctionCall {
	type: "FunctionCall";
	name: string;
	args: Array<Argument>;
	scope: Record<string, Parameter>;
}

export interface VariableReference {
	type: "VariableReference";
	name: string;
}

export type Argument = string | VariableReference;
export type Parameter = boolean | number | Argument;
export type Pattern = Array<Part>;
export type Part = string | VariableReference | FunctionCall;
