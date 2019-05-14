class Dictionary {
    constructor(api, redraw) {
        this._api = api;
        this._redraw = redraw;
        this._searching = {};
        this._searched = {};

        this._joyo_kanji = [];
        api.getJoyo()
            .then(response => this._joyo_kanji = response);

        this._jinmeiyo_kanji = [];
        api.getJinmeiyo()
            .then(response => this._jinmeiyo_kanji = response);
    }

    lookup(searchTerm) {
        return this._searchApi(searchTerm) || null;
    }

    joyo() {
        return this._joyo_kanji;
    }

    jinmeiyo() {
        return this._jinmeiyo_kanji;
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
