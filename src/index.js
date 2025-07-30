const m = require('mithril')
const { Dictionary } = require('./dictionary')
const { config } = require('./config')
const { KanjiInfo } = require('./kanji_info')
const { ReadingInfo } = require('./reading_info')
const { Loading } = require('./loading')
const { Kanjiapi } = require('kanjiapi-wrapper')
const { isKanji, isReading } = require('./constant')
const { InternalTextLink, ExternalLink } = require('./link')

const Info = {
  view: function({ attrs: { subject } }) {
    if (isKanji(subject)) {
      return m(KanjiInfo, {
        dictionary,
        kanji: subject.kanji,
        words: subject.words,
        wordlimit: m.route.param('wordlimit') || 20,
      })
    } else if (isReading(subject)) {
      return m(ReadingInfo, {
        dictionary,
        reading: subject,
      })
    }
  },
}

const Header = {
  view: function() {
    return m('header.white.bg-dark-purple.pa1.self-stretch', [
      m('h1.fw5.mv3.f1.tc.kosugi-maru', '漢字解'),
      m('h1.fw5.mv2.f2.tc', 'kanjikai'),
    ])
  },
}

const About = {
  view: function() {
    return [
      m('h2.fw3.tc', 'About'),
      m('.tc', [
        m('p', 'kanjikai is a rabbit-hole kanji dictionary: every kanji and every reading is clickable'),
        m('p', [
          'powered by ',
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
      ]),
    ]
  },
}

const BadSearch = {
  view: function() {
    return m('', 'Not Found')
  },
}

const RandomKanji = {
  view: function() {
    const kanji = dictionary.randomKanji() || m.route.param('search')
    return m(
        InternalTextLink, {
          classes: ['flex-none'],
          href: `/${kanji}`,
        },
      "I'm feeling lucky!",
    )
  },
}

const RomajiToggle = {
  view: function() {
    return m(
      '.flex.items-center.flex-auto.f7.f5-ns',
      m(
        'input[type=checkbox][name=romaji-toggle].mr2.pointer',
        {
          checked: config.getIsRomaji(),
          onclick: () => config.toggleRomaji(),
        },
        'あ/a',
      ),
      m(
        'label[for=romaji-toggle]',
        'Display readings in Roman alphabet (',
        m(
          ExternalLink,
          {
            href: 'https://en.wikipedia.org/wiki/Nihon-shiki_romanization',
          },
          'Nihon-shiki Rōmaji',
        ),
        ')',
      ),
    )
  },
}

const TextSearch = {
  view: function({ attrs: { search } }) {
    return m(
      'input[type=text].kosugi-maru.flex-grow.mr2.minw3',
      {
        onchange: e => m.route.set(e.target.value),
        value: search,
      },
    )
  },
}

const Page = {
  view: function({ attrs: { search } }) {
    return [
      m(Header),
      m(
        '.flex-auto.flex.flex-column.items-center.bg-white.pa2.w-100',
        m(
          '.w-100.w-80-m.w-60-l',
          m(
            '.flex.flex-column.mv2',
            m(
              '.flex.mb2.lh-copy.w-100.items-center',
              m('.mr1.nowrap', 'go to:'),
              m(TextSearch, { search }),
              m(RandomKanji),
            ),
            m(RomajiToggle),
          ),
          dictionary.lookup(search).status === Kanjiapi.SUCCESS
            ? m(Info, { subject: dictionary.lookup(search).value })
            : dictionary.lookup(search).status === Kanjiapi.LOADING
            ? m(Loading)
            : m(BadSearch),
        ),
      ),
      m('footer.white.bg-dark-purple.pa1.self-stretch', m(About)),
    ]
  },
}

function init() {
  m.route(document.body, '/字', {
    '/:search': Page,
  })
}

const kanjiapi = Kanjiapi.build()
kanjiapi.addListener('app', m.redraw)
const dictionary = new Dictionary(kanjiapi)

init()
