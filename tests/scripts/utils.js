import * as fs from "fs";

export function setupTestDirectory(suffix) {
    const testdir = "TEST_" + suffix;
    if (fs.existsSync(testdir)) {
        fs.rmSync(testdir, { recursive: true });
    }
    fs.mkdirSync(testdir);
    return testdir;
}
