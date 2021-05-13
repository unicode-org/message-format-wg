package com.mihnita.mf2.messageformat;

import java.util.HashMap;
import java.util.Map;

public class Parameters<K, V> {
	private HashMap<K, V> map = new HashMap<>();

	public Parameters<K, V> put(K key, V value) {
		map.put(key, value);
		return this;
	}
	
	public Map<K, V> build() {
		return map;
	}

	static Parameters<String, Object> msg() {
		return new Parameters<>();
	}

	static Parameters<String, String> ph() {
		return new Parameters<>();
	}
}
