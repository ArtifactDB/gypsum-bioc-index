import { fetchJson } from "./fetchJson.js";
import { setupS3 } from "./setupS3.js";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function scanLogs(since, { maxKeys = 1000 } = {}) {
    let { bucket, client } = await setupS3();
    let prefix = "..logs/";
    let options = { Bucket: bucket, Prefix: prefix, MaxKeys: maxKeys };

    // Rewinding a day and using that as the starting key.  The idea is to
    // improve the efficiency of the list operation by skipping things that
    // we must have already processed. Note, though, that this part is only
    // approximate as an alphanumeric sort doesn't check for timezones or
    // account for variable seconds. The rewinding by a day ensures that we
    // don't skip things we might still need to process, but in any case,
    // we still need to check the times manually to 'since'.
    let after = new Date(since.getTime() - 24 * 60 * 60 * 1000);
    options.StartAfter = prefix + String(after.getYear()) + "-" + String(after.getMonth()) + "-" + String(after.getDate())

    let accumulated = [];
    while (true) {
        let out = await client.send(new ListObjectsV2Command(options));

        if ("Contents" in out) {
            for (const x of out.Contents) {
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

        if (!out.IsTruncated) {
            break;
        }
        options.ContinuationToken = out.NextContinuationToken;
    }

    accumulated.sort((a, b) => a.time - b.time);
    return accumulated;
}
