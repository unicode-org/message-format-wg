import { expect } from 'chai';
import 'mocha';
import { PlainText, Placeholder, SimpleMessage } from '../src/messageformat';

describe('Tests for MessageFormat:', () => {

	// Helper functions to reduce verbosity

	function objectToMap<T>(obj?: {[k: string]: T}) : Map<string, T> {
		const result = new Map<string, T>();
		for (const key in obj) {
			result.set(key, obj[key]);
		}
		return result;
	}

	// Common for all tests
	const locale = 'en-IN';

	// The tests
	it('Simple placeholder test', () => {
		const expectedMsg = 'Hello John!\n';
		// TODO: some helper functions to make things less verbose
		const parts = [
			new PlainText('Hello '),
			new Placeholder('user', '', objectToMap<string>({})),
			new PlainText('!\n')
		];

		// TODO: locale should be passed to the constructor, not to format(...)
		const mf = new SimpleMessage("id", locale, parts);
		const msgArgs = objectToMap<unknown>({ user: 'John' });
		// Also a friendliner method, something that takes a JS `unknown`, not a Map
		const actual = mf.format(msgArgs);

		expect(expectedMsg).to.equal(actual);
	});

	it('Date formatting test', () => {
		const expectedMsg = 'Using locale en-IN the date is 29 Dec 2019.\n';
		const parts = [
			new PlainText('Using locale '),
			new Placeholder('locale', '', objectToMap<string>({})),
			new PlainText(' the date is '),
			new Placeholder('theDay', 'date', objectToMap<string>({ year: 'numeric', month: 'short', day: 'numeric' })),
			new PlainText('.\n')
		];

		const mf = new SimpleMessage("id", locale, parts);
		const msgArgs = objectToMap<unknown>({ locale: locale, theDay: new Date(2019, 11, 29) });
		const actual = mf.format(msgArgs);

		expect(expectedMsg).to.equal(actual);
	});

	it('Currency formatting test', () => {
		const expectedMsg = 'A large currency amount is €1,23,45,67,890.98\n';
		const parts = [
			new PlainText('A large currency amount is '),
			new Placeholder('bigCount', 'number', objectToMap<string>({ style: 'currency', currency: 'EUR' })),
			new PlainText('\n')
		];

		const mf = new SimpleMessage("id", locale, parts);
		const msgArgs = objectToMap<unknown>({ bigCount: 1234567890.97531 });
		const actual = mf.format(msgArgs);

		expect(expectedMsg).to.equal(actual);
	});

	it('Percentage formatting test', () => {
		const expectedMsg = 'A percentage is 1,420%.\n';
		const parts = [
			new PlainText('A percentage is '),
			new Placeholder('count', 'number', objectToMap<string>({ style: 'percent' })),
			new PlainText('.\n')
		];

		const mf = new SimpleMessage("id", locale, parts);
		const msgArgs = objectToMap<unknown>({ count: 14.2 });
		const actual = mf.format(msgArgs);

		expect(expectedMsg).to.equal(actual);
	});
});
