package com.mihnita.mf2.messageformat;

import static com.mihnita.mf2.messageformat.helpers.MFU.ip;
import static com.mihnita.mf2.messageformat.helpers.MFU.mm;
import static com.mihnita.mf2.messageformat.helpers.MFU.mso;
import static com.mihnita.mf2.messageformat.helpers.MFU.ph;
import static com.mihnita.mf2.messageformat.helpers.MFU.sela;
import static com.mihnita.mf2.messageformat.helpers.MFU.selv;
import static com.mihnita.mf2.messageformat.helpers.MFU.sm;
import static org.junit.Assert.assertEquals;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import com.ibm.icu.text.ListFormatter;
import com.ibm.icu.text.ListFormatter.Type;
import com.ibm.icu.text.ListFormatter.Width;
import com.ibm.icu.util.ULocale;
import com.mihnita.mf2.messageformat.datamodel.IPart;
import com.mihnita.mf2.messageformat.datamodel.ISelectorMessage.ISelectorArg;
import com.mihnita.mf2.messageformat.datamodel.ISelectorMessage.ISelectorVal;
import com.mihnita.mf2.messageformat.datamodel.ISelectorMessage.OrderedMap;
import com.mihnita.mf2.messageformat.datamodel.ISimpleMessage;
import com.mihnita.mf2.messageformat.datamodel.functions.IPlaceholderFormatter;
import com.mihnita.mf2.messageformat.impl.Placeholder;
import com.mihnita.mf2.messageformat.impl.SelectorMessage;
import com.mihnita.mf2.messageformat.impl.SimpleMessage;

@RunWith(JUnit4.class)
@SuppressWarnings("static-method")
public class FancyListTest {
	final static String localeId = "ro";
	final static Locale locale = Locale.forLanguageTag(localeId);

	static {
		Placeholder.CUSTOM_FORMATTER_FUNC.put("listFormat", new FormatList());
		Placeholder.CUSTOM_FORMATTER_FUNC.put("grammarBB", new GrammarFormatter(localeId));
		Placeholder.CUSTOM_FORMATTER_FUNC.put("personName", new GetPersonName());
	}
	// List formatting with grammatical inflection on each list item #3
	// https://github.com/unicode-org/message-format-wg/issues/3

	@Test
	public void testGrammarCaseBlackBox() {

		SimpleMessage mf = sm(locale, "Cartea ", ph("owner", "grammarBB", "case", "genitive"));

		Map<String, Object> params = mso("owner", "Maria");
		assertEquals("Cartea Mariei", mf.format(params));
		params = mso("owner", "Rodica");
		assertEquals("Cartea Rodicăi", mf.format(params));
		params = mso("owner", "Ileana");
		assertEquals("Cartea Ilenei", mf.format(params));
		params = mso("owner", "Petre");
		assertEquals("Cartea lui Petre", mf.format(params));
	}

	@Test
	public void testSimpleList() {

		String [] peopleNamesEmpty = {};
		String [] peopleNames1Female = { "Maria" };
		String [] peopleNames1Male = { "Petre" };
		String [] peopleNames = { "Maria", "Ileana", "Petre" };

		OrderedMap<ISelectorVal[], ISimpleMessage> messages = mm(
				selv(0), sm(locale, "Nu am dat cadou nimanui"),
				selv(1), sm(locale, "I-am dat cadou ", ph("people", "listFormat")),
				selv("other"), sm(locale, "Le-am dat cadou ", ph("people", "listFormat"))
		);

		ISelectorArg[] selectorArgs = sela("listLen", "plural");
		final SelectorMessage mf = new SelectorMessage("id", localeId, selectorArgs, messages);

		Map<String, Object> params;

		params = mso("listLen", peopleNamesEmpty.length, "people", peopleNamesEmpty);
		assertEquals("Nu am dat cadou nimanui", mf.format(params));

		params = mso("listLen", peopleNames1Female.length, "people", peopleNames1Female);
		assertEquals("I-am dat cadou Maria", mf.format(params));

		params = mso("listLen", peopleNames1Male.length, "people", peopleNames1Male);
		assertEquals("I-am dat cadou Petre", mf.format(params));

		params = mso("listLen", peopleNames.length, "people", peopleNames);
		assertEquals("Le-am dat cadou Maria, Ileana și Petre", mf.format(params));

//		partsOther[1] = new Placeholder("people", "listFormat", Parameters.ph().put("listType", "or").build());
//		assertEquals("Le-am dat cadou Maria, Ileana sau Petre", mf.format(params));
//
//		partsOther[1] = new Placeholder("people", "listFormat", Parameters.ph().put("listWidth", "narrow").build());
//		assertEquals("Le-am dat cadou Maria, Ileana, Petre", mf.format(params));
	}

	@Test
	public void testListWithItemProcess() {
		String [] peopleNames = { "Maria", "Ileana", "Petre" };

		SimpleMessage mf = sm(locale,
				"Le-am dat cadou ", ph("people", "listFormat", "listForEach", "grammarBB", "case", "genitive"));

		Map<String, Object> params = mso("listLen", peopleNames.length, "people", peopleNames);
		assertEquals("Le-am dat cadou Mariei, Ilenei și lui Petre", mf.format(params));
	}

