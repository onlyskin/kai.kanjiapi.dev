const R = require('ramda')

const isNotNil = R.complement(R.isNil)
const isKanji = R.propSatisfies(isNotNil, 'kanji')
const isReading = R.propSatisfies(isNotNil, 'reading')

module.exports = {
  ON: 'on-reading',
  KUN: 'kun-reading',
  NAME: 'name-reading',
  JOYO_GRADES: [1, 2, 3, 4, 5, 6, 8],
  JINMEIYO_GRADES: [9, 10],
  isKanji,
  isReading,
}
