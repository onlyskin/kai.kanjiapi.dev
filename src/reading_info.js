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
  sortKanjiLiterals: (dictionary, kanjiLiterals) => {
      const partitioned = {
          'joyo': [],
          'jinmeiyo': [],
          'heisig': [],
          'rest': [],
      };
      kanjiLiterals.forEach(kanji => {
          if (dictionary.isJoyo(kanji)) {
              partitioned['joyo'].push(kanji);
          } else if (dictionary.isJinmeiyo(kanji)) {
              partitioned['jinmeiyo'].push(kanji);
          } else if (dictionary.isHeisig(kanji)) {
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
