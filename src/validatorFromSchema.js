import Ajv from "ajv";

export function validatorFromSchema(schema) {
    const ajv = new Ajv();
    return ajv.compile(schema);
}
