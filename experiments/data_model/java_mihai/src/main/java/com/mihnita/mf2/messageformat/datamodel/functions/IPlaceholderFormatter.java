package com.mihnita.mf2.messageformat.datamodel.functions;

import java.util.Map;

public interface IPlaceholderFormatter {
	String format(Object value, String locale, Map<String, String> options);
}
