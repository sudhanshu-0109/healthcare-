// ─── AUDIT LOG PAGE ──────────────────────────────────────────
// Read-only table of all system audit events, newest first.

const AuditPage = ({ state }) => (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 24 }}>Audit Log</h2>
        <div className="card">
            <table className="tbl" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        {["#", "Action", "Performed By", "Details", "Timestamp"].map((h) => <th key={h}>{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {state.auditLogs.slice().reverse().map((l) => (
                        <tr key={l.id}>
                            <td style={{ fontFamily: "var(--m)", color: "var(--tx2)", fontSize: 12 }}>{l.id}</td>
                            <td>
                                <span style={{ background: "var(--c5)20", color: "var(--c5)", borderRadius: 99, fontSize: 11, padding: "2px 9px", fontFamily: "var(--m)" }}>
                                    {l.action}
                                </span>
                            </td>
                            <td style={{ fontWeight: 500 }}>{l.performedBy}</td>
                            <td style={{ color: "var(--tx2)" }}>{l.detail}</td>
                            <td style={{ fontFamily: "var(--m)", fontSize: 12, color: "var(--tx2)" }}>{l.timestamp}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default AuditPage;
