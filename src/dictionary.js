class Dictionary {
    constructor(api, redraw) {
        this._api = api;
        this._redraw = redraw;
        this._searching = {};
        this._searched = {};
        this._searchingWords = {};
        this._searchedWords = {};
        this._failedSearches = {};

        this._joyo_kanji_map = {};
        api.getJoyo()
            .then(response => {
                for (let kanji of response) {
                    this._joyo_kanji_map[kanji] = true;
                }
            });

        this._jinmeiyo_kanji_map = {};
        api.getJinmeiyo()
            .then(response => {
                for (let kanji of response) {
                    this._jinmeiyo_kanji_map[kanji] = true;
                }
            });
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

    randomKanji() {
        const kanji = Object.keys(this._joyo_kanji_map)
            .concat(Object.keys(this._jinmeiyo_kanji_map));
        const choice = Math.floor(Math.random() * kanji.length);
        return kanji[choice];
    }

    isJoyo(kanji) {
        return this._joyo_kanji_map[kanji] || false;
    }

    isJinmeiyo(kanji) {
        return this._jinmeiyo_kanji_map[kanji] || false;
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
