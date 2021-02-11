import { expect } from 'chai';
import 'mocha';
import { PlainText, SimpleMessage, SelectorMessage, Switch } from '../src/messageformat';
import { IMessage } from '../src/imessageformat';

describe('Tests for MessageFormat, examples from Eemeli:', () => {
	const locale = 'ro';

    function dinosaurMessage() : IMessage {
		const mfEq1 = new SimpleMessage('', locale, [new PlainText('a Dinosaur')]);
		const mfOther = new SimpleMessage('', locale, [new PlainText('Dinosaurs')]);
		return new SelectorMessage('dinosaur', locale,
			[new Switch('count', 'plural')], new Map([
				[[1], mfEq1],
				[['other'], mfOther]
			])
		);
	}
	function elephantMessage() : IMessage {
		const mfEq1 = new SimpleMessage('', locale, [new PlainText('an Elephant')]);
		const mfOther = new SimpleMessage('', locale, [new PlainText('Elephants')]);
		return new SelectorMessage('elephant', locale,
			[new Switch('count', 'plural')], new Map([
				[[1], mfEq1],
				[['other'], mfOther]
			])
		);
	}
	function ogreMessage() : IMessage {
		const mfEq1 = new SimpleMessage('', locale, [new PlainText('an Ogre')]);
		const mfOther = new SimpleMessage('', locale, [new PlainText('Ogres')]);
		return new SelectorMessage('ogre', locale,
			[new Switch('count', 'plural')], new Map([
				[[1], mfEq1],
				[['other'], mfOther]
			])
		);
	}
	function MonsterMessage() : IMessage {
		const mfEq1 = new SimpleMessage('', locale, [new PlainText('a Monster')]);
		const mfOther = new SimpleMessage('', locale, [new PlainText('Monsters')]);
		return new SelectorMessage('monster', locale,
			[new Switch('count', 'plural')], new Map([
				[[1], mfEq1],
				[['other'], mfOther]
			])
		);
	}

	it('Message XRef with extra info', () => {
		const mf = dinosaurMessage();
		const msgArgs = new Map<string, unknown>();
		msgArgs.set('count', 1);
		expect('a Dinosaur').to.equal(mf.format(msgArgs));
		msgArgs.set('count', 23);
		expect('Dinosaurs').to.equal(mf.format(msgArgs));
	});
});
