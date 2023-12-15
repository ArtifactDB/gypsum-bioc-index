import * as s3 from "./setupS3.js";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function listVersionFiles(project, asset, version, { maxKeys = 1000 } = {}) {
    const { bucket, client } = await s3.setupS3();

    let prefix = project + "/" + asset + "/" + version;
    let options = { Bucket: bucket, Prefix: prefix + "/", MaxKeys: maxKeys };
    let accumulated = [];

    while (true) {
        let out = await client.send(new ListObjectsV2Command(options));
        for (const x of out.Contents) {
            accumulated.push(x.Key);
        }
        if (!out.IsTruncated) {
            break;
        }
        options.ContinuationToken = out.NextContinuationToken;
    }

    return accumulated;
}
