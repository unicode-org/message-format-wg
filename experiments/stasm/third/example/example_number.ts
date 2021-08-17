import {Message} from "../impl/model.js";
import {formatMessage, formatToParts, NumberValue} from "../impl/runtime.js";

console.log("==== English ====");

{
	// "Transferred {NUMBER $payloadSize STYLE unit UNIT megabyte}."
	let message: Message = {
		lang: "en",
		id: "transferred",
		phrases: {},
		selectors: [
			{
				expr: null,
				default: {type: "StringLiteral", value: "default"},
			},
		],
		variants: [
			{
				keys: [{type: "StringLiteral", value: "default"}],
				value: [
					{type: "StringLiteral", value: "Transferred "},
					{
						type: "FunctionCall",
						name: "NUMBER",
						args: [{type: "VariableReference", name: "payloadSize"}],
						opts: {
							STYLE: {type: "StringLiteral", value: "unit"},
							UNIT: {type: "StringLiteral", value: "megabyte"},
						},
					},
					{type: "StringLiteral", value: "."},
				],
			},
		],
	};
	console.log(
		formatMessage(message, {
			payloadSize: new NumberValue(1.23),
		})
	);
}

console.log("==== French ====");

{
	// "{NUMBER $payloadSize STYLE unit UNIT megabyte} transféré."
	let message: Message = {
		lang: "fr",
		id: "transferred",
		phrases: {},
		selectors: [
			{
				expr: null,
				default: {type: "StringLiteral", value: "default"},
			},
		],
		variants: [
			{
				keys: [{type: "StringLiteral", value: "default"}],
				value: [
					{
						type: "FunctionCall",
						name: "NUMBER",
						args: [{type: "VariableReference", name: "payloadSize"}],
						opts: {
							STYLE: {type: "StringLiteral", value: "unit"},
							UNIT: {type: "StringLiteral", value: "megabyte"},
						},
					},
					{type: "StringLiteral", value: " transféré."},
				],
			},
		],
	};
	console.log(
		formatMessage(message, {
			payloadSize: new NumberValue(1.23),
		})
	);
	console.log(
		Array.of(
			...formatToParts(message, {
				payloadSize: new NumberValue(1.23),
			})
		)
	);
}
