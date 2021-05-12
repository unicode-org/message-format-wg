package com.mihnita.mf2.messageformat.datamodel.functions;

import java.util.Map;

// Formats a message
public interface IMessageFormatter {
	String format(Map<String, Object> parameters);
}
