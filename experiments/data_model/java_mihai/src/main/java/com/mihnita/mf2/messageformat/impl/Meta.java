package com.mihnita.mf2.messageformat.impl;

import com.mihnita.mf2.messageformat.datamodel.IMeta;

public class Meta implements IMeta {
	private final String comment;

	public Meta(String comment) {
		this.comment = comment;
	}

	@Override
	public String comment() {
		return comment;
	}
}
