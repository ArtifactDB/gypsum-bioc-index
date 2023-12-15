import * as s3 from "./setupS3.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function fetchFile(key, { mustWork = true } = {}) {
    const { bucket, client } = await s3.setupS3();

    try {
        // Need the await here for the try/catch to work properly.
        return await client.send(new GetObjectCommand({Bucket: bucket, Key: key }));
    } catch (e) {
        if (mustWork) {
            throw new Error("failed to fetch '" + key + "'; " + e.message);
        } else {
            return null;
        }
    }
}
