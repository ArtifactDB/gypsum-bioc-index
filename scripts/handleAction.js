import * as gbi from "../src/index.js";
import { indexVersion } from "./indexVersion.js";

function quickDelete(project, asset, handles, wipers) {
    for (const [id, wipe] of Object.entries(wipers)) {
        gbi.runSqlStatements(handles[id], wipe(project, asset, null));
        if (asset == null) {
            console.log("[OK] completed deletion of project '" + project + "' for '" + id + "'");
        } else {
            console.log("[OK] completed deletion of asset '" + asset + "' in project '" + project + "' for '" + id + "'");
        }
    }
}

async function quickAddVersion(project, asset, version, handles, validators, converters) {
    let statements = await indexVersion(project, asset, version, validators, converters);
    for (const [id, stmt] of Object.entries(statements)) {
        gbi.runSqlStatements(handles[id], stmt);
        console.log("[OK] added version '" + version + "' of asset '" + asset + "' in project '" + project + "' for '" + id + "'");
    }
}

export async function handleAction(action, handles, wipers, validators, converters) {
    if (action.type == "add-version") {
        if (action.latest) {
            quickDelete(action.project, action.asset, handles, wipers);
            await quickAddVersion(action.project, action.asset, action.version, handles, validators, converters);
        } else {
            console.log("[STATUS] skipping addition of non-latest version '" + action.version + "' of asset '" + action.asset + "' in project '" + action.project + "'");
        }

    } else if (action.type == "delete-version") {
        if (action.latest) {
            quickDelete(action.project, action.asset, handles, wipers);

            // Adding back the latest, if one exists.
            let latest = await gbi.fetchJson(action.project + "/" + action.asset + "/..latest", { mustWork: false });
            if (latest !== null) {
                await quickAddVersion(action.project, action.asset, action.version, handles, validators, converters);
            } else {
                console.log("[STATUS] latest version is not available for asset '" + action.asset + "' in project '" + action.project + "'");
            }
        }

    } else if (action.type == "delete-asset") {
        quickDelete(action.project, action.asset, handles, wipers);

    } else if (action.type == "delete-project") {
        quickDelete(action.project, null, handles, wipers);

    } else {
        throw new Error("unknown action type '" + action.type + "' in log '" + all_logs[i].key + "'");
    }
}
