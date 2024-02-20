#!/bin/sh

set -e
set -u

args=""
for x in $(ls .config)
do
    args="${args} --config .config/${x}"
done

NODE_OPTIONS='--experimental-fetch' npx --package=stringy-sqlite-search update ${args} --gypsum https://gypsum.artifactdb.com --dir build
