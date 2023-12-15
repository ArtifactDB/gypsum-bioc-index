import * as ls from "../src/listVersionFiles.js";
import { quickList } from "../src/utils.js";
import "isomorphic-fetch";

test("listVersionFiles works as expected", async () => {
    let contents = await ls.listVersionFiles("test-R", "basic", "v1");
    expect(contents.length).toBeGreaterThan(0);
    expect(typeof contents[0]).toBe("string");

    // Works correctly with continuation.
    let prefix = "test-R/basic/v1/";
    let contents2 = [];
    await quickList({ Prefix: prefix, MaxKeys: 1 }, resp => {
        for (const x of resp.Contents) {
            contents2.push(x);
        }
    });
    expect(contents2.length).toEqual(contents.length);
});
