const m = require('mithril');
const { romanize } = require('japanese');
const { isKatakana } = require('wanakana');
const { Api } = require('./api');

const API_URL = 'http://0.0.0.0:4000';

const config = {
    isRomaji: false,
    toggleRomaji: function() {
        this.isRomaji = !this.isRomaji;
        return Promise.resolve();
    },
};

function romanizeWithPunctuation(reading) {
    reading = reading
        .replace('.', '。')
        .replace('-', '－')
        .replace('-', '－')
        .replace('ー', '－');

    const romanized = romanize(reading, 'nihon');

    return isKatakana(reading) ? romanized.toUpperCase() : romanized;
}

function formatReading(reading) {
    if (!reading) {
        return reading;
    }

    return config.isRomaji ? romanizeWithPunctuation(reading) : reading;
}

function isKanji(data) {
    if (!data) return false;

    return data.kanji !== undefined;
}

function isReading(data) {
    if (!data) return false;

    return data.reading !== undefined;
}

function subjectText(subject) {
    if (!subject) return '';

    return isKanji(subject) ? subject.kanji : subject.reading;
}

const Meaning = {
    view: ({attrs: {meaning}}) => {
        return m('.meaning', meaning);
    },
};

const Word = {
    view: ({attrs: {word}}) => {
        return [
            m(
                '.flex-row.flex-right',
                m(
                    '.word',
                    [...word.kanji].map(character => {
                        return m(
                            'span.hover-shadow',
                            {
                                onclick: e => {
                                    model.setSearch(e.target.textContent);
                                },
                            },
                            character,
                        );
                    }),
                ),
            ),
            m('.word-reading', word.readings.map(formatReading).join(', ')),
            m(
                '.word-meaning.serif',
                word.meanings
                .map(meaning => m('p', meaning.glosses.join(', '))),
            ),
        ];
    },
};

const Reading = {
    view: ({attrs: {type, reading}}) => {
        return m(
            '',
            {
                class: [config.isRomaji ? 'romanized' : '', type].join(' '),
                onclick: () => model.setSearch(reading),
            },
            formatReading(reading),
        );
    },
};

const Kanji = {
    view: ({attrs: {kanji}}) => {
        return m(
            '.kanji',
            { onclick: () => model.setSearch(kanji) },
            kanji,
        );
    },
};

function words(kanji) {
    return kanji.words.map(word => {
        return {
            kanji: word.kanji[0].form,
            readings: word.readings.map(reading => reading.reading),
            meanings: word.meanings,
        }
    }).sort((a, b) => a.kanji.length - b.kanji.length);
    const priority_words = kanji
        .words
        .filter(word => word.priorities.length > 0);
    return priority_words.length > 0 ? priority_words : kanji.words;
}

const KanjiInfo = {
    grade: ({grade}) => {
        return grade ? grade : '';
    },
    jlpt: ({jlpt}) => {
        return jlpt ? jlpt : '';
    },
    unicode: ({unicode}) => {
        return unicode ? `U+${unicode.toUpperCase()}` : '';
    },
    view: function ({attrs: {kanji}}) {
        return m('.info', [
            m('.field.serif', 'Kanji'),
            m('.field-value', m(Kanji, {kanji: kanji.kanji})),
            m('.field.serif', 'Grade'),
            m('.field-value', this.grade(kanji)),
            m('.field.serif', 'JLPT'),
            m('.field-value', this.jlpt(kanji)),
            m('.field.serif', 'Strokes'),
            m('.field-value', kanji.stroke_count),
            m('.field.serif', 'Unicode'),
            m('.field-value', this.unicode(kanji)),
            m('.field.serif', 'Meanings'),
            m(
                '.field-value',
                kanji.meanings.map(meaning => m(Meaning, {meaning})),
            ),
            m('.field.serif', 'Kun'),
            m('.field-value', kanji.kun_readings.map(reading => {
                return m(Reading, {type: 'kun-reading', reading});
            })),
            m('.field.serif', 'On'),
            m('.field-value', kanji.on_readings.map(reading => {
                return m(Reading, {type: 'on-reading', reading});
            })),
            m('.field.serif', 'Nanori'),
            m(
                '.field-value',
                kanji.name_readings.map(reading => {
                    return m(Reading, {type: 'name-reading', reading});
                }),
            ),
            m('.field.serif', {style: {border: 'none'}}, 'Words'),
            m(
                '.words.field-value',
                {style: {border: 'none'}},
                words(kanji).map(word => m(Word, {word})),
            ),
        ]);
    },
};

const ReadingInfo = {
    view: ({attrs: {reading}}) => {
        return m('.info', [
            m('.field.serif', 'Reading'),
            m('.field-value', m(
                Reading,
                {type: 'reading', reading: reading.reading},
            )),
            m('.field.serif', 'Main Kanji'),
            m(
                '.field-value',
                reading.main_kanji.map(kanji => m(Kanji, {kanji})),
            ),
            m('.field.serif', 'Name Kanji'),
            m(
                '.field-value',
                reading.name_kanji.map(kanji => m(Kanji, {kanji})),
            ),
        ]);
    },
};

const model = {
    defaultKanji: {
        kanji: '',
        grade: 7,
        stroke_count: null,
        meanings: [],
        kun_readings: [],
        on_readings: [],
        name_readings: [],
        words: [],
    },
    _searching: {},
    _searched: {},
    searchApi: function(searchTerm) {
        if (!this._searching[searchTerm]) {
            this._searching[searchTerm] = true;

            api.search(searchTerm)
                .then(response => {
                    this._searched[searchTerm] = response;
                    m.redraw();
                })
                .catch(error => {
                    this._searching[searchTerm] = undefined;
                });
        }
        return this._searched[searchTerm];
    },
    getSearchResult: function() {
        return this.searchApi(m.route.param('search')) || this.defaultKanji;
    },
    setSearch: function(searchTerm) {
        m.route.set(`/${searchTerm}`, null);
    },
};

const Info = {
    view: function({attrs: {subject}}) {
        if (isKanji(subject)) {
            return m(KanjiInfo, {kanji: subject});
        } else if (isReading(subject)) {
            return m(ReadingInfo, {reading: subject});
        }
    },
};

const RomajiToggle = {
    view: function() {
        return m(
            '#romaji-toggle',
            {
                onclick: _ => config.toggleRomaji(),
            },
            'あ/a'
        );
    },
};

const Header = {
    view: function() {
        return m('header.vertical-flex', [
            m('h1', '漢字解'),
            m('h1.romanized', 'KanjiKai'),
        ]);
    },
};

const About = {
    view: function() {
        return [
            m('h2.center-text.romanized', 'About'),
            m('#about.center-text.romanized', [
                m('p', [
                    'This site is powered by ',
                    m('a[href=https://kanjiapi.dev]', 'kanjiapi.dev'),
                ]),
            ])
        ];
    },
};

const Page = {
    view: function() {
        return m('.vertical-flex', [
            m(Header),
            m('.page.vertical-flex', [
                m(RomajiToggle),
                m('input[text]#kanji-input', {
                    value: subjectText(model.getSearchResult()),
                    onchange: e => {
                        if (event.target.value.length === 0) return;

                        return model.setSearch(event.target.value);
                    },
                }),
                m(Info, {subject: model.getSearchResult()}),
                m(About),
            ]),
        ]);
    },
};

function init() {
    m.route(document.body, '/字', {
        '/:search': Page,
    });
}

const api = new Api(m.request);
init();
