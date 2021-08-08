import {Func, Message, Pattern, Phrase} from "../messageformat2/model.js";

export let en_phrases = <Message>{
	type: "Message",
	id: "phrases",
	phrases: {
		"added-photo": <Phrase>{
			type: "Phrase",
			selectors: [
				{
					expr: <Func>{name: "VAR", args: ["photoCount"], scope: {}},
					default: "other",
				},
			],
			variants: [
				{keys: ["one"], value: <Pattern>["added a new photo"]},
				{
					keys: ["other"],
					value: <Pattern>[
						"added ",
						<Func>{name: "PLURAL", args: ["photoCount"], scope: {}},
						" new photos",
					],
				},
			],
		},
		"their-album": <Phrase>{
			type: "Phrase",
			selectors: [
				{
					expr: <Func>{name: "VAR", args: ["userGender"], scope: {}},
					default: "other",
				},
			],
			variants: [
				{keys: ["masculine"], value: <Pattern>["his album"]},
				{keys: ["feminine"], value: <Pattern>["her album"]},
				{keys: ["other"], value: <Pattern>["their album"]},
			],
		},
	},
	selectors: [{expr: null, default: "default"}],
	variants: [
		{
			keys: ["default"],
			value: <Pattern>[
				<Func>{name: "VAR", args: ["userName"], scope: {}},
				" ",
				<Func>{name: "PHRASE", args: ["added-photo"], scope: {}},
				" to ",
				<Func>{name: "PHRASE", args: ["their-album"], scope: {}},
				".",
			],
		},
	],
};

export let en_accord = <Message>{
	type: "Message",
	id: "accord",
	phrases: {},
	selectors: [{expr: null, default: "default"}],
	variants: [
		{
			keys: ["default"],
			value: <Pattern>[
				"The ",
				<Func>{name: "NOUN", args: ["item"], scope: {}},
				" is ",
				<Func>{
					name: "ADJECTIVE",
					args: ["color"],
					scope: {
						accord_with: "item",
					},
				},
				".",
			],
		},
	],
};
