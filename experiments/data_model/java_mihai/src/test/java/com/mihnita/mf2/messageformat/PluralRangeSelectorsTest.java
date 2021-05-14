package com.mihnita.mf2.messageformat;

import static com.mihnita.mf2.messageformat.helpers.MFU.mm;
import static com.mihnita.mf2.messageformat.helpers.MFU.mso;
import static com.mihnita.mf2.messageformat.helpers.MFU.ph;
import static com.mihnita.mf2.messageformat.helpers.MFU.sela;
import static com.mihnita.mf2.messageformat.helpers.MFU.selv;
import static com.mihnita.mf2.messageformat.helpers.MFU.sm;
import static org.junit.Assert.assertEquals;

import java.util.Locale;
import java.util.Map;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import com.ibm.icu.number.NumberRangeFormatter;
import com.ibm.icu.number.NumberRangeFormatter.RangeIdentityFallback;
import com.ibm.icu.util.ULocale;
import com.mihnita.mf2.messageformat.datamodel.ISelectorMessage.ISelectorVal;
import com.mihnita.mf2.messageformat.datamodel.functions.IPlaceholderFormatter;
import com.mihnita.mf2.messageformat.datamodel.functions.ISelectorScoreFn;
import com.mihnita.mf2.messageformat.impl.Placeholder;
import com.mihnita.mf2.messageformat.impl.SelectorMessage;
import com.mihnita.mf2.messageformat.impl.SelectorMessage.SelectorVal;

@RunWith(JUnit4.class)
@SuppressWarnings("static-method")
public class PluralRangeSelectorsTest {
	static final String LOCALE_ID = "hi";
	static final Locale LOCALE = Locale.forLanguageTag(LOCALE_ID);

	// Support for plural range selectors #125
	// https://github.com/unicode-org/message-format-wg/issues/125

	@Test
	public void testSimplePlural() {
		SelectorMessage.CUSTOM_SELECTOR_FUNCTIONS.put("rangePlural", new RangePluralSelectorFunc());
		Placeholder.CUSTOM_FORMATTER_FUNC.put("nrRange", new FormatNumberRange());

		final SelectorMessage mf = new SelectorMessage("id", LOCALE_ID,
				sela("range", "rangePlural"),
				mm(
						selv("few"), sm(LOCALE, "Between ", ph("range", "nrRange"), " fere few."),
						selv("many"), sm(LOCALE, "Between ", ph("range", "nrRange"), " mare many."),
						selv("other"), sm(LOCALE, "Between ", ph("range", "nrRange"), " ore other.")
				));

		// Some made-up rules:
		// if start >= end => others
		// if start < end && start + end even => few
		// if start < end && start + end odd => many
		assertEquals("Between 1–4 fere few.",
				mf.format(mso("range", new Range<Number>(1, 4))));
		assertEquals("Between 2–6 mare many.",
				mf.format(mso("range", new Range<Number>(2, 6))));
		assertEquals("Between 12,34,56,789–98,76,54,321 ore other.",
				mf.format(mso("range", new Range<Number>(987654321, 123456789))));
	}
}

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

class Range<T> {
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

class RangePluralSelectorFunc implements ISelectorScoreFn {

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
				boolean isOdd = (r.end + r.start) % 2 == 1;
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
