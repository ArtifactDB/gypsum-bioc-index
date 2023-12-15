import * as s3 from "../src/publicS3Config.js";
import "isomorphic-fetch";

test("publicS3Config works as expected", async () => {
    let config = await s3.publicS3Config();
    expect(typeof config.endpoint).toBe("string");
    expect(typeof config.key).toBe("string");
    expect(typeof config.secret).toBe("string");
});
