#!/bin/sh

set -e 
set -u

rm -rf .config
mkdir .config
for x in $(ls schemas)
do
    dbname=$(echo $x | sed "s/json/sqlite3/")
    fname=$(echo "_${x}")
    npx --package=stringy-sqlite-search configure --schema schemas/${x} --db_name ${dbname} --file_name ${fname} > .config/${x}
done
