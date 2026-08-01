# KanjiApiKai

Source code for [KanjiKai](https://kai.kanjiapi.dev), a web application for
exploring Kanji, powered by [kanjiapi.dev](https://kanjiapi.dev).

## Development

Requirements: `yarn` or `npm`

Install with `yarn`

Build with `./build`

Test with `yarn test`

Deploy with `gcloud storage rsync out gs://kai.kanjiapi.dev --exclude=".*\.map$" --checksums-only --dry-run`

Lint with `yarn lint`

### Running against a local kanjiapi

`./build` bakes the API base URL into the bundle, defaulting to
`https://kanjiapi.dev`, and prints which one it used. Set `KANJIAPI_URL` to build
against a local kanjiapi instead.

```sh
KANJIAPI_URL=http://localhost:8000 serveit -s out ./build -p 8090
```

Deploys are unaffected as long as `KANJIAPI_URL` is not set in the environment
you build from.
