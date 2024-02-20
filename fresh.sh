#!/bin/sh

set -e
set -u

rm -rf build
mkdir build
NODE_OPTIONS='--experimental-fetch' npx --package=gypsum-metadata-index fresh \
    --class _bioconductor.json,bioconductor.sqlite3 \
    --gypsum https://gypsum.artifactdb.com \
    --dir build
