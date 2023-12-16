import * as gbi from "../src/index.js";
import { indexVersion } from "./indexVersion.js";
import { loadSchemas } from "./loadSchemas.js";
import { createFromSchemas } from "./createFromSchemas.js";
import { openSqlHandles } from "./openSqlHandles.js";
import { closeSqlHandles } from "./closeSqlHandles.js";
import { parseArgs } from "node:util";
import * as path from "path";
import * as fs from "fs";

const args = parseArgs({
    options: {
        only: {
            type: "string",
            short: "x"
        },
        after: {
            type: "string",
            short: "a"
        },
        schemas: {
            type: "string",
            short: "s",
            default: "schemas"
        },
        outputs: {
            type: "string",
            short: "o",
            default: "."
        },
        overwrite: {
            type: "boolean",
            short: "w",
            default: true
        }
    }
});

const schemas = loadSchemas(args.values.schemas);
let validators = createFromSchemas(schemas, gbi.validatorFromSchema);
let converters = createFromSchemas(schemas, gbi.converterFromSchema);

let outputs = openSqlHandles(args.values.outputs, Object.keys(schemas), { overwrite: args.values.overwrite });
for (const [id, db] of Object.entries(outputs)) {
    let init_cmds = gbi.initializeFromSchema(schemas[id]);
    db.exec(init_cmds);
}

// Creating the timestamp here, just so that if there are any operations
// between now and completion of the index, we catch them in the updates. This
// is okay as all logged operations are idempotent from our perspective; we're
// just (re)aligning with whatever's in the bucket.
fs.writeFileSync(path.join(args.values.outputs, "modified"), String((new Date).getTime()))

let all_projects;
if ("only" in args.values) {
    all_projects = [ args.values.only ];
} else {
    let after = null;
    if ("after" in args.values) {
        after = args.values.after;
    }
    all_projects = await gbi.listAllProjects({ after });
}

for (const proj of all_projects) {
    let jobs = [];
    let info = [];
    let all_assets = await gbi.listAllAssets(proj);

    for (const ass of all_assets) {
        // No need to check the project-level ..LOCK as we're only using the
        // latest, which must be completed (and approved, if probational).
        let latest = await gbi.fetchJson(proj + "/" + ass + "/..latest", { mustWork: false });
        if (latest !== null) {
            let key = proj + "/" + ass + "/" + latest.version;
            console.log("[STATUS] starting " + key);
            jobs.push(indexVersion(proj, ass, latest.version, validators, converters));
            info.push(key);
        }
    }

    let rjobs = await Promise.allSettled(jobs);
    for (var i = 0; i < rjobs.length; i++) {
        let current = rjobs[i];
        if (current.status == "rejected") {
            throw new Error("failed to construct indexing commands for '" + info[i] + "'; " + current.reason);
        }

        for (const [id, tasks] of Object.entries(current.value)) {
            try {
                gbi.runSqlStatements(outputs[id], tasks);
                console.log("[OK] indexed '" + info[i] + "' for '" + id + "'");
            } catch (e) {
                throw new Error("failed to index '" + info[i] + "' for '" + id + "'; " + e.message);
            }
        }
    }
}

closeSqlHandles(outputs);
