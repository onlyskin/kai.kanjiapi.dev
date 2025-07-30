const m = require('mithril')
const { ExternalLink } = require('./link')

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
  const variantsWithKanji = word.variants.filter(validVariant.bind(null, kanji))

  const validPriorityVariant = variantsWithKanji.find(priorityVariant)

  const validPriorityVariantLength = validPriorityVariant
    ? validPriorityVariant.priorities.length
    : 0

  const hasPriorityVariant = word.variants.some(priorityVariant)

  const firstVariantIsValid = validVariant(kanji, word.variants[0])

  const minWordLength = validPriorityVariant
    ? validPriorityVariant.written.length
    : variantsWithKanji.reduce(
        (acc, curr) => Math.min(acc, curr.written.length),
        Infinity,
      )

  return {
    validPriorityVariantLength,
    firstVariantIsValid,
    minWordLength,
    hasPriorityVariant,
  }
}

function compareWords(word1, word2, kanji) {
  const score1 = scoreWord(word1, kanji)
  const score2 = scoreWord(word2, kanji)

  if (score1.validPriorityVariantLength !== score2.validPriorityVariantLength) {
    return score2.validPriorityVariantLength - score1.validPriorityVariantLength
  }

  if (score1.firstVariantIsValid !== score2.firstVariantIsValid) {
    return score2.firstVariantIsValid - score1.firstVariantIsValid
  }

  if (score1.hasPriorityVariant !== score2.hasPriorityVariant) {
    return score2.hasPriorityVariant - score1.hasPriorityVariant
  }

  return score1.minWordLength - score2.minWordLength
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

    const validPriorityVariant = variantsWithKanji.find(priorityVariant)

    return {
      variant: validPriorityVariant
        ? validPriorityVariant
        : variantsWithKanji[0],
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
