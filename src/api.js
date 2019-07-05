const API_URL = 'https://kanjiapi.dev';

class Api {
    constructor(request) {
        this._request = request;
        this._searches = {};
        this._failedKanjiSearches = [];
        this._failedReadingSearches = [];
    }

    async wordsFor(character) {
        return this._request({
            method: 'GET',
            url: `${API_URL}/v1/words/${character}`,
        });
    }

    async getJoyo() {
        return this._request({
            method: 'GET',
            url: `${API_URL}/v1/kanji/joyo`,
        });
    }

    async getJinmeiyo() {
        return this._request({
            method: 'GET',
            url: `${API_URL}/v1/kanji/jinmeiyo`,
        });
    }

    async search(searchTerm) {
        try {
            const firstKanji = this._firstKanjiFrom(searchTerm);
            const kanjiData = await this._trySearchKanji(firstKanji);
            return kanjiData;
        } catch(e) {
            try {
                const reading_data = await this._trySearchReading(searchTerm);
                return reading_data;
            } catch(e) {
                return Promise.reject(new Error('not found'));
            }
        }
    }

    _firstKanjiFrom(text) {
        return String.fromCodePoint(text.codePointAt(0));
    }

    async _trySearchReading(searchTerm) {
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

    async _trySearchKanji(maybeKanji) {
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
