import * as gbi from "../../src/index.js";
import * as path from "path";
import { loadSchemas } from "../../scripts/loadSchemas.js";
import { createFromSchemas } from "../../scripts/createFromSchemas.js";

test("createFromSchemas works as expected", () => {
    // Assume we run it from the root of the repository.
    let all_schemas = loadSchemas("schemas");
    let expected_keys = Array(Object.keys(all_schemas));

    // Creation works as expected.
    let cv = createFromSchemas(all_schemas, gbi.validatorFromSchema);
    expect(Array(Object.keys(cv))).toEqual(expected_keys);
    let cc = createFromSchemas(all_schemas, gbi.converterFromSchema);
    expect(Array(Object.keys(cc))).toEqual(expected_keys);
    let cw = createFromSchemas(all_schemas, gbi.wiperFromSchema);
    expect(Array(Object.keys(cw))).toEqual(expected_keys);
})
