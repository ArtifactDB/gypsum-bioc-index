import * as init from "../src/initializeFromSchema.js";
import schema from "../schemas/bioconductor.json";
import Database from "better-sqlite3"

test("initializerFromSchema works as expected", async () => {
    const initialized = init.initializeFromSchema(schema);
    const db = new Database(':memory:');
    const init_str = initialized.join("\n");
    db.exec(init_str);

    let listing = db.pragma("table_list");
    let available = listing.filter(y => y.type == "table" || y.type == "virtual").map(y => y.name);
    expect(available.indexOf("overlord") >= 0).toBe(true);
    expect(available.indexOf("free_text") >= 0).toBe(true);
    expect(available.indexOf("multi_sources") >= 0).toBe(true);
    expect(available.indexOf("multi_genome") >= 0).toBe(true);
    expect(available.indexOf("multi_taxonomy_id") >= 0).toBe(true);

    // Running again on existing tables will wipe existing results.
    db.prepare("INSERT INTO multi_genome(_key, item) VALUES('foo', 'blah')").run();
    let res = db.prepare("SELECT COUNT(*) FROM multi_genome").all();
    expect(res[0]["COUNT(*)"]).toBe(1);

    db.exec(init_str);
    res = db.prepare("SELECT COUNT(*) FROM multi_genome").all();
    expect(res[0]["COUNT(*)"]).toBe(0);
})
