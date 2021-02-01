// MF1: { gender, select, male{he} female{she} other{they} }
const genderSelect: Select = {
  select: [['gender']],
  cases: [
    { key: ['male'], value: ['he'] },
    { key: ['female'], value: ['she'] },
    { key: ['other'], value: ['they'] }
  ]
}

// MF1: { count, plural, one{a message} other{# messages} }
const countPlural: Select = {
  select: [{ func: 'plural', args: [['count']] }],
  cases: [
    { key: ['one'], value: ['a message'] },
    {
      key: ['other'],
      value: [{ func: 'number', args: [['count']] }, ' messages']
    }
  ]
}

const gameMessages: Resource = {
  id: 'game-messages',
  locale: 'en',
  messages: {
    monsters: {
      dinosaur: { indefinite: ['a Dinosaur'], plural: ['Dinosaurs'] },
      elephant: { indefinite: ['an Elephant'], plural: ['Elephants'] },
      ogre: { indefinite: ['an Ogre'], plural: ['Ogres'] },
      other: { indefinite: ['a Monster'], plural: ['Monsters'] }
    },
    'killed-by': [
      'You have been killed by ',
      { msg: ['monsters', ['monster'], 'indefinite'] }
    ],
    'kill-count': {
      select: [
        { func: 'plural', args: [['monster-count']] },
        { func: 'plural', args: [['dungeon-count']] }
      ],
      cases: [
        {
          key: ['one'],
          value: [
            'You have killed ',
            { msg: ['monsters', ['monster'], 'indefinite'] },
            '.'
          ]
        },
        {
          key: ['other', 'one'],
          value: [
            'You have killed ',
            { func: 'number', args: [['monster-count']] },
            ' ',
            { msg: ['monsters', ['monster'], 'plural'] },
            ' in one dungeon.'
          ]
        },
        {
          key: ['other', 'other'],
          value: [
            'You have killed ',
            { func: 'number', args: [['monster-count']] },
            ' ',
            { msg: ['monsters', ['monster'], 'plural'] },
            ' in ',
            { func: 'number', args: [['dungeon-count']] },
            ' dungeons.'
          ]
        }
      ]
    }
  }
}

const extMessages: Resource = {
  id: 'remote-ref',
  locale: 'en',
  messages: {
    friend: [
      'Your friend has become ',
      {
        func: 'sparkle',
        args: [
          { id: 'game-messages', msg: ['monsters', ['monster'], 'indefinite'] }
        ]
      }
    ]
  }
}
