package com.mihnita.mf2.messageformat;

import static com.mihnita.mf2.messageformat.helpers.MFU.ph;
import static com.mihnita.mf2.messageformat.helpers.MFU.sm;
import static org.junit.Assert.assertEquals;

import java.text.ParseException;
import java.util.Date;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import com.ibm.icu.text.DateFormat;
import com.ibm.icu.text.DateIntervalFormat;
import com.ibm.icu.text.SimpleDateFormat;
import com.ibm.icu.util.Calendar;
import com.ibm.icu.util.DateInterval;
import com.ibm.icu.util.GregorianCalendar;
import com.ibm.icu.util.ULocale;
import com.mihnita.mf2.messageformat.datamodel.functions.IPlaceholderFormatter;
import com.mihnita.mf2.messageformat.impl.Message;
import com.mihnita.mf2.messageformat.impl.Placeholder;
import com.mihnita.mf2.messageformat.impl.SimpleMessage;

@RunWith(JUnit4.class)
@SuppressWarnings("static-method")
public class DynamicMessageReference2Test {
	// Dynamic References
	// https://github.com/unicode-org/message-format-wg/issues/181

	static private final String LOCALE_ID = "en";
	static private final Locale LOCALE = Locale.forLanguageTag(LOCALE_ID);

	static {
		Placeholder.CUSTOM_FORMATTER_FUNC.put("DATETIME_RANGE", new DateTimeRange());
		Placeholder.CUSTOM_FORMATTER_FUNC.put("NOW", new DateTimeNow());
	}

	@Test
	public void test() {
		// A calendar object
		Message.VARIABLES.put("var_start", new GregorianCalendar(2019, Calendar.MAY, 17));
		// Milliseconds
		Message.VARIABLES.put("var_end", new GregorianCalendar(2021, Calendar.AUGUST, 23).getTimeInMillis());

		Placeholder ph1 = ph("range", "DATETIME_RANGE", "start", "m:msg_start", "end", "$var_end", "skeleton", "y");
		Placeholder ph2 = ph("range", "DATETIME_RANGE", "start", "$var_start", "end", "$var_end", "skeleton", "y");
		Placeholder ph3 = ph("range", "DATETIME_RANGE", "start", "$var_name", "end", "f:NOW", "skeleton", "y");
		StringBuffer messageRef = new StringBuffer("m:msg_start");
		Message.VARIABLES.put("var_name", messageRef); // var_name contains a ref to a message

		SimpleMessage msg_start = sm("msg_start", LOCALE, "1970");
		SimpleMessage msg_1 = sm("msg_1", LOCALE, "Years ", ph1);
		SimpleMessage msg_2 = sm("msg_2", LOCALE, "Years ", ph2);
		SimpleMessage msg_3 = sm("msg_3", LOCALE, "Years ", ph3);

		Message.RES_MANAGER.put(msg_start.id(), msg_start);
		Message.RES_MANAGER.put(msg_1.id(), msg_1);
		Message.RES_MANAGER.put(msg_2.id(), msg_2);
		Message.RES_MANAGER.put(msg_3.id(), msg_3);

		Message message;

		message = Message.RES_MANAGER.get("msg_start");
		assertEquals("1970", message.format(null));

		message = Message.RES_MANAGER.get("msg_1");
		assertEquals("Years 1970 – 2021", message.format(null));

		message = Message.RES_MANAGER.get("msg_2");
		assertEquals("Years 2019 – 2021", message.format(null));

		message = Message.RES_MANAGER.get("msg_3");
		assertEquals("Years 1970 – 2021", message.format(null));
	}

}

/**
 * Implementing the {@code DATETIME_RANGE} custom function
 *
 * <p>Normally in a separate file, in a shared folder,
 * but here to show that things are really isolated,
 * and what custom functions belong with what tests</p>
 */
class DateTimeRange implements IPlaceholderFormatter {

	// This is extremely dodgy proposition.
	// Parsing "something that looks like a date / time" in a random locale,
	// and input by some random translator is just asking for trouble.
	// But this is to show that ES can do what EZ does, as good or as bad.
	@SuppressWarnings("deprecation")
	long hackParseDateTime(String s, String locale, Map<String, String> options) {
		String skeleton = options.get("skeleton");
		DateFormat df = SimpleDateFormat.getInstanceForSkeleton(skeleton, ULocale.forLanguageTag(locale));

		try {
			Date tmpDate = df.parse(s);
			// We assume that "absurd" values are not real dates but milliseconds
			if (tmpDate.getYear() > -2000 && tmpDate.getYear() <= 5000)
				return tmpDate.getTime();
		} catch (ParseException e) {
		}

		// Parsing as a date failed, we try parsing it as milliseconds
		try {
			return Long.parseLong(s);
		} catch (NumberFormatException e) {
			return 0;
		}
	}

	Object hackyEval(String s, Object value, String locale, Map<String, String> options) {
		if (s.startsWith("f:")) { // function ref
			IPlaceholderFormatter funcName = Placeholder.CUSTOM_FORMATTER_FUNC.get(s.substring(2));
			String val = funcName.format(value, locale, options);
			return hackyEval(Objects.toString(val), value, locale, options);
		} else if (s.startsWith("m:")) { // message ref
			Message msg = Message.RES_MANAGER.get(s.substring(2));
			return hackyEval(msg.format(null), value, locale, options);
		} else if (s.startsWith("$")) { // var ref
			Object obj = Message.VARIABLES.get(s.substring(1));
			if (obj instanceof CharSequence) { // if it's a string we try to eval deeper
				return hackyEval(((CharSequence) obj).toString(), value, locale, options);
			} else {
				return obj;
			}
		}
		return s;
	}

	/*
	 * The value, locale, options are there to pass when formatting referred messages.
	 * But I'm cheating a bit here to make the implementation simpler.
	 * There is an example of that in DynamicMessageReferenceTest.
	 */
	long stringToLong(String s, Object value, String locale, Map<String, String> options) {
		if (s == null || s.isEmpty()) {
			return 0;
		}

		Object obj = hackyEval(s, value, locale, options);
		if (obj instanceof Date) {
			return ((Date) obj).getTime();
		}
		if (obj instanceof Calendar) {
			return ((Calendar) obj).getTimeInMillis();
		}
		if (obj instanceof Long) {
			return ((Long) obj);
		}
		if (obj instanceof String) {
			try {
				long result = hackParseDateTime((String) obj, locale, options);
				return result;
			} catch (NumberFormatException e) {
				return 0;
			}
		}

		return 0;
	}

	@Override
	public String format(Object value, String locale, Map<String, String> options) {
		long start = stringToLong(options.get("start"), value, locale, options);
		long end = stringToLong(options.get("end"), value, locale, options);
		String skeleton = options.get("skeleton");

		DateInterval di = new DateInterval(start, end);
		DateIntervalFormat dif = DateIntervalFormat.getInstance(skeleton, ULocale.forLanguageTag(locale));
		return dif.format(di);
	}
}

/**
 * Implementing the {@code NOW} custom function
 *
 * <p>This is if we want to share and reuse it for other date/time formatters.
 * Otherwise we can consider it a special string value recognized by {@code DATETIME_RANGE}.</p>
 */
class DateTimeNow implements IPlaceholderFormatter {
	@Override
	public String format(Object value, String locale, Map<String, String> options) {
		return Long.toString(new Date().getTime());
	}
}
