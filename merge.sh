#!/bin/sh

set -e
set -u

rm -rf merged
mkdir merged

mkdir merged/bioconductor
npx --package=merge-json-schemas merge schemas/bioconductor/v1.json > merged/bioconductor/v1.json
