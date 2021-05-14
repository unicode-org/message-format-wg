package com.mihnita.mf2.messageformat.datamodel.functions;

import java.util.Map;

public interface IPlaceholderFormatter {
	/*
	 * After implementing a few of these formatters I think that the most
	 * flexible approach would be to have something like:
	 *    IFormattable chain(IFormattable value, ...)
     *    String format(IFormattable value, ...)
	 *    IFormattedParts formatToParts(IFormattable value, ...)
	 *
	 * Then we can "chain" functions by doing this:
	 *    f3.format(f2.chain(f1.chain(value, ...), ...), ...)
	 *
	 * In languages without RTI `IFormattable` would carry info about the type
	 * (for example ICU4C: https://unicode-org.github.io/icu-docs/apidoc/dev/icu4c/classicu_1_1Format.html) 
	 */
	String format(Object value, String locale, Map<String, String> options);
}
