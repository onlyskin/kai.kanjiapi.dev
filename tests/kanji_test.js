global.window = require("mithril/test-utils/browserMock.js")();
global.document = window.document;

const o = require('ospec');
const Kanji = require('../src/kanji');
const util = require('util');

o.spec('prioritiseWords', () => {
    o('words where a variant with the kanji is a proprity sort higher', () => {
        const priorityValid = {
            'variants': [
                { 'written': 'お国', 'priorities': ['spec1'] },
            ],
        };

        const nonPriorityValid = {
            'variants': [
                { 'written': 'お国', 'priorities': [] },
            ],
        };

        const apiWords = [ nonPriorityValid, priorityValid ];

        const words = Kanji.prioritiseWords('国', apiWords);

        const expected = [ priorityValid, nonPriorityValid ];
        o(words).deepEquals(expected);
    });

    o('the more priorities a variant with the kanji has the higher it sorts', () => {
        const onePriorityValid = {
            'variants': [
                { 'written': 'お国', 'priorities': ['spec1'] },
            ],
        };

        const twoPrioritiesValid = {
            'variants': [
                { 'written': 'お国', 'priorities': ['spec1', 'news1'] },
            ],
        };

        const apiWords = [ onePriorityValid, twoPrioritiesValid ];

        const words = Kanji.prioritiseWords('国', apiWords);

        const expected = [ twoPrioritiesValid, onePriorityValid ];
        o(words).deepEquals(expected);
    })

    o('words where the first variant has the kanji sort higher', () => {
        const firstValid = {
            'variants': [
                { 'written': 'お国', 'priorities': [] },
                { 'written': 'お', 'priorities': [] },
            ],
        };
        
        const firstNonValid = {
            'variants': [
                { 'written': 'お', 'priorities': [] },
                { 'written': 'お国', 'priorities': [] },
            ],
        };

        const apiWords = [ firstNonValid, firstValid ];

        const words = Kanji.prioritiseWords('国', apiWords);

        const expected = [ firstValid, firstNonValid ];
        o(words).deepEquals(expected);
    });

    o('words with any priority variant sort higher', () => {
        const priorityNonValid = {
            'variants': [
                { 'written': 'お', 'priorities': ['spec1'] },
                { 'written': 'お国', 'priorities': [] },
            ],
        };

        const noPriority = {
            'variants': [
                { 'written': 'お', 'priorities': [] },
                { 'written': 'お国', 'priorities': [] },
            ],
        };

        const apiWords = [ noPriority, priorityNonValid ];

        const words = Kanji.prioritiseWords('国', apiWords);

        const expected = [ priorityNonValid, noPriority ];
        o(words).deepEquals(expected);
    });

    o('shorter words sort higher', () => {
        const shorter = {
            'variants': [
                { 'written': 'お国', 'priorities': [] },
            ],
        };

        const longer = {
            'variants': [
                { 'written': 'お国お', 'priorities': [] },
            ],
        };

        const apiWords = [ longer, shorter ];

        const words = Kanji.prioritiseWords('国', apiWords);

        const expected = [ shorter, longer ];
        o(words).deepEquals(expected);
    });
});

o.spec('presentWords', () => {


    // presents all three variants when search for 'stone', but not when search
    // for other kanji in third
    const word = {
        "variants": [
            {
                "written": "かんらん石",
                "pronounced": "かんらんせき",
                "priorities": []
            },
            {
                "written": "カンラン石",
                "pronounced": "カンランせき",
                "priorities": []
            },
            {
                "written": "橄欖石",
                "pronounced": "かんらんせき",
                "priorities": []
            }
        ],
        "meanings": [
            {
                "glosses": [
                    "olivine",
                    "peridot"
                ]
            }
        ]
    };

});
