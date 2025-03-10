const m = require('mithril')

const textLinkClasses = ['dim', 'black-80', 'no-select', 'underline'];

const ExternalLink = {
  view({ children, attrs }) {
    return m(
      'a',
      {class: textLinkClasses.join(' '), ...attrs},
      children,
    )
  },
}

const InternalLink = {
    view: ({ children, attrs: { href, classes, params } }) => m(
        m.route.Link,
        {
            href,
            class: ['no-underline', 'black', 'grow', 'lh-solid', ...classes].join(' '),
            params,
        },
        children
    ),
}

const InternalTextLink = {
    view: ({ children, attrs: { href, classes, params } }) => m(
        m.route.Link,
        {
            href,
            class: [...textLinkClasses, ...classes].join(' '),
            params,
        },
        children
    ),
}

module.exports = {
  InternalLink,
  InternalTextLink,
  ExternalLink,
}
