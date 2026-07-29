const o = require('ospec')
const {
  Kanjiapi: { LOADING, SUCCESS, ERROR },
} = require('kanjiapi-wrapper')

const { Dictionary } = require('../src/dictionary')

o.spec('dictionary lookup', () => {
  const kanjiResponse = () => ({ grade: 2, kanji: '漢' })
  const readingResponse = () => ({ main_kanji: [] })
  const wordsResponse = () => [{ variants: [] }]
  const success = value => ({ status: SUCCESS, value })
  const loading = () => ({ status: LOADING, value: null })
  const error = () => ({ status: ERROR, value: null })

  // Dictionary's constructor calls every kanji-set getter eagerly, so a fake
  // that misses one throws before any assertion runs. Keep them all in here so
  // adding a set to Dictionary only means touching this one place.
  const kanjiSetGetters = () => ({
    getAllSet: () => success(new Set(['漢'])),
    getJoyoSet: () => success(new Set(['a'])),
    getJinmeiyoSet: () => success(new Set(['b'])),
    getHeisigSet: () => success(new Set(['c'])),
    getKyoikuSet: () => success(new Set(['d'])),
    getListForGrade: () => success(new Set(['e'])),
    getListForJlpt: () => success(new Set(['f'])),
  })

  const kanjiapiWithResults = (
    getKanjiResult,
    getReadingResult,
    getWordsForKanjiResult,
    setOverrides = {},
  ) => {
    const getKanjiSpy = o.spy(() => getKanjiResult)
    const getReading = () => getReadingResult
    const getWordsForKanjiSpy = o.spy(() => getWordsForKanjiResult)
    const kanjiapi = {
      ...kanjiSetGetters(),
      getKanji: getKanjiSpy,
      getReading,
      getWordsForKanji: getWordsForKanjiSpy,
      ...setOverrides,
    }

    return { kanjiapi, getKanjiSpy, getWordsForKanjiSpy }
  }

  const loadingSetTest = (name, setOverrides) =>
    o(`returns loading while kanjiapi ${name} set is loading`, () => {
      const { kanjiapi } = kanjiapiWithResults(
        success(kanjiResponse()),
        error(),
        success(wordsResponse()),
        setOverrides,
      )

      const dictionary = new Dictionary(kanjiapi)

      o(dictionary.lookup('ジ')).deepEquals({ status: LOADING, value: null })
    })

  loadingSetTest('joyo', { getJoyoSet: () => loading() })
  loadingSetTest('jinmeiyo', { getJinmeiyoSet: () => loading() })
  loadingSetTest('heisig', { getHeisigSet: () => loading() })

  o(
    'returns loading when kanjiapi returns loading for both kanji and reading',
    () => {
      const { kanjiapi } = kanjiapiWithResults(loading(), loading())

      const dictionary = new Dictionary(kanjiapi)

      o(dictionary.lookup('ジ')).deepEquals({ status: LOADING, value: null })
    },
  )

  o(
    'returns loading when kanjiapi returns reading success and kanji loading',
    () => {
      const { kanjiapi } = kanjiapiWithResults(
        loading(),
        success(readingResponse()),
      )

      const dictionary = new Dictionary(kanjiapi)

      o(dictionary.lookup('ジ')).deepEquals({ status: LOADING, value: null })
    },
  )

  o(
    'returns loading when kanjiapi returns kanji success and reading loading',
    () => {
      const { kanjiapi } = kanjiapiWithResults(
        success(kanjiResponse()),
        loading(),
      )

      const dictionary = new Dictionary(kanjiapi)

      o(dictionary.lookup('漢')).deepEquals({ status: LOADING, value: null })
    },
  )

  o(
    'returns error when kanjiapi returns error for both kanji and reading',
    () => {
      const { kanjiapi } = kanjiapiWithResults(error(), error())

      const dictionary = new Dictionary(kanjiapi)

      o(dictionary.lookup('ジ')).deepEquals({ status: ERROR, value: null })
    },
  )

  o(
    'returns data when kanjiapi returns reading success and kanji error',
    () => {
      const { kanjiapi } = kanjiapiWithResults(
        error(),
        success(readingResponse()),
      )

      const dictionary = new Dictionary(kanjiapi)

      o(dictionary.lookup('ジ')).deepEquals({
        status: SUCCESS,
        value: { main_kanji: [] },
      })
    },
  )

  o(
    'returns data when kanjiapi returns kanji success and reading error',
    () => {
      const { kanjiapi } = kanjiapiWithResults(
        success(kanjiResponse()),
        error(),
        success(wordsResponse()),
      )

      const dictionary = new Dictionary(kanjiapi)

      o(dictionary.lookup('漢')).deepEquals({
        status: SUCCESS,
        value: {
          kanji: { grade: 2, kanji: '漢' },
          words: [{ variants: [] }],
        },
      })
    },
  )

  o('only uses first character to get kanji', () => {
    const { kanjiapi, getKanjiSpy } = kanjiapiWithResults(
      success(kanjiResponse()),
      error(),
      success(wordsResponse()),
    )

    const dictionary = new Dictionary(kanjiapi)

    o(dictionary.lookup('漢漢')).deepEquals({
      status: SUCCESS,
      value: {
        kanji: { grade: 2, kanji: '漢' },
        words: [{ variants: [] }],
      },
    })
    o(getKanjiSpy.calls[0].args[0]).deepEquals('漢')
  })

  o('combines kanji with words for kanji', () => {
    const { kanjiapi, getWordsForKanjiSpy } = kanjiapiWithResults(
      success(kanjiResponse()),
      error(),
      success(wordsResponse()),
    )

    const dictionary = new Dictionary(kanjiapi)

    o(dictionary.lookup('漢')).deepEquals({
      status: SUCCESS,
      value: {
        kanji: { grade: 2, kanji: '漢' },
        words: [{ variants: [] }],
      },
    })
    o(getWordsForKanjiSpy.calls[0].args[0]).deepEquals('漢')
  })

  o('returns loading when kanji loaded but words loading', () => {
    const { kanjiapi } = kanjiapiWithResults(
      success(kanjiResponse()),
      error(),
      loading(),
    )

    const dictionary = new Dictionary(kanjiapi)

    o(dictionary.lookup('漢')).deepEquals({ status: LOADING, value: null })
  })

  o('returns empty list of words when kanji loaded but words error', () => {
    const { kanjiapi } = kanjiapiWithResults(
      success(kanjiResponse()),
      error(),
      error(),
    )

    const dictionary = new Dictionary(kanjiapi)

    o(dictionary.lookup('漢')).deepEquals({
      status: SUCCESS,
      value: {
        kanji: { grade: 2, kanji: '漢' },
        words: [],
      },
    })
  })
})
