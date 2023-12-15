import { quickList } from "./utils.js";

export async function scanLogs(since) {
    const prefix = "..logs/";

    // Rewinding a day and using that as the starting key.  The idea is to
    // improve the efficiency of the list operation by skipping things that
    // we must have already processed. Note, though, that this part is only
    // approximate as an alphanumeric sort doesn't check for timezones or
    // account for variable seconds. The rewinding by a day ensures that we
    // don't skip things we might still need to process, but in any case,
    // we still need to check the times manually to 'since'.
    let after = new Date(since.getTime() - 24 * 60 * 60 * 1000);
    let after_name = prefix + String(after.getYear()) + "-" + String(after.getMonth()) + "-" + String(after.getDate())

    let accumulated = [];
    await quickList({ Prefix: prefix, StartAfter: after_name }, resp => {
        if ("Contents" in resp) {
            for (const x of resp.Contents) {
                // Parsing out the time and comparing it to 'since'.
                let i = x.Key.indexOf("_");
                if (i < 0) {
                    continue;
                }

                let lpath = x.Key.slice(prefix.length, i);
                let tstamp = Date.parse(lpath);
                if (Number.isNaN(tstamp)) {
                    continue;
                }

                if (tstamp > since) {
                    accumulated.push({ time: tstamp, key: x.Key });
                }
            }
        }
    });

    accumulated.sort((a, b) => a.time - b.time);
    return accumulated;
}
