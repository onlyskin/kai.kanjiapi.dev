const m = require('mithril');
const { Api } = require('./api');
const { Dictionary } = require('./dictionary');
const { KanjiLiteral } = require('./kanji_literal');
const Kana = require('./kana');
const { config } = require('./config');
const { KanjiInfo } = require('./kanji_info');
const { Reading } = require('./reading');
const { Loading } = require('./loading');

function isKanji(data) {
    if (!data) return false;

    return data.kanji !== undefined;
}

function isReading(data) {
    if (!data) return false;

    return data.reading !== undefined;
}

const CollapsibleRow = {
    view: function({attrs: {left, right}}) {
        return m('.db.flex.flex-column.flex-row-ns', [
            m('.fw6.flex.flex-wrap.justify-center.items-center-ns.justify-end-ns.w-20-ns.pa1.pb0.pa1-ns.avenir', left),
            m('.flex.flex-wrap.justify-center.items-center-ns.justify-start-ns.pa1.pt0.pa1-ns', right),
        ]);
    }
};

const ReadingInfo = {
    view: ({attrs: {dictionary, reading}}) => {
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
                    return m(KanjiLiteral, {dictionary, kanji, large: false});
                })),
            }) : null,
            reading.name_kanji.length ? m(CollapsibleRow, {
                left:  'Name Kanji',
                right: m('.flex.flex-wrap.justify-center', reading.name_kanji.map(kanji => {
                    return m(KanjiLiteral, {dictionary, kanji, large: false});
                })),
            }) : null,
        ]);
    },
};

const Info = {
    view: function({attrs: {subject}}) {
        if (isKanji(subject)) {
            return m(
                KanjiInfo,
                {
                    dictionary,
                    kanji: subject,
                    words: dictionary.wordsFor(subject),
                    wordlimit: m.route.param('wordlimit') || 20,
                },
            );
        } else if (isReading(subject)) {
            return m(
                ReadingInfo,
                {
                    dictionary,
                    reading: subject,
                },
            );
        }
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

const BadSearch = {
    view: function() {
        return m('', 'Not Found');
    },
};

const RandomKanji = {
    view: function() {
        const joyo = dictionary.joyo();
        const choice = Math.floor(Math.random() * joyo.length);
        const kanji = joyo[choice] || m.route.param('search');
        return m(
            '.link.dim.black-80.underline.avenir.flex-none',
            { onclick: e => m.route.set(`/${kanji}`, null), },
            'I\'m feeling lucky!',
        );
    },
};

const RomajiToggle = {
    view: function() {
        return m(
            '.flex.items-center.flex-auto',
            m(
                'input[type=checkbox].mr2',
                { onclick: e => config.toggleRomaji() },
                'あ/a'
            ),
            m('label.avenir.lh-copy', 'Display readings in Roman alphabet'),
        );
    },
};

const SearchBar = {
    view () {
        return m(
            'input[text].f2.flex-auto.w-100.avenir.fw3.mv2.pa1.dark-gray.br3.ba.b--moon-gray.bw1',
            {
                placeholder: 'search...',
                onchange: e => m.route.set(`/${e.target.value}`, null),
            },
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
                    m(SearchBar),
                    m(
                        '.flex.items-center.mv2', 
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

init();
