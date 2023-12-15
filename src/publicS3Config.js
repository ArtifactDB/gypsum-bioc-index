var cached = null;

export async function publicS3Config({ url = null } = {}) {
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

    cached = await res.json();
    return cached;
}
