package com.mihnita.mf2.messageformat;

public class Range<T> {
	final public T start;
	final public T end;

	public Range(T start, T end) {
		this.start = start;
		this.end = end;
	}
	
	@Override
	public String toString() {
		return "[" + start + ", " + end + "]";
	}
}
