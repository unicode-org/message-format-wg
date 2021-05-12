package com.mihnita.mf2.messageformat;

import static org.junit.Assert.assertEquals;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import com.mihnita.mf2.messageformat.datamodel.IPart;
import com.mihnita.mf2.messageformat.impl.Message;
import com.mihnita.mf2.messageformat.impl.Placeholder;
import com.mihnita.mf2.messageformat.impl.PlainText;
import com.mihnita.mf2.messageformat.impl.SimpleMessage;

@RunWith(JUnit4.class)
@SuppressWarnings("static-method")
public class VariableReferenceTest {

	// https://github.com/unicode-org/message-format-wg/issues/130

	@Test
	public void testSimplePlural() {
		String locale = "ro";
		StringBuffer userName = new StringBuffer("John");

		final IPart [] partsMsg = {
				new PlainText("Hello "),
				new Placeholder("$userName"),
				new PlainText("!")
		};
		SimpleMessage mf = new SimpleMessage("msg", locale, partsMsg);

		Message.VARIABLES.put("userName", userName);

		// For variable ref I want something like this:
		assertEquals("Hello John!", mf.format(null));
		userName.append(" Doe");
		assertEquals("Hello John Doe!", mf.format(null));
		userName.replace(0, userName.length(), "Steve");
		assertEquals("Hello Steve!", mf.format(null));
		userName.replace(0, userName.length(), "Mary");
		assertEquals("Hello Mary!", mf.format(null));
		
		/*
		 * So we don't have to pass the value for each format, it will be
		 * automatically retrieved from the current value of the variable.
		 * But for this we need something that can be moved around by reference, not by value.
		 * In a language like C/C++ we can store a ref or a pointer in the variable map.
		 * Java is a bit clunky, we need a proper  
		 */
	}
}
