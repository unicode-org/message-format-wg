package com.mihnita.mf2.messageformat.datamodel;

public interface IMessageGroup { // xliff:group
	String id();
	String locale();
	IMessage[] messages();
}
