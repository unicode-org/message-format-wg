package com.mihnita.mf2.messageformat;

import static org.junit.Assert.assertEquals;

import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import com.mihnita.mf2.messageformat.datamodel.IPart;
import com.mihnita.mf2.messageformat.datamodel.ISelectorMessage.ISelectorVal;
import com.mihnita.mf2.messageformat.impl.Message;
import com.mihnita.mf2.messageformat.impl.Placeholder;
import com.mihnita.mf2.messageformat.impl.PlainText;
import com.mihnita.mf2.messageformat.impl.SelectorMessage;
import com.mihnita.mf2.messageformat.impl.SelectorMessage.SelectorArg;
import com.mihnita.mf2.messageformat.impl.SelectorMessage.SelectorVal;
import com.mihnita.mf2.messageformat.impl.SimpleMessage;

@RunWith(JUnit4.class)
@SuppressWarnings("static-method")
public class DynamicMessageReferenceTest {

	// Dynamic References
	// https://github.com/unicode-org/message-format-wg/issues/130

	static private final ISelectorVal CASE_GENITIVE = new SelectorVal("genitive");
	static private final ISelectorVal CASE_OTHER = new SelectorVal("other");
	static private final String LOCALE_ID = "fi";

	@BeforeClass
	public static void createMessages() {
		final IPart [] partsChromeDefault = { new PlainText("Chrome") };
		final IPart [] partsChromeGen = { new PlainText("Chromen") };

		final IPart [] partsSafariDefault = { new PlainText("Safari") };
		final IPart [] partsSafariGen = { new PlainText("Safarin") };

		final IPart [] partsFirefoxDefault = { new PlainText("Firefox") };
		final IPart [] partsFirefoxGen = { new PlainText("Firefoxin") };

		final SelectorArg[] selectorArgs = { new SelectorArg("gcase", "grammar_case") };
		final SelectorMessage firefoxMessage = new SelectorMessage("firefox", LOCALE_ID, selectorArgs,
				MsgMap.sel()
				.put(new ISelectorVal[]{CASE_GENITIVE}, new SimpleMessage("id", LOCALE_ID, partsFirefoxGen))
				.put(new ISelectorVal[]{CASE_OTHER}, new SimpleMessage("id", LOCALE_ID, partsFirefoxDefault))
				.map());
		final SelectorMessage chromeMessage = new SelectorMessage("chrome", LOCALE_ID, selectorArgs,
				MsgMap.sel()
				.put(new ISelectorVal[]{CASE_GENITIVE}, new SimpleMessage("id", LOCALE_ID, partsChromeGen))
				.put(new ISelectorVal[]{CASE_OTHER}, new SimpleMessage("id", LOCALE_ID, partsChromeDefault))
				.map());
		final SelectorMessage safariMessage = new SelectorMessage("safari", LOCALE_ID, selectorArgs,
				MsgMap.sel()
				.put(new ISelectorVal[]{CASE_GENITIVE}, new SimpleMessage("id", LOCALE_ID, partsSafariGen))
				.put(new ISelectorVal[]{CASE_OTHER}, new SimpleMessage("id", LOCALE_ID, partsSafariDefault))
				.map());

		Message.RES_MANAGER.put(firefoxMessage.id(), firefoxMessage);
		Message.RES_MANAGER.put(chromeMessage.id(), chromeMessage);
		Message.RES_MANAGER.put(safariMessage.id(), safariMessage);
	}

	@Test
	public void testSimpleGrammarSelection() {
		Message message = Message.RES_MANAGER.get("firefox");
		assertEquals("Firefox",
				message.format(Parameters.msg().put("gcase", "whatever").build()));
		assertEquals("Firefoxin",
				message.format(Parameters.msg().put("gcase", "genitive").build()));

		message = Message.RES_MANAGER.get("chrome");
		assertEquals("Chrome",
				message.format(Parameters.msg().put("gcase", "nominative").build()));
		assertEquals("Chromen",
				message.format(Parameters.msg().put("gcase", "genitive").build()));
	}

	@Test
	public void testDynamicRef() {
		StringBuffer browser = new StringBuffer("firefox");
		Message.VARIABLES.put("browser", browser);
		final IPart [] partsMsg2 = {
				new PlainText("Please start "),
				new Placeholder("$browser", "msgRef", Parameters.ph().put("gcase", "genitive").build())
		};
		SimpleMessage mf = new SimpleMessage("msg2", LOCALE_ID, partsMsg2);

		assertEquals("Please start Firefoxin", mf.format(null));

		browser.replace(0, browser.length(), "chrome");
		assertEquals("Please start Chromen", mf.format(null));

		browser.replace(0, browser.length(), "safari");
		assertEquals("Please start Safarin", mf.format(null));
	}
}
