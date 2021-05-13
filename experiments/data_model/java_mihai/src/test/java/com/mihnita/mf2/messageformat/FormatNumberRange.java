package com.mihnita.mf2.messageformat;

import java.util.Map;

import com.ibm.icu.number.NumberRangeFormatter;
import com.ibm.icu.number.NumberRangeFormatter.RangeIdentityFallback;
import com.ibm.icu.util.ULocale;
import com.mihnita.mf2.messageformat.datamodel.functions.IPlaceholderFormatter;

class FormatNumberRange implements IPlaceholderFormatter {
	@Override
	public String format(Object value, String locale, Map<String, String> options) {
		if (value instanceof Range<?>) {
			@SuppressWarnings("unchecked") // We can do better than unchecked, but for a proof of concept is good enough
			Range<Integer> range = (Range<Integer>) value;
			Number begin;
			Number end;
			if (range.start > range.end) {
				begin = range.end;
				end = range.start;
			} else {
				begin = range.start;
				end = range.end;
			}
			return NumberRangeFormatter.with()
					.identityFallback(RangeIdentityFallback.APPROXIMATELY_OR_SINGLE_VALUE)
					.locale(ULocale.forLanguageTag(locale))
					.formatRange(begin, end)
					.toString();
		}
		return null;
	}
}