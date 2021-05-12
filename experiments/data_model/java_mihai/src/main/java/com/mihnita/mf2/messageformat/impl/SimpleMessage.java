package com.mihnita.mf2.messageformat.impl;

import java.util.Map;

import com.mihnita.mf2.messageformat.datamodel.IPart;
import com.mihnita.mf2.messageformat.datamodel.ISimpleMessage;
import com.mihnita.mf2.messageformat.datamodel.functions.IMessageFormatter;

public class SimpleMessage extends Message implements ISimpleMessage, IMessageFormatter { // xliff:unit
	private final IPart[] parts;

	public SimpleMessage(java.lang.String id, java.lang.String locale, IPart[] parts) {
		super(id, locale);
		this.parts = parts;
	}

	@Override
	public IPart[] parts() {
		return parts;
	}

	@Override
	public String format(Map<String, Object> parameters) {
		StringBuilder result = new StringBuilder();
		for (IPart part : this.parts) {
			if (part instanceof PlainText) {
				result = result.append(((PlainText) part).value());
			} else if (part instanceof Placeholder) {
				result = result.append(((Placeholder) part).format(locale, parameters));
			}
		}
		return result.toString();
	}	
}
