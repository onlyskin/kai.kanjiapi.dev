MVP:
- add a link to it from kanjiapi.dev
- make Romaji button more intuitive
- fix word size and padding styling on medium sized things (tablets) (tachyons?)
- make sure sizing is right on iphone (not working in desktop safari responsive
  atm)

Nice to haves:
- neaten up dictionary/api.js with a view to extracting a Promise-based caching/wrapper
  library from api.js
- extract words/readings for kanji properly (tested)
  - display that it is an alternative form where that is the case

Future:
- add page with more details about a word (/char/word) which can show variants,
  etc.
- allow users to save a list of words to localstorage to export
- add list of names using name dict
