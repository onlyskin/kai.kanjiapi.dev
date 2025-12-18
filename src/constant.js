function isNotNil(x) {
  return x !== null && x!== undefined;
}

function isKanji(x) {
  return isNotNil(x) && isNotNil(x.kanji)
}

function isReading(x) {
  return isNotNil(x) && isNotNil(x.reading)
}

function union(a, b) {
  const unioned = new Set(a);
  for (const value of b) {
    unioned.add(value);
  }
  return unioned;
}

module.exports = {
  ON: 'on-reading',
  KUN: 'kun-reading',
  NAME: 'name-reading',
  JOYO_GRADES: [1, 2, 3, 4, 5, 6, 8],
  JINMEIYO_GRADES: [9, 10],
  isKanji,
  isReading,
  union,
}
