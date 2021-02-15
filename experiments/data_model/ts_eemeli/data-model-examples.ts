// MF1: { gender, select, male{he} female{she} other{they} }
const genderSelect: Select = {
  select: [{ var_path: ['gender'] }],
  cases: [
    { key: ['male'], value: ['he'] },
    { key: ['female'], value: ['she'] },
    { key: ['other'], value: ['they'] }
  ]
}

// MF1: { count, plural, one{a message} other{# messages} }
const countPlural: Select = {
  select: [{ func: 'plural', args: [{ var_path: ['count'] }] }],
  cases: [
    { key: ['one'], value: ['a message'] },
    {
      key: ['other'],
      value: [{ func: 'number', args: [{ var_path: ['count'] }] }, ' messages']
    }
  ]
}

const gameMessages: Resource = {
  id: 'game-messages',
  locale: 'en',
  entries: [
    {
      id: 'monsters',
      entries: [
        {
          id: 'dinosaur',
          entries: [
            { id: 'indefinite', value: ['a Dinosaur'] },
            { id: 'plural', value: ['Dinosaurs'] }
          ]
        },
        {
          id: 'elephant',
          entries: [
            { id: 'indefinite', value: ['an Elephant'] },
            { id: 'plural', value: ['Elephants'] }
          ]
        },
        {
          id: 'ogre',
          entries: [
            { id: 'indefinite', value: ['an Ogre'] },
            { id: 'plural', value: ['Ogres'] }
          ]
        },
        {
          id: 'other',
          entries: [
            { id: 'indefinite', value: ['a Monster'] },
            { id: 'plural', value: ['Monsters'] }
          ]
        }
      ]
    },
    {
      id: 'killed-by',
      value: [
        'You have been killed by ',
        { msg_path: ['monsters', { var_path: ['monster'] }, 'indefinite'] }
      ]
    },
    {
      id: 'kill-count',
      value: {
        select: [
          { func: 'plural', args: [{ var_path: ['monster-count'] }] },
          { func: 'plural', args: [{ var_path: ['dungeon-count'] }] }
        ],
        cases: [
          {
            key: ['one'],
            value: [
              'You have killed ',
              {
                msg_path: ['monsters', { var_path: ['monster'] }, 'indefinite']
              },
              '.'
            ]
          },
          {
            key: ['other', 'one'],
            value: [
              'You have killed ',
              { func: 'number', args: [{ var_path: ['monster-count'] }] },
              ' ',
              { msg_path: ['monsters', { var_path: ['monster'] }, 'plural'] },
              ' in one dungeon.'
            ]
          },
          {
            key: ['other', 'other'],
            value: [
              'You have killed ',
              { func: 'number', args: [{ var_path: ['monster-count'] }] },
              ' ',
              { msg_path: ['monsters', { var_path: ['monster'] }, 'plural'] },
              ' in ',
              { func: 'number', args: [{ var_path: ['dungeon-count'] }] },
              ' dungeons.'
            ]
          }
        ]
      }
    }
  ]
}

const extMessages: Resource = {
  id: 'remote-ref',
  locale: 'en',
  entries: [
    {
      id: 'friend',
      value: [
        'Your friend has become ',
        {
          func: 'sparkle',
          args: [
            {
              res_id: 'game-messages',
              msg_path: ['monsters', { var_path: ['monster'] }, 'indefinite']
            }
          ]
        }
      ]
    }
  ]
}
