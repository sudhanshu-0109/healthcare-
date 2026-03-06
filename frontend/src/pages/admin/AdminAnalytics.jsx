// ─── ADMIN ANALYTICS DASHBOARD ───────────────────────────────
// System-wide KPIs, appointment status breakdown, lab stats,
// and revenue breakdown for the admin role.

import StatCard from "../../components/ui/StatCard";
import { SC } from "../../constants/designTokens";

const AdminAnalytics = ({ state }) => {
    const rev = state.billing.reduce((s, b) => s + b.totalAmount, 0);
    const stats = [
        { label: "Total Appointments", val: state.appointments.length, icon: "cal", color: "var(--c1)" },
        { label: "Lab Tests Done", val: state.labTests.filter((t) => t.status === "COMPLETED").length, icon: "flask", color: "var(--c2)" },
        { label: "Revenue", val: `₹${rev.toLocaleString()}`, icon: "dollar", color: "var(--c3)" },
        { label: "Active Users", val: state.users.length, icon: "user", color: "var(--c5)" },
        { label: "Emergencies", val: state.emergencyRequests.filter((e) => e.status === "COMPLETED").length, icon: "amb", color: "var(--c4)" },
        { label: "Prescriptions", val: state.prescriptions.length, icon: "clip", color: "var(--c1)" },
    ];

    const ta = Math.max(state.appointments.length, 1);
    const tl = Math.max(state.labTests.length, 1);

    return (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <h2 style={{ fontWeight: 800, fontSize: 24 }}>Analytics Dashboard</h2>

            {/* KPI grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                {stats.map((s) => <StatCard key={s.label} {...s} />)}
            </div>

            {/* Chart cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                {/* Appointment status bars */}
                <div className="card">
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Appointment Status</div>
                    {["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED"].map((st) => {
                        const c = state.appointments.filter((a) => a.status === st).length;
                        const p = Math.round((c / ta) * 100);
                        return (
                            <div key={st} style={{ marginBottom: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                                    <span style={{ color: SC[st] }}>{st}</span>
                                    <span style={{ color: "var(--tx2)", fontFamily: "var(--m)" }}>{c} ({p}%)</span>
                                </div>
                                <div style={{ height: 5, background: "var(--s3)", borderRadius: 99, overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${p}%`, background: SC[st], borderRadius: 99, transition: "width .5s" }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Lab status bars */}
                <div className="card">
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Lab Tests</div>
                    {["PENDING", "COMPLETED"].map((st) => {
                        const c = state.labTests.filter((t) => t.status === st).length;
                        const p = Math.round((c / tl) * 100);
                        return (
                            <div key={st} style={{ marginBottom: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                                    <span style={{ color: SC[st] }}>{st}</span>
                                    <span style={{ color: "var(--tx2)", fontFamily: "var(--m)" }}>{c} ({p}%)</span>
                                </div>
                                <div style={{ height: 5, background: "var(--s3)", borderRadius: 99, overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${p}%`, background: SC[st], borderRadius: 99 }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Revenue breakdown */}
                <div className="card">
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Revenue Breakdown</div>
                    {state.billing.length === 0 ? (
                        <div style={{ color: "var(--tx2)", fontSize: 13 }}>No billing data.</div>
                    ) : (
                        state.billing.map((b) => (
                            <div key={b.id} style={{ marginBottom: 10 }}>
                                <div style={{ fontSize: 12, color: "var(--tx2)", marginBottom: 6 }}>Bill #{b.id} — {b.createdAt}</div>
                                {[
                                    { l: "Consult", v: b.consultationFee, c: "var(--c1)" },
                                    { l: "Lab", v: b.labFee, c: "var(--c2)" },
                                    { l: "Pharmacy", v: b.pharmacyFee, c: "var(--c3)" },
                                ].map((r) => (
                                    <div key={r.l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0" }}>
                                        <span style={{ color: "var(--tx2)" }}>{r.l}</span>
                                        <span style={{ fontFamily: "var(--m)", color: r.c }}>₹{r.v}</span>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
