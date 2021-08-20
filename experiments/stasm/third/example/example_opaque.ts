import {test} from "tap";
import {FormattingContext} from "../impl/context.js";
import {Message} from "../impl/model.js";
import {formatToParts, OpaquePart, RuntimeValue} from "../impl/runtime.js";

// We want to pass it into the translation and get it back out unformatted, in
// the correct position in the sentence, via formatToParts.
class SomeUnstringifiableClass {}

// TODO(stasm): This is generic enough that it could be in impl/runtime.ts.
class WrappedValue extends RuntimeValue<SomeUnstringifiableClass> {
	formatToString(ctx: FormattingContext): string {
		throw new Error("Method not implemented.");
	}

	*formatToParts(ctx: FormattingContext): IterableIterator<OpaquePart> {
		yield {type: "opaque", value: this.value};
	}
}

test("Pass an opaque instance as a variable", (tap) => {
	// "Ready? Then {$submitButton}!"
	let message: Message = {
		lang: "en",
		id: "submit",
		phrases: {},
		selectors: [],
		variants: [
			{
				keys: [],
				value: [
					{type: "StringLiteral", value: "Ready? Then  "},
					{
						type: "VariableReference",
						name: "submitButton",
					},
					{type: "StringLiteral", value: "!"},
				],
			},
		],
	};

	let instance = new SomeUnstringifiableClass();

	tap.same(
		formatToParts(message, {
			submitButton: new WrappedValue(instance),
		}),
		[
			{type: "literal", value: "Ready? Then  "},
			{type: "opaque", value: instance},
			{type: "literal", value: "!"},
		]
	);

	tap.end();
});
