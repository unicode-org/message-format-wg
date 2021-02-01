// https://docs.google.com/presentation/d/1nBnWv3nQQnS0zMkM5qsIE6f5zki3YDHXR-hdxJo1Pc0
// Slide 5
// https://play.rust-lang.org/?version=stable&mode=debug&edition=2018&gist=4a2886f54ecf1ac4a665a07f296aed58

export type Message = MessageValue;

export type MessageValue = Pattern;

export type Pattern = PatternElement[];

export type PatternElement = Text | Placeholder;
export type Text = string;
export type Placeholder = InlineExpression;

export type InlineExpression = StringLiteral | NumberLiteral | FunctionReference | VariableReference;

export type StringLiteral = string;
export type NumberLiteral = string;
export interface FunctionReference {
	id: Identifier;
	arguments: InlineExpression[];
}
export type VariableReference = Identifier;

export type Identifier = string;
