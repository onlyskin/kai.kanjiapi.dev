const {
  Kanjiapi: { ERROR, LOADING, SUCCESS },
} = require('kanjiapi-wrapper')
const { isKanji } = require('./constant')

function isLoading(result) {
  return result.status === LOADING
}

function isError(result) {
  return result.status === ERROR
}

function isSuccess(result) {
  return result.status === SUCCESS
}

function allErrored(results) {
  return results.every(isError);
}

function anyLoading(results) {
  return results.some(isLoading);
}

class Dictionary {
  constructor(kanjiapi) {
    this._kanjiapi = kanjiapi
    this.kanjiSets = [
      {
        name: 'joyo',
        func: () => this._unwrap(this._kanjiapi.getJoyoSet()),
      },
      {
        name: 'jinmeiyo',
        func: () => this._unwrap(this._kanjiapi.getJinmeiyoSet()),
      },
      {
        name: 'heisig',
        func: () => this._unwrap(this._kanjiapi.getHeisigSet()),
      },
    ]
  }

  lookup(searchTerm) {
    if (['joyo', 'jinmeiyo', 'heisig'].some(name => this._kanjiSet(name).size === 0)) {
      return { status: LOADING, value: null }
    }

    const firstKanji = this._firstKanjiFrom(searchTerm)

    const results = [
      this._kanjiapi.getKanji(firstKanji),
      this._kanjiapi.getReading(searchTerm),
    ]

    if (anyLoading(results)) {
      return { status: LOADING, value: null }
    }

    if (allErrored(results)) {
      return { status: ERROR, value: null }
    }

    const successes = results.filter(isSuccess)
    const first = successes[0]
    return isKanji(first.value) ? this._withWords(first) : first
  }

  randomKanji() {
    const kanji = [...this._kanjiSet('joyo'), ...this._kanjiSet('jinmeiyo'), ...this._kanjiSet('heisig')]
    const choice = Math.floor(Math.random() * kanji.length)
    return kanji[choice]
  }

  kanjiSetStrings() {
    return this.kanjiSets.map(f => f.name);
  }

  _unwrap(result) {
    return result.status === SUCCESS
      ? result.value
      : new Set()
  }

  inKanjiSet(name, kanji) {
    return this._kanjiSet(name).has(kanji)
  }

  _kanjiSet(name) {
    const kanjiSet = this.kanjiSets.find(kanjiSet => kanjiSet.name == name)
    if (kanjiSet === undefined) {
      return new Set()
    } else {
      return kanjiSet.func()
    }
  }

  _firstKanjiFrom(text) {
    return String.fromCodePoint(text.codePointAt(0))
  }

  _withWords(kanjiResult) {
    const wordsResult = this._kanjiapi.getWordsForKanji(kanjiResult.value.kanji)

    return {
      status: wordsResult.status === LOADING ? LOADING : SUCCESS,
      value:
        wordsResult.status === LOADING
          ? null
          : {
              kanji: kanjiResult.value,
              words: wordsResult.status === ERROR ? [] : wordsResult.value,
            },
    }
  }
}

module.exports = {
  Dictionary,
}
