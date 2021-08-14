import {NumberValue, StringValue} from "../messageformat2/runtime.js";
import {formatMessage} from "../messageformat2/index.js";
import {Message} from "../messageformat2/model.js";

console.log("==== English ====");

{
	let message: Message = {
		type: "Message",
		id: "phrases",
		phrases: {
			"added-photo": {
				type: "Phrase",
				selectors: [
					{
						expr: {
							type: "FunctionCall",
							name: "PLURAL",
							args: [{type: "VariableReference", name: "photoCount"}],
							opts: {},
						},
						default: {type: "StringLiteral", value: "other"},
					},
				],
				variants: [
					{
						keys: [{type: "StringLiteral", value: "one"}],
						value: [{type: "StringLiteral", value: "added a new photo"}],
					},
					{
						keys: [{type: "StringLiteral", value: "other"}],
						value: [
							{type: "StringLiteral", value: "added "},
							{type: "VariableReference", name: "photoCount"},
							{type: "StringLiteral", value: " new photos"},
						],
					},
				],
			},
			"their-album": {
				type: "Phrase",
				selectors: [
					{
						expr: {type: "VariableReference", name: "userGender"},
						default: {type: "StringLiteral", value: "other"},
					},
				],
				variants: [
					{
						keys: [{type: "StringLiteral", value: "masculine"}],
						value: [{type: "StringLiteral", value: "his album"}],
					},
					{
						keys: [{type: "StringLiteral", value: "feminine"}],
						value: [{type: "StringLiteral", value: "her album"}],
					},
					{
						keys: [{type: "StringLiteral", value: "other"}],
						value: [{type: "StringLiteral", value: "their album"}],
					},
				],
			},
		},
		selectors: [{expr: null, default: {type: "StringLiteral", value: "default"}}],
		variants: [
			{
				keys: [{type: "StringLiteral", value: "default"}],
				value: [
					{type: "VariableReference", name: "userName"},
					{type: "StringLiteral", value: " "},
					{
						type: "FunctionCall",
						name: "PHRASE",
						args: [{type: "StringLiteral", value: "added-photo"}],
						opts: {},
					},
					{type: "StringLiteral", value: " to "},
					{
						type: "FunctionCall",
						name: "PHRASE",
						args: [{type: "StringLiteral", value: "their-album"}],
						opts: {},
					},
					{type: "StringLiteral", value: "."},
				],
			},
		],
	};
	console.log(
		formatMessage("en", message, {
			userName: new StringValue("Mary"),
			userGender: new StringValue("feminine"),
			photoCount: new NumberValue(34),
		})
	);
}

console.log();
console.log("==== polski ====");

{
	let message: Message = {
		type: "Message",
		id: "phrases",
		phrases: {},
		selectors: [
			{
				expr: {type: "VariableReference", name: "userGender"},
				default: {type: "StringLiteral", value: "other"},
			},
			{
				expr: {
					type: "FunctionCall",
					name: "PLURAL",
					args: [{type: "VariableReference", name: "photoCount"}],
					opts: {},
				},
				default: {type: "StringLiteral", value: "many"},
			},
		],
		variants: [
			{
				keys: [
					{type: "StringLiteral", value: "masculine"},
					{type: "StringLiteral", value: "one"},
				],
				value: [
					{type: "VariableReference", name: "userName"},
					{type: "StringLiteral", value: " dodał nowe zdjęcie do swojego albumu."},
				],
			},
			{
				keys: [
					{type: "StringLiteral", value: "masculine"},
					{type: "StringLiteral", value: "few"},
				],
				value: [
					{type: "VariableReference", name: "userName"},
					{type: "StringLiteral", value: " dodał "},
					{type: "VariableReference", name: "photoCount"},
					{type: "StringLiteral", value: "nowe zdjęcia do swojego albumu."},
				],
			},
			{
				keys: [
					{type: "StringLiteral", value: "masculine"},
					{type: "StringLiteral", value: "many"},
				],
				value: [
					{type: "VariableReference", name: "userName"},
					{type: "StringLiteral", value: " dodał "},
					{type: "VariableReference", name: "photoCount"},
					{type: "StringLiteral", value: "nowych zdjęć do swojego albumu."},
				],
			},
			{
				keys: [
					{type: "StringLiteral", value: "feminine"},
					{type: "StringLiteral", value: "one"},
				],
				value: [
					{type: "VariableReference", name: "userName"},
					{type: "StringLiteral", value: " dodała nowe zdjęcie do swojego albumu."},
				],
			},
			{
				keys: [
					{type: "StringLiteral", value: "feminine"},
					{type: "StringLiteral", value: "few"},
				],
				value: [
					{type: "VariableReference", name: "userName"},
					{type: "StringLiteral", value: " dodała "},
					{type: "VariableReference", name: "photoCount"},
					{type: "StringLiteral", value: " nowe zdjęcia do swojego albumu."},
				],
			},
			{
				keys: [
					{type: "StringLiteral", value: "feminine"},
					{type: "StringLiteral", value: "many"},
				],
				value: [
					{type: "VariableReference", name: "userName"},
					{type: "StringLiteral", value: " dodała "},
					{type: "VariableReference", name: "photoCount"},
					{type: "StringLiteral", value: " nowych zdjęć do swojego albumu."},
				],
			},
			{
				keys: [
					{type: "StringLiteral", value: "other"},
					{type: "StringLiteral", value: "one"},
				],
				value: [
					{type: "StringLiteral", value: "Użytkownik "},
					{type: "VariableReference", name: "userName"},
					{type: "StringLiteral", value: " dodał nowe zdjęcie do swojego albumu."},
				],
			},
			{
				keys: [
					{type: "StringLiteral", value: "other"},
					{type: "StringLiteral", value: "few"},
				],
				value: [
					{type: "StringLiteral", value: "Użytkownik "},
					{type: "VariableReference", name: "userName"},
					{type: "StringLiteral", value: " dodał "},
					{type: "VariableReference", name: "photoCount"},
					{type: "StringLiteral", value: " nowe zdjęcia do swojego albumu."},
				],
			},
			{
				keys: [
					{type: "StringLiteral", value: "other"},
					{type: "StringLiteral", value: "many"},
				],
				value: [
					{type: "StringLiteral", value: "Użytkownik "},
					{type: "VariableReference", name: "userName"},
					{type: "StringLiteral", value: " dodał "},
					{type: "VariableReference", name: "photoCount"},
					{type: "StringLiteral", value: " nowych zdjęć do swojego albumu."},
				],
			},
		],
	};
	console.log(
		formatMessage("pl", message, {
			userName: new StringValue("Mary"),
			userGender: new StringValue("feminine"),
			photoCount: new NumberValue(34),
		})
	);
}
