import {test} from "tap";
import {Message} from "../impl/model.js";
import {formatMessage, FormattableNumber, formatToParts} from "../impl/runtime.js";

test("Number formatting (English)", (tap) => {
	// "Transferred {NUMBER $payloadSize STYLE unit UNIT megabyte}."
	let message: Message = {
		lang: "en",
		id: "transferred",
		phrases: {},
		selectors: [],
		variants: [
			{
				keys: [],
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

	tap.equal(
		formatMessage(message, {
			payloadSize: new FormattableNumber(1.23),
		}),
		"Transferred 1.23 MB."
	);

	tap.same(
		formatToParts(message, {
			payloadSize: new FormattableNumber(1.23),
		}),
		[
			{type: "literal", value: "Transferred "},
			{type: "integer", value: "1"},
			{type: "decimal", value: "."},
			{type: "fraction", value: "23"},
			{type: "literal", value: " "},
			{type: "unit", value: "MB"},
			{type: "literal", value: "."},
		]
	);

	tap.end();
});

test("Number formatting (French)", (tap) => {
	// "{NUMBER $payloadSize STYLE unit UNIT megabyte} transféré."
	let message: Message = {
		lang: "fr",
		id: "transferred",
		phrases: {},
		selectors: [],
		variants: [
			{
				keys: [],
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

	tap.equal(
		formatMessage(message, {
			payloadSize: new FormattableNumber(1.23),
		}),
		"1,23 Mo transféré."
	);

	tap.same(
		formatToParts(message, {
			payloadSize: new FormattableNumber(1.23),
		}),
		[
			{type: "integer", value: "1"},
			{type: "decimal", value: ","},
			{type: "fraction", value: "23"},
			{type: "literal", value: " "},
			{type: "unit", value: "Mo"},
			{type: "literal", value: " transféré."},
		]
	);

	tap.end();
});
