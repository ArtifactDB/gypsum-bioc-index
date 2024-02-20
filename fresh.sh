#!/bin/sh

set -e
set -u

args=""
for x in $(ls .config)
do
    args="${args} --config .config/${x}"
done

rm -rf build
mkdir build
node --experimental-fetch stringy/scripts/fresh.js ${args} --gypsum https://gypsum.artifactdb.com --dir build
