const m = require('mithril');

const API_URL = 'https://kanjiapi.dev';

function KanjiInfo() {
    return {
        view: ({attrs: {kanji}}) => {
            return m('', [
                m('', `Kanji: ${kanji.kanji}`),
                m('', `Grade: ${kanji.grade}`),
                m('', `Strokes: ${kanji.stroke_count}`),
                m('', `Meanings: ${kanji.meanings.join(', ')}`),
                m('', [
                    m('', 'Kun:'),
                    kanji.kun_readings.map(reading => m('', reading)),
                ]),
                m('', [
                    m('', 'On:'),
                    kanji.on_readings.map(reading => m('', reading)),
                ]),
                m('', [
                    m('', 'Nanori:'),
                    kanji.name_readings.map(reading => m('', reading)),
                ]),
            ]);
        },
    };
}

function KanjiPicker(initialVnode) {
    let kanji = {
        kanji: '',
        grade: '',
        stroke_count: '',
        meanings: [],
        kun_readings: [],
        on_readings: [],
        name_readings: [],
    };

    function updateKanji(response) {
        kanji = response;
        m.redraw();
    }

    async function loadKanji(event) {
        const inputText = event.target.value;

        if (inputText.length === 0) return;

        const character = event.target.value[0];

        try {
            const response = await m.request({
                method: 'GET',
                url: `${API_URL}/kanji/${character}`,
            });
            updateKanji(response);
        } catch (exception) {
            updateKanji(null);
        }
        event.target.value = character;
    }

    return {
        view: (vnode) => {
            return [
                m('input[text]', {
                    onchange: loadKanji
                }),
                m(KanjiInfo, {kanji}),
            ];
        },
    };
}

function init() {
    m.mount(document.body, KanjiPicker);
}

init();
