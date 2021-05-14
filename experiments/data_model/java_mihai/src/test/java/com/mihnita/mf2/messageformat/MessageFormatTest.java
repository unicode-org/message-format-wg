package com.mihnita.mf2.messageformat;

import static com.mihnita.mf2.messageformat.helpers.MFU.mm;
import static com.mihnita.mf2.messageformat.helpers.MFU.mso;
import static com.mihnita.mf2.messageformat.helpers.MFU.ph;
import static com.mihnita.mf2.messageformat.helpers.MFU.sela;
import static com.mihnita.mf2.messageformat.helpers.MFU.selv;
import static com.mihnita.mf2.messageformat.helpers.MFU.sm;
import static org.junit.Assert.assertEquals;

import java.util.Currency;
import java.util.GregorianCalendar;
import java.util.Locale;
import java.util.Map;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import com.ibm.icu.util.Calendar;
import com.ibm.icu.util.CurrencyAmount;
import com.mihnita.mf2.messageformat.impl.SelectorMessage;
import com.mihnita.mf2.messageformat.impl.SimpleMessage;

@RunWith(JUnit4.class)
@SuppressWarnings("static-method")
public class MessageFormatTest {
	// Common for all tests. Chosen for the interesting number format.
	final static String LOCALE_ID = "en-IN";
	final static Locale LOCALE = Locale.forLanguageTag(LOCALE_ID);

	@Test
	public void testSimplePlaceholder() {
		SimpleMessage mf = sm(LOCALE, "Hello ", ph("user"), "!");
		String actual = mf.format(mso("user", "John"));
		assertEquals("Hello John!", actual);
	}

	@Test
	public void testDateFormatting() {
		final SimpleMessage mf = sm(LOCALE,
				"Using locale ", ph("locale"), " the date is ", ph("theDay", "date", "skeleton", "yMMMd"), ".\n");
		final Map<String, Object> parameters = mso(
				"theDay", new GregorianCalendar(2019, Calendar.DECEMBER, 29).getTime(),
				"locale", LOCALE_ID
		);
		assertEquals("Using locale en-IN the date is 29 Dec 2019.\n", mf.format(parameters));
	}

	@Test
	public void testCurrencyFormatting() {
		double value = 1234567890.97531;
		SimpleMessage mf;

		mf = sm(LOCALE, "A number is ", ph("value", "number"));
		assertEquals("A number is 1,23,45,67,890.975",
				mf.format(mso("value", value)));

		/* The currency is determined by locale.
	      This is the current ICU behavior, and it is risky, and bad i18n.
	      But the developer controls the class bound to "number", not some 3rd party library (ICU).
	      So we can be customized to reject / throw when the currency code is not specified.
		*/
		mf = sm(LOCALE, "A large currency amount is ", ph("value", "number", "style", "currency"));
		assertEquals("A large currency amount is ₹1,23,45,67,890.98",
				mf.format(mso("value", value)));

		// For correct behavior we can specify the currency code in the placeholder
		mf = sm(LOCALE, "A large currency amount is ",
				ph("value", "number", "style", "currency", "currencyCode", "GBP"));
		assertEquals("A large currency amount is £1,23,45,67,890.98",
				mf.format(mso("value", value)));

		// Without style the currency the type is determine by the class bound to "number".
		// and by passing a CurrencyAmount for formatting we control the currency code. 
		mf = sm(LOCALE, "A large currency amount is ", ph("value", "number"));
		assertEquals("A large currency amount is €1,23,45,67,890.98",
				mf.format(mso("value", new CurrencyAmount(value, Currency.getInstance("EUR")))));
	}

	@Test
	public void testPercentageFormatting() {
		final SimpleMessage mf = sm(LOCALE, "A percentage is ", ph("count", "number", "style", "percent"));
		assertEquals("A percentage is 1,420%", mf.format(mso("count", 14.2)));
	}

	@Test
	public void testSimplePlural() {
		final String localeRoId = "ro";
		final Locale localeRo = Locale.forLanguageTag(localeRoId);

		final SelectorMessage mf = new SelectorMessage("id", localeRoId,
				sela("count", "plural"),
				mm(
						selv(1), sm(localeRo, "Ai sters un fisier."),
						selv("few"), sm(localeRo, "Ai sters ", ph("count", "number"), " fisiere."),
						selv("other"), sm(localeRo, "Ai sters ", ph("count", "number"), " de fisiere.")
				));

		assertEquals("Ai sters un fisier.", mf.format(mso("count", 1)));
		assertEquals("Ai sters 3 fisiere.", mf.format(mso("count", 3)));
		assertEquals("Ai sters 23 de fisiere.", mf.format(mso("count", 23)));
	}

	@Test
	public void testSimpleGender() {
		final String expectedMsgF = "You've been invited to her party.";
		final String expectedMsgM = "You've been invited to his party.";
		final String expectedMsgO = "You've been invited to their party.";

		final SelectorMessage mf = new SelectorMessage("id", LOCALE_ID,
				sela("host_gender", "gender"),
				mm(
						selv("female"), sm(LOCALE, expectedMsgF),
						selv("male"), sm(LOCALE, expectedMsgM),
						selv("other"), sm(LOCALE, expectedMsgO)
				));

		assertEquals(expectedMsgF, mf.format(mso("host_gender", "female")));
		assertEquals(expectedMsgM, mf.format(mso("host_gender", "male")));
		assertEquals(expectedMsgO, mf.format(mso("host_gender", "we_do_not_know")));
	}

	// The multi-selector messages of #119
	// https://github.com/unicode-org/message-format-wg/issues/119

	@Test
	public void testDoublePlural() {
		final String expected0x = "You have killed no monsters.";
		final String expected11 = "You have killed one monster in one dungeon.";
		final String expected1x = "How can you kill one single monster in more than one dungeon?";
		final String expected51 = "You have killed 5 monsters in one dungeon.";
		final String expected82 = "You have killed 8 monsters in 2 dungeons.";

		final SelectorMessage mf = new SelectorMessage("id", LOCALE_ID,
				sela(
						"monster-count", "plural",
						"dungeon-count", "plural"
				),
				mm(
						selv(0, "other"), sm(LOCALE, expected0x),
						selv(1, 1), sm(LOCALE, expected11),
						selv(1, "other"), sm(LOCALE, expected1x),
						selv("other", 1), sm(LOCALE,
								"You have killed ", ph("monster-count", "number"), " monsters in one dungeon."),
						selv("other", "other"), sm(LOCALE,
								"You have killed ",
								ph("monster-count", "number"), " monsters in ",
								ph("dungeon-count", "number"), " dungeons.")
				));

		assertEquals(expected0x, mf.format(mso("monster-count", 0, "dungeon-count", 21)));
		assertEquals(expected11, mf.format(mso("monster-count", 1, "dungeon-count", 1)));
		assertEquals(expected1x, mf.format(mso("monster-count", 1, "dungeon-count", 3)));
		assertEquals(expected51, mf.format(mso("monster-count", 5, "dungeon-count", 1)));
		assertEquals(expected82, mf.format(mso("monster-count", 8, "dungeon-count", 2)));
	}
}
