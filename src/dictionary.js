class Dictionary {
    constructor(api, redraw) {
        this._api = api;
        this._redraw = redraw;
        this._searching = {};
        this._searched = {};
    }

    lookup(searchTerm) {
        return this._searchApi(searchTerm) || null;
    }

    _searchApi(searchTerm) {
        if (!this._searching[searchTerm]) {
            this._searching[searchTerm] = true;

            this._api.search(searchTerm)
                .then(response => {
                    this._searched[searchTerm] = response;
                    this._redraw();
                })
                .catch(error => {
                    this._searching[searchTerm] = undefined;
                });
        }
        return this._searched[searchTerm];
    }
}

module.exports = {
    Dictionary
};
