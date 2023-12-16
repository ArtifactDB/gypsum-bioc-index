import * as path from "path";
import * as gbi from "../../src/index.js";
import * as utils from "./utils.js";
import { loadSchemas } from "../../scripts/loadSchemas.js";
import { createFromSchemas } from "../../scripts/createFromSchemas.js";
import { openSqlHandles } from "../../scripts/openSqlHandles.js";
import { closeSqlHandles } from "../../scripts/closeSqlHandles.js";
import { handleAction } from "../../scripts/handleAction.js";

// Assume we run it from the root of the repository.
let all_schemas = loadSchemas("schemas");
let cv = createFromSchemas(all_schemas, gbi.validatorFromSchema);
let cc = createFromSchemas(all_schemas, gbi.converterFromSchema);
let cw = createFromSchemas(all_schemas, gbi.wiperFromSchema);
let ci = createFromSchemas(all_schemas, gbi.initializeFromSchema);

function initialize_handles(suffix) {
    const testdir = utils.setupTestDirectory(suffix);
    let handles = openSqlHandles(testdir, Object.keys(all_schemas), { overwrite: true });
    for (const [id, db] of Object.entries(handles)) {
        db.exec(ci[id]);
    }
    return handles;
}

const project = "scRNAseq";
const asset = "zeisel-brain-2015";
const version = "2023-12-14";

function extract_count(handle) {
    let res = handle.prepare("SELECT COUNT(*) FROM overlord").all();
    return res[0]["COUNT(*)"];
}

test("handleAction works correctly when adding a version", async () => {
    let handles = initialize_handles("add");

    let action = {
        type: "add-version",
        project: project,
        asset: asset,
        version: version,
        latest: false 
    };

    // No-op if not latest.
    await handleAction(action, handles, cw, cv, cc);
    expect(extract_count(handles.bioconductor)).toEqual(0);
    expect(extract_count(handles.scRNAseq)).toEqual(0);

    // Now with an insertion.
    action.latest = true;
    await handleAction(action, handles, cw, cv, cc);
    expect(extract_count(handles.bioconductor)).toEqual(1);
    expect(extract_count(handles.scRNAseq)).toEqual(1);
})

test("handleAction works correctly when deleting a version", async () => {
    let handles = initialize_handles("delete");

    let action = {
        type: "delete-version",
        project: project,
        asset: asset,
        version: version,
        latest: false 
    };

    // No-op if not latest.
    await handleAction(action, handles, cw, cv, cc);
    expect(extract_count(handles.bioconductor)).toEqual(0);
    expect(extract_count(handles.scRNAseq)).toEqual(0);

    // Injecting a bunch of crap.
    for (const db of Object.values(handles)) {
        for (const key of ["foo", "bar"]) {
            db.prepare("INSERT INTO overlord(_key, _project, _asset) VALUES(?,?,?)").run(key, project, asset);
        }
    }
    expect(extract_count(handles.bioconductor)).toEqual(2);
    expect(extract_count(handles.scRNAseq)).toEqual(2);

    // Cleans out the crap and repopulates the existing directory.
    action.latest = true;
    await handleAction(action, handles, cw, cv, cc);
    expect(extract_count(handles.bioconductor)).toEqual(1);
    expect(extract_count(handles.scRNAseq)).toEqual(1);
})

test("handleAction works correctly when deleting an asset", async () => {
    let handles = initialize_handles("delete-asset");

    let action = {
        type: "delete-asset",
        project: project,
        asset: asset
    };

    // Injecting a bunch of crap.
    for (const db of Object.values(handles)) {
        db.prepare("INSERT INTO overlord(_key, _project, _asset) VALUES(?,?,?)").run("YAY", project, asset);
        db.prepare("INSERT INTO overlord(_key, _project, _asset) VALUES(?,?,?)").run("YAY2", project, asset + "2");
    }
    expect(extract_count(handles.bioconductor)).toEqual(2);
    expect(extract_count(handles.scRNAseq)).toEqual(2);

    await handleAction(action, handles, cw, cv, cc);
    expect(extract_count(handles.bioconductor)).toEqual(1);
    expect(extract_count(handles.scRNAseq)).toEqual(1);
})

test("handleAction works correctly when deleting a project", async () => {
    let handles = initialize_handles("delete-project");

    let action = {
        type: "delete-project",
        project: project
    };

    // Injecting a bunch of crap.
    for (const db of Object.values(handles)) {
        db.prepare("INSERT INTO overlord(_key, _project, _asset) VALUES(?,?,?)").run("YAY", project, asset);
        db.prepare("INSERT INTO overlord(_key, _project, _asset) VALUES(?,?,?)").run("YAY2", project, asset + "2");
    }
    expect(extract_count(handles.bioconductor)).toEqual(2);
    expect(extract_count(handles.scRNAseq)).toEqual(2);

    await handleAction(action, handles, cw, cv, cc);
    expect(extract_count(handles.bioconductor)).toEqual(0);
    expect(extract_count(handles.scRNAseq)).toEqual(0);
})
