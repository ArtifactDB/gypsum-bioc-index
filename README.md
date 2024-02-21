# Bioconductor metadata index

[![RunTests](https://github.com/ArtifactDB/bioconductor-metadata-index/actions/workflows/run-tests.yaml/badge.svg)](https://github.com/ArtifactDB/bioconductor-metadata-index/actions/workflows/run-tests.yaml)
[![Updates](https://github.com/ArtifactDB/bioconductor-metadata-index/actions/workflows/update-indices.yaml/badge.svg)](https://github.com/ArtifactDB/bioconductor-metadata-index/actions/workflows/update-indices.yaml)

## Overview

This repository compiles metadata documents from the [**gypsum** backend](https://github.com/ArtifactDB/gypsum-worker) into a SQLite index,
using scripts from the [gypsum-metadata-index](https://github.com/ArtifactDB/gypsum-metadata-index) repository.
Applications can download these indices to extract the metadata and/or perform a range of queries including full-text searches.
Check out the [relevant documentation](https://github.com/ArtifactDB/gypsum-metadata-index/blob/master/README.md) of the tables within each SQLite file.

This document is intended for system administrators or the occasional developer who wants to create a new index for their package(s).
Users should not have to interact with these indices directly, as this should be mediated by client packages in relevant frameworks like R/Bioconductor.
For example, the [gypsum R client](https://github.com/ArtifactDB/gypsum-R) provides functions for obtaining the schemas and indices,
which are then called by more user-facing packages like the [scRNAseq](https://github.com/LTLA/scRNAseq) R package.

## Metadata and schemas

To be eligible for inclusion in this index, uploads should include one or more JSON-formatted metadata documents that are assigned to each project-asset-version combination.
The name of the metadata document determines the database into which it is inserted, as well as the [JSON schema](https://json-schema.org) used for metadata validation:

- Files named `_bioconductor.json` should validate against the [Bioconductor metadata schema](schemas/bioconductor/v1.json).
  These are compiled into the `bioconductor.sqlite3` file.

Package developers may open a [pull request](https://github.com/ArtifactDB/bioconductor-metadata-index) on this repository to add application-specific metadata.
This can involve either:

- Adding an application-specific subschema to the `schemas/bioconductor/MY_APP_HERE` subdirectory.
  Any application-specific metadata will be automatically incorporated into the existing `bioconductor.sqlite3`.
- Adding an entirely new schema in a `schemas/MY_APP_HERE` subdirectory.
  This is more flexible and allows for metadata that is not compatible with the Bioconductor schema,
  but requires additional updates to [`fresh.sh`](fresh.sh) and [`update.sh`](update.sh) to build and update the new database.

In general, we recommend breaking down large JSON schemas into smaller subschemas for easier development.
We then use [merge-json-schemas](https://github.com/ArtifactDB/merge-json-schemas) to merge subschemas into the full Bioconductor schema, which is then published on GitHub Pages.
Developers adding entirely new schemas should udpate [`merge.sh`](merge.sh) to ensure these schemas are merged and published.

## Publishing SQLite files

The various GitHub Actions in this repository will publish the SQLite files as release assets.

- The [`fresh-build` Action](https://github.com/ArtifactDB/bioconductor-metadata-index/actions/workflows/fresh-build.yaml) will run the `fresh.sh` script to create and publish a fresh build.
  This is manually triggered and can be used on the rare occasions where the existing release is irrecoverably out of sync with the **gypsum** bucket.
- The [`update-indices` Action](https://github.com/ArtifactDB/bioconductor-metadata-index/actions/workflows/update-indices.yaml) runs the `update.sh` script daily to match changes to the bucket contents.
  This will only publish a new release if any changes were performed.
  - Note that cron jobs in GitHub Actions require some semi-routine nudging to indicate that the repository is still active, otherwise the workflow is disabled.

The latest version of the SQLite files are available [here](https://github.com/ArtifactDB/bioconductor-metadata-index/releases/tag/latest).
The `modified` file contains the Unix timestamp for the last update of the files;
clients can check this file to determine whether local caches need to be refreshed.
