import { quickList } from "./utils.js";

export async function scanLogs(since) {
    const prefix = "..logs/";

    // Rewinding a day and using that as the 'StartAfter' key. The idea is to
    // improve the efficiency of the list operation by skipping keys that we
    // must have already processed. Note, though, that this part is only
    // approximate as an alphanumeric sort doesn't check for timezones or
    // account for variable precision of fractional seconds. Hence, we rewind
    // by a full day to be conservative and ensure that we only skip things
    // that we must have already processed; for everything else, we still list
    // the keys, extract the times and compare them manually to 'since'.
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
