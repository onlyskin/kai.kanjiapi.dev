const o = require('ospec');
const { Api } = require('../src/api');

function not_found() {
    const error = new Error('Not found');
    error.code = 404;
    return error;
}

function kanji_request_fake() {
    return o.spy((request_config) => {
        if (request_config.url.includes('/kanji/')) {
            return Promise.resolve('kanji result');
        }
        return Promise.reject(not_found());
    });
}

function reading_request_fake() {
    return o.spy((request_config) => {
        if (request_config.url.includes('/kanji/')) {
            return Promise.reject(not_found());
        }
        return Promise.resolve('reading result');
    });
}

function failing_request_fake() {
    return o.spy((request_config) => {
        return Promise.reject(not_found());
    });
}

o.spec('search', () => {
    o('searches for first character as kanji first', async () => {
        const request_fake = kanji_request_fake();
        const api = new Api(request_fake);

        const result = await api.search('山雪');

        o(request_fake.args[0]).deepEquals({
            method: 'GET',
            url: 'https://kanjiapi.dev/v1/kanji/山',
        });
        o(result).equals('kanji result');
    });

    o('searches for whole string as reading if no kanji found', async () => {
        const request_fake = reading_request_fake();
        const api = new Api(request_fake);

        const result = await api.search('やま');

        o(request_fake.calls[0].args[0]).deepEquals({
            method: 'GET',
            url: 'https://kanjiapi.dev/v1/kanji/や',
        });
        o(request_fake.calls[1].args[0]).deepEquals({
            method: 'GET',
            url: 'https://kanjiapi.dev/v1/reading/やま',
        });
        o(result).equals('reading result');
    });

    o('caches successful kanji search', async () => {
        const request_fake = kanji_request_fake();
        const api = new Api(request_fake);

        const result1 = await api.search('山雪');
        const result2 = await api.search('山雪');

        o(request_fake.calls.length).equals(1);
        o(result1).equals('kanji result');
        o(result2).equals('kanji result');
    });

    o('caches successful reading search', async () => {
        const request_fake = reading_request_fake();
        const api = new Api(request_fake);

        const result1 = await api.search('やま');
        const result2 = await api.search('やま');

        o(request_fake.calls.length).equals(2);
        o(request_fake.calls[0].args[0]).deepEquals({
            method: 'GET',
            url: 'https://kanjiapi.dev/v1/kanji/や',
        });
        o(request_fake.calls[1].args[0]).deepEquals({
            method: 'GET',
            url: 'https://kanjiapi.dev/v1/reading/やま',
        });
        o(result1).equals('reading result');
        o(result2).equals('reading result');
    });

    o('caches failed kanji search', async () => {
        const request_fake = reading_request_fake();
        const api = new Api(request_fake);

        const result1 = await api.search('やま');
        const result2 = await api.search('やま');

        o(request_fake.calls.length).equals(2);
        o(result1).equals('reading result');
        o(result2).equals('reading result');
    });

    o('caches failed reading search', async () => {
        const request_fake = failing_request_fake();
        const api = new Api(request_fake);

        try {
            const result1 = await api.search('やま');
            const result2 = await api.search('やま');
            const result3 = await api.search('やま');
        } catch(e) {
            o(request_fake.calls.length).equals(2);
        }
    });

    o('raises error when no kanji or reading matches', async () => {
        const request_fake = failing_request_fake();
        const api = new Api(request_fake);

        try {
            const result1 = await api.search('やま');
        } catch(e) {
            o(e.message).equals('not found');
        }
    });
});
