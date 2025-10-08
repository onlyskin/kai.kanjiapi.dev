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

function priorityVariant(variant) {
  return variant.priorities.length > 0
}

function scoreWord(word, kanji) {
  const variantsWithKanji = word.variants.filter(
    validVariant.bind(null, kanji),
  )
  .sort((a, b) => b.priorities.length - a.priorities.length)

  const hasPriorityVariant = variantsWithKanji.some(priorityVariant)

  const kanjiCount = Array.from(variantsWithKanji[0].written).filter(ch => !isCharKana(ch)).length;
  const variantLength = variantsWithKanji[0].written.length

  return [
    hasPriorityVariant,
    kanjiCount,
    variantLength,
  ]
}

function compareWords(word1, word2, kanji) {
  const aScore = scoreWord(word1, kanji)
  const bScore = scoreWord(word2, kanji)

  if (aScore[0] !== bScore[0]) {
    return aScore[0] ? -1 : 1;
  }
  if (aScore[1] !== bScore[1]) {
    return aScore[1] - bScore[1];
  }
  return aScore[2] - bScore[2];
}

function prioritiseWords(kanji, words) {
  const wordsCopy = JSON.parse(JSON.stringify(words))
  wordsCopy.sort((a, b) => compareWords(a, b, kanji))

  return wordsCopy
}

function wordsForKanji(kanji, words) {
  const prioritised = prioritiseWords(kanji, words)
  const converted = prioritised.map(word => {
    const variantsWithKanji = word.variants.filter(
      validVariant.bind(null, kanji),
    )
    .sort((a, b) => b.priorities.length - a.priorities.length)

    return {
      variant: variantsWithKanji[0],
      meanings: word.meanings,
    }
  })
  return converted
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
