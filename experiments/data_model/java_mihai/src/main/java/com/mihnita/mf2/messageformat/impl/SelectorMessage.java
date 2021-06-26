package com.mihnita.mf2.messageformat.impl;

import java.security.InvalidParameterException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import com.ibm.icu.text.PluralRules;
import com.ibm.icu.util.ULocale;
import com.mihnita.mf2.messageformat.datamodel.ISelectorMessage;
import com.mihnita.mf2.messageformat.datamodel.ISimpleMessage;
import com.mihnita.mf2.messageformat.datamodel.functions.IMessageFormatter;
import com.mihnita.mf2.messageformat.datamodel.functions.ISelectorScoreFn;

public class SelectorMessage extends Message implements ISelectorMessage, IMessageFormatter {
	private final ISelectorArg[] selectorArgs;
	private final OrderedMap<ISelectorVal[], ISimpleMessage> messages;

	static class PluralSelector implements ISelectorScoreFn {
		@Override
		public int select(Object value1, ISelectorVal value2, String locale) {
			if (value1 == value2) {
				return 15;
			}
			String value2Str = value2.str();
			if (value1.toString().equals(value2Str)) {
				return 10;
			}
			if (value1 instanceof Number) {
				Number nrValue1 = (Number) value1;
				if (nrValue1 == value2.nr())
					return 15;
				PluralRules pl = PluralRules.forLocale(ULocale.forLanguageTag(locale), PluralRules.PluralType.CARDINAL);
				String selectResult = pl.select(nrValue1.doubleValue());
				if (value2Str != null && value2Str.equals(selectResult)) {
					return 5;
				}
			}
			if ("other".equals(value2Str)) {
				return 2;
			}
			return -100000;
		}
	}

	static class GenderSelector implements ISelectorScoreFn {
		@Override
		public int select(Object value1, ISelectorVal value2, String locale) {
			// the gender selector is just syntactic sugar, for now
			return new GenericSelector().select(value1, value2, locale);
		}
	}

	static class GenericSelector implements ISelectorScoreFn {
		@Override
		public int select(Object value1, ISelectorVal value2, String locale) {
			if (value1 == value2) {
				return 10;
			}
			String value2Str = value2.toString();
			if (value1.toString().equals(value2Str)) {
				return 5;
			}
			if ("other".equals(value2Str)) {
				return 2;
			}
			return -100000;
		}
	}
	
	final static Map<String, ISelectorScoreFn> _defaultSelectorFunctions = new HashMap<>();
	static {
		_defaultSelectorFunctions.put("plural", new PluralSelector());
		_defaultSelectorFunctions.put("gender", new GenderSelector());
		_defaultSelectorFunctions.put("select", new GenericSelector());
		_defaultSelectorFunctions.put("grammar_case", new GenericSelector());
	}
	public final static Map<String, ISelectorScoreFn> CUSTOM_SELECTOR_FUNCTIONS = new HashMap<>();

	public SelectorMessage(String id, String locale, ISelectorArg[] selectorArgs, OrderedMap<ISelectorVal[], ISimpleMessage> messages) {
		super(id, locale);
		this.selectorArgs = selectorArgs;
		this.messages = messages;

		// Need way better validation that this for prod (types, null, etc.)
		for (Entry<ISelectorVal[], ISimpleMessage> e : messages.entrySet()) {
			if (selectorArgs.length != e.getKey().length) {
				throw new InvalidParameterException("Switch count different than case count:\n"
						+ selectorArgs.length
						+ " != "
						+ e.getKey().length);
			}
		}
	}

	@Override
	public final ISelectorArg[] selectorArgs() {
		return selectorArgs;
	}

	@Override
	public final OrderedMap<ISelectorVal[], ISimpleMessage> messages() {
		return messages;
	}

	static public class SelectorVal implements ISelectorVal { // Xliff spec need extension. Proposal in the works.
		// Either / or
		private final Number nr;
		private final String str;

		public SelectorVal(String str) {
			this(null, str);
		}
		public SelectorVal(Number nr) {
			this(nr, null);
		}
		private SelectorVal(Number nr, String str) {
			this.nr = nr;
			this.str = str;
		}

		@Override
		public Number nr() {
			return nr;
		}

		@Override
		public String str() {
			return str;
		}

		boolean isNumber() { return nr != null; }
		boolean isString() { return str != null; }

		@Override
		public String toString() {
			if (isString())
				return str();
			return "" + nr();
		}
	}

	static public class SelectorArg implements ISelectorArg {
		private final String name;
		private final String selectorName;

		public SelectorArg(String name, String selectorName) {
			this.name = name;
			this.selectorName = selectorName;
		}

		@Override
		public String name() {
			return name;
		}

		@Override
		public String selectorName() {
			return selectorName;
		}

		@Override
		public String toString() {
			return "{" + name +"::"+ selectorName + "}";
		}
	}
	
	private static ISelectorScoreFn getSelectorFunction(String functionName) {
		ISelectorScoreFn result = _defaultSelectorFunctions.get(functionName);
		if (result == null) {
			result = CUSTOM_SELECTOR_FUNCTIONS.get(functionName);
		}
		return result;
	}

	@Override
	public String format(Map<String, Object> parameters) {
		int bestScore = -1;
		ISimpleMessage bestMessage = null;
		for (Entry<ISelectorVal[], ISimpleMessage> e : messages.entrySet()) {
			int currentScore = -1;
			for (int i = 0; i < selectorArgs.length; i++) {
				ISelectorArg selector = selectorArgs[i];
				Object value = parameters.get(selector.name());
				ISelectorScoreFn selectorFunction = getSelectorFunction(selector.selectorName());
				if (selectorFunction != null) {
					ISelectorVal[] selectVals = e.getKey();
					int score = selectorFunction.select(value, selectVals[i], locale);
					currentScore += score;
				}
			}
			if (currentScore > bestScore) {
				bestScore = currentScore;
				bestMessage = e.getValue();
			}
		}
		if (bestMessage != null) {
			return bestMessage.format(parameters);
		}
		throw new RuntimeException("Some troubles.\nParameters: " + parameters);
	}

	@Override
	public String toString() {
		StringBuilder result = new StringBuilder();

		result.append("Selectors: [\n");
		for (ISelectorArg e : this.selectorArgs) {
			result.append("  " + e + "\n");
		}
		result.append("]\n");
		result.append("messages: {\n");
		for (Entry<ISelectorVal[], ISimpleMessage> e : messages.entrySet()) {
			result.append("  " + Arrays.toString(e.getKey()) + " : " + e.getValue() + "\n");
		}
		result.append("}\n");

		return result.toString();
	}
}
