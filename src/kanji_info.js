const m = require('mithril')
const { KanjiLiteral } = require('./kanji_literal')
const Kanji = require('./kanji')
const Kana = require('./kana')
const { ON, KUN, NAME } = require('./constant')
const { Reading } = require('./reading')
const { config } = require('./config')
const { InternalLink, InternalTextLink } = require('./link')

const Meaning = {
  view: ({ attrs: { meaning } }) => {
    return m('.lh-solid.pa2.f5.ma1.br3.ba.c-meaning.black', meaning)
  },
}

const CHAR_BORDER = '0.1rem dashed hsla(286, 65%, 85%, 1)'
const CHAR_PADDING = '0.25rem'

const WordChar = {
  view: function({ attrs: { character, index, length } }) {
    if (Kana.isKana(character)) {
        return m('.dib.db.br3.black.word-char.lh-solid', character)
    }

    return m(
      InternalLink,
      {
          classes: [
              'br3', 'word-char', 'char-bv', 'pv1',
              ...(index === 0 ? ['char-bl', 'pl1'] : []),
              ...(index === length -1 ? ['char-br', 'pr1'] : []),
          ],
        href: `/${character}`,
      },
      character,
    )
  },
}

const WordMeanings = {
  view: ({ attrs: { meanings } }) => {
    return meanings.map((meaning, index, arr) => {
      return m(
        arr.length < 2 ? '' : '.mv2',
        arr.length < 2
          ? meaning.glosses.join('; ')
          : `${index + 1}. ${meaning.glosses.join('; ')}`,
      )
    })
  },
}

const Word = {
  view: function({ attrs: { word } }) {
    return m(
      '.fl.flex.pv2.pv3-ns.bb.b--light-silver.justify-between.items-center.flex-wrap',
      m(
        '.kosugi-maru.f2.f1-ns',
        [...word.variant.written].map((character, index) =>
          m(WordChar, {
            character,
            index,
            length: word.variant.written.length,
          }),
        ),
      ),
      m('.flex.flex-column.justify-center.items-end', [
        m(
          '.f3',
          {
            class: config.getIsRomaji() ? 'i' : 'kosugi-maru',
          },
          Kana.formatReading(word.variant.pronounced),
        ),
        m(
          '.measure-narrow.tr',
          m(WordMeanings, { meanings: word.meanings }),
        ),
      ]),
    )
  },
}

const Words = {
  view: ({ attrs: { kanji, words, wordlimit, dictionary } }) => {
    const filterLists = config.getFilterLists()
    const filteredForVariant = Kanji.wordsForKanji(kanji.kanji, words)
      .filter(word => {
        return [...word.variant.written]
          .every(ch => dictionary.validChar(filterLists, ch) || ch === kanji.kanji)
      })

    return [
      filteredForVariant
      .slice(0, wordlimit)
      .map(word => m(Word, { word })),
      filteredForVariant.length > wordlimit
      ? m(
        InternalTextLink,
        {
          classes: ['mv3', 'self-center'],
          href: `/${kanji.kanji}`,
          params: { wordlimit: Number(wordlimit) + 20 },
        },
        'more words',
      )
      : '',
    ]
  }
}

const Row = {
  view: function({ attrs: { left, right, classes = [] } }) {
    return m('.db.flex.items-center.justify-between.pv1', {
        class: classes.join(' '),
    }, [
      m('.fw6.pr2', left),
      m('', right),
    ])
  },
}

const KanjiInfo = {
  view: function({ attrs: { dictionary, kanji, words, wordlimit } }) {
    return m(
      '',
      m(
        '.flex.items-center.justify-around.mv4',
        m(KanjiLiteral, { kanji: kanji.kanji, large: true, dictionary }),
        m(
          '.flex-grow.ml2',
          Kanji.grade(kanji)
            ? m(Row, {
                left: 'Grade',
                right: m('', Kanji.grade(kanji)),
              })
            : null,
          Kanji.jlpt(kanji)
            ? m(Row, {
                left: 'JLPT',
                right: m('', Kanji.jlpt(kanji)),
              })
            : null,
          m(Row, {
            left: 'Strokes',
            right: m('', kanji.stroke_count),
          }),
          m(Row, {
            left: 'Unicode',
            right: m('', Kanji.unicode(kanji)),
          }),
          Kanji.alternative(kanji) ? m(Row, {
            left: 'Alternative',
            right: m(KanjiLiteral, { kanji: Kanji.alternative(kanji), dictionary }),
            classes: ['mt4'],
          }): null,
          Kanji.heisig(kanji)
            ? m(Row, {
                left: 'Heisig Keyword',
                right: m(
                  '.c-meaning.br2.ph1.black',
                  Kanji.heisig(kanji),
                ),
              })
            : null,
        ),
      ),
      kanji.kun_readings.length
        ? m(
            '.mv1',
            m(Row, {
              left: m('.f5', 'Kun'),
              right: m(
                '.flex.flex-wrap.items-center.justify-end.w-auto',
                kanji.kun_readings.map(reading => {
                  return m(Reading, { type: KUN, reading, large: false })
                }),
              ),
            }),
          )
        : null,
      kanji.on_readings.length
        ? m(
            '.mv1',
            m(Row, {
              left: m('.f5', 'On'),
              right: m(
                '.flex.flex-wrap.items-center.justify-end.w-auto',
                kanji.on_readings.map(reading => {
                  return m(Reading, { type: ON, reading, large: false })
                }),
              ),
            }),
          )
        : null,
      kanji.name_readings.length
        ? m(
            '.mv1',
            m(Row, {
              left: m('.f5', 'Nanori'),
              right: m(
                '.flex.flex-wrap.items-center.justify-end.w-auto',
                kanji.name_readings.map(reading => {
                  return m(Reading, { type: NAME, reading, large: false })
                }),
              ),
            }),
          )
        : null,
      kanji.meanings.length
        ? m(
            '.mv1',
            m(Row, {
              left: m('.f5', 'Meanings'),
              right: m(
                '.flex.flex-wrap.items-center.justify-end.w-auto',
                kanji.meanings.map(meaning => {
                  return m(Meaning, { meaning })
                }),
              ),
            }),
          )
        : null,
      m('.db.flex.flex-column', [
        m(
          '.fw6.flex.self-center.justify-end-ns.w-20.flex-wrap.self-start-ns.pa1.pb0.pa1-ns',
          'Words',
        ),
        m(
          '.fl.flex.flex-column.justify-start.flex-wrap-l',
          m(Words, { kanji, words, wordlimit, dictionary }),
        ),
      ]),
    )
  },
}

module.exports = {
  KanjiInfo,
}
