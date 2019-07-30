const m = require('mithril');
const { isKana } = require('wanakana');
const { Loading } = require('./loading');
const { KanjiLiteral } = require('./kanji_literal');
const Kanji = require('./kanji');
const Kana = require('./kana');
const { ON, KUN, NAME } = require('./constant');
const { Reading } = require('./reading');
const { config } = require('./config');

const Meaning = {
    view: ({attrs: {meaning}}) => {
        return m(
            '.lh-solid.pa3.ma1.br-pill.f4.avenir.bg-pale-orange',
            meaning,
        );
    },
};

const CHAR_BORDER = '0.1rem dashed hsla(286, 65%, 85%, 1)';
const CHAR_PADDING = '0.25rem';

const WordChar = {
    view: ({attrs: {character, index, length}}) => {
        return m(
            '.dib.db.br3.bg-pale-purple.b--pale-purple.lh-solid',
            {
                class: isKana(character) ? '' : 'pointer grow bt bb',
                style: isKana(character) ? {} : {
                    borderRight: index === length - 1 ? CHAR_BORDER : undefined,
                    borderLeft: index === 0 ? CHAR_BORDER : undefined,
                    borderTop: CHAR_BORDER,
                    borderBottom: CHAR_BORDER,
                    paddingRight: index === length - 1 ? CHAR_PADDING : '0rem',
                    paddingLeft: index === 0 ? CHAR_PADDING : '0rem',
                    paddingTop: CHAR_PADDING,
                    paddingBottom: CHAR_PADDING,
                },
                onclick: e => {
                    m.route.set(`/${e.target.textContent}`, null);
                },
            },
            character,
        );
    },
};

const WordMeanings = {
    view: ({attrs: {meanings}}) => {
        return meanings.map((meaning, index, arr) => {
            return m(
                arr.length < 2 ? '' : '.mv2',
                arr.length < 2 ?
                meaning.glosses.join('; ') :
                `${index + 1}. ${meaning.glosses.join('; ')}`,
            );
        });
    },
};

const Word = {
    view: function ({attrs: {word}}) {
        return m(
            '.fl.flex.pv1.pv2-ns.bb.b--black-20.justify-between.items-center.flex-wrap',
            m(
                '.kosugi-maru.f2.f1-ns',
                [...word.variant.written]
                .map((character, index) => m(WordChar, {
                    character,
                    index,
                    length: word.variant.written.length,
                })),
            ),
            m(
                '.flex.flex-column.justify-center.items-end',
                [
                    m(
                        '.f5.f3-ns.ma1',
                        {
                            class: config.isRomaji ? 'avenir i' : 'kosugi-maru',
                        },
                        Kana.formatReading(word.variant.pronounced),
                    ),
                    m(
                        '.measure-narrow.avenir.tr.ma1',
                        m(WordMeanings, {meanings: word.meanings}),
                    ),
                ],
            ),
        );
    },
};

const Words = {
    view: ({attrs: {kanji, words, wordlimit}}) => {
        return [
            Kanji.wordsForKanji(kanji.kanji, words)
            .slice(0, wordlimit)
            .map(word => m(Word, {word})),
            words.length > wordlimit ?
            m(
                '.mv3.self-center.avenir.pointer.link.dim.black-80.underline.no-select',
                {
                    onclick : () => {
                        m.route.set(m.route.get(), {wordlimit: Number(wordlimit) + 20});
                    },
                },
                'more words',
            ) : '',
        ];
    },
};

const Row = {
    view: function({attrs: {left, right}}) {
        return m('.db.flex.items-center.justify-between.avenir', [
            m('.fw6.pa1', left),
            m('.pa1', right),
        ]);
    },
};

const KanjiInfo = {
    view: function ({attrs: {dictionary, kanji, words, wordlimit}}) {
        return m('',
            m(
                '.flex.items-center.justify-around.mv4',
                m(KanjiLiteral, {kanji: kanji.kanji, large: true, dictionary}),
                m(
                    '.flex-grow',
                    Kanji.grade(kanji) ? m(Row, {
                        left: 'Grade',
                        right: m('.avenir', Kanji.grade(kanji)),
                    }) : null,
                    Kanji.jlpt(kanji) ? m(Row, {
                        left: 'JLPT',
                        right: m('.avenir', Kanji.jlpt(kanji)),
                    }) : null,
                    m(Row, {
                        left: 'Strokes',
                        right: m('.avenir', kanji.stroke_count),
                    }),
                    m(Row, {
                        left: 'Unicode',
                        right: m('.avenir', Kanji.unicode(kanji)),
                    }),
                ),
            ),
            kanji.kun_readings.length ? m(
                '.mv1',
                m(Row, {
                    left: m('.f5', 'Kun'),
                    right: m(
                        '.flex.flex-wrap.items-center.justify-end.w-auto',
                        kanji.kun_readings.map(reading => {
                            return m(Reading, {type: KUN, reading, large: false});
                        }),
                    ),
                }),
            ) : null,
            kanji.on_readings.length ? m(
                '.mv1',
                m(Row, {
                    left: m('.f5', 'On'),
                    right: m(
                        '.flex.flex-wrap.items-center.justify-end.w-auto',
                        kanji.on_readings.map(reading => {
                            return m(Reading, {type: ON, reading, large: false});
                        }),
                    ),
                }),
            ) : null,
            kanji.name_readings.length ? m(
                '.mv1',
                m(Row, {
                    left: m('.f5', 'Nanori'),
                    right: m(
                        '.flex.flex-wrap.items-center.justify-end.w-auto',
                        kanji.name_readings.map(reading => {
                            return m(Reading, {type: NAME, reading, large: false});
                        }),
                    ),
                })
            ) : null,
            kanji.meanings.length ? m(
                '.mv3',
                m(Row, {
                    left: m('.f5', 'Meanings'),
                    right: m(
                        '.flex.flex-wrap.items-center.justify-end.w-auto',
                        kanji.meanings.map(meaning => {
                            return m(Meaning, {meaning});
                        }),
                    ),
                }),
            ) : null,
            m('.db.flex.flex-column', [
                m(
                    '.fw6.flex.self-center.justify-end-ns.w-20.flex-wrap.self-start-ns.pa1.pb0.pa1-ns.avenir',
                    'Words'
                ),
                m(
                    '.fl.flex.flex-column.justify-start.flex-wrap-l',
                    words.status === 'LOADING' ?
                    m(Loading) :
                    words.status === 'SUCCESS' ?
                    m(Words, { kanji, words: words.value, wordlimit }) :
                    words.status === 'ERROR' && words.value === 404 ?
                    m('', 'No words') :
                    m('', 'error')
                ),
            ]),
        );
    },
};

module.exports = {
    KanjiInfo,
};
