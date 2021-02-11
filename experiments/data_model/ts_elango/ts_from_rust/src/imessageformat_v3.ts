// https://docs.google.com/presentation/d/1SYUNBoBtIxRnfvdAy8IXBXVQvUxdxIO4I6rquuO-zO0
// Slide 5

export interface SingleMessage {
	id: string;
	locale: string;
	pattern: MessagePattern;
}

export interface MessageGroup {
	id: string;
	locale: string;
	selectors: Selector[];
	messages: Map<SelectVal[], MessagePattern>;
}

export interface MessagePattern {
	parts: PatternPart[];
}

export type PatternPart = TextPart | Placeholder;

export interface TextPart {
	text: string;
}

export interface Placeholder {
	id: string;
	ph_type: PlaceholderType;
	default_text_val?: string;
	category: ValCategory;
}

export enum PlaceholderType {
	OPEN,
	CLOSE,
	STANDALONE
}

export interface Selector {
	name: string;
	category: ValCategory;
}
	
export interface SelectVal {
	val: unknown;
}

export enum ValCategoryEnum {
	GENDER,
	PLURAL,
}

export type ValCategory = ValCategoryEnum | string; // other: string

export interface Foo { // MessageFormatter methods
	select(selectors, runtime_vals, messages): MessagePattern;
	format(placeholder, val): string;
	format(pattern, runtime_vals): string;
}
	
// The parameters used when calling `format` at runtime
export type runtime_vals = Map<string, unknown>;
