import {format} from "../messageformat2/context.js";
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
							scope: {},
						},
						default: {type: "StringValue", value: "other"},
					},
				],
				variants: [
					{
						keys: [{type: "StringValue", value: "one"}],
						value: [{type: "StringValue", value: "added a new photo"}],
					},
					{
						keys: [{type: "StringValue", value: "other"}],
						value: [
							{type: "StringValue", value: "added "},
							{type: "VariableReference", name: "photoCount"},
							{type: "StringValue", value: " new photos"},
						],
					},
				],
			},
			"their-album": {
				type: "Phrase",
				selectors: [
					{
						expr: {type: "VariableReference", name: "userGender"},
						default: {type: "StringValue", value: "other"},
					},
				],
				variants: [
					{
						keys: [{type: "StringValue", value: "masculine"}],
						value: [{type: "StringValue", value: "his album"}],
					},
					{
						keys: [{type: "StringValue", value: "feminine"}],
						value: [{type: "StringValue", value: "her album"}],
					},
					{
						keys: [{type: "StringValue", value: "other"}],
						value: [{type: "StringValue", value: "their album"}],
					},
				],
			},
		},
		selectors: [{expr: null, default: {type: "StringValue", value: "default"}}],
		variants: [
			{
				keys: [{type: "StringValue", value: "default"}],
				value: [
					{type: "VariableReference", name: "userName"},
					{type: "StringValue", value: " "},
					{
						type: "FunctionCall",
						name: "PHRASE",
						args: [{type: "StringValue", value: "added-photo"}],
						scope: {},
					},
					{type: "StringValue", value: " to "},
					{
						type: "FunctionCall",
						name: "PHRASE",
						args: [{type: "StringValue", value: "their-album"}],
						scope: {},
					},
					{type: "StringValue", value: "."},
				],
			},
		],
	};
	console.log(
		format("en", message, {
			userName: "Mary",
			userGender: "feminine",
			photoCount: 34,
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
				default: {type: "StringValue", value: "other"},
			},
			{
				expr: {
					type: "FunctionCall",
					name: "PLURAL",
					args: [{type: "VariableReference", name: "photoCount"}],
					scope: {},
				},
				default: {type: "StringValue", value: "many"},
			},
		],
		variants: [
			{
				keys: [
					{type: "StringValue", value: "masculine"},
					{type: "StringValue", value: "one"},
				],
				value: [
					{type: "VariableReference", name: "userName"},
					{type: "StringValue", value: " dodał nowe zdjęcie do swojego albumu."},
				],
			},
			{
				keys: [
					{type: "StringValue", value: "masculine"},
					{type: "StringValue", value: "few"},
				],
				value: [
					{type: "VariableReference", name: "userName"},
					{type: "StringValue", value: " dodał "},
					{type: "VariableReference", name: "photoCount"},
					{type: "StringValue", value: "nowe zdjęcia do swojego albumu."},
				],
			},
			{
				keys: [
					{type: "StringValue", value: "masculine"},
					{type: "StringValue", value: "many"},
				],
				value: [
					{type: "VariableReference", name: "userName"},
					{type: "StringValue", value: " dodał "},
					{type: "VariableReference", name: "photoCount"},
					{type: "StringValue", value: "nowych zdjęć do swojego albumu."},
				],
			},
			{
				keys: [
					{type: "StringValue", value: "feminine"},
					{type: "StringValue", value: "one"},
				],
				value: [
					{type: "VariableReference", name: "userName"},
					{type: "StringValue", value: " dodała nowe zdjęcie do swojego albumu."},
				],
			},
			{
				keys: [
					{type: "StringValue", value: "feminine"},
					{type: "StringValue", value: "few"},
				],
				value: [
					{type: "VariableReference", name: "userName"},
					{type: "StringValue", value: " dodała "},
					{type: "VariableReference", name: "photoCount"},
					{type: "StringValue", value: " nowe zdjęcia do swojego albumu."},
				],
			},
			{
				keys: [
					{type: "StringValue", value: "feminine"},
					{type: "StringValue", value: "many"},
				],
				value: [
					{type: "VariableReference", name: "userName"},
					{type: "StringValue", value: " dodała "},
					{type: "VariableReference", name: "photoCount"},
					{type: "StringValue", value: " nowych zdjęć do swojego albumu."},
				],
			},
			{
				keys: [
					{type: "StringValue", value: "other"},
					{type: "StringValue", value: "one"},
				],
				value: [
					{type: "StringValue", value: "Użytkownik "},
					{type: "VariableReference", name: "userName"},
					{type: "StringValue", value: " dodał nowe zdjęcie do swojego albumu."},
				],
			},
			{
				keys: [
					{type: "StringValue", value: "other"},
					{type: "StringValue", value: "few"},
				],
				value: [
					{type: "StringValue", value: "Użytkownik "},
					{type: "VariableReference", name: "userName"},
					{type: "StringValue", value: " dodał "},
					{type: "VariableReference", name: "photoCount"},
					{type: "StringValue", value: " nowe zdjęcia do swojego albumu."},
				],
			},
			{
				keys: [
					{type: "StringValue", value: "other"},
					{type: "StringValue", value: "many"},
				],
				value: [
					{type: "StringValue", value: "Użytkownik "},
					{type: "VariableReference", name: "userName"},
					{type: "StringValue", value: " dodał "},
					{type: "VariableReference", name: "photoCount"},
					{type: "StringValue", value: " nowych zdjęć do swojego albumu."},
				],
			},
		],
	};
	console.log(
		format("pl", message, {
			userName: "Mary",
			userGender: "feminine",
			photoCount: 34,
		})
	);
}
