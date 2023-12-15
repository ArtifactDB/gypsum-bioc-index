import { quickList } from "./utils.js";

export async function listVersionFiles(project, asset, version) {
    let prefix = project + "/" + asset + "/" + version;
    let options = { Prefix: prefix + "/" };
    let accumulated = [];
    await quickList(options, resp => {
        if ("Contents" in resp) {
            for (const x of resp.Contents) {
                accumulated.push(x.Key);
            }
        }
    });
    return accumulated;
}
