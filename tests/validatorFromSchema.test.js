import * as val from "../src/validatorFromSchema.js";
import schema from "../schemas/bioconductor.json";
import { examples } from "./examples.js";
import Ajv from "ajv";

test("validatorFromSchema works as expected", () => {
    const validator = val.validatorFromSchema(schema);
    validator(examples[0]);
    validator(examples[1]);

    let test = {...(examples[0])};
    delete test.title;
    expect(() => validator(test)).toThrow("title");
})
