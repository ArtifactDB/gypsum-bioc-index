import * as path from "path";
import { loadSchemas } from "../../scripts/loadSchemas.js";

test("loadSchemas works as expected", () => {
    // Assume we run it from the root of the repository.
    let all_schemas = loadSchemas("schemas");
    expect("bioconductor" in all_schemas).toBe(true);
    expect(typeof all_schemas["bioconductor"]).toBe('object');
    expect("scRNAseq" in all_schemas).toBe(true);
    expect(typeof all_schemas["scRNAseq"]).toBe('object');
})
