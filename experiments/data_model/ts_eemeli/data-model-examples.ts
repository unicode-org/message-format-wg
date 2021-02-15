// MF1: { gender, select, male{he} female{she} other{they} }
const genderSelect: Select = {
  select: [{ path: ['gender'] }],
  cases: [
    { key: ['male'], value: ['he'] },
    { key: ['female'], value: ['she'] },
    { key: ['other'], value: ['they'] }
  ]
}

// MF1: { count, plural, one{a message} other{# messages} }
const countPlural: Select = {
  select: [{ func: 'plural', args: [{ path: ['count'] }] }],
  cases: [
    { key: ['one'], value: ['a message'] },
    {
      key: ['other'],
      value: [{ func: 'number', args: [{ path: ['count'] }] }, ' messages']
    }
  ]
}

const gameMessages: Resource = {
  id: 'game-messages',
  locale: 'en',
  messages: {
    monsters: {
      messages: {
        dinosaur: {
          messages: {
            indefinite: { value: ['a Dinosaur'] },
            plural: { value: ['Dinosaurs'] }
          }
        },
        elephant: {
          messages: {
            indefinite: { value: ['an Elephant'] },
            plural: { value: ['Elephants'] }
          }
        },
        ogre: {
          messages: {
            indefinite: { value: ['an Ogre'] },
            plural: { value: ['Ogres'] }
          }
        },
        other: {
          messages: {
            indefinite: { value: ['a Monster'] },
            plural: { value: ['Monsters'] }
          }
        }
      }
    },
    'killed-by': {
      value: [
        'You have been killed by ',
        { msg: ['monsters', { path: ['monster'] }, 'indefinite'] }
      ]
    },
    'kill-count': {
      select: [
        { func: 'plural', args: [{ path: ['monster-count'] }] },
        { func: 'plural', args: [{ path: ['dungeon-count'] }] }
      ],
      cases: [
        {
          key: ['one'],
          value: [
            'You have killed ',
            { msg: ['monsters', { path: ['monster'] }, 'indefinite'] },
            '.'
          ]
        },
        {
          key: ['other', 'one'],
          value: [
            'You have killed ',
            { func: 'number', args: [{ path: ['monster-count'] }] },
            ' ',
            { msg: ['monsters', { path: ['monster'] }, 'plural'] },
            ' in one dungeon.'
          ]
        },
        {
          key: ['other', 'other'],
          value: [
            'You have killed ',
            { func: 'number', args: [{ path: ['monster-count'] }] },
            ' ',
            { msg: ['monsters', { path: ['monster'] }, 'plural'] },
            ' in ',
            { func: 'number', args: [{ path: ['dungeon-count'] }] },
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
    friend: {
      value: [
        'Your friend has become ',
        {
          func: 'sparkle',
          args: [
            {
              id: 'game-messages',
              msg: ['monsters', { path: ['monster'] }, 'indefinite']
            }
          ]
        }
      ]
    }
  }
}
