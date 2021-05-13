package com.mihnita.mf2.messageformat;

import static com.mihnita.mf2.messageformat.helpers.ConstSelectors.CASE_EXACTLY_ONE;
import static com.mihnita.mf2.messageformat.helpers.ConstSelectors.CASE_EXACTLY_ZERO;
import static com.mihnita.mf2.messageformat.helpers.ConstSelectors.CASE_OTHER;
import static org.junit.Assert.assertEquals;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
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
import com.mihnita.mf2.messageformat.datamodel.ISelectorMessage.ISelectorVal;
import com.mihnita.mf2.messageformat.datamodel.functions.IPlaceholderFormatter;
import com.mihnita.mf2.messageformat.impl.Placeholder;
import com.mihnita.mf2.messageformat.impl.PlainText;
import com.mihnita.mf2.messageformat.impl.SelectorMessage;
import com.mihnita.mf2.messageformat.impl.SelectorMessage.SelectorArg;
import com.mihnita.mf2.messageformat.impl.SimpleMessage;

@RunWith(JUnit4.class)
@SuppressWarnings("static-method")
public class FancyListTest {
	
	// List formatting with grammatical inflection on each list item #3
	// https://github.com/unicode-org/message-format-wg/issues/3

	@Test
	public void testGrammarCaseBlackBox() {
		final String locale = "ro";
		Placeholder.CUSTOM_FORMATTER_FUNC.put("grammarBB", new GrammarFormatter(locale));

		IPart[] parts = {
				new PlainText("Cartea "),
				new Placeholder("owner", "grammarBB", Parameters.ph().put("case", "genitive").build())
		};

		SimpleMessage mf = new SimpleMessage("", locale, parts);

		Map<String, Object> params = new HashMap<>();
		params.put("owner", "Maria");
		assertEquals("Cartea Mariei", mf.format(params));
		params.put("owner", "Rodica");
		assertEquals("Cartea Rodicăi", mf.format(params));
		params.put("owner", "Ileana");
		assertEquals("Cartea Ilenei", mf.format(params));
		params.put("owner", "Petre");
		assertEquals("Cartea lui Petre", mf.format(params));
	}

	@Test
	public void testSimpleList() {
		final String locale = "ro";

		String [] peopleNamesEmpty = {};
		String [] peopleNames1Female = { "Maria" };
		String [] peopleNames1Male = { "Petre" };
		String [] peopleNames = { "Maria", "Ileana", "Petre" };

		IPart[] partsExactly0 = {
				new PlainText("Nu am dat cadou nimanui"),
		};
		IPart[] partsExactly1 = {
				new PlainText("I-am dat cadou "),
				new Placeholder("people", "listFormat")
		};
		IPart[] partsOther = {
				new PlainText("Le-am dat cadou "),
				new Placeholder("people", "listFormat")
		};

		final SelectorArg[] selectorArgs = { new SelectorArg("listLen", "plural") };
		MsgMap messages = MsgMap.sel()
				.put(new ISelectorVal[]{CASE_EXACTLY_ZERO}, new SimpleMessage("", locale, partsExactly0))
				.put(new ISelectorVal[]{CASE_EXACTLY_ONE}, new SimpleMessage("", locale, partsExactly1))
				.put(new ISelectorVal[]{CASE_OTHER}, new SimpleMessage("", locale, partsOther));

		Placeholder.CUSTOM_FORMATTER_FUNC.put("listFormat", new FormatList());
		final SelectorMessage mf = new SelectorMessage("id", locale, selectorArgs, messages.map());

		Map<String, Object> params = new HashMap<>();

		params.put("listLen", peopleNamesEmpty.length);
		params.put("people", peopleNamesEmpty);
		assertEquals("Nu am dat cadou nimanui", mf.format(params));

		params.put("listLen", peopleNames1Female.length);
		params.put("people", peopleNames1Female);
		assertEquals("I-am dat cadou Maria", mf.format(params));

		params.put("listLen", peopleNames1Male.length);
		params.put("people", peopleNames1Male);
		assertEquals("I-am dat cadou Petre", mf.format(params));

		params.put("listLen", peopleNames.length);
		params.put("people", peopleNames);
		assertEquals("Le-am dat cadou Maria, Ileana și Petre", mf.format(params));
		
		partsOther[1] = new Placeholder("people", "listFormat", Parameters.ph().put("listType", "or").build());
		assertEquals("Le-am dat cadou Maria, Ileana sau Petre", mf.format(params));

		partsOther[1] = new Placeholder("people", "listFormat", Parameters.ph().put("listWidth", "narrow").build());
		assertEquals("Le-am dat cadou Maria, Ileana, Petre", mf.format(params));
	}

