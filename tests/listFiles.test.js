import * as ls from "../src/listFiles.js";
import "isomorphic-fetch";

test("listFiles works as expected", async () => {
    let contents = await ls.listFiles("test-R", "basic", "v1");
    expect(contents.length).ToBeGreaterThan(0);
});
