// ─── USERS PAGE ──────────────────────────────────────────────
// Admin-only read-only table listing all registered users.

import Badge from "../../components/ui/Badge";

const UsersPage = ({ state }) => (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 24 }}>User Management</h2>
        <div className="card">
            <table className="tbl" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        {["ID", "Name", "Email", "Role"].map((h) => <th key={h}>{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {state.users.map((u) => (
                        <tr key={u.id}>
                            <td style={{ fontFamily: "var(--m)", color: "var(--tx2)", fontSize: 12 }}>{u.id}</td>
                            <td style={{ fontWeight: 600 }}>{u.name}</td>
                            <td style={{ color: "var(--tx2)" }}>{u.email}</td>
                            <td><Badge s={u.role.toUpperCase()} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default UsersPage;
