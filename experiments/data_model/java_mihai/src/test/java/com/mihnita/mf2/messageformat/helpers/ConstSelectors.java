package com.mihnita.mf2.messageformat.helpers;

import com.mihnita.mf2.messageformat.datamodel.ISelectorMessage.ISelectorVal;
import com.mihnita.mf2.messageformat.impl.SelectorMessage.SelectorVal;

public class ConstSelectors {
	static public final ISelectorVal CASE_EXACTLY_ZERO = new SelectorVal(0);
	static public final ISelectorVal CASE_EXACTLY_ONE = new SelectorVal(1);

	static public final ISelectorVal CASE_ZERO = new SelectorVal("zero");
	static public final ISelectorVal CASE_ONE = new SelectorVal("one");
	static public final ISelectorVal CASE_TWO = new SelectorVal("two");
	static public final ISelectorVal CASE_FEW = new SelectorVal("few");
	static public final ISelectorVal CASE_MANY = new SelectorVal("many");
	static public final ISelectorVal CASE_OTHER = new SelectorVal("other");

	static public final ISelectorVal CASE_MALE = new SelectorVal("male");
	static public final ISelectorVal CASE_FEMALE = new SelectorVal("female");
}
