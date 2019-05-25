const m = require('mithril');
const { Api } = require('./api');
const { Dictionary } = require('./dictionary');
const { config } = require('./config');
const { KanjiInfo } = require('./kanji_info');
const { ReadingInfo } = require('./reading_info');
const { Loading } = require('./loading');

function isKanji(data) {
    if (!data) return false;

    return data.kanji !== undefined;
}

function isReading(data) {
    if (!data) return false;

    return data.reading !== undefined;
}

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
                        'a[href=https://kanjiapi.dev].link.dim.white-80.no-select',
                        'kanjiapi.dev',
                    ),
                    ' and ',
                    m(
                        'a[href=https://mithril.js.org].link.dim.white-80.no-select',
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
        const kanji = dictionary.randomKanji() || m.route.param('search');
        return m(
            '.pointer.link.dim.black-80.underline.avenir.flex-none.no-select',
            { onclick: e => m.route.set(`/${kanji}`, null), },
            'I\'m feeling lucky!',
        );
    },
};

const RomajiToggle = {
    view: function() {
        return m(
            '.flex.items-center.flex-auto.mr2.f7.f5-ns',
            m(
                'input[type=checkbox].mr2.pointer',
                { onclick: e => config.toggleRomaji() },
                'あ/a'
            ),
            m(
                'label.avenir.lh-copy',
                'Display readings in Roman alphabet (',
                m(
                    'a.pointer.link.dim.black-80.underline.avenir.no-select',
                    { href: 'https://en.wikipedia.org/wiki/Nihon-shiki_romanization' },
                    'Nihon-shiki Rōmaji',
                ),
                ')',
            ),
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
