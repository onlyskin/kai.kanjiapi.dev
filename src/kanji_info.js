const m = require('mithril');
const { isKana } = require('wanakana');
const { Loading } = require('./loading');
const { KanjiLiteral } = require('./kanji_literal');
const Kanji = require('./kanji');
const Kana = require('./kana');
const Random = require('./random');
const { ON, KUN, NAME } = require('./constant');
const { Reading } = require('./reading');

const random = new Random();

const Meaning = {
    view: ({attrs: {meaning}}) => {
        return m(
            '.lh-solid.pa3.ma1.br-pill.f4.avenir.bg-pale-orange',
            meaning,
        );
    },
};

const WordChar = {
    view: ({attrs: {character}}) => {
        return m(
            '.di.dib-ns',
            isKana(character) ?
            {
                class: '',
            } :
            {
                class: 'pointer grow',
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
                '',
                arr.length < 2 ?
                meaning.glosses.join('; ') :
                `${index + 1}. ${meaning.glosses.join('; ')}`,
            );
        });
    },
};

const Word = {
    _wordCardBackground: () => {
        const jitteredHue = 286 * random.jitter(0.04);
        const jitteredSaturation = 65 * random.jitter(0.04);
        const jitteredLightness = 90 * random.jitter(0.04);
        return `hsla(${jitteredHue}, ${jitteredSaturation}%, ${jitteredLightness}%, 1)`;
    },
    view: function ({attrs: {word}}) {
        return m(
            '.ma1.fl.br-5.shadow-4.flex.pv1.ph2.pv2-ns.ph3-ns.b--pale-purple',
            {
                style: {
                    background: this._wordCardBackground(),
                },
            },
            m(
                '.flex.flex-column.justify-center',
                m(
                    '.kosugi-maru.mr2.f3.f2-ns',
                    [...word.variant.written]
                      .map(character => m(WordChar, {character})),
                ),
            ),
            m(
                '.flex.flex-column.justify-center.mr2.mr0-ns',
                [
                    m(
                        '.kosugi-maru',
                        Kana.formatReading(word.variant.pronounced),
                    ),
                    m(
                        '.measure-narrow.avenir',
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
            words.length > wordlimit ? m('.f1', {
                onclick : e => {
                    m.route.set(m.route.get(), {wordlimit: Number(wordlimit) + 20});
                },
            }, '...') : '',
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
                    Kanji.grade(kanji) ? m(Row, {left: 'Grade', right: m('.avenir', Kanji.grade(kanji))}) : null,
                    Kanji.jlpt(kanji) ? m(Row, {left: 'JLPT', right: m('.avenir', Kanji.jlpt(kanji))}) : null,
                    m(Row, {left: 'Strokes', right: m('.avenir', kanji.stroke_count)}),
                    m(Row, {left: 'Unicode', right: m('.avenir', Kanji.unicode(kanji))}),
                ),
            ),
            kanji.kun_readings.length ? m(Row, {
                left: m('.f5', 'Kun'),
                right: m(
                    '.flex.flex-wrap.items-center.justify-end.w-auto',
                    kanji.kun_readings.map(reading => {
                        return m(Reading, {type: KUN, reading, size: 'f4'});
                    }),
                ),
            }) : null,
            kanji.on_readings.length ? m(Row, {
                left: m('.f5', 'On'),
                right: m(
                    '.flex.flex-wrap.items-center.justify-end.w-auto',
                    kanji.on_readings.map(reading => {
                        return m(Reading, {type: ON, reading, size: 'f4'});
                    }),
                ),
            }) : null,
            kanji.name_readings.length ? m(Row, {
                left: m('.f5', 'Nanori'),
                right: m(
                    '.flex.flex-wrap.items-center.justify-end.w-auto',
                    kanji.name_readings.map(reading => {
                        return m(Reading, {type: NAME, reading, size: 'f4'});
                    }),
                ),
            }) : null,
            kanji.meanings.length ?  m(
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
                    '.fl.pa2.words.flex.flex-wrap.justify-center',
                    words ? m(Words, {kanji, words, wordlimit}) : m(Loading),
                ),
            ]),
        );
    },
};

module.exports = {
    KanjiInfo,
};
