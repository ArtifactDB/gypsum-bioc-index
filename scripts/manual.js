import * as gbi from "../src/index.js";
import { parseArgs } from "node:util";
import { handleAction } from "./handleAction.js";
import { loadSchemas } from "./loadSchemas.js";
import { createFromSchemas } from "./createFromSchemas.js";
import { openSqlHandles } from "./openSqlHandles.js";
import { closeSqlHandles } from "./closeSqlHandles.js";
import * as fs from "fs";
import * as path from "path";

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
        },
        type: {
            type: "string",
            short: "t",
        },
        project: {
            type: "string",
            short: "p",
        },
        asset: {
            type: "string",
            short: "a",
        },
        version: {
            type: "string",
            short: "v",
        },
        latest: {
            type: "string",
            short: "l"
        }
    }
});

// Mock up an action:
if (!("type" in args.values)) {
    throw new Error("'--type' is required");
}
if (!("project" in args.values)) {
    throw new Error("'--project' is required");
}
let action = { type: args.values.type, project: args.values.project };

if (args.values.type == "add-version" || args.values.type == "delete-version") {
    if (!("asset" in args.values)) {
        throw new Error("'--asset' is required");
    }
    if (!("version" in args.values)) {
        throw new Error("'--version' is required");
    }
    if (!("latest" in args.values)) {
        throw new Error("'--latest' is required");
    }
    action.asset = args.values.asset;
    action.version = args.values.version;
    action.latest = args.values.latest;

} else if (args.values.type == "delete-asset") {
    if (!("asset" in args.values)) {
        throw new Error("'--asset' is required");
    }
    action.asset = args.values.asset;
}

const schemas = loadSchemas(args.values.schemas);
let validators = createFromSchemas(schemas, gbi.validatorFromSchema);
let converters = createFromSchemas(schemas, gbi.converterFromSchema);
let wipers = createFromSchemas(schemas, gbi.wiperFromSchema);

let handles = openSqlHandles(args.values.dir, Object.keys(schemas));
await handleAction(action, handles, wipers, validators, converters);
closeSqlHandles(handles);
