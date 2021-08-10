import {Message} from "../messageformat2/model.js";

export let pl_phrases: Message = {
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

export let pl_accord: Message = {
	type: "Message",
	id: "accord",
	phrases: {},
	selectors: [{expr: null, default: "default"}],
	variants: [
		{
			keys: ["default"],
			value: [
				{
					type: "FunctionCall",
					name: "NOUN",
					args: [{type: "VariableReference", name: "item"}],
					scope: {capitalized: true},
				},
				" jest ",
				{
					type: "FunctionCall",
					name: "ADJECTIVE",
					args: [{type: "VariableReference", name: "color"}],
					scope: {
						accord_with: {type: "VariableReference", name: "item"},
					},
				},
				".",
			],
		},
	],
};
