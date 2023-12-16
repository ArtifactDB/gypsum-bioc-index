import * as fs from "fs";
import * as path from "path";
import * as gbi from "../src/index.js";

export function loadSchemas(dir) {
    let output = {};
    for (const file of fs.readdirSync(dir)) {
        let id = file.slice(0, file.length - 5);
        output[id] = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    }
    return output
}
