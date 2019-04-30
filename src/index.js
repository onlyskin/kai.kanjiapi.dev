const m = require('mithril');

const API_URL = 'https://kanjiapi.dev';

function isKanji(data) {
    return data.kanji !== undefined;
}

function isReading(data) {
    return data.reading !== undefined;
}

const Meaning = {
    view: ({attrs: {meaning}}) => {
        return m('.meaning', meaning);
    },
};

const KunReading = {
    view: ({attrs: {reading}}) => {
        return m('.kun-reading', { onclick: () => model.setSubject(reading) }, reading);
    },
};

const OnReading = {
    view: ({attrs: {reading}}) => {
        return m('.on-reading', { onclick: () => model.setSubject(reading) }, reading);
    },
};

const NameReading = {
    view: ({attrs: {reading}}) => {
        return m('.name-reading', { onclick: () => model.setSubject(reading) }, reading);
    },
};

const Kanji = {
    view: ({attrs: {kanji}}) => {
        return m('.kanji', { onclick: () => model.setSubject(kanji) }, kanji);
    },
};

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
            m('.field', 'Kun'),
            m('.field-value', kanji.kun_readings.map(reading => m(KunReading, {reading}))),
            m('.field', 'On'),
            m('.field-value', kanji.on_readings.map(reading => m(OnReading, {reading}))),
            m('.field', {style: {border: 'none'}}, 'Nanori'),
            m(
                '.field-value',
                {style: {border: 'none'}},
                kanji.name_readings.map(reading => m(NameReading, {reading})),
            ),
        ]);
    },
};

const ReadingInfo = {
    view: ({attrs: {reading}}) => {
        return m('.info', [
            m('.field', 'Reading'),
            m('.field-value', m('.reading', reading.reading)),
            m('.field', 'Main Kanji'),
            m('.field-value', reading.main_kanji.map(kanji => m(Kanji, {kanji}))),
            m('.field', 'Name Kanji'),
            m('.field-value', reading.name_kanji.map(kanji => m(Kanji, {kanji}))),
        ]);
    },
};

const model = {
    subject: null,
    defaultKanji: {
        kanji: '',
        grade: null,
        stroke_count: null,
        meanings: [],
        kun_readings: [],
        on_readings: [],
        name_readings: [],
    },
    getSubject: function() {
        return this.subject;
    },
    setSubject: function(text) {
        return this.loadKanji(text[0])
            .then(response => {
                this.subject = response;
            })
            .catch(exception => {
                return this.loadReading(text)
                    .then(response => {
                        this.subject = response;
                    })
                    .catch(exception => {
                        this.subject = this.defaultKanji;
                    });
            });
    },
    init: function() {
        this.subject = this.defaultKanji;

        this.loadKanji('尽')
            .then(kanji => {
                this.subject = kanji;
                this.defaultKanji = kanji;
            });
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

const Page = {
    view: function() {
        return m('.page', [
            m('input[text]#kanji-input', {
                onchange: e => {
                    if (event.target.value.length === 0) return;

                    return model.setSubject(event.target.value);
                }
            }),
            m(Info, {subject: model.getSubject()}),
        ]);
    },
};

function init() {
    m.mount(document.body, Page);
}

model.init();
init();
