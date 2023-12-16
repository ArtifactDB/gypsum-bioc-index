import * as ls from "../src/listAllAssets.js";

test("listAllAssets works as expected", async () => {
    let contents = await ls.listAllAssets("test-R");
    expect(contents.length).toBeGreaterThan(0);
    expect(contents.indexOf("basic")).toBeGreaterThanOrEqual(0);
});
