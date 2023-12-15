export function runSqlStatements(db, statements) {
    let output = [];
    for (const s of statements) {
        output.push(db.prepare(s.statement).run(...(s.parameters)));
    }
    return output;
}
