const m = require('mithril')
const Kana = require('./kana')
const { config } = require('./config')
const { ON, KUN } = require('./constant')
const { InternalLink } = require('./link')

const Reading = {
  _linkClasses: function(type, large) {
      return [
        'ma1', 'br3', 'ba',
        ...(large ? ['f1', 'pa2'] : ['f4', 'pa1']),
        config.isRomaji ? 'avenir' : 'kosugi-maru',
        ...(type === KUN ? ['b--pale-red', 'bg-pale-red']
            : type === ON ? ['b--pale-blue', 'bg-pale-blue']
            : ['b--pale-green', 'bg-pale-green'])
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
