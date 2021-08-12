import {Message} from "../messageformat2/model.js";

export let en_phrases: Message = {
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

export let en_accord: Message = {
	type: "Message",
	id: "accord",
	phrases: {},
	selectors: [{expr: null, default: "default"}],
	variants: [
		{
			keys: ["default"],
			value: [
				"The ",
				{
					type: "FunctionCall",
					name: "NOUN",
					args: [{type: "VariableReference", name: "item"}],
					scope: {},
				},
				" is ",
				{
					type: "FunctionCall",
					name: "ADJECTIVE",
					args: [{type: "VariableReference", name: "color"}],
					scope: {
						ACCORD_WITH: {type: "VariableReference", name: "item"},
					},
				},
				".",
			],
		},
	],
};

export let en_you_see: Message = {
	type: "Message",
	id: "you-see",
	phrases: {},
	selectors: [{expr: null, default: "default"}],
	variants: [
		{
			keys: ["default"],
			value: [
				"You see ",
				{
					type: "FunctionCall",
					name: "ACTOR",
					args: [{type: "VariableReference", name: "monster"}],
					scope: {
						INDEFINITE: true,
					},
				},
				"!",
			],
		},
	],
};

export let en_they_wave: Message = {
	type: "Message",
	id: "they-wave",
	phrases: {},
	selectors: [{expr: null, default: "default"}],
	variants: [
		{
			keys: ["default"],
			value: [
				{
					type: "FunctionCall",
					name: "ACTOR",
					args: [{type: "VariableReference", name: "monster"}],
					scope: {
						DEFINITE: true,
						CAPITALIZED: true,
					},
				},
				" waves at you!",
			],
		},
	],
};
