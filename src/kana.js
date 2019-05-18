const { config } = require('./config');
const { romanize } = require('japanese');
const { isKatakana } = require('wanakana');
const { ON, KUN } = require('./constant');

function formatReading(reading) {
    if (!reading) {
        return reading;
    }

    return config.isRomaji ? romanizeWithPunctuation(reading) : reading;
}

function romanizeWithPunctuation(reading) {
    reading = reading
        .replace('.', '。')
        .replace('-', '－')
        .replace('-', '－')
        .replace('ー', '－');

    const romanized = romanize(reading, 'nihon');

    return isKatakana(reading) ? romanized.toUpperCase() : romanized;
}

function readingType(reading) {
    return isKatakana(reading) ? ON : KUN;
}

module.exports = {
    formatReading,
    readingType,
};
