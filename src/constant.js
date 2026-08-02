function isNotNil(x) {
  return x !== null && x !== undefined
}

function isKanji(x) {
  return isNotNil(x) && isNotNil(x.kanji)
}

function isReading(x) {
  return isNotNil(x) && isNotNil(x.reading)
}

function union(a, b) {
  const unioned = new Set(a)
  for (const value of b) {
    unioned.add(value)
  }
  return unioned
}

module.exports = {
  ON: 'on-reading',
  KUN: 'kun-reading',
  NAME: 'name-reading',
  isKanji,
  isReading,
  union,
}
