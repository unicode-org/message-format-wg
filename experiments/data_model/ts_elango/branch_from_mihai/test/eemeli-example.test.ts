import { expect } from 'chai';
import 'mocha';
import { Message, SimpleMessage, SelectorMessage, PlainText, SelectorArg } from '../src/messageformat';
import { IMessage } from '../src/imessageformat';

describe('Tests for MessageFormat, examples from Eemeli:', () => {
	const locale = 'ro';

    function dinosaurMessage() : IMessage {
		const mfEq1 = new SimpleMessage('', locale, [new PlainText('a Dinosaur')]);
		const mfOther = new SimpleMessage('', locale, [new PlainText('Dinosaurs')]);
		return new SelectorMessage('dinosaur', locale,
			[new SelectorArg('count', 'plural')], new Map([
				[[1], mfEq1],
				[['other'], mfOther]
			])
		);
	}
	function elephantMessage() : IMessage {
		const mfEq1 = new SimpleMessage('', locale, [new PlainText('an Elephant')]);
		const mfOther = new SimpleMessage('', locale, [new PlainText('Elephants')]);
		return new SelectorMessage('elephant', locale,
			[new SelectorArg('count', 'plural')], new Map([
				[[1], mfEq1],
				[['other'], mfOther]
			])
		);
	}
	function ogreMessage() : IMessage {
		const mfEq1 = new SimpleMessage('', locale, [new PlainText('an Ogre')]);
		const mfOther = new SimpleMessage('', locale, [new PlainText('Ogres')]);
		return new SelectorMessage('ogre', locale,
			[new SelectorArg('count', 'plural')], new Map([
				[[1], mfEq1],
				[['other'], mfOther]
			])
		);
	}
	function monsterMessage() : IMessage {
		const mfEq1 = new SimpleMessage('', locale, [new PlainText('a Monster')]);
		const mfOther = new SimpleMessage('', locale, [new PlainText('Monsters')]);
		return new SelectorMessage('monster', locale,
			[new SelectorArg('count', 'plural')], new Map([
				[[1], mfEq1],
				[['other'], mfOther]
			])
		);
	}

	it('Message XRef with extra info', () => { // not yet ready
		const mf = dinosaurMessage();
		expect('a Dinosaur').to.equal(Message.format(mf, {'count': 1}));
		expect('Dinosaurs').to.equal(Message.format(mf, {'count': 23}));

		expect('an Ogre').to.equal(Message.format(ogreMessage(), {'count': 1}));
		expect('Elephants').to.equal(Message.format(elephantMessage(), {'count': 42}));
		expect('a Monster').to.equal(Message.format(monsterMessage(), {'count': 1}));
	});
});
