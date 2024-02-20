#!/bin/sh

set -e
set -u

args=""
for x in $(ls schemas)
do
    dbname=$(echo $x | sed "s/json/sqlite3/")
    fname=$(echo "_${x}")
    args="${args} --config ${fname},${dbname}"
done

rm -rf build
mkdir build
NODE_OPTIONS='--experimental-fetch' npx --package=stringy-sqlite-search fresh ${args} --gypsum https://gypsum.artifactdb.com --dir build
