const m = require('mithril')
const { ExternalLink } = require('./link')
const { isCharKana } = require('./kana')

const JOYO_WIKIPEDIA_URL = 'https://en.wikipedia.org/wiki/J%C5%8Dy%C5%8D_kanji'
const JINMEIYO_WIKIPEDIA_URL =
  'https://en.wikipedia.org/wiki/Jinmeiy%C5%8D_kanji'

function grade({ grade }) {
  if (grade === 9 || grade === 10) {
    return m(ExternalLink, { href: JINMEIYO_WIKIPEDIA_URL }, 'Jinmeiyō')
  } else if (grade === 8) {
    return [
      m(ExternalLink, { href: JOYO_WIKIPEDIA_URL }, 'Jōyō'),
      ': high school',
    ]
  } else if (grade) {
    return [m(ExternalLink, { href: JOYO_WIKIPEDIA_URL }, 'Jōyō'), `: ${grade}`]
  } else {
    return null
  }
}

function jlpt({ jlpt }) {
  return jlpt ? jlpt : ''
}

function unicode({ unicode }) {
  return unicode ? `U+${unicode.toUpperCase()}` : ''
}

function alternative({ unihan_cjk_compatibility_variant }) {
  return unihan_cjk_compatibility_variant || ''
}

function heisig({ heisig_en }) {
  return heisig_en || ''
}

function validVariant(kanji, variant) {
  return variant.written.includes(kanji)
}

// The variant we display for a word: of the ones actually written with this
// kanji, the one carrying the most priority tags. Ties keep the earliest, which
// is the order the API lists them in.
function bestVariantFor(kanji, word) {
  let best = null
  for (const variant of word.variants) {
    if (!validVariant(kanji, variant)) {
      continue
    }
    if (best === null || variant.priorities.length > best.priorities.length) {
      best = variant
    }
  }
  return best
}

function kanjiCount(written) {
  let count = 0
  for (const ch of written) {
    if (!isCharKana(ch)) {
      count++
    }
  }
  return count
}

// JMdict priority tags. The '1' suffix marks the stronger corpus of a pair
// (news1 is the top 12k words by newspaper frequency, news2 the next 12k), and
// nfXX is a frequency band, nf01 being the most common 500 words.
const NF_TAG = /^nf(\d+)$/
const NO_TIER = 2
const NO_BAND = 99

function priorityRank(priorities) {
  let tier = NO_TIER
  let band = NO_BAND
  for (const priority of priorities) {
    const nf = NF_TAG.exec(priority)
    if (nf !== null) {
      band = Math.min(band, Number(nf[1]))
    } else if (priority.endsWith('1')) {
      tier = Math.min(tier, 0)
    } else if (priority.endsWith('2')) {
      tier = Math.min(tier, 1)
    }
  }
  return { tier, band }
}

// Lexicographic, every field ascending, so a score is just "smaller is better".
// Kanji count outranks priority strength deliberately: words written with this
// kanji alone stay above compounds, and strength only breaks ties within a
// group. Without the strength keys every 2-kanji compound ties on length and
// falls through to whatever order the API listed them in.
function scoreVariant(variant) {
  const { tier, band } = priorityRank(variant.priorities)

  return [
    variant.priorities.length > 0 ? 0 : 1,
    kanjiCount(variant.written),
    tier,
    band,
    variant.written.length,
  ]
}

function compareScores(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return a[i] - b[i]
    }
  }
  return 0
}

// Score each word once, then sort. This runs on every redraw for word lists in
// the thousands, so it deliberately avoids re-deriving the variant per
// comparison. Words written without the kanji are dropped rather than scored.
function rankWords(kanji, words) {
  const ranked = []
  for (const word of words) {
    const variant = bestVariantFor(kanji, word)
    if (variant === null) {
      continue
    }
    ranked.push({ word, variant, score: scoreVariant(variant) })
  }
  ranked.sort((a, b) => compareScores(a.score, b.score))
  return ranked
}

function prioritiseWords(kanji, words) {
  return rankWords(kanji, words).map((ranked) => ranked.word)
}

function wordsForKanji(kanji, words) {
  return rankWords(kanji, words).map((ranked) => ({
    variant: ranked.variant,
    meanings: ranked.word.meanings,
  }))
}

module.exports = {
  grade,
  jlpt,
  unicode,
  prioritiseWords,
  wordsForKanji,
  heisig,
  alternative,
}
