class Random {
  constructor() {
    this._size = 1000
    this._offset = 0
    this._randomNumbers = Array(this._size)
    for (const x of this._randomNumbers.keys()) {
      this._randomNumbers[x] = Math.random()
    }
  }

  get() {
    this._offset += 1
    return this._randomNumbers[this._offset % this._size]
  }

  jitter(variation) {
    return 1 + this.get() * variation * 2 - variation
  }
}

module.exports = Random
