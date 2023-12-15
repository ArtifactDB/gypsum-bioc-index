import * as ls from "../src/listAllProjects.js";
import "isomorphic-fetch";

test("listAllProjects works as expected", async () => {
    let contents = await ls.listAllProjects();
    expect(contents.length).toBeGreaterThan(0);
    expect(contents.indexOf("test-R")).toBeGreaterThanOrEqual(0);
});
