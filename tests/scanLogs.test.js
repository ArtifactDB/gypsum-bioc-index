import * as sc from "../src/scanLogs.js";
import "isomorphic-fetch";

test("scanLogs works as expected", async () => {
    let yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Can't really do a lot of tests here, as we don't know what it'll be.
    let all_logs = await sc.scanLogs(yesterday);
    for (const x of all_logs) {
        expect(x.time > yesterday).toBe(true);
        expect(x.key.startsWith("..logs/")).toBe(true);
    }

    // Works with continuation.
    let all_logs2 = await sc.scanLogs(yesterday, { maxKeys: 1 });
    expect(all_logs2.length).toBeGreaterThanOrEqual(all_logs.length);
});
