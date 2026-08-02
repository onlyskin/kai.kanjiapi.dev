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

### Favicon

`./build` copies the committed `favicon.png` into `out/`, so a normal build needs
nothing beyond `yarn`. The file is generated with
[ImageMagick](https://imagemagick.org) and the macOS system font Hiragino Maru
Gothic ProN W4, and only needs regenerating if the design changes:

```sh
magick -size 128x128 -gravity center -background '#2F1758' -fill white \
    -font "/System/Library/Fonts/ヒラギノ丸ゴ ProN W4.ttc" label:解 \
    -depth 8 -strip favicon.png
```

### Running against a local kanjiapi

`./build` bakes the API base URL into the bundle, defaulting to
`https://kanjiapi.dev`, and prints which one it used. Set `KANJIAPI_URL` to build
against a local kanjiapi instead.

```sh
KANJIAPI_URL=http://localhost:8000 serveit -s out ./build -p 8090
```

Deploys are unaffected as long as `KANJIAPI_URL` is not set in the environment
you build from.
