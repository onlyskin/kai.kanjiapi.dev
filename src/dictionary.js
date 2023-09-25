const R = require('ramda')
const {
  Kanjiapi: { ERROR, LOADING, SUCCESS },
} = require('kanjiapi-wrapper')

const isLoading = R.propEq('status', LOADING)
const isError = R.propEq('status', ERROR)
const isSuccess = R.propEq('status', SUCCESS)
const allErrored = R.all(isError)
const anyLoading = R.any(isLoading)
const { isKanji } = require('./constant')

class Dictionary {
  constructor(kanjiapi) {
    this._kanjiapi = kanjiapi
  }

  lookup(searchTerm) {
    if (this._joyoSet().length === 0 || this._jinmeiyoSet().length === 0 || this._heisigSet().length === 0) {
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

    const successful = R.pipe(R.filter(isSuccess), R.head, result =>
      isKanji(result.value) ? this._withWords(result) : result,
    )(results)

    return successful
  }

  randomKanji() {
    const kanji = [...this._joyoSet(), ...this._jinmeiyoSet(), ...this._heisigSet()]
    const choice = Math.floor(Math.random() * kanji.length)
    return kanji[choice]
  }

  isJoyo(kanji) {
    const { status, value } = this._kanjiapi.getJoyoSet()
    return status === SUCCESS ? value.has(kanji) : false
  }

  isJinmeiyo(kanji) {
    const { status, value } = this._kanjiapi.getJinmeiyoSet()
    return status === SUCCESS ? value.has(kanji) : false
  }

  isHeisig(kanji) {
    const { status, value } = this._kanjiapi.getHeisigSet()
    return status === SUCCESS ? value.has(kanji) : false
  }

  _joyoSet() {
    return this._kanjiapi.getJoyoSet().status === SUCCESS
      ? this._kanjiapi.getJoyoSet().value.keys()
      : []
  }

  _jinmeiyoSet() {
    return this._kanjiapi.getJinmeiyoSet().status === SUCCESS
      ? this._kanjiapi.getJinmeiyoSet().value.keys()
      : []
  }

  _heisigSet() {
    return this._kanjiapi.getHeisigSet().status === SUCCESS
      ? this._kanjiapi.getHeisigSet().value.keys()
      : []
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
