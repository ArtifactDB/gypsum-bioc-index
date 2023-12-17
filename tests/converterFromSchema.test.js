import * as init from "../src/initializeFromSchema.js";
import * as convert from "../src/converterFromSchema.js";
import { runSqlStatements } from "../src/runSqlStatements.js";
import schema from "../schemas/bioconductor.json";
import { examples } from "./examples.js";
import Database from "better-sqlite3"

test("converterFromSchema works as expected", () => {
    const initialized = init.initializeFromSchema(schema);
    const db = new Database(':memory:');
    db.exec(initialized);

    const converter = convert.converterFromSchema(schema);
    let statements = converter("foo", "bar", "v1", "asd/asd", "summarized_experiment", examples[0]); 
    runSqlStatements(db, statements);

    // Checking that the key is correctly assembled.
    let info = db.prepare("SELECT * FROM core LIMIT 1").all();
    expect(info[0]["_key"]).toEqual("foo/bar/v1/asd/asd");
    expect(info[0]["_path"]).toEqual("asd/asd");

    // Checking that we have entries in each of the tables.
    let res = db.prepare("SELECT COUNT(*) FROM multi_genome").all();
    expect(res[0]["COUNT(*)"]).toBe(3);

    res = db.prepare("SELECT COUNT(*) FROM multi_taxonomy_id").all();
    expect(res[0]["COUNT(*)"]).toBe(2);

    res = db.prepare("SELECT COUNT(*) FROM core").all();
    expect(res[0]["COUNT(*)"]).toBe(1);

    res = db.prepare("SELECT COUNT(*) FROM free_text").all();
    expect(res[0]["COUNT(*)"]).toBe(1);
})

test("converterFromSchema works with a NULL path", () => {
    const initialized = init.initializeFromSchema(schema);
    const db = new Database(':memory:');
    db.exec(initialized);

    const converter = convert.converterFromSchema(schema);
    let statements = converter("foo", "bar", "v1", null, "summarized_experiment", examples[0]); 
    runSqlStatements(db, statements);

    // Checking that the key is correctly assembled.
    let res = db.prepare("SELECT * FROM core LIMIT 1").all();
    expect(res[0]["_key"]).toEqual("foo/bar/v1");
    expect(res[0]["_path"]).toBeNull();
})
