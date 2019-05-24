class Dictionary {
    constructor(api, redraw) {
        this._api = api;
        this._redraw = redraw;
        this._searching = {};
        this._searched = {};
        this._searchingWords = {};
        this._searchedWords = {};
        this._failedSearches = {};

        this._joyo_kanji = [];
        api.getJoyo()
            .then(response => this._joyo_kanji = response);

        this._jinmeiyo_kanji = [];
        api.getJinmeiyo()
            .then(response => this._jinmeiyo_kanji = response);
    }

    lookup(searchTerm) {
        if (this._failedSearches[searchTerm]) {
            return {
                _status: 'failed',
            };
        }

        const searchResult = this._searchApi(searchTerm);
        if (searchResult) {
            return {
                _status: 'ok',
                result: searchResult,
            };
        }

        return {
            _status: 'pending',
        };
    }

    wordsFor(kanji) {
        return this._wordsFromApi(kanji) || null;
    }

    _wordsFromApi(kanji) {
        const literal = kanji.kanji;
        if (!this._searchingWords[literal]) {
            this._searchingWords[literal] = true;

            this._api.wordsFor(literal)
                .then(response => {
                    this._searchedWords[literal] = response;
                    this._redraw();
                })
                .catch(error => {
                    this._searchingWords[literal] = undefined;
                });
        }
        return this._searchedWords[literal];
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
                    this._failedSearches[searchTerm] = true;
                    this._redraw();
                });
        }
        return this._searched[searchTerm];
    }
}

module.exports = {
    Dictionary
};
