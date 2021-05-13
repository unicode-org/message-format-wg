package com.mihnita.mf2.messageformat;

import static com.mihnita.mf2.messageformat.helpers.ConstSelectors.CASE_EXACTLY_ONE;
import static com.mihnita.mf2.messageformat.helpers.ConstSelectors.CASE_EXACTLY_ZERO;
import static com.mihnita.mf2.messageformat.helpers.ConstSelectors.CASE_FEMALE;
import static com.mihnita.mf2.messageformat.helpers.ConstSelectors.CASE_FEW;
import static com.mihnita.mf2.messageformat.helpers.ConstSelectors.CASE_MALE;
import static com.mihnita.mf2.messageformat.helpers.ConstSelectors.CASE_OTHER;
import static org.junit.Assert.assertEquals;

import java.util.Currency;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.Map;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import com.ibm.icu.util.Calendar;
import com.ibm.icu.util.CurrencyAmount;
import com.mihnita.mf2.messageformat.datamodel.IPart;
import com.mihnita.mf2.messageformat.datamodel.ISelectorMessage.ISelectorVal;
import com.mihnita.mf2.messageformat.datamodel.ISelectorMessage.OrderedMap;
import com.mihnita.mf2.messageformat.datamodel.ISimpleMessage;
import com.mihnita.mf2.messageformat.impl.Placeholder;
import com.mihnita.mf2.messageformat.impl.PlainText;
import com.mihnita.mf2.messageformat.impl.SelectorMessage;
import com.mihnita.mf2.messageformat.impl.SelectorMessage.SelectorArg;
import com.mihnita.mf2.messageformat.impl.SimpleMessage;

@RunWith(JUnit4.class)
@SuppressWarnings("static-method")
public class MessageFormatTest {
	// Common for all tests. Chosen for the interesting number format.
	final String locale = "en-IN";

	@Test
	public void testSimplePlaceholder() {
		final String expectedMsg = "Hello John!\n";
		final IPart [] parts = {
				new PlainText("Hello "),
				new Placeholder("user"),
				new PlainText("!\n"),
		};

		SimpleMessage mf = new SimpleMessage("id", locale, parts);

		String actual = mf.format(Parameters.msg().put("user", "John").build());

		assertEquals(expectedMsg, actual);
	}

	@Test
	public void testDateFormatting() {
		final String expectedMsg = "Using locale en-IN the date is 29 Dec 2019.\n";
		HashMap<String, String> phOptions = new HashMap<>();
		phOptions.put("skeleton", "yMMMd");
		final IPart [] parts = {
				new PlainText("Using locale "),
				new Placeholder("locale"),
				new PlainText(" the date is "),
				new Placeholder("theDay", "date", phOptions),
				new PlainText(".\n"),
		};

		final SimpleMessage mf = new SimpleMessage("id", locale, parts);

		final Map<String, Object> parameters = Parameters.msg()
				.put("theDay", new GregorianCalendar(2019, Calendar.DECEMBER, 29).getTime())
				.put("locale", locale)
				.build();

		assertEquals(expectedMsg, mf.format(parameters));
	}

	@Test
	public void testCurrencyFormatting() {
		final String expectedMsg = "A large currency amount is €1,23,45,67,890.98\n";
		final IPart [] parts = {
				new PlainText("A large currency amount is "),
				// This one works too. Without style: currency the type is determine by the class of currencyAmount
//				new Placeholder("currencyAmount", "number", Parameters.ph().put("style", "currency").build()),
				new Placeholder("currencyAmount", "number"),
				new PlainText("\n")
		};

		final SimpleMessage mf = new SimpleMessage("id", locale, parts);
		final CurrencyAmount currencyAmount = new CurrencyAmount(1234567890.97531, Currency.getInstance("EUR"));

		assertEquals(expectedMsg, mf.format(Parameters.msg().put("currencyAmount", currencyAmount).build()));
	}

	@Test
	public void testPercentageFormatting() {
		final String expectedMsg = "A percentage is 1,420%.\n";
		final IPart [] parts = {
				new PlainText("A percentage is "),
				new Placeholder("count", "number", Parameters.ph().put("style", "percent").build()),
				new PlainText(".\n")
		};

		final SimpleMessage mf = new SimpleMessage("id", locale, parts);

		assertEquals(expectedMsg, mf.format(Parameters.msg().put("count", 14.2).build()));
	}

