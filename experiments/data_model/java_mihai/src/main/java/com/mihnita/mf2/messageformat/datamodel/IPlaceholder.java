package com.mihnita.mf2.messageformat.datamodel;

import java.util.Map;

/** This also has a function associated with it. */
public interface IPlaceholder extends IPart { // xliff: ph, pc, sc, ec. No cp, mrk, sm, em
	// Think `{expDate, date, ::dMMMy}` in ICU MessageFormat
	String name(); // icu:`expDate` ::: The name of the thing I format. "The thing": in param, evn, xref
	String formatter_name(); // (function_name? formatter_name?) icu:`date` ::: What name of the formatter to use. Registry.
	Map<String, String> options(); //  icu:`::dMMMy` ::: How to format

	public String format(String locale, Map<String, Object> parameters);
}
