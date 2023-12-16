import * as fs from "fs";
import * as path from "path";
import Database from "better-sqlite3"

export function openSqlHandles(dir, names, { overwrite = false } = {}) {
    let outputs = {};
    for (const id of names) {
        let opath = path.join(dir, id + ".sqlite3")
        if (overwrite && fs.existsSync(opath)) {
            fs.unlinkSync(opath);
        }
        let db = new Database(opath);
        outputs[id] = db;
    }
    return outputs;
}
