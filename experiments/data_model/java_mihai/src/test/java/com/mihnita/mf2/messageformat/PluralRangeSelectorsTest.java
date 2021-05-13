package com.mihnita.mf2.messageformat;

import static com.mihnita.mf2.messageformat.helpers.ConstSelectors.CASE_FEW;
import static com.mihnita.mf2.messageformat.helpers.ConstSelectors.CASE_MANY;
import static com.mihnita.mf2.messageformat.helpers.ConstSelectors.CASE_OTHER;
import static org.junit.Assert.assertEquals;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import com.mihnita.mf2.messageformat.datamodel.IPart;
import com.mihnita.mf2.messageformat.datamodel.ISelectorMessage.ISelectorVal;
import com.mihnita.mf2.messageformat.impl.Placeholder;
import com.mihnita.mf2.messageformat.impl.PlainText;
import com.mihnita.mf2.messageformat.impl.SelectorMessage;
import com.mihnita.mf2.messageformat.impl.SelectorMessage.SelectorArg;
import com.mihnita.mf2.messageformat.impl.SimpleMessage;

@RunWith(JUnit4.class)
@SuppressWarnings("static-method")
public class PluralRangeSelectorsTest {

	// Support for plural range selectors #125
	// https://github.com/unicode-org/message-format-wg/issues/125

	@Test
	public void testSimplePlural() {
		final String locale = "hi";

		IPart[] partsFew = {
				new PlainText("Between "),
				new Placeholder("range", "nrRange"),
				new PlainText(" fere few.")
		};
		IPart[] partsMany = {
				new PlainText("Between "),
				new Placeholder("range", "nrRange"),
				new PlainText(" mare many.")
		};
		IPart[] partsOther = {
				new PlainText("Between "),
				new Placeholder("range", "nrRange"),
				new PlainText(" ore other.")
		};

		final SelectorArg[] selectorArgs = { new SelectorArg("range", "rangePlural") };
		MsgMap messages = MsgMap.sel()
				.put(new ISelectorVal[]{CASE_FEW}, new SimpleMessage("", locale, partsFew))
				.put(new ISelectorVal[]{CASE_MANY}, new SimpleMessage("", locale, partsMany))
				.put(new ISelectorVal[]{CASE_OTHER}, new SimpleMessage("", locale, partsOther));

		SelectorMessage.CUSTOM_SELECTOR_FUNCTIONS.put("rangePlural", new RangePluralSelectorFunc());
		Placeholder.CUSTOM_FORMATTER_FUNC.put("nrRange", new FormatNumberRange());

		final SelectorMessage mf = new SelectorMessage("id", locale, selectorArgs, messages.map());

		// Some made-up rules:
		// if start >= end => others
		// if start < end && start + end even => few
		// if start < end && start + end odd => many
		assertEquals("Between 1–4 fere few.",
				mf.format(Parameters.msg().put("range", new Range<Number>(1, 4)).build()));
		assertEquals("Between 2–6 mare many.",
				mf.format(Parameters.msg().put("range", new Range<Number>(2, 6)).build()));
		assertEquals("Between 12,34,56,789–98,76,54,321 ore other.",
				mf.format(Parameters.msg().put("range", new Range<Number>(987654321, 123456789)).build()));
	}
}
