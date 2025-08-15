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
        niceName: 'Jōyō',
        func: () => this._unwrap(this._kanjiapi.getJoyoSet()),
      },
      {
        name: 'jinmeiyo',
        niceName: 'Jinmeiyō',
        func: () => this._unwrap(this._kanjiapi.getJinmeiyoSet()),
      },
      {
        name: 'heisig',
        niceName: 'Heisig',
        func: () => this._unwrap(this._kanjiapi.getHeisigSet()),
      },
      ...[...Array(6).keys()].map((i) => {
        return {
          name: `grade-${i+1}`,
          niceName: `Grade ${i+1}`,
          func: () => this._unwrap(this._kanjiapi.getListForGrade(i+1)),
        }
      }),
      {
        name: 'kyoiku',
        niceName: 'Kyōiku',
        func: () => this._unwrap(this._kanjiapi.getKyoikuSet()),
      },
      {
        name: 'high-school',
        niceName: 'High School',
        func: () => this._unwrap(this._kanjiapi.getListForGrade(8)),
      },
      ...[...Array(5).keys()].map((i) => {
        i = 5 - i
        return {
          name: `jlpt-${i}`,
          niceName: `JLPT ${i}`,
          func: () => this._unwrap(this._kanjiapi.getListForJlpt(i)),
        }
      }),
    ]
    this.kanjiSets.forEach(kanjiSet => {
      kanjiSet.func()
    });
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

  randomKanji(lists) {
    if (lists.length === 0) {
      lists = ['joyo', 'jinmeiyo', 'heisig']
    }

    const kanji = [...lists.map(list => this._kanjiSet(list))
      .reduce((acc, curr) => curr.union(acc), new Set())]
    const choice = Math.floor(Math.random() * kanji.length)
    return kanji[choice]
  }

  getKanjiSets() {
    return this.kanjiSets.map(function(f) {
      return { name: f.name, niceName: f.niceName };
    });
  }

  validChar(lists, ch) {
    if (lists.length === 0) {
      return true
    }

    if (this._isNotKanji(ch)) {
      return true
    }

    return lists.some(list => this.inKanjiSet(list, ch))
  }

  countKanjiInLists(lists) {
    if (lists.length === 0) {
      return this._unwrap(this._kanjiapi.getAllSet()).size;
    } else {
      const kanji = [...lists.map(list => this._kanjiSet(list))
        .reduce((acc, curr) => curr.union(acc), new Set())]
      return kanji.length;
    }
  }

  _isNotKanji(ch) {
    return !this._unwrap(this._kanjiapi.getAllSet()).has(ch)
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
