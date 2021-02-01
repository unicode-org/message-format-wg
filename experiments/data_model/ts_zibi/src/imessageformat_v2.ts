// https://docs.google.com/presentation/d/1nBnWv3nQQnS0zMkM5qsIE6f5zki3YDHXR-hdxJo1Pc0
// Slide 6
// https://play.rust-lang.org/?version=stable&mode=debug&edition=2018&gist=1acfc34ed95de4191a555b4af3235320

export type Message = MessageValue;

export type MessageValue = Single | Multi;

export type Single = Pattern;

export interface Multi {
	selector: InlineExpression;
	variants: Variant[];
}

export type Pattern = PatternElement[];

export type PatternElement = Text | Placeholder;
export type Text = string;
export type Placeholder = InlineExpression;

export interface Variant {
	key: VariantKey;
	value: Pattern;
}

export type VariantKey = StringLiteral | NumberLiteral;

export type InlineExpression = StringLiteral | NumberLiteral | FunctionReference | VariableReference;

export type StringLiteral = string;
export type NumberLiteral = string;
export interface FunctionReference {
	id: Identifier;
	arguments: InlineExpression[];
}
export type VariableReference = Identifier;

export type Identifier = string;
