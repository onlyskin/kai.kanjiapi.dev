const m = require('mithril')
const { InternalLink } = require('./link')

const KanjiLiteral = {
  _linkClasses: function(dictionary, kanji, large) {
    return [
        'ma1', 'br3', 'ba', 'kosugi-maru',
        ...(large ? ['f-05', 'pa2'] : ['f2', 'pa1']),
        ...(dictionary.isJoyo(kanji) ? ['bg-light-yellow', 'b--yellow']
            : dictionary.isJinmeiyo(kanji) ? ['bg-mid-red', 'b--red']
            : dictionary.isHeisig(kanji) ? ['bg-mid-green', 'b--green']
            : ['bg-mid-blue', 'b--blue'])
    ]
  },
  view: function({ attrs: { dictionary, kanji, large } }) {
    return m(
      InternalLink, {
          classes: this._linkClasses(dictionary, kanji, large),
          href: `/${kanji}`,
      },
      kanji,
    )
  },
}

module.exports = {
  KanjiLiteral,
}
