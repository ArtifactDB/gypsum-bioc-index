import * as path from "path";
import * as gbi from "../../src/index.js";
import * as utils from "./utils.js";
import { loadSchemas } from "../../scripts/loadSchemas.js";
import { createFromSchemas } from "../../scripts/createFromSchemas.js";
import { indexVersion } from "../../scripts/indexVersion.js";

// Assume we run it from the root of the repository.
let all_schemas = loadSchemas("schemas");
let cv = createFromSchemas(all_schemas, gbi.validatorFromSchema);
let cc = createFromSchemas(all_schemas, gbi.converterFromSchema);

const project = "scRNAseq";
const asset = "zeisel-brain-2015";
const version = "2023-12-14";

test("indexAction works correctly", async () => {
    let statements = await indexVersion(project, asset, version, cv, cc);

    expect(statements.bioconductor.length).toBeGreaterThan(1);
    expect(statements.bioconductor[0].statement).toMatch("core");
    expect(statements.bioconductor[1].statement).toMatch("free_text");

    expect(statements.scRNAseq.length).toBeGreaterThan(0);
    expect(statements.bioconductor[0].statement).toMatch("core");
})
