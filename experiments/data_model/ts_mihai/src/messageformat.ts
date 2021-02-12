import {IMessage, ISimpleMessage, ISelectorMessage} from './imessageformat';
import {IPart, IPlaceholder, IPlainText} from './imessageformat';
import {ISelectorArg, ISelectorVal} from './imessageformat';
import {IPlaceholderFormatter, ISelectorFn} from './imessageformat';
import {formatDateTime, formatNumber} from './some_format_functions';
import {pluralSelector, genderSelector, genericSelector} from './some_format_functions';
import {objectToMap} from './util_functions';

const _defaultFormatterFunctions = new Map<string, IPlaceholderFormatter>([
	['date', formatDateTime],
	['time', formatDateTime],
	['number', formatNumber]
]);

const _defaultSelectorFunctions = new Map<string, ISelectorFn>([
	['plural', pluralSelector],
	['gender', genderSelector],
	['select', genericSelector]
]);

export abstract class Message implements IMessage {
	id: string;
	locale: string;
	constructor(id: string, locale: string) {
		this.id = id;
		this.locale = locale;
	}
	static format(msg: IMessage, parameters: {[k: string]: unknown}): string {
		if (msg instanceof SimpleMessage) {
			return SimpleMessage._format(msg, parameters);
		} else if (msg instanceof SelectorMessage) {
			return SelectorMessage._format(msg, parameters);
		} else {
			console.log(msg);
			throw new Error('I don\'t know how to format ' + typeof (msg));
		}
	}
}

export class SimpleMessage extends Message implements ISimpleMessage {
	parts: IPart[];
	constructor(id: string, locale: string, parts: IPart[]) {
		super(id, locale);
		this.parts = parts;
	}
	static _format(msg: SimpleMessage, parameters: {[k: string]: unknown}): string {
		let result = '';
		for (const idx in msg.parts) {
			const part = msg.parts[idx];
			if (part instanceof PlainText) {
				result = result.concat(part.value);
			} else if (typeof part === 'string') {
				result = result.concat(part);
			} else if (part instanceof Placeholder) {
				result = result.concat(Placeholder._format(part, msg.locale, objectToMap(parameters)));
			}
		}
		return result;
	}
}

export class SelectorMessage extends Message implements ISelectorMessage {
	selectorArgs: ISelectorArg[];
	// The order matters. So we need a "special map" that keeps the order
	messages: Map<ISelectorVal[], ISimpleMessage>;
	constructor(id: string, locale: string, selectorArgs: SelectorArg[], messages: Map<ISelectorVal[], ISimpleMessage>) {
		super(id, locale);
		// Need way better validation that this for prod (types, null, etc.)
		messages.forEach((value: ISimpleMessage, key: ISelectorVal[]) => {
			if (selectorArgs.length != key.length) {
				throw new Error('Switch count different than case count:\n'
					+ selectorArgs.length
					+ ' != '
					+ key.length
				);
			}
		});
		this.selectorArgs = selectorArgs;
		this.messages = messages;
	}
	static _format(msg: SelectorMessage, parameters: {[k: string]: unknown}): string {
		let bestScore = -1;
		let bestMessage = new SimpleMessage(msg.id, msg.locale, []);
		msg.messages.forEach((msgVal: ISimpleMessage, selectVals: ISelectorVal[]) => {
			let currentScore = -1;
			for (let i = 0; i < msg.selectorArgs.length; i++) {
				const selector = msg.selectorArgs[i];
				const value = parameters[selector.name];
				const selectorFunction = _defaultSelectorFunctions.get(selector.selector_name);
				if (selectorFunction) {
					const score = selectorFunction(value, selectVals[i], msg.locale);
					currentScore += score;
				}
			}
			if (currentScore > bestScore) {
				bestScore = currentScore;
				bestMessage = msgVal;
			}
		});
		if (bestScore >= 1) {
			return SimpleMessage._format(bestMessage, parameters);
		}
		console.log("=== ERROR ===");
		console.log(this);
		console.log(parameters);
		throw new Error('Some troubles.\nParameters: ' + parameters);
	}
}

export class SelectorArg implements ISelectorArg {
	name: string; // the variable to select on
	selector_name: string; // plural, ordinal, gender, select, ...
	constructor(name: string, selector_name: string) {
		this.name = name;
		this.selector_name = selector_name;
	}
}

export class PlainText implements IPlainText {
	value: string;
	constructor(value: string) {
		this.value = value;
	}
	format(): string {
		return this.value;
	}
}

export class Placeholder implements IPlaceholder {
	name: string;
	formatter_name: string;
	options: Map<string, string>;

	constructor(name: string, formatter_name?: string, options?: {[k: string]: string}) {
		this.name = name;
		this.formatter_name = formatter_name ? formatter_name : '';
		this.options = objectToMap<string>(options);
	}

	static _format(ph: IPlaceholder, locale: string, parameters: Map<string, unknown>): string {
		const value = parameters.get(ph.name); // the runtime value of the placeholder
		const formatterFunction = _defaultFormatterFunctions.get(ph.formatter_name);
		if (formatterFunction) {
			return formatterFunction(ph, locale, parameters);
		} else if (value) {
			return String(value);
		}
		return '<undefined ' + ph.name + '>';
	}
}
