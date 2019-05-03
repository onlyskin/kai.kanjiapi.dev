const m = require('mithril');
const { romanize } = require('japanese');
const { isKatakana } = require('wanakana');

const API_URL = 'https://kanjiapi.dev';

const config = {
    isRomaji: true,
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
        return m('.word', [...word].map(character => {
            return m(
                'span',
                {
                    onclick: e => {
                        model.setSearch(e.target.textContent);
                    },
                },
                character,
            );
        }));
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
    if (kanji.words.length === 0) {
        return kanji.rare_words.slice(0, 20);
    } else {
        return kanji.words.slice();
    }
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
            m('.field', 'Kanji'),
            m('.field-value', m(Kanji, {kanji: kanji.kanji})),
            m('.field', 'Grade'),
            m('.field-value', this.grade(kanji)),
            m('.field', 'JLPT'),
            m('.field-value', this.jlpt(kanji)),
            m('.field', 'Strokes'),
            m('.field-value', kanji.stroke_count),
            m('.field', 'Unicode'),
            m('.field-value', this.unicode(kanji)),
            m('.field', 'Meanings'),
            m('.field-value', kanji.meanings.map(meaning => m(Meaning, {meaning}))),
            m('.field', 'Words'),
            m('.field-value', words(kanji).map(word => m(Word, {word}))),
            m('.field', 'Kun'),
            m('.field-value', kanji.kun_readings.map(reading => {
                return m(Reading, {type: 'kun-reading', reading});
            })),
            m('.field', 'On'),
            m('.field-value', kanji.on_readings.map(reading => {
                return m(Reading, {type: 'on-reading', reading});
            })),
            m('.field', {style: {border: 'none'}}, 'Nanori'),
            m(
                '.field-value',
                {style: {border: 'none'}},
                kanji.name_readings.map(reading => {
                    return m(Reading, {type: 'name-reading', reading});
                }),
            ),
        ]);
    },
};

const ReadingInfo = {
    view: ({attrs: {reading}}) => {
        return m('.info', [
            m('.field', 'Reading'),
            m('.field-value', m(Reading, {type: 'reading', reading: reading.reading})),
            m('.field', 'Main Kanji'),
            m('.field-value', reading.main_kanji.map(kanji => m(Kanji, {kanji}))),
            m('.field', 'Name Kanji'),
            m('.field-value', reading.name_kanji.map(kanji => m(Kanji, {kanji}))),
        ]);
    },
};

const model = {
    defaultKanji: {
        kanji: '',
        grade: null,
        stroke_count: null,
        meanings: [],
        kun_readings: [],
        on_readings: [],
        name_readings: [],
        words: [],
        rare_words: [],
    },
    searches: {},
    failedKanjiSearches: [],
    failedTextSearches: [],
    getSearchResult: function() {
        return this.searches[m.route.param('search')] || this.defaultKanji;
    },
    searched: function(search) {
        const searched = Object.keys(this.searches);
        return searched.includes(search);
    },
    setSearch: function(searchTerm) {
        const maybeKanji = searchTerm[0];

        if (this.searched(maybeKanji)) {
            return Promise.resolve().then(this.routeTo.bind(null, maybeKanji));
        }

        if (this.searched(searchTerm)) {
            return Promise.resolve().then(this.routeTo.bind(null, searchTerm));
        }

        const isFailedKanji = this.failedKanjiSearches.includes(maybeKanji);
        const isFailedTextSearch = this.failedTextSearches.includes(searchTerm)

        if (isFailedTextSearch && isFailedKanji) {
            return Promise.resolve();
        }

        if (isFailedKanji) {
            return this.loadReading(searchTerm)
                .then(response => {
                    this.searches[searchTerm] = response;
                    this.routeTo(searchTerm);
                })
                .catch(_ => this.failText(searchTerm));
        }

        if (isFailedTextSearch) {
            return this.loadKanji(maybeKanji)
                .then(response => {
                    this.searches[maybeKanji] = response;
                    this.routeTo(maybeKanji);
                })
                .catch(_ => this.failKanji(maybeKanji));
        }

        return this.loadKanji(maybeKanji)
            .then(response => {
                this.searches[maybeKanji] = response;
                this.routeTo(maybeKanji);
            })
            .catch(exception => {
                this.failKanji(maybeKanji);
                return this.loadReading(searchTerm)
                    .then(response => {
                        this.searches[searchTerm] = response;
                        this.routeTo(searchTerm);
                    })
                    .catch(_ => this.failText(searchTerm));
            });
    },
    failKanji: function(character) {
        this.failedKanjiSearches.push(character);
    },
    failText: function(searchTerm) {
        this.failedTextSearches.push(searchTerm);
    },
    routeTo: function(searchTerm) {
        m.route.set(`/${searchTerm}`, null, {state: {search: searchTerm}});
    },
    loadKanji: function(character) {
        return m.request({
            method: 'GET',
            url: `${API_URL}/v1/kanji/${character}`,
        });
    },
    loadReading: function(text) {
        return m.request({
            method: 'GET',
            url: `${API_URL}/v1/reading/${text}`,
        });
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
    oninit: function({attrs}) {
        if (attrs.search) {
            model.setSearch(attrs.search);
        }
    },
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

init();
