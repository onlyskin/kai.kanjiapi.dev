const m = require('mithril');
const { isKana } = require('wanakana');
const { Api } = require('./api');
const { Dictionary } = require('./dictionary');
const Kanji = require('./kanji');
const Kana = require('./kana');
const { config } = require('./config');
const Random = require('./random');
const { ON, KUN, NAME } = require('./constant');

function isKanji(data) {
    if (!data) return false;

    return data.kanji !== undefined;
}

function isReading(data) {
    if (!data) return false;

    return data.reading !== undefined;
}

const Meaning = {
    view: ({attrs: {meaning}}) => {
        return m(
            '.lh-solid.pa1.ma1.br3.f4.ba.avenir.bg-pale-orange.b--pale-orange',
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

const Reading = {
    _borderClass: (type) => {
        if (type === KUN) {
            return 'b--pale-red';
        } else if (type === ON) {
            return 'b--pale-blue';
        }
        return 'b--pale-green';
    },
    _backgroundClass: (type) => {
        if (type === KUN) {
            return 'bg-pale-red';
        } else if (type === ON) {
            return 'bg-pale-blue';
        }
        return 'bg-pale-green';
    },
    view: function({attrs: {type, reading, size}}) {
        return m(
            '.lh-solid.pa1.ma1.br3.ba.pointer.grow',
            {
                class: [
                    size,
                    config.isRomaji ? 'avenir' : 'kosugi-maru',
                    this._borderClass(type),
                    this._backgroundClass(type),
                ].join(' '),
                onclick: () => m.route.set(`/${reading}`, null),
            },
            Kana.formatReading(reading),
        );
    },
};

const KanjiLiteral = {
    _backgroundClass: (kanji) => {
        if (dictionary.joyo().includes(kanji)) {
            return 'bg-washed-yellow';
        } else if (dictionary.jinmeiyo().includes(kanji)) {
            return 'bg-washed-red';
        }
        return 'bg-washed-blue';
    },
    _borderClass: (kanji) => {
        if (dictionary.joyo().includes(kanji)) {
            return 'b--light-yellow';
        } else if (dictionary.jinmeiyo().includes(kanji)) {
            return 'b--light-red';
        }
        return 'b--lightest-blue';
    },
    view: function({attrs: {kanji}}) {
        return m(
            '.pointer.grow.ma1.lh-solid.pa1.br3.f1.ba.kosugi-maru',
            {
                class: [
                    this._backgroundClass(kanji),
                    this._borderClass(kanji),
                ].join(' '),
                onclick: () => m.route.set(`/${kanji}`, null)
            },
            kanji,
        );
    },
};

const Row = {
    view: function({attrs: {left, right}}) {
        return m('.db.flex.justify-center.justify-start-ns', [
            m('.fw6.flex.flex-wrap.items-center.justify-end.w-20-ns.pa1.avenir', left),
            m('.flex.flex-wrap.items-center.justify-start.pa1', right),
        ]);
    },
};

const CollapsibleRow = {
    view: function({attrs: {left, right}}) {
        return m('.db.flex.flex-column.flex-row-ns', [
            m('.fw6.flex.flex-wrap.justify-center.items-center-ns.justify-end-ns.w-20-ns.pa1.pb0.pa1-ns.avenir', left),
            m('.flex.flex-wrap.justify-center.items-center-ns.justify-start-ns.pa1.pt0.pa1-ns', right),
        ]);
    }
};

const KanjiInfo = {
    view: function ({attrs: {kanji, words, wordlimit}}) {
        return m('', [
            m(CollapsibleRow, {left: 'Kanji', right: m(KanjiLiteral, {kanji: kanji.kanji})}),
            Kanji.grade(kanji) ? m(Row, {left: 'Grade', right: m('.avenir', Kanji.grade(kanji))}) : null,
            Kanji.jlpt(kanji) ? m(Row, {left: 'JLPT', right: m('.avenir', Kanji.jlpt(kanji))}) : null,
            m(Row, {left: 'Strokes', right: m('.avenir', kanji.stroke_count)}),
            m(Row, {left: 'Unicode', right: m('.avenir', Kanji.unicode(kanji))}),
            kanji.kun_readings.length ? m(CollapsibleRow, {
                left: 'Kun',
                right: kanji.kun_readings.map(reading => {
                    return m(Reading, {type: KUN, reading, size: 'f4'});
                }),
            }) : null,
            kanji.on_readings.length ? m(CollapsibleRow, {
                left: 'On',
                right: kanji.on_readings.map(reading => {
                    return m(Reading, {type: ON, reading, size: 'f4'});
                }),
            }) : null,
            kanji.name_readings.length ? m(CollapsibleRow, {
                left: 'Nanori',
                right: kanji.name_readings.map(reading => {
                    return m(Reading, {type: NAME, reading, size: 'f4'});
                }),
            }) : null,
            kanji.meanings.length ? m(CollapsibleRow, {
                left: 'Meanings',
                right: kanji.meanings.map(meaning => {
                    return m(Meaning, {meaning});
                }),
            }) : null,
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
        ]);
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

const ReadingInfo = {
    view: ({attrs: {reading}}) => {
        return m('', [
            m(CollapsibleRow, {
                left: 'Reading',
                right: m(
                    Reading,
                    {
                        type: Kana.readingType(reading.reading),
                        reading: reading.reading,
                        size: 'f1',
                    },
                ),
            }),
            reading.main_kanji.length ? m(CollapsibleRow, {
                left: 'Main Kanji',
                right: m('.flex.flex-wrap.justify-center', reading.main_kanji.map(kanji => {
                    return m(KanjiLiteral, {kanji});
                })),
            }) : null,
            reading.name_kanji.length ? m(CollapsibleRow, {
                left:  'Name Kanji',
                right: m('.flex.flex-wrap.justify-center', reading.name_kanji.map(kanji => {
                    return m(KanjiLiteral, {kanji});
                })),
            }) : null,
        ]);
    },
};

const Info = {
    view: function({attrs: {subject}}) {
        if (isKanji(subject)) {
            return m(
                KanjiInfo, {
                    kanji: subject,
                    words: dictionary.wordsFor(subject),
                    wordlimit: m.route.param('wordlimit') || 20,
                });
        } else if (isReading(subject)) {
            return m(ReadingInfo, {reading: subject});
        }
    },
};

const RomajiToggle = {
    view: function() {
        return m(
            '.bg-dark-gray.white.mh1.pa2.br-pill.kosugi-maru.flex-none',
            {
                onclick: _ => config.toggleRomaji(),
            },
            'あ/a'
        );
    },
};

const Header = {
    view: function() {
        return m('header.white.bg-dark-purple.pa1.self-stretch', [
            m('h1.fw5.mv3.f1.tc.kosugi-maru', '漢字解'),
            m('h1.fw5.mv2.f2.tc.avenir', 'kanjikai'),
        ]);
    },
};

const About = {
    view: function() {
        return [
            m('h2.fw3.tc.avenir', 'About'),
            m('.tc.avenir', [
                m('p', [
                    'kanjikai is powered by ',
                    m(
                        'a[href=https://kanjiapi.dev].link.dim.white-80',
                        'kanjiapi.dev',
                    ),
                    ' and ',
                    m(
                        'a[href=https://mithril.js.org].link.dim.white-80',
                        'mithril.js',
                    ),
                ]),
            ])
        ];
    },
};

const Loading = {
    view: function() {
        return m('.loader');
    },
};

const BadSearch = {
    view: function() {
        return m('', 'Not Found');
    },
};

const RandomKanji = {
    view: function() {
        const joyo = dictionary.joyo()
        const choice = Math.floor(Math.random() * joyo.length)
        const kanji = joyo[choice] || m.route.param('search');
        return m(
            '.bg-dark-gray.white.pa2.mh1.br-pill.kosugi-maru.flex-none',
            { onclick: e => m.route.set(`/${kanji}`, null), },
            'Random',
        );
    },
};

const Page = {
    view: function({attrs}) {
        const searchResult = dictionary.lookup(attrs.search);

        return [
            m(Header),
            m(
                '.flex-auto.flex.flex-column.items-center.bg-white.pa2.w-100',
                m(
                    '.w-80-m.w-60-l',
                    m(
                        '.flex',
                        m('input[text].kosugi-maru.flex-auto', {
                            value: attrs.search,
                            onchange: e => {
                                m.route.set(`/${e.target.value}`, null);
                            },
                        }),
                        m(RomajiToggle),
                        m(RandomKanji),
                    ),
                    searchResult._status === 'ok' ?
                    m(Info, {subject: searchResult.result}) :
                    searchResult._status === 'pending' ?
                    m(Loading) :
                    m(BadSearch),
                ),
            ),
            m('footer.white.bg-dark-purple.pa1.self-stretch', m(About)),
        ];
    },
};

function init() {
    m.route(document.body, '/字', {
        '/:search': Page,
    });
}

const api = new Api(m.request);
const dictionary = new Dictionary(api, m.redraw);
const random = new Random();

init();
