const config = {
  storageKey: 'kanjikai-config',
  clear: function() {
    const emptyData = {
      isRomaji: false,
      filterLists: [],
    };
    localStorage.setItem(this.storageKey, JSON.stringify(emptyData));
  },
  getData: function() {
    let stored = localStorage.getItem(this.storageKey);
    if (stored === null) {
      this.clear();
      return this.getData();
    } else {
      return JSON.parse(stored);
    }
  },
  saveData: function(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  },
  getIsRomaji: function() {
    return this.getData().isRomaji;
  },
  filterList: function(listName) {
    return this.getData().filterLists.includes(listName);
  },
  getFilterLists: function() {
    return this.getData().filterLists;
  },
  toggleFilterList: function(listName) {
    const current = this.getData();
    const index = current.filterLists.indexOf(listName);
    if (index !== -1) {
      current.filterLists.splice(index, 1);
    } else {
      current.filterLists.push(listName)
    }
    this.saveData(current)
  },
  toggleRomaji: function() {
    const current = this.getData();
    current.isRomaji = !current.isRomaji
    this.saveData(current)
  },
}

module.exports = {
  config,
}
