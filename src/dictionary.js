const { Kanjiapi: { ERROR, LOADING, SUCCESS } } = require('kanjiapi-wrapper');

class Dictionary {
    constructor(kanjiapi) {
        this._kanjiapi = kanjiapi;
    }

    lookup(searchTerm) {
        const firstKanji = this._firstKanjiFrom(searchTerm);

        const kanjiResult = this._kanjiapi.getKanji(firstKanji)
        const readingResult = this._kanjiapi.getReading(searchTerm)

        if ( kanjiResult.status === ERROR && readingResult.status === ERROR ) {
            return { status: ERROR, value: null }
        }

        if ( kanjiResult.status === SUCCESS) {
            return kanjiResult
        }

        if ( readingResult.status === SUCCESS) {
            return readingResult
        }

        if ( kanjiResult.status === LOADING || readingResult.status === LOADING ) {
            return { status: LOADING, value: null }
        }
    }

    randomKanji() {
        const kanji = [ ...this._joyoSet(), this._jinmeiyoSet() ]
        const choice = Math.floor(Math.random() * kanji.length)
        return kanji[choice]
    }

    isJoyo(kanji) {
        const { status, value } = this._kanjiapi.getJoyoSet()
        return status === SUCCESS ? value.has(kanji) : false
    }

    isJinmeiyo(kanji) {
        const { status, value } = this._kanjiapi.getJinmeiyoSet()
        return status === SUCCESS ? value.has(kanji) : false
    }

    _firstKanjiFrom(text) {
        return String.fromCodePoint(text.codePointAt(0));
    }

    _joyoSet() {
        return this._kanjiapi.getJoyoSet().status === SUCCESS ?
            this._kanjiapi.getJoyoSet().value.keys() :
            []
    }

    _jinmeiyoSet() {
        return this._kanjiapi.getJinmeiyoSet().status === SUCCESS ?
            this._kanjiapi.getJinmeiyoSet().value.keys() :
            []
    }
}

module.exports = {
    Dictionary
};
