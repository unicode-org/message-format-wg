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
	default: StringLiteral;
}

export interface Variant {
	keys: Array<StringLiteral>;
	value: Array<Part>;
}

export interface FunctionCall {
	type: "FunctionCall";
	name: string;
	args: Array<Argument>;
	opts: Record<string, Parameter>;
}

export interface VariableReference {
	type: "VariableReference";
	name: string;
}

export interface StringLiteral {
	type: "StringLiteral";
	value: string;
}

export interface NumberLiteral {
	type: "NumberLiteral";
	value: string;
}

export interface BooleanLiteral {
	type: "BooleanLiteral";
	value: boolean;
}

export type Argument = StringLiteral | VariableReference;
export type Parameter = StringLiteral | VariableReference | BooleanLiteral | NumberLiteral;
export type Part = StringLiteral | VariableReference | FunctionCall;
