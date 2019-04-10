#!/bin/bash

SRC=src
OUT=out
BROWSERIFY=node_modules/browserify/bin/cmd.js

rm -rf $OUT
mkdir -p $OUT

$BROWSERIFY $SRC/index.js -o $OUT/index.bundle.js --debug

cp index.html $OUT/index.html
cp css/* $OUT/
