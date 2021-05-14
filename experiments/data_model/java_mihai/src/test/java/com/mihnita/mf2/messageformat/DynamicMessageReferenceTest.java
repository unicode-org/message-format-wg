package com.mihnita.mf2.messageformat;

import static com.mihnita.mf2.messageformat.helpers.MFU.mm;
import static com.mihnita.mf2.messageformat.helpers.MFU.mso;
import static com.mihnita.mf2.messageformat.helpers.MFU.ph;
import static com.mihnita.mf2.messageformat.helpers.MFU.sela;
import static com.mihnita.mf2.messageformat.helpers.MFU.selv;
import static com.mihnita.mf2.messageformat.helpers.MFU.sm;
import static org.junit.Assert.assertEquals;

import java.util.Locale;

import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import com.mihnita.mf2.messageformat.datamodel.ISelectorMessage.ISelectorArg;
import com.mihnita.mf2.messageformat.impl.Message;
import com.mihnita.mf2.messageformat.impl.SelectorMessage;
import com.mihnita.mf2.messageformat.impl.SimpleMessage;

@RunWith(JUnit4.class)
@SuppressWarnings("static-method")
public class DynamicMessageReferenceTest {

	// Dynamic References
	// https://github.com/unicode-org/message-format-wg/issues/130

	static private final String CASE_GENITIVE = "genitive";
	static private final String CASE_OTHER = "other";
	static private final String LOCALE_ID = "fi";
	static private final Locale LOCALE = Locale.forLanguageTag(LOCALE_ID);

	@BeforeClass
	public static void createMessages() {
		final ISelectorArg[] selectorArgs = sela("gcase", "grammar_case");

		final SelectorMessage firefoxMessage = new SelectorMessage("firefox", LOCALE_ID, selectorArgs,
				mm(
						selv(CASE_GENITIVE), sm(LOCALE, "Firefoxin"),
						selv(CASE_OTHER), sm(LOCALE, "Firefox")
				));
		final SelectorMessage chromeMessage = new SelectorMessage("chrome", LOCALE_ID, selectorArgs,
				mm(
						selv(CASE_GENITIVE), sm(LOCALE, "Chromen"),
						selv(CASE_OTHER), sm(LOCALE, "Chrome")
				));
		final SelectorMessage safariMessage = new SelectorMessage("safari", LOCALE_ID, selectorArgs,
				mm(
						selv(CASE_GENITIVE), sm(LOCALE, "Safarin"),
						selv(CASE_OTHER), sm(LOCALE, "Safari")
				));

		Message.RES_MANAGER.put(firefoxMessage.id(), firefoxMessage);
		Message.RES_MANAGER.put(chromeMessage.id(), chromeMessage);
		Message.RES_MANAGER.put(safariMessage.id(), safariMessage);
	}

	@Test
	public void testSimpleGrammarSelection() {
		Message message = Message.RES_MANAGER.get("firefox");
		assertEquals("Firefox", message.format(mso("gcase", "whatever")));
		assertEquals("Firefoxin", message.format(mso("gcase", "genitive")));

		message = Message.RES_MANAGER.get("chrome");
		assertEquals("Chrome", message.format(mso("gcase", "nominative")));
		assertEquals("Chromen", message.format(mso("gcase", "genitive")));
	}

	@Test
	public void testDynamicRef() {
		StringBuffer browser = new StringBuffer("firefox");
		Message.VARIABLES.put("browser", browser);

		SimpleMessage mf = sm("msg2", LOCALE,
				"Please start ", ph("$browser", "msgRef", "gcase", "genitive"));

		assertEquals("Please start Firefoxin", mf.format(null));

		browser.replace(0, browser.length(), "chrome");
		assertEquals("Please start Chromen", mf.format(null));

		browser.replace(0, browser.length(), "safari");
		assertEquals("Please start Safarin", mf.format(null));
	}
}