	@Test
	public void testSimplePlural() {
		final String localeRo = "ro";

		final String expectedMsgEq1 = "Ai sters un fisier.\n";
		final String expectedMsgFew = "Ai sters 3 fisiere.\n";
		final String expectedMsgOther = "Ai sters 23 de fisiere.\n";

		final IPart [] partsEq1 = {
				new PlainText("Ai sters un fisier.\n")
		};
		final IPart [] partsFew = {
				new PlainText("Ai sters "),
				new Placeholder("count", "number"),
				new PlainText(" fisiere.\n")
		};
		final IPart [] partsOther = {
				new PlainText("Ai sters "),
				new Placeholder("count", "number"),
				new PlainText(" de fisiere.\n")
		};

		final SimpleMessage mfEq1 = new SimpleMessage("", localeRo, partsEq1);
		final SimpleMessage mfEqFew = new SimpleMessage("", localeRo, partsFew);
		final SimpleMessage mfOther = new SimpleMessage("", localeRo, partsOther);

		final SelectorArg[] selectorArgs = { new SelectorArg("count", "plural") };

		final OrderedMap<ISelectorVal[], ISimpleMessage> messages = new OrderedMap<>();
		messages.put(new ISelectorVal[]{CASE_EXACTLY_ONE}, mfEq1);
		messages.put(new ISelectorVal[]{CASE_FEW}, mfEqFew);
		messages.put(new ISelectorVal[]{CASE_OTHER}, mfOther);

		final SelectorMessage mf = new SelectorMessage("id", localeRo, selectorArgs, messages);

		assertEquals(expectedMsgEq1, mf.format(Parameters.msg().put("count", 1).build()));
		assertEquals(expectedMsgFew, mf.format(Parameters.msg().put("count", 3).build()));
		assertEquals(expectedMsgOther, mf.format(Parameters.msg().put("count", 23).build()));
	}

	@Test
	public void testSimpleGender() {
		final String expectedMsgF = "You've been invited to her party.\n";
		final String expectedMsgM = "You've been invited to his party.\n";
		final String expectedMsgO = "You've been invited to their party.\n";

		final SelectorArg[] selectorArgs = { new SelectorArg("host_gender", "gender") };

		final OrderedMap<ISelectorVal[], ISimpleMessage> messages = new OrderedMap<>();
		messages.put(new ISelectorVal[] {CASE_FEMALE},
				new SimpleMessage("", locale, new IPart[] {new PlainText(expectedMsgF)}));
		messages.put(new ISelectorVal[] {CASE_MALE},
				new SimpleMessage("", locale, new IPart[] {new PlainText(expectedMsgM)}));
		messages.put(new ISelectorVal[] {CASE_OTHER},
				new SimpleMessage("", locale, new IPart[] {new PlainText(expectedMsgO)}));

		final SelectorMessage mf = new SelectorMessage("id", locale, selectorArgs, messages);

		assertEquals(expectedMsgF, mf.format(Parameters.msg().put("host_gender", "female").build()));
		assertEquals(expectedMsgM, mf.format(Parameters.msg().put("host_gender", "male").build()));
		assertEquals(expectedMsgO, mf.format(Parameters.msg().put("host_gender", "we_do_not_know").build()));
	}

	// The multi-selector messages of #119
	// https://github.com/unicode-org/message-format-wg/issues/119

	@Test
	public void testDoublePlural() {
		final String expected0 = "You have killed no monsters.";
		final String expected1 = "You have killed one monster in one dungeon.";
		final String expected2 = "You have killed 5 monsters in one dungeon.";
		final String expected3 = "You have killed 8 monsters in 2 dungeons.";

		final IPart [] partsM0 = {
				new PlainText("You have killed no monsters.")
		};
		final IPart [] partsM1 = {
				new PlainText("You have killed one monster in one dungeon.")
		};
		final IPart [] partsM2 = { 
				new PlainText("You have killed "),
				new Placeholder("monster-count", "number"),
				new PlainText(" monsters in one dungeon.")
		};
		final IPart [] partsM3 = {
				new PlainText("You have killed "),
				new Placeholder("monster-count", "number"),
				new PlainText(" monsters in "),
				new Placeholder("dungeon-count", "number"),
				new PlainText(" dungeons."),
		};

		final SelectorArg[] selectorArgs = {
				new SelectorArg("monster-count", "plural"),
				new SelectorArg("dungeon-count", "plural"),
		};

		final OrderedMap<ISelectorVal[], ISimpleMessage> messages = new OrderedMap<>();
		messages.put(new ISelectorVal[]{CASE_EXACTLY_ZERO, CASE_OTHER}, new SimpleMessage("", locale, partsM0));
		messages.put(new ISelectorVal[]{CASE_EXACTLY_ONE, CASE_OTHER}, new SimpleMessage("", locale, partsM1));
		messages.put(new ISelectorVal[]{CASE_OTHER, CASE_EXACTLY_ONE}, new SimpleMessage("", locale, partsM2));
		messages.put(new ISelectorVal[]{CASE_OTHER, CASE_OTHER}, new SimpleMessage("", locale, partsM3));

		final SelectorMessage mf = new SelectorMessage("id", locale, selectorArgs, messages);

		assertEquals(expected0,
				mf.format(Parameters.msg().put("monster-count", 0).put("dungeon-count", 0).build()));
		assertEquals(expected1,
				mf.format(Parameters.msg().put("monster-count", 1).put("dungeon-count", 0).build()));
		assertEquals(expected2,
				mf.format(Parameters.msg().put("monster-count", 5).put("dungeon-count", 1).build()));
		assertEquals(expected3,
				mf.format(Parameters.msg().put("monster-count", 8).put("dungeon-count", 2).build()));
	}
}
