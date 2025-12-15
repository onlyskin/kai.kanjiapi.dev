const m = require('mithril')
const Kana = require('./kana')
const { config } = require('./config')
const { ON, KUN } = require('./constant')
const { InternalLink } = require('./link')

const Reading = {
  _linkClasses: function(type, large) {
      return [
        'ma1', 'br3', 'ba', 'jumpable',
        ...(large ? ['f1', 'pa2'] : ['f4', 'pa1']),
        config.getIsRomaji() ? '' : 'kosugi-maru',
        ...(type === KUN ? ['c-red']
            : type === ON ? ['c-blue']
            : ['c-green'])
      ];
  },
  view: function({ attrs: { type, reading, large } }) {
    return m(
      InternalLink, {
          classes: this._linkClasses(type, large),
          href: `/${reading}`,
      },
      Kana.formatReading(reading),
    )
  },
}

module.exports = {
  Reading,
}
