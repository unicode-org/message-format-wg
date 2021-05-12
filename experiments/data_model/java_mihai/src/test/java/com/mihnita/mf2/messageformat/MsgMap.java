package com.mihnita.mf2.messageformat;

import com.mihnita.mf2.messageformat.datamodel.ISimpleMessage;
import com.mihnita.mf2.messageformat.datamodel.ISelectorMessage.ISelectorVal;
import com.mihnita.mf2.messageformat.datamodel.ISelectorMessage.OrderedMap;

public class MsgMap {
	private OrderedMap<ISelectorVal[], ISimpleMessage> map = new OrderedMap<>();

	static MsgMap sel() {
		return new MsgMap();
	}

	public MsgMap put(ISelectorVal[] key, ISimpleMessage value) {
		map.put(key, value);
		return this;
	}

	public OrderedMap<ISelectorVal[], ISimpleMessage> map() {
		return map;
	}
}
