export function createFromSchemas(schemas, fun) {
    let output = {};
    for (const [id, schema] of Object.entries(schemas)) {
        output[id] = fun(schema);
    }
    return output;
}
