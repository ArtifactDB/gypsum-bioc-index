export function wiperFromSchema(schema) {
    const tables = new Set(["core"]);

    for (const [n, x] of Object.entries(schema.properties)) {
        if (x.type == "string") {
            if ("_attributes" in x && x._attributes.indexOf("free_text") >= 0) {
                tables.add("free_text");
            }
        } else if (x.type == "array") {
            tables.add("multi_" + n);
        }
    }

    return (project, asset, version) => {
        let selector = "CREATE TEMP TABLE tmp_deleted AS SELECT _key FROM core WHERE _project = ?";
        let params = [ project ];

        if (asset !== null) {
            selector += " AND _asset = ?";
            params.push(asset);
        }
        if (version !== null) {
            selector += " AND _version = ?";
            params.push(version);
        }

        let statements = [{ statement: selector + ";", parameters: params }];
        for (const tab of tables) {
            statements.push({
                statement: `DELETE FROM ${tab} WHERE _key IN (SELECT _key FROM tmp_deleted);`,
                parameters: []
            });
        }

        return statements;
    };
}
