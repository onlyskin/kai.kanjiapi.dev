const API_URL = 'http://0.0.0.0:4000';

class Api {
    constructor(request) {
        this._request = request;
        this._searches = {};
        this._failedKanjiSearches = [];
        this._failedReadingSearches = [];
    }

    async search(searchTerm) {
        try {
            const kanji_data = await this._try_search_kanji(searchTerm[0]);
            return kanji_data;
        } catch(e) {
            try {
                const reading_data = await this._try_search_reading(searchTerm);
                return reading_data;
            } catch(e) {
                return Promise.reject(new Error('not found'));
            }
        }
    }

    async _try_search_reading(searchTerm) {
        if (this._failedReadingSearches.includes(searchTerm)) {
            return Promise.reject();
        }

        if (this._searched(searchTerm)) {
            return Promise.resolve(this._searches[searchTerm]);
        }

        try {
            const response = await this._loadReading(searchTerm);

            this._searches[searchTerm] = response;

            return response;
        } catch(e) {
            this._failedReadingSearches.push(searchTerm);
            return Promise.reject();
        }
    }

    async _try_search_kanji(maybeKanji) {
        if (this._failedKanjiSearches.includes(maybeKanji)) {
            return Promise.reject();
        }

        if (this._searched(maybeKanji)) {
            return Promise.resolve(this._searches[maybeKanji]);
        }

        try {
            const response = await this._loadKanji(maybeKanji);

            this._searches[maybeKanji] = response;

            return response;
        } catch(e) {
            this._failedKanjiSearches.push(maybeKanji);
            return Promise.reject();
        }
    }

    _searched(searchTerm) {
        return Object.keys(this._searches).includes(searchTerm);
    }

    _loadKanji(character) {
        return this._request({
            method: 'GET',
            url: `${API_URL}/v1/kanji/${character}`,
        });
    }

    _loadReading(text) {
        return this._request({
            method: 'GET',
            url: `${API_URL}/v1/reading/${text}`,
        });
    }
}

module.exports = {
    Api
};
