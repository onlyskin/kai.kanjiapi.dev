const { config } = require('./config');
const { romanize, ERROR } = require('kana-convert');
const { ON, KUN } = require('./constant');

function formatReading(reading) {
    if (!reading) {
        return reading;
    }

    return config.isRomaji ? romanizeWithPunctuation(reading) : reading;
}

function isCharInRange(char = '', start, end) {
    if (typeof(char) !== 'string') {
        return false;
    }

    if(!char.length) {
        return false;
    }

    const code = char.charCodeAt(0);

    return start <= code && code <= end;
}

const KATAKANA_START = 0x30a1;
const KATAKANA_END = 0x30fc;
const HIRAGANA_START = 0x3041;
const HIRAGANA_END = 0x3096;
const LONG_DASH = 0x30fc;

function isKatakana(char) {
    return isCharInRange(char, KATAKANA_START, KATAKANA_END);
}

function isHiragana(char) {
    if (isLongDash = char.charCodeAt(0) === LONG_DASH) {
        return true;
    }

    return isCharInRange(char, HIRAGANA_START, HIRAGANA_END);
}

function isCharKana(char) {
    return isHiragana(char) || isKatakana(char);
}

function isKana(chars = '') {
    if (typeof(chars) !== 'string') {
        return false;
    }

    if(!chars.length) {
        return false;
    }

    return [...chars].every(isCharKana);
}

function romanizeWithPunctuation(reading) {
    reading = reading
        .replace('.', '。')
        .replace('-', '－')
        .replace('-', '－')
        .replace('ー', '－');

    const romanized = romanize(reading, { nonKanaAllowed: true, mergeLongVowels: true });

    if (romanized.status === ERROR) {
        return '???';
    }

    return isKatakana(reading) ? romanized.result.toUpperCase() : romanized.result;
}

function readingType(reading) {
    return isKatakana(reading) ? ON : KUN;
}

module.exports = {
    formatReading,
    readingType,
    isKana,
};
