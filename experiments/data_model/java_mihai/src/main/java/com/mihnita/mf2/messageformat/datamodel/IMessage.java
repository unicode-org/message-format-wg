package com.mihnita.mf2.messageformat.datamodel;

import java.util.Map;

public interface IMessage {
	String id();
	String locale();
	String format(Map<String, Object> parameters);
}
