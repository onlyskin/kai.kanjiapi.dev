const o = require('ospec')
const { nextAction } = require('../src/scroll')

o.spec('nextAction', () => {
  o('following a link to another kanji goes to the top', () => {
    const action = nextAction({
      wasPop: false,
      previousSearch: '字',
      search: '学',
      saved: undefined,
    })

    o(action).deepEquals({ type: 'top' })
  })

  o('a link to a kanji visited earlier still goes to the top', () => {
    const action = nextAction({
      wasPop: false,
      previousSearch: '学',
      search: '字',
      saved: 1200,
    })

    o(action).deepEquals({ type: 'top' })
  })

  o('back restores the position saved for that page', () => {
    const action = nextAction({
      wasPop: true,
      previousSearch: '学',
      search: '字',
      saved: 1200,
    })

    o(action).deepEquals({ type: 'restore', target: 1200 })
  })

  o('forward restores its own position, not the top', () => {
    const action = nextAction({
      wasPop: true,
      previousSearch: '字',
      search: '学',
      saved: 800,
    })

    o(action).deepEquals({ type: 'restore', target: 800 })
  })

  o('back to a page never scrolled restores the top', () => {
    const action = nextAction({
      wasPop: true,
      previousSearch: '学',
      search: '字',
      saved: undefined,
    })

    o(action).deepEquals({ type: 'restore', target: 0 })
  })

  o('more words keeps the position, being the same kanji', () => {
    const action = nextAction({
      wasPop: false,
      previousSearch: '字',
      search: '字',
      saved: undefined,
    })

    o(action).deepEquals({ type: 'stay' })
  })

  o('the first load goes to the top', () => {
    const action = nextAction({
      wasPop: false,
      previousSearch: null,
      search: '字',
      saved: undefined,
    })

    o(action).deepEquals({ type: 'top' })
  })
})
