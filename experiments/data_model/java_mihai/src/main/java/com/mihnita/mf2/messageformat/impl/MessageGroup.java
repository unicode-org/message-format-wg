package com.mihnita.mf2.messageformat.impl;

import com.mihnita.mf2.messageformat.datamodel.IMessage;

public class MessageGroup { // xliff:group
	private final String id;
	private final String locale;
	private final IMessage[] messages;

	public MessageGroup(String id, String locale, IMessage[] messages) {
		this.id = id;
		this.locale = locale;
		this.messages = messages;
	}

	public final String id() {
		return id;
	}

	public final String locale() {
		return locale;
	}

	public final IMessage[] messages() {
		return messages;
	}
}
