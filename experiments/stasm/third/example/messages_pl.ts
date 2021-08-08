import {Func, Message, Pattern} from "../messageformat2/model.js";

export let pl_phrases = <Message>{
	type: "Message",
	id: "phrases",
	phrases: {},
	selectors: [
		{
			expr: <Func>{name: "VAR", args: ["userGender"], scope: {}},
			default: "other",
		},
		{
			expr: <Func>{name: "PLURAL", args: ["photoCount"], scope: {}},
			default: "many",
		},
	],
	variants: [
		{
			keys: ["masculine", "one"],
			value: <Pattern>[
				<Func>{name: "VAR", args: ["userName"], scope: {}},
				" dodał nowe zdjęcie do swojego albumu.",
			],
		},
		{
			keys: ["masculine", "few"],
			value: <Pattern>[
				<Func>{name: "VAR", args: ["userName"], scope: {}},
				" dodał ",
				<Func>{name: "VAR", args: ["photoCount"], scope: {}},
				"nowe zdjęcia do swojego albumu.",
			],
		},
		{
			keys: ["masculine", "many"],
			value: <Pattern>[
				<Func>{name: "VAR", args: ["userName"], scope: {}},
				" dodał ",
				<Func>{name: "VAR", args: ["photoCount"], scope: {}},
				"nowych zdjęć do swojego albumu.",
			],
		},
		{
			keys: ["feminine", "one"],
			value: <Pattern>[
				<Func>{name: "VAR", args: ["userName"], scope: {}},
				" dodała nowe zdjęcie do swojego albumu.",
			],
		},
		{
			keys: ["feminine", "few"],
			value: <Pattern>[
				<Func>{name: "VAR", args: ["userName"], scope: {}},
				" dodała ",
				<Func>{name: "VAR", args: ["photoCount"], scope: {}},
				" nowe zdjęcia do swojego albumu.",
			],
		},
		{
			keys: ["feminine", "many"],
			value: <Pattern>[
				<Func>{name: "VAR", args: ["userName"], scope: {}},
				" dodała ",
				<Func>{name: "VAR", args: ["photoCount"], scope: {}},
				" nowych zdjęć do swojego albumu.",
			],
		},
		{
			keys: ["other", "one"],
			value: <Pattern>[
				"Użytkownik ",
				<Func>{name: "VAR", args: ["userName"], scope: {}},
				" dodał nowe zdjęcie do swojego albumu.",
			],
		},
		{
			keys: ["other", "few"],
			value: <Pattern>[
				"Użytkownik ",
				<Func>{name: "VAR", args: ["userName"], scope: {}},
				" dodał ",
				<Func>{name: "VAR", args: ["photoCount"], scope: {}},
				" nowe zdjęcia do swojego albumu.",
			],
		},
		{
			keys: ["other", "many"],
			value: <Pattern>[
				"Użytkownik ",
				<Func>{name: "VAR", args: ["userName"], scope: {}},
				" dodał ",
				<Func>{name: "VAR", args: ["photoCount"], scope: {}},
				" nowych zdjęć do swojego albumu.",
			],
		},
	],
};

export let pl_accord = <Message>{
	type: "Message",
	id: "accord",
	phrases: {},
	selectors: [{expr: null, default: "default"}],
	variants: [
		{
			keys: ["default"],
			value: <Pattern>[
				<Func>{name: "NOUN", args: ["item"], scope: {capitalized: true}},
				" jest ",
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
