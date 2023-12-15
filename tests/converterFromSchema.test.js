import * as init from "../src/initializeFromSchema.js";
import * as convert from "../src/converterFromSchema.js";
import schema from "../schemas/bioconductor.json";
import { examples } from "./examples.js";
import Database from "better-sqlite3"

test("converterFromSchema works as expected", async () => {
    const initialized = init.initializeFromSchema(schema);
    const db = new Database(':memory:');
    const init_str = initialized.join("\n");
    db.exec(init_str);

    const converter = convert.converterFromSchema(schema);
    let statements = converter("foo", "bar", "v1", "asd/asd", "summarized_experiment", examples[0]); 

    for (const s of statements) {
        db.prepare(s.statement).run(...(s.parameters));
    }

    // Checking that we have entries in each of the tables.
    let res = db.prepare("SELECT COUNT(*) FROM multi_genome").all();
    expect(res[0]["COUNT(*)"]).toBe(3);

    res = db.prepare("SELECT COUNT(*) FROM multi_taxonomy_id").all();
    expect(res[0]["COUNT(*)"]).toBe(2);

    res = db.prepare("SELECT COUNT(*) FROM overlord").all();
    expect(res[0]["COUNT(*)"]).toBe(1);

    res = db.prepare("SELECT COUNT(*) FROM free_text").all();
    expect(res[0]["COUNT(*)"]).toBe(1);
})
