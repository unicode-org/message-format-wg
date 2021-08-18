declare namespace Intl {
	interface ListFormatOptions {
		// I added `string` to avoid having to validate the exact values of options.
		localeMatcher?: string | "best fit" | "lookup";
		type?: string | "conjunction" | "disjunction | unit";
		style?: string | "long" | "short" | "narrow";
	}

	type ListFormatPartTypes = "literal" | "element";

	interface ListFormatPart {
		type: ListFormatPartTypes;
		value: string;
	}

	interface ListFormat {
		format(value?: Array<unknown>): string;
		formatToParts(value?: Array<unknown>): ListFormatPart[];
	}

	var ListFormat: {
		new (locales?: string | string[], options?: ListFormatOptions): ListFormat;
		(locales?: string | string[], options?: ListFormatOptions): ListFormat;
	};
}
