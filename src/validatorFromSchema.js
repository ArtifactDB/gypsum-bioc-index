import Ajv from "ajv";

export function validatorFromSchema(schema) {
    const ajv = new Ajv();
    ajv.addKeyword("_attributes")
    let validator = ajv.compile(schema);
    return x => {
        if (!validator(x)) {
            throw new Error(ajv.errorsText(validator.errors));
        }
    };
}
