import * as s3 from "./publicS3Config";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function listFiles(project, asset, version, { config = null, maxKeys = 1000 } = {}) {
    if (config === null) {
        config = await s3.publicS3Config();
    }

    const S3 = new S3Client({
        region: "auto",
        endpoint: config.endpoint,
        credentials: {
            accessKeyId: config.key,
            secretAccessKey: config.secret
        }
    });

    let prefix = project + "/" + asset + "/" + version;
    let options = { Bucket: config.bucket, Prefix: prefix + "/", MaxKeys: maxKeys };
    let accumulated = [];

    while (true) {
        let out = await S3.send(new ListObjectsV2Command(options));
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
