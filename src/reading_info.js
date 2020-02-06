const m = require('mithril')
const { Reading } = require('./reading')
const { KanjiLiteral } = require('./kanji_literal')
const Kana = require('./kana')

const Row = {
  view: function({ attrs: { left, right } }) {
    return m('.db.flex.flex-column', [
      m('.fw6.flex.justify-start.pa1.pb0.avenir', left),
      m('.flex.flex-wrap.justify-start.pa1.pt0', right),
    ])
  },
}

const ReadingInfo = {
  sortKanji: (dictionary, a, b) => {
    const aIsJoyo = dictionary.isJoyo(a)
    const bIsJoyo = dictionary.isJoyo(b)
    const aIsJinmeiyo = dictionary.isJinmeiyo(a)
    const bIsJinmeiyo = dictionary.isJinmeiyo(b)

    if (aIsJoyo) {
      if (bIsJoyo) {
        return a.localeCompare(b)
      }

      return -1
    }

    if (bIsJoyo) {
      return 1
    }

    if (aIsJinmeiyo) {
      if (bIsJinmeiyo) {
        return a.localeCompare(b)
      }

      return -1
    }

    if (bIsJinmeiyo) {
      return 1
    }

    return a.localeCompare(b)
  },
  view: function({ attrs: { dictionary, reading } }) {
    return m('', [
      m(Row, {
        left: 'Reading',
        right: m(Reading, {
          type: Kana.readingType(reading.reading),
          reading: reading.reading,
          large: true,
        }),
      }),
      reading.main_kanji.length
        ? m(Row, {
            left: 'Main Kanji',
            right: [...reading.main_kanji]
              .sort(this.sortKanji.bind(null, dictionary))
              .map(kanji => {
                return m(KanjiLiteral, {
                  dictionary,
                  kanji,
                  large: false,
                })
              }),
          })
        : null,
      reading.name_kanji.length
        ? m(Row, {
            left: 'Name Kanji',
            right: [...reading.name_kanji]
              .sort(this.sortKanji.bind(null, dictionary))
              .map(kanji => {
                return m(KanjiLiteral, {
                  dictionary,
                  kanji,
                  large: false,
                })
              }),
          })
        : null,
    ])
  },
}

module.exports = {
  ReadingInfo,
}
