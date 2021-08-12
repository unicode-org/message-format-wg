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
	default: StringValue;
}

export interface Variant {
	keys: Array<StringValue>;
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

export interface StringValue {
	type: "StringValue";
	value: string;
}

export interface NumberValue {
	type: "NumberValue";
	value: string;
}

export interface BooleanValue {
	type: "BooleanValue";
	value: boolean;
}

export type Argument = StringValue | VariableReference;
export type Parameter = StringValue | VariableReference | BooleanValue | NumberValue;
export type Pattern = Array<Part>;
export type Part = StringValue | VariableReference | FunctionCall;
