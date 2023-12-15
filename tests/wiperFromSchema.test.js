import * as init from "../src/initializeFromSchema.js";
import * as convert from "../src/converterFromSchema.js";
import * as wipe from "../src/wiperFromSchema.js";
import schema from "../schemas/bioconductor.json";
import { examples } from "./examples.js";
import Database from "better-sqlite3"

test("wiperFromSchema works as expected", () => {
    const initialized = init.initializeFromSchema(schema);

    const converter = convert.converterFromSchema(schema);
    let statements0 = converter("foo", "bar", "v1", "asd/asd", "summarized_experiment", examples[0]); 
    let statements1 = converter("blam", "bloo", "v1", "asd/asd", "summarized_experiment", examples[1]); 

    const wiper = wipe.wiperFromSchema(schema);
    let wstatements = wiper("foo", "bar", null);

    // Now checking whether they run.
    const db = new Database(':memory:');
    const init_str = initialized.join("\n");
    db.exec(init_str);

    for (const {statement, parameters} of statements0) {
        db.prepare(statement).run(...parameters);
    }

    for (const {statement, parameters} of statements1) {
        db.prepare(statement).run(...parameters);
    }

    // Checking that we have entries in each of the tables.
    let res = db.prepare("SELECT COUNT(*) FROM multi_genome").all();
    expect(res[0]["COUNT(*)"]).toBe(4);

    res = db.prepare("SELECT COUNT(*) FROM multi_taxonomy_id").all();
    expect(res[0]["COUNT(*)"]).toBe(3);

    res = db.prepare("SELECT COUNT(*) FROM overlord").all();
    expect(res[0]["COUNT(*)"]).toBe(2);

    res = db.prepare("SELECT COUNT(*) FROM free_text").all();
    expect(res[0]["COUNT(*)"]).toBe(2);

    // Now, wiping one of the assets.
    for (const {statement, parameters} of wstatements) {
        db.prepare(statement).run(...parameters);
    }

    // Checking that the wipe was successful.
    res = db.prepare("SELECT COUNT(*) FROM multi_genome").all();
    expect(res[0]["COUNT(*)"]).toBe(1);

    res = db.prepare("SELECT COUNT(*) FROM multi_taxonomy_id").all();
    expect(res[0]["COUNT(*)"]).toBe(1);

    res = db.prepare("SELECT COUNT(*) FROM overlord").all();
    expect(res[0]["COUNT(*)"]).toBe(1);

    res = db.prepare("SELECT COUNT(*) FROM free_text").all();
    expect(res[0]["COUNT(*)"]).toBe(1);
})
