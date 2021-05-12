package com.mihnita.mf2.messageformat.impl;

import com.mihnita.mf2.messageformat.datamodel.IMessage;

public abstract class Message implements IMessage {
	private final String id;
	protected final String locale;

	public Message(String id, String locale) {
		this.id = id;
		this.locale = locale;
	}

	@Override
	public String id() {
		return id;
	}

	@Override
	public String locale() {
		return locale;
	}
}
