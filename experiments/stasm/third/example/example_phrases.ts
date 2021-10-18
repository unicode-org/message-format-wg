import {test} from "tap";
import {Message} from "../impl/model.js";
import {
	formatMessage,
	FormattableNumber,
	FormattableString,
	formatToParts,
} from "../impl/runtime.js";

test("Phrase references (English)", (tap) => {
	let message: Message = {
		lang: "en",
		id: "phrases",
		phrases: {
			"added-photo": {
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
				selectors: [
					{
						expr: {
							type: "FunctionCall",
							name: "CHOOSE",
							args: [{type: "VariableReference", name: "userGender"}],
							opts: {},
						},
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
		selectors: [],
		variants: [
			{
				keys: [],
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

	tap.equal(
		formatMessage(message, {
			userName: new FormattableString("Mary"),
			userGender: new FormattableString("feminine"),
			photoCount: new FormattableNumber(34),
		}),
		"Mary added 34 new photos to her album."
	);

	tap.same(
		formatToParts(message, {
			userName: new FormattableString("Mary"),
			userGender: new FormattableString("feminine"),
			photoCount: new FormattableNumber(34),
		}),
		[
			{type: "literal", value: "Mary"},
			{type: "literal", value: " "},
			{type: "literal", value: "added "},
			{type: "integer", value: "34"},
			{type: "literal", value: " new photos"},
			{type: "literal", value: " to "},
			{type: "literal", value: "her album"},
			{type: "literal", value: "."},
		]
	);

	tap.end();
});

test("Phrase references (Polish)", (tap) => {
	let message: Message = {
		lang: "pl",
		id: "phrases",
		phrases: {},
		selectors: [
			{
				expr: {
					type: "FunctionCall",
					name: "CHOOSE",
					args: [{type: "VariableReference", name: "userGender"}],
					opts: {},
				},
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

	tap.equal(
		formatMessage(message, {
			userName: new FormattableString("Mary"),
			userGender: new FormattableString("feminine"),
			photoCount: new FormattableNumber(34),
		}),
		"Mary dodała 34 nowe zdjęcia do swojego albumu."
	);

	tap.same(
		formatToParts(message, {
			userName: new FormattableString("Mary"),
			userGender: new FormattableString("feminine"),
			photoCount: new FormattableNumber(34),
		}),
		[
			{type: "literal", value: "Mary"},
			{type: "literal", value: " dodała "},
			{type: "integer", value: "34"},
			{type: "literal", value: " nowe zdjęcia do swojego albumu."},
		]
	);

	tap.end();
});
