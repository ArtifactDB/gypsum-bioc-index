import * as ff from "../src/fetchJson.js";

test("fetchJson works as expected", async () => {
    let summ = await ff.fetchJson("test-R/basic/v1/..summary");
    expect(typeof summ.upload_user_id).toBe("string");

    // Checking failure states.
    await expect(() => ff.fetchJson("test-not-exists/..summary")).rejects.toThrow("failed to fetch");
    expect(await ff.fetchJson("test-not-exists/..summary", { mustWork: false })).toBeNull();
})
