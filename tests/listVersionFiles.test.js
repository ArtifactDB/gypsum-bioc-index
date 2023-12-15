import * as ls from "../src/listVersionFiles.js";
import "isomorphic-fetch";

test("listVersionFiles works as expected", async () => {
    let contents = await ls.listVersionFiles("test-R", "basic", "v1");
    expect(contents.length).toBeGreaterThan(0);
    expect(typeof contents[0]).toBe("string");

    // Works with continuation.
    let contents2 = await ls.listVersionFiles("test-R", "basic", "v1", { maxKeys: 1 });
    expect(contents2.length).toEqual(contents.length);
});
