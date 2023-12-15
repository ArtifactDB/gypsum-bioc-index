import * as gbi from "../src/index.js";
import { parseArgs } from "node:util";
import { handleAction } from "./handleAction.js";
import { loadSchemas } from "./loadSchemas.js";
import * as fs from "fs";
import * as path from "path";
import Database from "better-sqlite3"

const args = parseArgs({
    options: {
        schemas: {
            type: "string",
            short: "s",
            default: "schemas"
        },
        dir: {
            type: "string",
            short: "d",
            default: "."
        }
    }
});

let lastmod = new Date(Number(fs.readFileSync(path.join(args.values.dir, "modified"))));

const schemas = loadSchemas(args.values.schemas);
let validators = {};
let converters = {};
let wipers = {};
for (const [id, schema] of Object.entries(schemas)) {
    validators[id] = gbi.validatorFromSchema(schema);
    wipers[id] = gbi.wiperFromSchema(schema);
    converters[id] = gbi.converterFromSchema(schema);
}

let handles = {};
for (const id of Object.keys(schemas)) {
    handles[id] = new Database(path.join(args.values.dir, id + ".sqlite3"))
}

let all_logs = await gbi.scanLogs(lastmod);
let resolved_logs = await Promise.all(all_logs.map(x => gbi.fetchJson(x.key)));

// Jobs must be done in order.
for (var i = 0; i < resolved_logs.length; i++) {
    let action = resolved_logs[i];
    console.log("[STATUS] processing log '" + all_logs[i] + "' (type: " + action.type + ")");
    handleAction(action, handles, wipers, validators, converters);
}

for (const v of Object.values(handles)) {
    v.close();
}

if (all_logs.length) {
    let last_event = 0;
    for (const x of all_logs) {
        if (last_event < x.time) {
            last_event = x.time;
        }
    }
    fs.writeFileSync(path.join(args.values.dir, "modified"), String(last_event));
}
