function isNotNil(x) {
  return x !== null && x!== undefined;
}

function isKanji(x) {
  return isNotNil(x) && isNotNil(x.kanji)
}

function isReading(x) {
  return isNotNil(x) && isNotNil(x.reading)
}

module.exports = {
  ON: 'on-reading',
  KUN: 'kun-reading',
  NAME: 'name-reading',
  JOYO_GRADES: [1, 2, 3, 4, 5, 6, 8],
  JINMEIYO_GRADES: [9, 10],
  isKanji,
  isReading,
}
