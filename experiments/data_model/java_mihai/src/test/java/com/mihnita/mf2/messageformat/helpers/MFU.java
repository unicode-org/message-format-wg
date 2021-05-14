package com.mihnita.mf2.messageformat.helpers;

import java.security.InvalidParameterException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import com.mihnita.mf2.messageformat.datamodel.IPart;
import com.mihnita.mf2.messageformat.datamodel.ISimpleMessage;
import com.mihnita.mf2.messageformat.datamodel.ISelectorMessage.ISelectorArg;
import com.mihnita.mf2.messageformat.datamodel.ISelectorMessage.ISelectorVal;
import com.mihnita.mf2.messageformat.datamodel.ISelectorMessage.OrderedMap;
import com.mihnita.mf2.messageformat.impl.Placeholder;
import com.mihnita.mf2.messageformat.impl.PlainText;
import com.mihnita.mf2.messageformat.impl.SimpleMessage;
import com.mihnita.mf2.messageformat.impl.SelectorMessage.SelectorVal;
import com.mihnita.mf2.messageformat.impl.SelectorMessage.SelectorArg;

// Just used to reduce the verbosity of the tests
// In real use we would get the model from a serialized form.
public class MFU {
	public static Placeholder ph(String name) {
		return new Placeholder(name);
	}
	public static Placeholder ph(String name, String formatterName) {
		return new Placeholder(name, formatterName);
	}
	public static Placeholder ph(String name, String formatterName, String ... options) {
		HashMap<String, String> optionsMap = new HashMap<>(options.length / 2);
		int maxLen = options.length - 1;
		for (int i = 0; i < maxLen; i += 2) {
			optionsMap.put(options[i], options[i + 1]);
		}
		return new Placeholder(name, formatterName, optionsMap);
	}

	public static SimpleMessage sm(Object... parts) {
		return sm(Locale.getDefault(), parts);
	}
	public static SimpleMessage sm(IPart[] parts) {
		return sm(Locale.getDefault(), parts);
	}
	public static SimpleMessage sm(Locale locale, Object... parts) {
		return sm("", locale, parts);
	}
	public static SimpleMessage sm(Locale locale, IPart[] parts) {
		return sm("", locale, parts);
	}
	public static SimpleMessage sm(String id, Locale locale, Object... parts) {
		return new SimpleMessage(id, locale.toLanguageTag(), ip(parts));
	}
	public static SimpleMessage sm(String id, Locale locale, IPart[] parts) {
		return new SimpleMessage(id, locale.toLanguageTag(), parts);
	}

	public static IPart[] ip(Object... parts) {
		IPart[] result = new IPart[parts.length];
		for (int i = 0; i < parts.length; i++) {
			Object part = parts[i];
			IPart iPart;
			if (part instanceof String) {
				iPart = new PlainText((String) part);
			} else if (part instanceof CharSequence) {
				iPart = new PlainText(part.toString());
			} else if (part instanceof PlainText) {
				iPart = (PlainText) part;
			} else if (part instanceof Placeholder) {
				iPart = (Placeholder) part;
			} else {
				throw new InvalidParameterException("Can't put a " + part.getClass().getName() + " in an IPart");
			}
			result[i] = iPart;
		}
		return result;
	}

	/* Map of <String, Object> */
	public static Map<String, Object> mso(Object ... params) {
		Map<String, Object> result = new HashMap<>(params.length / 2);
		int maxLen = params.length - 1;
		for (int i = 0; i < maxLen; i += 2) {
			result.put((String) params[i], params[i + 1]);
		}
		return result;
	}

	static public ISelectorVal[] selv(Object ... values) {
		ISelectorVal[] result = new ISelectorVal[values.length];
		for (int i = 0; i < values.length; i++) {
			Object val = values[i];
			ISelectorVal iSelVal;
			if (val instanceof Number) {
				iSelVal = new SelectorVal((Number) val);
			} else if (val instanceof Long) {
				iSelVal = new SelectorVal((Long) val);
			} else if (val instanceof Integer) {
				iSelVal = new SelectorVal((Integer) val);
			} else if (val instanceof String) {
				iSelVal = new SelectorVal((String) val);
			} else if (val instanceof CharSequence) {
				iSelVal = new SelectorVal(val.toString());
			} else {
				throw new InvalidParameterException("Can't put a " + val.getClass().getName() + " in an ISelectorVal");
			}
			result[i] = iSelVal;
		}
		return result;
	}
	static public ISelectorArg[] sela(String ... values) {
		ISelectorArg[] result = new ISelectorArg[values.length / 2];

		int maxLen = values.length - 1;
		for (int i = 0; i < maxLen; i += 2) {
			result[i / 2] = new SelectorArg(values[i], values[i + 1]);
		}
		return result;
	}

	public static OrderedMap<ISelectorVal[], ISimpleMessage> mm(Object ... params) {
		OrderedMap<ISelectorVal[], ISimpleMessage> result = new OrderedMap<>();
		int maxLen = params.length - 1;
		for (int i = 0; i < maxLen; i += 2) {
			result.put((ISelectorVal[]) params[i], (ISimpleMessage) params[i + 1]);
		}
		return result;
	}
}
