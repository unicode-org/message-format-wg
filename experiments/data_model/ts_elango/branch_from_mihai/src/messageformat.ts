import {ICase} from './imessageformat';
import {IPart} from './imessageformat';
import {IPlaceholder} from './imessageformat';
import {IPlainText} from './imessageformat';
import {IMessage, } from './imessageformat';
import {ISelectorMessage, } from './imessageformat';
import {ISimpleMessage} from './imessageformat';
import {ISwitch} from './imessageformat';

function mapToObject<T>(obj?: Map<string, T>) : {[k: string]: T} {
	const result: {[k: string]: T} = {};
	if (obj) {
		obj.forEach((val: T, key: string) => {
			result[key] = val;
		});
	}
	return result;
}

interface ISwitchSelectorFunction {
	// (name: string, type: string, flags: Map<string, string>,
	// 	locale: string, parameters: Map<string, unknown>): ICase;
	(value1: unknown, value2: unknown, locale: string): number;
}
interface IFormatterFunction {
	(name: string, type: string, flags: Map<string, string>,
		locale: string, parameters: Map<string, unknown>): string;
}

const formatDateTime: IFormatterFunction = (
		name: string,
		type: string,
		flags: Map<string, string>,
		locale: string,
		parameters: Map<string, unknown>) => {

	const options = mapToObject<string>(flags);
	if (type == 'date' || type == 'time') {
		const value = parameters.get(name);
		if (value instanceof Date) {
			return Intl.DateTimeFormat(locale, options).format(value);
		}
		if (value instanceof Number) {
			return Intl.DateTimeFormat(locale, options).format(value.valueOf());
		}
	}
	return '<undefined ' + name + '>';
};

const formatNumber: IFormatterFunction = (
		name: string,
		type: string,
		flags: Map<string, string>,
		locale: string,
		parameters: Map<string, unknown>) => {

	const options = mapToObject<string>(flags);
	if (type == 'number') {
		const value = parameters.get(name);
		if (value instanceof Number || typeof value === 'number') {
			return Intl.NumberFormat(locale, options).format(value.valueOf());
		}
	}
	return '<undefined ' + name + '>';
};

const _defaultFormatterFunctions = new Map<string, IFormatterFunction>([
	['date', formatDateTime],
	['time', formatDateTime],
	['number', formatNumber]
]);

const pluralSwitchSelector: ISwitchSelectorFunction = (
		value1: unknown, value2: unknown, locale: string) => {
	let value1Str = '' + value1;
	let value2Str = '' + value2;
	if (value1Str == value2Str) {
		return 10;
	}
	if (value1 instanceof Number || typeof value1 === 'number') {
		let sel = new Intl.PluralRules(locale).select(value1.valueOf());
		if (sel == value2Str) {
			return 5;
		}
	}
	if (value2Str == 'other')
		return 2;
	return -100000;
};

const genderSwitchSelector: ISwitchSelectorFunction = (
		value1: unknown, value2: unknown, locale: string) => {
	// the gender selector is just syntactic sugar, for now
	return selectSwitchSelector(value1, value2, locale);
};

const selectSwitchSelector: ISwitchSelectorFunction = (
		value1: unknown, value2: unknown, locale: string) => {
	if (value1 == value2) {
		return 10;
	}
	let value1Str = '' + value1;
	let value2Str = '' + value2;
	if (value1Str == value2Str) {
		return 5;
	}
	if (value2Str == 'other') {
		return 2;
	}
	return -100000;
};

const _defaultSwitchSelectorFunctions = new Map<string, ISwitchSelectorFunction>([
	['plural', pluralSwitchSelector],
	['gender', genderSwitchSelector],
	['select', selectSwitchSelector]
]);

export abstract class Message implements IMessage {
	id: string;
	locale: string;
	constructor(id: string, locale: string) {
		this.id = id;
		this.locale = locale;
	}
	abstract format(parameters: Map<string, unknown>): string;
}

export class SimpleMessage extends Message implements ISimpleMessage {
	parts: IPart[];
	constructor(id: string, locale: string, parts: IPart[]) {
		super(id, locale);
		this.parts = parts;
	}
	format(parameters: Map<string, unknown>): string {
		let result = '';
		for (const idx in this.parts) {
			const part = this.parts[idx];
			if (part instanceof PlainText) {
				result = result.concat(part.format());
			} else if (part instanceof Placeholder) {
				result = result.concat(part.format(this.locale, parameters));
			}
		}
		return result;
	}
}

export class SelectorMessage extends Message implements ISelectorMessage {
	switches: ISwitch[];
	// The order matters. So we need a "special map" that keeps the order
	messages: Map<ICase[], ISimpleMessage>;
	constructor(id: string, locale: string, switches: Switch[], messages: Map<ICase[], ISimpleMessage>) {
		super(id, locale);
		// Need way better validation that this for prod (types, null, etc.)
		messages.forEach((value: ISimpleMessage, key: ICase[]) => {
			if (switches.length != key.length) {
				throw new Error('Switch count different than case count:\n'
					+ switches.length
					+ ' != '
					+ key.length
				);
			}
		});
		this.switches = switches;
		this.messages = messages;
	}
	format(parameters: Map<string, unknown>): string {
		let bestScore = -1;
		var bestMessage = new SimpleMessage(this.id, this.locale, []);
		this.messages.forEach((msgVal: SimpleMessage, caseElement: ICase[]) => {
			let currentScore = -1;
			for (var i = 0; i < this.switches.length; i++) {
				const switchElement = this.switches[i];
				const value = parameters.get(switchElement.name);
				const switchFunction = _defaultSwitchSelectorFunctions.get(switchElement.type);
				if (switchFunction) {
					const score = switchFunction(value, caseElement[i], this.locale);
					currentScore += score;
				}
			}
			if (currentScore > bestScore) {
				bestScore = currentScore;
				bestMessage = msgVal;
			}
		});
		if (bestScore >= 1) {
			return bestMessage.format(parameters);
		}
		console.log("=== ERROR ===");
		console.log(this);
		console.log(parameters);
		throw new Error('Some troubles.\nParameters: ' + parameters);
	}
}

export class Switch implements ISwitch {
	name: string; // the variable to switch on
	type: string; // plural, ordinal, gender, select, ...
	constructor(name: string, type: string) {
		this.name = name;
		this.type = type;
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
	type: string;
	flags: Map<string, string>;

	constructor(name: string, type: string, flags: Map<string, string>) {
		this.name = name;
		this.type = type;
		this.flags = flags;
	}
	format(locale: string, parameters: Map<string, unknown>): string {
		const value = parameters.get(this.name); // the runtime value of the placeholder
		const formatterFunction = _defaultFormatterFunctions.get(this.type);
		if (formatterFunction) {
			return formatterFunction(this.name, this.type, this.flags, locale, parameters);
		} else if (value) {
			return String(value);
		}
		return '<undefined ' + this.name + '>';
	}
}
