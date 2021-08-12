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
						expr: {type: "VariableReference", name: "photoCount"},
						default: "other",
					},
				],
				variants: [
					{keys: ["one"], value: ["added a new photo"]},
					{
						keys: ["other"],
						value: [
							"added ",
							{
								type: "FunctionCall",
								name: "PLURAL",
								args: [{type: "VariableReference", name: "photoCount"}],
								scope: {},
							},
							" new photos",
						],
					},
				],
			},
			"their-album": {
				type: "Phrase",
				selectors: [
					{
						expr: {type: "VariableReference", name: "userGender"},
						default: "other",
					},
				],
				variants: [
					{keys: ["masculine"], value: ["his album"]},
					{keys: ["feminine"], value: ["her album"]},
					{keys: ["other"], value: ["their album"]},
				],
			},
		},
		selectors: [{expr: null, default: "default"}],
		variants: [
			{
				keys: ["default"],
				value: [
					{type: "VariableReference", name: "userName"},
					" ",
					{type: "FunctionCall", name: "PHRASE", args: ["added-photo"], scope: {}},
					" to ",
					{type: "FunctionCall", name: "PHRASE", args: ["their-album"], scope: {}},
					".",
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
				default: "other",
			},
			{
				expr: {
					type: "FunctionCall",
					name: "PLURAL",
					args: [{type: "VariableReference", name: "photoCount"}],
					scope: {},
				},
				default: "many",
			},
		],
		variants: [
			{
				keys: ["masculine", "one"],
				value: [
					{type: "VariableReference", name: "userName"},
					" dodał nowe zdjęcie do swojego albumu.",
				],
			},
			{
				keys: ["masculine", "few"],
				value: [
					{type: "VariableReference", name: "userName"},
					" dodał ",
					{type: "VariableReference", name: "photoCount"},
					"nowe zdjęcia do swojego albumu.",
				],
			},
			{
				keys: ["masculine", "many"],
				value: [
					{type: "VariableReference", name: "userName"},
					" dodał ",
					{type: "VariableReference", name: "photoCount"},
					"nowych zdjęć do swojego albumu.",
				],
			},
			{
				keys: ["feminine", "one"],
				value: [
					{type: "VariableReference", name: "userName"},
					" dodała nowe zdjęcie do swojego albumu.",
				],
			},
			{
				keys: ["feminine", "few"],
				value: [
					{type: "VariableReference", name: "userName"},
					" dodała ",
					{type: "VariableReference", name: "photoCount"},
					" nowe zdjęcia do swojego albumu.",
				],
			},
			{
				keys: ["feminine", "many"],
				value: [
					{type: "VariableReference", name: "userName"},
					" dodała ",
					{type: "VariableReference", name: "photoCount"},
					" nowych zdjęć do swojego albumu.",
				],
			},
			{
				keys: ["other", "one"],
				value: [
					"Użytkownik ",
					{type: "VariableReference", name: "userName"},
					" dodał nowe zdjęcie do swojego albumu.",
				],
			},
			{
				keys: ["other", "few"],
				value: [
					"Użytkownik ",
					{type: "VariableReference", name: "userName"},
					" dodał ",
					{type: "VariableReference", name: "photoCount"},
					" nowe zdjęcia do swojego albumu.",
				],
			},
			{
				keys: ["other", "many"],
				value: [
					"Użytkownik ",
					{type: "VariableReference", name: "userName"},
					" dodał ",
					{type: "VariableReference", name: "photoCount"},
					" nowych zdjęć do swojego albumu.",
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