	@Test
	public void testListWithItemMultiProcess() {
		Person [] peopleNames = {
				new Person("Maria", "Stanescu"),
				new Person("Ileana", "Zamfir"),
				new Person("Petre", "Belu"),
		};
		IPart[] partsOther = ip(
				"Le-am dat cadou ",
				ph("people", "listFormat", "listForEach", "personName|grammarBB",
						"case", "genitive", "personName", "first")
		);

		SimpleMessage mf = sm(locale, partsOther);

		Map<String, Object> params = mso("listLen", peopleNames.length, "people", peopleNames);
		assertEquals("Le-am dat cadou Mariei, Ilenei și lui Petre", mf.format(params));

		IPart[] partsOtherLastName = ip(
				"Le-am dat cadou ",
				 //  last name instead of first, OR list instead of AND
				ph("people", "listFormat", "listForEach", "personName|grammarBB",
						"case", "genitive", "listType", "or", "personName", "last")
		);
		mf = sm(locale, partsOtherLastName);
		assertEquals("Le-am dat cadou lui Stanescu, lui Zamfir sau lui Belu", mf.format(params));
	}
}

class Person {
	final String firstName;
	final String lastName;
	public Person(String firstName, String lastName) {
		this.firstName = firstName;
		this.lastName = lastName;
	}
}

class GetPersonName implements IPlaceholderFormatter {
	@Override
	public String format(Object value, String locale, Map<String, String> options) {
		if (value instanceof Person) {
			Person person = (Person) value;
			String field = (options == null) ? "first" :  options.get("personName");
			if ("first".equals(field)) {
				return person.firstName;
			}
			if ("last".equals(field)) {
				return person.lastName;
			}
			return person.toString();
		}
		return "{" + value + "}";
	}
}

class FormatList implements IPlaceholderFormatter {

	static Width stringToWidth(String val, Width fallback) {
		try {
			return Width.valueOf(val.toUpperCase(Locale.US));
		} catch (@SuppressWarnings("unused") IllegalArgumentException | NullPointerException expected) {
			return fallback;
		}
	}

	static Type stringToType(String val, Type fallback) {
		try {
			return Type.valueOf(val.toUpperCase(Locale.US));
		} catch (@SuppressWarnings("unused") IllegalArgumentException | NullPointerException expected) {
			return fallback;
		}
	}
	
	static String safeMapGet(Map<String, String> options, String key) {
		return safeMapGet(options, key, "");
	}

	static String safeMapGet(Map<String, String> options, String key, String def) {
		if (options == null)
			return def;
		String result = options.get(key);
		return result != null ? result : def;
	}
	
	@Override
	public String format(Object value, String locale, Map<String, String> options) {
		Width width = stringToWidth(safeMapGet(options, "listWidth"), Width.WIDE);
		Type type = stringToType(safeMapGet(options, "listType"), Type.AND);
		String listForEach = safeMapGet(options, "listForEach");

//		IPlaceholderFormatter itemFunction = null;
		IPlaceholderFormatter[] itemFunctions = null;
		if (!listForEach.isEmpty()) {
			itemFunctions = Placeholder.getFunctions(listForEach);
		}

		List<Object> toFormat = new ArrayList<>();
		ListFormatter formatter = ListFormatter.getInstance(ULocale.forLanguageTag(locale), type, width);
		if (value instanceof Object[]) {
			for (Object v : (Object[]) value) {
				if (itemFunctions != null) {
					toFormat.add(Placeholder.applyFunctions(v, locale, options, itemFunctions));
				} else {
					toFormat.add(v);
				}
			}
		}
		if (value instanceof Collection<?>) {
			for (Object v : (Collection<?>) value) {
				if (itemFunctions != null) {
					toFormat.add(Placeholder.applyFunctions(v, locale, options, itemFunctions));
				} else {
					toFormat.add(v);
				}
			}
		}
		return formatter.format(toFormat);
	}
}

// A "dummy" implementation.
// We can imagine a real thing with language-dependent machine learning models,
// or connecting to a service.
class GrammarCasesBlackBox {
	public GrammarCasesBlackBox(@SuppressWarnings("unused") String localeId) {
	}

	@SuppressWarnings("static-method")
	String getCase(String value, String grammarCase) {
		switch (grammarCase) {
			case "dative": // intentional fallback
			case "genitive":
				return getDativeAndGenitive(value);
			// and so on, but I don't care to add more for now
			default:
				return value;
		}
	}

	// Romanian naive and incomplete rules, just to make things work for testing.
	private static String getDativeAndGenitive(String value) {
		if (value.endsWith("ana"))
			return value.substring(0, value.length() - 3) + "nei";
		if (value.endsWith("ca"))
			return value.substring(0, value.length() - 2) + "căi";
		if (value.endsWith("ga"))
			return value.substring(0, value.length() - 2) + "găi";
		if (value.endsWith("a"))
			return value.substring(0, value.length() - 1) + "ei";
		return "lui " + value;
	}
}

class GrammarFormatter implements IPlaceholderFormatter {
	private final GrammarCasesBlackBox grammarMagic;

	public GrammarFormatter(String locale) {
		grammarMagic = new GrammarCasesBlackBox(locale);
	}

	@Override
	public String format(Object value, String locale, Map<String, String> options) {
		String result = null;
		if (value instanceof CharSequence) {
			String gcase = options.get("case");
			if (gcase == null)
				gcase = "other";
			result = grammarMagic.getCase(value.toString(), gcase);
		}
		return result == null ? "{" + value + "}" : result;
	}
}