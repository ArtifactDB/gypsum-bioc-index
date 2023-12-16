import * as fs from "fs";
import * as path from "path";
import * as utils from "./utils.js";
import { openSqlHandles } from "../../scripts/openSqlHandles.js";
import { closeSqlHandles } from "../../scripts/closeSqlHandles.js";

test("openSqlHandles works as expected", () => {
    const testdir = utils.setupTestDirectory("handles");
    let apath = path.join(testdir, "A.sqlite3");
    let bpath = path.join(testdir, "B.sqlite3");
    let cpath = path.join(testdir, "C.sqlite3");
    expect(fs.existsSync(apath)).toBe(false);
    expect(fs.existsSync(bpath)).toBe(false);
    expect(fs.existsSync(cpath)).toBe(false);

    const list_tables = handle => {
        let listing = handle.pragma("table_list");
        let found = [];
        for (const x of listing) {
            if (x.schema == "main" && x.type == "table") {
                found.push(x.name);
            }
        }
        return found;
    };

    // Creates new SQLite files.
    {
        let handles = openSqlHandles(testdir, [ "A", "B", "C" ]);
        expect(fs.existsSync(apath)).toBe(true);
        expect(fs.existsSync(bpath)).toBe(true);
        expect(fs.existsSync(cpath)).toBe(true);

        handles["A"].exec("CREATE TABLE foo (bar TEXT);");
        handles["B"].exec("CREATE TABLE whee (stuff INTEGER);");
        handles["C"].exec("CREATE TABLE blah (gunk REAL);");

        closeSqlHandles(handles);
    }

    // Works with existing SQLite files.
    {
        let handles = openSqlHandles(testdir, [ "A", "B", "C" ]);
        expect(list_tables(handles["A"]).indexOf("foo") >= 0).toBe(true);
        expect(list_tables(handles["B"]).indexOf("whee") >= 0).toBe(true);
        expect(list_tables(handles["C"]).indexOf("blah") >= 0).toBe(true);
        closeSqlHandles(handles);
    }

    // Works with overwrite:
    {
        let handles = openSqlHandles(testdir, [ "A", "B", "C" ], { overwrite: true });
        expect(list_tables(handles["A"]).indexOf("foo") >= 0).toBe(false);
        expect(list_tables(handles["B"]).indexOf("whee") >= 0).toBe(false);
        expect(list_tables(handles["C"]).indexOf("blah") >= 0).toBe(false);
        closeSqlHandles(handles);
    }
})
