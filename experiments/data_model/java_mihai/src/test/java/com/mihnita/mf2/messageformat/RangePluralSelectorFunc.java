package com.mihnita.mf2.messageformat;

import com.mihnita.mf2.messageformat.datamodel.ISelectorMessage.ISelectorVal;
import com.mihnita.mf2.messageformat.datamodel.functions.ISelectorScoreFn;
import com.mihnita.mf2.messageformat.impl.SelectorMessage.SelectorVal;

public class RangePluralSelectorFunc implements ISelectorScoreFn {

	@Override
	public int select(Object value1, ISelectorVal value2, String locale) {
		if (value1 instanceof Range<?> && value2 instanceof SelectorVal) {
			@SuppressWarnings("unchecked")
			Range<Integer> r = (Range<Integer>) value1;
			String strLabel = value2.toString();
			// Some made-up rules:
			// if start >= end => others
			// if start < end && start + end even => few
			// if start < end && start + end odd => many
			if (r.start < r.end) {
				boolean isOdd = (r.end + r.start) %2 == 1;
				if (isOdd && "few".equals(strLabel)) {
					return 100;
				}
				if (!isOdd && "many".equals(strLabel)) {
					return 100;
				}
			}
			if ("other".equals(strLabel)) {
				return 2;
			}
		}
		return -100000;
	}

}
