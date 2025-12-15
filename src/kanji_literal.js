const m = require('mithril')
const { InternalLink } = require('./link')

const KanjiLiteral = {
  _linkClasses: function(dictionary, kanji, large) {
    return [
        'br3', 'ba', 'kosugi-maru', 'jumpable',
        ...(large ? ['f-05', 'pa2'] : ['f2', 'pa1']),
        ...(dictionary.inKanjiSet('joyo', kanji) ? ['c-joyo']
            : dictionary.inKanjiSet('jinmeiyo', kanji) ? ['c-jinmeiyo']
            : dictionary.inKanjiSet('heisig', kanji) ? ['c-heisig']
            : ['c-other'])
    ]
  },
  view: function({ attrs: { dictionary, kanji, large, classes = [] } }) {
    return m(
      InternalLink, {
          classes: [...this._linkClasses(dictionary, kanji, large), ...classes],
          href: `/${kanji}`,
      },
      kanji,
    )
  },
}

module.exports = {
  KanjiLiteral,
}
