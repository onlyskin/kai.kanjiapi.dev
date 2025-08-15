const m = require('mithril')
const { Reading } = require('./reading')
const { KanjiLiteral } = require('./kanji_literal')
const Kana = require('./kana')
const { config } = require('./config')

const Row = {
  view: function({ attrs: { left, right } }) {
    return m('.db.flex.flex-column', [
      m('.fw6.flex.justify-start.pa1.pb0', left),
      m('.flex.flex-wrap.justify-start.pa1.pt0', right),
    ])
  },
}

const ReadingInfo = {
  sortKanjiLiterals: (dictionary, kanjiLiterals) => {
      const partitioned = {
          'joyo': [],
          'jinmeiyo': [],
          'heisig': [],
          'rest': [],
      };
      const filterLists = config.getFilterLists()
      kanjiLiterals.forEach(kanji => {
          if (!dictionary.validChar(filterLists, kanji)) {
            return
          } else if (dictionary.inKanjiSet('joyo', kanji)) {
              partitioned['joyo'].push(kanji);
          } else if (dictionary.inKanjiSet('jinmeiyo', kanji)) {
              partitioned['jinmeiyo'].push(kanji);
          } else if (dictionary.inKanjiSet('heisig', kanji)) {
              partitioned['heisig'].push(kanji);
          } else {
              partitioned['rest'].push(kanji);
          }
      });
      return [
          ...partitioned['joyo'].sort(),
          ...partitioned['jinmeiyo'].sort(),
          ...partitioned['heisig'].sort(),
          ...partitioned['rest'].sort(),
      ];
  },
  sortKanji: (dictionary, a, b) => {
    const aIsJoyo = dictionary.inKanjiSet('joyo', a)
    const bIsJoyo = dictionary.inKanjiSet('joyo', b)
    const aIsJinmeiyo = dictionary.inKanjiSet('jinmeiyo', a)
    const bIsJinmeiyo = dictionary.inKanjiSet('jinmeiyo', b)

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
            right: this.sortKanjiLiterals(dictionary, [...reading.main_kanji])
              .map(kanji => {
                return m(KanjiLiteral, {
                  dictionary,
                  kanji,
                  large: false,
                  classes: ['ma1'],
                })
              }),
          })
        : null,
      reading.name_kanji.length
        ? m(Row, {
            left: 'Name Kanji',
            right: this.sortKanjiLiterals(dictionary, [...reading.name_kanji])
              .map(kanji => {
                return m(KanjiLiteral, {
                  dictionary,
                  kanji,
                  large: false,
                  classes: ['ma1'],
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
