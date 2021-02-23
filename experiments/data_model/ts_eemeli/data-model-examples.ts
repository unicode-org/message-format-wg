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
    },

    /**
     * Requested by Mihai, as a PoC for function composition within the data model
     *
     * grammatical_case(input: string, options: { case: 'genitive' | ... }): string
     * // Applies the desired grammatical case on the input value
     *
     * map<T, U>(func: (...args: any[], input: T, options?: any) => U, iter: Iterable<T>): Iterable<U>
     * // Applies a function to each of value of `iter`. If `func` defines some of
     * // its own args or options, those are effectively curried into each invokation.
     *
     * list(...args: Array<string | Iterable<string>>, options: { type: 'and' | 'or' }): string
     * // Apply a list formatter on the input arguments, which may be a mix of strings and string sequences
     */
    {
      id: 'gift-recipients',
      value: [
        'I gave gifts to ',
        {
          func: 'list',
          args: [
            {
              func: 'map',
              args: [
                {
                  func: 'grammatical_case',
                  args: [],
                  options: [{ key: 'case', value: 'genitive' }]
                },
                { var_path: ['people'] }
              ]
            }
          ],
          options: [{ key: 'type', value: 'and' }]
        }
      ]
    },

    {
      id: 'gift-recipients-with-meta',
      meta: {
        comment:
          'Requested by Mihai, ' +
          'as a PoC for function composition within the data model'
      },
      value: [
        'I gave gifts to ',
        {
          func: 'list',
          args: [
            {
              func: 'map',
              args: [
                {
                  func: 'grammatical_case',
                  args: [],
                  options: [{ key: 'case', value: 'genitive' }],
                  meta: {
                    comment:
                      'Applies the desired grammatical case on the input value',
                    arg_types: ['string'],
                    opt_types: { case: '"genitive" | ...' },
                    ret_type: 'string'
                  }
                },
                { var_path: ['people'] }
              ],
              meta: {
                comment:
                  'Applies a function to each of value of `iter`. ' +
                  'If `func` defines some of its own args or options, ' +
                  'those are effectively curried into each invokation.',
                generics: ['T', 'U'],
                arg_types: [
                  '(...args: any[], input: T, options?: any) => U',
                  'Iterable<T>'
                ],
                ret_type: 'U'
              }
            }
          ],
          options: [{ key: 'type', value: 'and' }],
          meta: {
            comment:
              'Apply a list formatter on the input arguments, ' +
              'which may be a mix of strings and string sequences',
            arg_rest_type: 'Array<string | Iterable<string>>',
            opt_types: { type: '"and" | "or"' }
          }
        }
      ]
    }
  ]
}
