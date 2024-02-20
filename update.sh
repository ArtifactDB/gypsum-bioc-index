#!/bin/sh

set -e
set -u

NODE_OPTIONS='--experimental-fetch' npx --package=gypsum-metadata-index update \
    --class _bioconductor.json,bioconductor.sqlite3 \
    --gypsum https://gypsum.artifactdb.com \
    --dir build
