import * as val from "../src/validatorFromSchema.js";
import schema from "../schemas/bioconductor.json";
import { examples } from "./examples.js";

test("validatorFromSchema works as expected", () => {
    const validator = val.validatorFromSchema(schema);
    expect(validator(examples[0])).toBe(true);
    expect(validator(examples[1])).toBe(true);

    let test = {...(examples[0])};
    delete test.title;
    expect(validator(test)).toBe(false);
    expect(validator.errors[0].message).toMatch("title");
})
