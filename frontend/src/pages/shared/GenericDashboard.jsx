// ─── GENERIC DASHBOARD ───────────────────────────────────────
// Fallback dashboard for lab, pharmacy, and hospital roles.

import StatCard from "../../components/ui/StatCard";

const GenericDashboard = ({ state, user }) => {
    // ── Hospital ──
    if (user.role === "hospital") {
        const act = state.emergencyRequests.filter((e) => e.status === "REQUESTED").length;
        const hdl = state.emergencyRequests.filter((e) => e.acceptedHospitalId === user.id).length;
        return (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <h2 style={{ fontWeight: 800, fontSize: 24 }}>Welcome, {user.name} 🏥</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                    <StatCard label="Active Emergencies" val={act} icon="amb" color="var(--c4)" sub="awaiting response" />
                    <StatCard label="Cases Handled" val={hdl} icon="check" color="var(--c1)" sub="by your hospital" />
                </div>
                {act > 0 && (
                    <div style={{ background: "var(--c4)12", border: "1px solid var(--c4)44", borderRadius: 12, padding: "14px 18px", display: "flex", gap: 12, alignItems: "center" }}>
                        <span style={{ fontSize: 24 }}>🚨</span>
                        <div style={{ fontWeight: 700, color: "var(--c4)" }}>{act} active emergency — go to Emergency Requests!</div>
                    </div>
                )}
            </div>
        );
    }

    // ── Pharmacy ──
    if (user.role === "pharmacy") {
        const pen = state.pharmacyOrders.filter((o) => o.status === "READY").length;
        return (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <h2 style={{ fontWeight: 800, fontSize: 24 }}>Welcome, {user.name} 💊</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                    <StatCard label="Pending Orders" val={pen} icon="pill" color="var(--c3)" sub="awaiting pickup" />
                    <StatCard label="Total Orders" val={state.pharmacyOrders.length} icon="receipt" color="var(--c1)" sub="all time" />
                </div>
            </div>
        );
    }

    // ── Lab ──
    const tot = state.labTests.length;
    const pen = state.labTests.filter((t) => t.status === "PENDING").length;
    return (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <h2 style={{ fontWeight: 800, fontSize: 24 }}>Welcome, {user.name} 🔬</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                <StatCard label="Total Tests" val={tot} icon="flask" color="var(--c2)" sub="in system" />
                <StatCard label="Pending" val={pen} icon="clock" color="var(--c3)" sub="awaiting upload" />
                <StatCard label="Completed" val={tot - pen} icon="check" color="var(--c1)" sub="reports uploaded" />
            </div>
        </div>
    );
};

export default GenericDashboard;
