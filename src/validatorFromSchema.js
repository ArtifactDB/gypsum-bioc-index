import Ajv from "ajv";

export function validatorFromSchema(schema) {
    const ajv = new Ajv();
    ajv.addKeyword("_attributes")
    return ajv.compile(schema);
}
