export function publicS3Config(url = null) {
    if (url === null) {
        url = restUrl();
    }

    let res = await fetch(url + "/credentials/s3-api");
    if (!res.ok) {
        throw new Error("failed to retrieve S3 credentials for bucket access")
    }

    return await res.json();
}
