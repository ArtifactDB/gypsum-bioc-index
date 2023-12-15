import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { setupS3 } from "./setupS3.js";

export async function quickList(params, fun) {
    const { bucket, client } = await setupS3();
    let options = { Bucket: bucket, ...params };
    while (true) {
        let out = await client.send(new ListObjectsV2Command(options));
        fun(out);
        if (!out.IsTruncated) {
            break;
        }
        options.ContinuationToken = out.NextContinuationToken;
    }
}
