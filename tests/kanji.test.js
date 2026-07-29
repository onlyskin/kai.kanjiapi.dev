const o = require('ospec')
const Kanji = require('../src/kanji')

// The sort keys, in order: has-any-priority, kanji count, priority tier,
// nf frequency band, variant length. Every one ascending.
o.spec('prioritiseWords', () => {
  const word = (written, priorities = []) => ({
    variants: [{ written, priorities }],
  })

  o('words where a variant with the kanji has a priority sort higher', () => {
    const priorityValid = word('お国', ['spec1'])
    const nonPriorityValid = word('お国')

    const words = Kanji.prioritiseWords('国', [nonPriorityValid, priorityValid])

    o(words).deepEquals([priorityValid, nonPriorityValid])
  })

  o('words written with fewer kanji sort higher', () => {
    const oneKanji = word('お国')
    const twoKanji = word('国語')

    const words = Kanji.prioritiseWords('国', [twoKanji, oneKanji])

    o(words).deepEquals([oneKanji, twoKanji])
  })

  o('kanji count outranks priority strength', () => {
    const weakOneKanji = word('お国', ['news2'])
    const strongCompound = word('国語', ['ichi1', 'news1', 'nf01'])

    const words = Kanji.prioritiseWords('国', [strongCompound, weakOneKanji])

    o(words).deepEquals([weakOneKanji, strongCompound])
  })

  o('within a kanji count, a tier 1 priority beats a tier 2 one', () => {
    const tierOne = word('外国', ['news1'])
    const tierTwo = word('国語', ['news2'])

    const words = Kanji.prioritiseWords('国', [tierTwo, tierOne])

    o(words).deepEquals([tierOne, tierTwo])
  })

  o('within a tier, the lower nf frequency band sorts higher', () => {
    const commoner = word('外国', ['news1', 'nf01'])
    const rarer = word('国語', ['news1', 'nf10'])

    const words = Kanji.prioritiseWords('国', [rarer, commoner])

    o(words).deepEquals([commoner, rarer])
  })

  o('shorter words sort higher', () => {
    const shorter = word('お国')
    const longer = word('お国お')

    const words = Kanji.prioritiseWords('国', [longer, shorter])

    o(words).deepEquals([shorter, longer])
  })

  o('priorities on a variant without the kanji do not count', () => {
    const priorityOnOtherVariant = {
      variants: [
        { written: 'お', priorities: ['ichi1'] },
        { written: 'お国', priorities: [] },
      ],
    }
    const priorityOnValidVariant = word('お国', ['ichi1'])

    const words = Kanji.prioritiseWords('国', [
      priorityOnOtherVariant,
      priorityOnValidVariant,
    ])

    o(words).deepEquals([priorityOnValidVariant, priorityOnOtherVariant])
  })

  o('words with no variant written with the kanji are dropped', () => {
    const withoutKanji = word('あい')
    const withKanji = word('お国')

    const words = Kanji.prioritiseWords('国', [withoutKanji, withKanji])

    o(words).deepEquals([withKanji])
  })
})

o.spec('wordsForKanji', () => {
  o('presents the variant with the most priorities', () => {
    const apiWords = [
      {
        variants: [
          { written: 'お国', pronounced: 'おくに', priorities: [] },
          { written: '御国', pronounced: 'おくに', priorities: ['spec1'] },
        ],
        meanings: [{ glosses: ['country'] }],
      },
    ]

    o(Kanji.wordsForKanji('国', apiWords)).deepEquals([
      {
        variant: {
          written: '御国',
          pronounced: 'おくに',
          priorities: ['spec1'],
        },
        meanings: [{ glosses: ['country'] }],
      },
    ])
  })

  o('ignores variants that are not written with the kanji', () => {
    const apiWords = [
      {
        variants: [
          { written: 'おくに', pronounced: 'おくに', priorities: ['ichi1'] },
          { written: 'お国', pronounced: 'おくに', priorities: [] },
        ],
        meanings: [{ glosses: ['country'] }],
      },
    ]

    o(Kanji.wordsForKanji('国', apiWords)).deepEquals([
      {
        variant: { written: 'お国', pronounced: 'おくに', priorities: [] },
        meanings: [{ glosses: ['country'] }],
      },
    ])
  })
})

o.spec('presentWords', () => {
  // presents all three variants when search for 'stone', but not when search
  // for other kanji in third
  //const word = {
  //  variants: [
  //    {
  //      written: 'かんらん石',
  //      pronounced: 'かんらんせき',
  //      priorities: [],
  //    },
  //    {
  //      written: 'カンラン石',
  //      pronounced: 'カンランせき',
  //      priorities: [],
  //    },
  //    {
  //      written: '橄欖石',
  //      pronounced: 'かんらんせき',
  //      priorities: [],
  //    },
  //  ],
  //  meanings: [
  //    {
  //      glosses: ['olivine', 'peridot'],
  //    },
  //  ],
  //}
})
