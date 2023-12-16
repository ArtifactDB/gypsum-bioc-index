export function closeSqlHandles(handles) {
    for (const db of Object.values(handles)) {
        db.close();
    }
}
