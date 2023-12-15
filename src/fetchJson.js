import { fetchFile } from "./fetchFile.js";

export async function fetchJson(key, { mustWork = true } = {}) {
    let fres = await fetchFile(key, { mustWork });
    if (fres === null) {
        return null;
    }
    let stringified = await fres.Body.transformToString("utf-8");
    return JSON.parse(stringified);
}
