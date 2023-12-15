import { S3Client } from "@aws-sdk/client-s3";

var cached = null;

export async function setupS3({ url = null } = {}) {
    if (cached !== null) {
        return cached;
    }

    if (url === null) {
        url = "https://gypsum-test.aaron-lun.workers.dev";
    }

    let res = await fetch(url + "/credentials/s3-api");
    if (!res.ok) {
        throw new Error("failed to retrieve S3 credentials for bucket access")
    }

    let config = await res.json();

    const client = new S3Client({
        region: "auto",
        endpoint: config.endpoint,
        credentials: {
            accessKeyId: config.key,
            secretAccessKey: config.secret
        }
    });

    cached = { bucket: config.bucket, client };
    return cached;
}
