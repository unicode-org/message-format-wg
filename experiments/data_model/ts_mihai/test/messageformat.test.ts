import { expect } from 'chai';
import 'mocha';
import { PlainText, Placeholder, SimpleMessage, SelectorMessage, Switch } from '../src/messageformat';
import { ICase, ISimpleMessage } from '../src/imessageformat';

describe('Tests for MessageFormat:', () => {

	// Common for all tests. Chosen for the interesting number format.
	const locale = 'en-IN';

	// The tests
	it('Simple placeholder test', () => {
		const expectedMsg = 'Hello John!\n';
		// TODO: some helper functions to make things less verbose
		const parts = [
			new PlainText('Hello '),
			new Placeholder('user', '', {}),
			new PlainText('!\n')
		];

		const mf = new SimpleMessage('id', locale, parts);
		const actual = SimpleMessage.format(mf, { user: 'John' });

		expect(expectedMsg).to.equal(actual);
	});

	it('Date formatting test', () => {
		const expectedMsg = 'Using locale en-IN the date is 29 Dec 2019.\n';
		const parts = [
			new PlainText('Using locale '),
			new Placeholder('locale', '', {}),
			new PlainText(' the date is '),
			new Placeholder('theDay', 'date', { year: 'numeric', month: 'short', day: 'numeric' }),
			new PlainText('.\n')
		];

		const mf = new SimpleMessage('id', locale, parts);
		const msgArgs = { locale: locale, theDay: new Date(2019, 11, 29) };
		const actual = SimpleMessage.format(mf, msgArgs);

		expect(expectedMsg).to.equal(actual);
	});

	it('Currency formatting test', () => {
		const expectedMsg = 'A large currency amount is €1,23,45,67,890.98\n';
		const parts = [
			new PlainText('A large currency amount is '),
			new Placeholder('bigCount', 'number', { style: 'currency', currency: 'EUR' }),
			new PlainText('\n')
		];

		const mf = new SimpleMessage('id', locale, parts);
		const msgArgs = { bigCount: 1234567890.97531 };
		const actual = SimpleMessage.format(mf, msgArgs);

		expect(expectedMsg).to.equal(actual);
	});

	it('Percentage formatting test', () => {
		const expectedMsg = 'A percentage is 1,420%.\n';
		const parts = [
			new PlainText('A percentage is '),
			new Placeholder('count', 'number', { style: 'percent' }),
			new PlainText('.\n')
		];

		const mf = new SimpleMessage('id', locale, parts);
		const actual = SimpleMessage.format(mf, { count: 14.2 });

		expect(expectedMsg).to.equal(actual);
	});

	it('Simple plural test', () => {
		const expectedMsgEq1 = 'Ai sters un fisier.\n';
		const expectedMsgFew = 'Ai sters 3 fisiere.\n';
		const expectedMsgOther = 'Ai sters 23 de fisiere.\n';

		const partsEq1 = [
			new PlainText('Ai sters un fisier.\n'),
		];
		const partsFew = [
			new PlainText('Ai sters '),
			new Placeholder('count', 'number', {}),
			new PlainText(' fisiere.\n')
		];
		const partsOther = [
			new PlainText('Ai sters '),
			new Placeholder('count', 'number', {}),
			new PlainText(' de fisiere.\n')
		];

		const localeRo = 'ro';
		const mfEq1 = new SimpleMessage('', localeRo, partsEq1);
		const mfEqFew = new SimpleMessage('', localeRo, partsFew);
		const mfOther = new SimpleMessage('', localeRo, partsOther);

		const switches = [
			new Switch('count', 'plural')
		];
		const messages = new Map<ICase[], ISimpleMessage>();
		messages.set([1], mfEq1);
		messages.set(['few'], mfEqFew);
		messages.set(['other'], mfOther);

		const mf = new SelectorMessage('id', localeRo, switches, messages);

		expect(expectedMsgEq1).to.equal(SelectorMessage.format(mf, { count: 1 }));
		expect(expectedMsgFew).to.equal(SelectorMessage.format(mf, { count: 3 }));
		expect(expectedMsgOther).to.equal(SelectorMessage.format(mf, { count: 23 }));
	});

	it('Simple gender test', () => {
		const expectedMsgF = 'You\'ve been invited to her party.\n';
		const expectedMsgM = 'You\'ve been invited to his party.\n';
		const expectedMsgO = 'You\'ve been invited to their party.\n';

		const mfEqF = new SimpleMessage('', locale, [new PlainText(expectedMsgF)]);
		const mfEqM = new SimpleMessage('', locale, [new PlainText(expectedMsgM)]);
		const mfEqO = new SimpleMessage('', locale, [new PlainText(expectedMsgO)]);

		const switches = [
			new Switch('host_gender', 'gender')
		];
		const messages = new Map<ICase[], ISimpleMessage>();
		messages.set(['female'], mfEqF);
		messages.set(['male'], mfEqM);
		messages.set(['other'], mfEqO);

		const mf = new SelectorMessage('id', locale, switches, messages);

		expect(expectedMsgF).to.equal(SelectorMessage.format(mf, { host_gender: 'female' }));
		expect(expectedMsgM).to.equal(SelectorMessage.format(mf, { host_gender: 'male' }));
		expect(expectedMsgO).to.equal(SelectorMessage.format(mf, { host_gender: 'we_do_not_know' }));
	});

	it('Double plural test', () => {
		const switches = [
			new Switch('monster-count', 'plural'),
			new Switch('dungeon-count', 'plural'),
		];
		const s0 = new SimpleMessage('', locale, [
			new PlainText('You have killed no monsters.')]);
		const s1 = new SimpleMessage('', locale, [
			new PlainText('You have killed one monster in one dungeon.')]);
		const s2 = new SimpleMessage('', locale, [
			new PlainText('You have killed '),
			new Placeholder('monster-count', 'number', {}),
			new PlainText(' monsters in one dungeon.')
		]);
		const s3 = new SimpleMessage('', locale, [
			new PlainText('You have killed '),
			new Placeholder('monster-count', 'number', {}),
			new PlainText(' monsters in '),
			new Placeholder('dungeon-count', 'number', {}),
			new PlainText(' dungeons.'),
		]);

		const messages = new Map<ICase[], ISimpleMessage>([
			[[      0, 'other'], s0],
			[[      1, 'other'], s1],
			[['other',       1], s2],
			[['other', 'other'], s3]
		]);
		const mf = new SelectorMessage('id', locale, switches, messages);

		expect('You have killed no monsters.').to.equal(
			SelectorMessage.format(mf, {'monster-count': 0, 'dungeon-count': 0}));
		expect('You have killed one monster in one dungeon.').to.equal(
			SelectorMessage.format(mf, {'monster-count': 1, 'dungeon-count': 0}));
		expect('You have killed 5 monsters in one dungeon.').to.equal(
			SelectorMessage.format(mf, {'monster-count': 5, 'dungeon-count': 1}));
		expect('You have killed 8 monsters in 2 dungeons.').to.equal(
			SelectorMessage.format(mf, {'monster-count': 8, 'dungeon-count': 2}));
	});
});
