package com.mihnita.mf2.messageformat.impl;

import com.mihnita.mf2.messageformat.datamodel.IPlainText;

public class PlainText implements IPlainText { // we can attach some "meta" to it, if we want
	private final String value;

	public PlainText(String value) {
		this.value = value;
	}

	@Override
	public String value() {
		return value;
	}
}
