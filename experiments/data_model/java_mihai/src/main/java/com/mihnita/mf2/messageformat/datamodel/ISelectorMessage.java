package com.mihnita.mf2.messageformat.datamodel;

import java.util.LinkedHashMap;

public interface ISelectorMessage extends IMessage { // Xliff spec need extesion. Proposal in the works.
	ISelectorArg[] selectorArgs();
	OrderedMap<ISelectorVal[], ISimpleMessage> messages();

	static public interface ISelectorVal { // Xliff spec need extension. Proposal in the works.
		Number nr();
		String str();
	}
	
	static public interface ISelectorArg { // Xliff spec need extesion. Proposal in the works.
		String name(); // the variable to select on
		String selectorName(); // plural, ordinal, gender, select, ..
	}

	// The order matters, so we need a "special map" that keeps the insertion order.
	// OrderedMap is more readable than LinkedHashMap, and closer to the spirit of the TypeScript data model
	@SuppressWarnings("serial")
	static public class OrderedMap<K, V> extends LinkedHashMap<K,V> {
		// a simple "alias" from LinkedHashMap to OrderedMap
	}
}
