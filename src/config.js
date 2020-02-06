const config = {
  isRomaji: false,
  toggleRomaji: function() {
    this.isRomaji = !this.isRomaji
    return Promise.resolve()
  },
}

module.exports = {
  config,
}