	@Test
	public void testListWithItemProcess() {
		final String locale = "ro";

		String [] peopleNames = { "Maria", "Ileana", "Petre" };
		IPart[] partsOther = {
				new PlainText("Le-am dat cadou "),
				new Placeholder("people", "listFormat", Parameters.ph()
						.put("listForEach", "grammarBB")
						.put("case", "genitive")
						.build())
		};

		SimpleMessage mf = new SimpleMessage("", locale, partsOther);

		Placeholder.CUSTOM_FORMATTER_FUNC.put("listFormat", new FormatList());
		Placeholder.CUSTOM_FORMATTER_FUNC.put("grammarBB", new GrammarFormatter(locale));

		Map<String, Object> params = new HashMap<>();
		params.put("listLen", peopleNames.length);
		params.put("people", peopleNames);
		assertEquals("Le-am dat cadou Mariei, Ilenei și lui Petre", mf.format(params));
	}

	@Test
	public void testListWithItemMultiProcess() {
		final String locale = "ro";

		Person [] peopleNames = {
				new Person("Maria", "Stanescu"),
				new Person("Ileana", "Zamfir"),
				new Person("Petre", "Belu"),
		};
		IPart[] partsOther = {
				new PlainText("Le-am dat cadou "),
				new Placeholder("people", "listFormat", Parameters.ph()
						.put("listForEach", "personName|grammarBB")
						.put("case", "genitive")
						.put("personName", "first")
						.build())
		};

		SimpleMessage mf = new SimpleMessage("", locale, partsOther);

		Placeholder.CUSTOM_FORMATTER_FUNC.put("listFormat", new FormatList());
		Placeholder.CUSTOM_FORMATTER_FUNC.put("grammarBB", new GrammarFormatter(locale));
		Placeholder.CUSTOM_FORMATTER_FUNC.put("personName", new GetPersonName());

		Map<String, Object> params = new HashMap<>();
		params.put("listLen", peopleNames.length);
		params.put("people", peopleNames);
		assertEquals("Le-am dat cadou Mariei, Ilenei și lui Petre", mf.format(params));

		IPart[] partsOtherLastName = {
				new PlainText("Le-am dat cadou "),
				new Placeholder("people", "listFormat", Parameters.ph()
						.put("listForEach", "personName|grammarBB")
						.put("case", "genitive")
						.put("personName", "last") // LAST instead of FIRST
						.put("listType", "or") // OR instead of AND
						.build())
		};
		mf = new SimpleMessage("", locale, partsOtherLastName);
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

class Utils {
	static IPlaceholderFormatter[] getFunctions(String functionNames) {
		String[] arrFunctionNames = functionNames.split("\\|");
		IPlaceholderFormatter[] result = new IPlaceholderFormatter[arrFunctionNames.length]; 
		for (int i = 0; i < arrFunctionNames.length; i++) {
			result[i] = Placeholder.CUSTOM_FORMATTER_FUNC.get(arrFunctionNames[i]);
		}
		return result;
	}

	static String applyFunctions(Object value, String locale, Map<String, String> options, IPlaceholderFormatter ... functions) {
		Object r = value;
		for (IPlaceholderFormatter function : functions) {
			r = function.format(r, locale, options);
		}
		return r.toString();
	}
}

class FormatList implements IPlaceholderFormatter {

	Width stringToWidth(String val, Width fallback) {
		try {
			return Width.valueOf(val.toUpperCase(Locale.US));
		} catch (IllegalArgumentException | NullPointerException expected) {
			return fallback;
		}
	}

	Type stringToType(String val, Type fallback) {
		try {
			return Type.valueOf(val.toUpperCase(Locale.US));
		} catch (IllegalArgumentException | NullPointerException expected) {
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
			itemFunctions = Utils.getFunctions(listForEach);
//			itemFunction = Placeholder.CUSTOM_FORMATTER_FUNC.get(listForEach);
		}

		List<Object> toFormat = new ArrayList<>();
		ListFormatter formatter = ListFormatter.getInstance(ULocale.forLanguageTag(locale), type, width);
		if (value instanceof Object[]) {
			for (Object v : (Object[]) value) {
				if (itemFunctions != null) {
//					toFormat.add(itemFunction.format(v, locale, options));
					toFormat.add(Utils.applyFunctions(v, locale, options, itemFunctions));
				} else {
					toFormat.add(v);
				}
			}
		}
		if (value instanceof Collection<?>) {
			for (Object v : (Collection<?>) value) {
				if (itemFunctions != null) {
//					toFormat.add(itemFunction.format(v, locale, options));
					toFormat.add(Utils.applyFunctions(v, locale, options, itemFunctions));
				} else {
					toFormat.add(v);
				}
			}
		}
		return formatter.format(toFormat);
	}
}

class GrammarCasesBlackBox {
	public GrammarCasesBlackBox(String localeId) {
	}

	String getCase(String value, String grammarCase) {
		switch (grammarCase) {
			case "dative": // intentional fallback
			case "genitive":
				return getDativeAndGenitive(value);
			// and so on, missing for now
			default:
				return value;
		}
	}

	private String getDativeAndGenitive(String value) {
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