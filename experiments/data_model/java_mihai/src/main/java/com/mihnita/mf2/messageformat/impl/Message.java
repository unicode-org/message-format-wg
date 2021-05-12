package com.mihnita.mf2.messageformat.impl;

import java.util.HashMap;

import com.mihnita.mf2.messageformat.datamodel.IMessage;

public abstract class Message implements IMessage {
	private final String id;
	protected final String locale;
	
	@SuppressWarnings("serial")
	public static class ResourceManager extends HashMap<String, Message> {}
	@SuppressWarnings("serial")
	public static class Variables extends HashMap<String, Object> {}

	public static final ResourceManager RES_MANAGER = new ResourceManager();
	public static final Variables VARIABLES = new Variables();

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
