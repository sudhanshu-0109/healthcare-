// ─── PATIENT DASHBOARD ───────────────────────────────────────
// Overview page shown to patients after login.

import StatCard from "../../components/ui/StatCard";
import SectionTitle from "../../components/ui/SectionTitle";
import Badge from "../../components/ui/Badge";
import Btn from "../../components/ui/Btn";
import Ic from "../../components/ui/Ic";
import { P } from "../../constants/icons";
import { todayStr } from "../../utils/helpers";

const PatientDashboard = ({ state, user, onMedicineTaken }) => {
    const appts = state.appointments.filter((a) => a.patientId === user.id);
    const bills = state.billing.filter((b) => b.patientId === user.id);
    const labs = state.labTests.filter((l) => l.patientId === user.id);
    const unread = state.notifications.filter((n) => n.userId === user.id && !n.readStatus);
    const unpaid = bills.filter((b) => !b.paidStatus);
    const inProg = appts.find((a) => a.status === "IN_PROGRESS");
    const nextUp = appts.find((a) => a.status === "CONFIRMED" && a.queueNumber === 1);

    return (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Greeting */}
            <div>
                <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 4 }}>
                    Welcome back, {user.name.split(" ")[0]} 👋
                </h2>
                <p style={{ color: "var(--tx2)", fontSize: 14 }}>Your health overview — {todayStr()}</p>
            </div>

            {/* Queue alert banner */}
            {(inProg || nextUp) && (
                <div style={{
                    background: inProg ? "var(--c2)15" : "var(--c1)15",
                    border: `1px solid ${inProg ? "var(--c2)" : "var(--c1)"}44`,
                    borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
                }}>
                    <span style={{ fontSize: 28 }}>{inProg ? "🩺" : "🔔"}</span>
                    <div>
                        <div style={{ fontWeight: 800, color: inProg ? "var(--c2)" : "var(--c1)", fontSize: 15 }}>
                            {inProg ? "You are currently being seen!" : "You are next in queue!"}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--tx2)" }}>
                            {inProg ? `With ${inProg.doctorName}` : `${nextUp.doctorName} • ${nextUp.date} at ${nextUp.time}`}
                        </div>
                    </div>
                </div>
            )}

            {/* Unpaid bill warning */}
            {unpaid.length > 0 && (
                <div style={{ background: "var(--c4)12", border: "1px solid var(--c4)44", borderRadius: 12, padding: "12px 18px", display: "flex", gap: 12, alignItems: "center" }}>
                    <Ic d={P.alert} size={18} c="var(--c4)" />
                    <div style={{ fontWeight: 700, color: "var(--c4)" }}>
                        {unpaid.length} Unpaid Bill{unpaid.length > 1 ? "s" : ""} — Please clear dues
                    </div>
                </div>
            )}

            {/* KPI row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
                <StatCard label="Appointments" val={appts.length} icon="cal" color="var(--c1)" sub={`${appts.filter((a) => a.status === "CONFIRMED").length} confirmed`} />
                <StatCard label="Lab Reports" val={labs.length} icon="flask" color="var(--c2)" sub={`${labs.filter((l) => l.status === "COMPLETED").length} ready`} />
                <StatCard label="Total Billed" val={`₹${bills.reduce((s, b) => s + b.totalAmount, 0).toLocaleString()}`} icon="dollar" color="var(--c3)" sub={unpaid.length > 0 ? `${unpaid.length} unpaid` : "All paid ✓"} />
                <StatCard label="Notifications" val={unread.length} icon="bell" color="var(--c4)" sub="unread" />
            </div>

            {/* Two-column detail grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Upcoming appointments */}
                <div>
                    <SectionTitle ch="Upcoming Appointments" />
                    {appts.filter((a) => a.status !== "COMPLETED").length === 0 ? (
                        <div className="card" style={{ color: "var(--tx2)", textAlign: "center", padding: "30px 0" }}>No upcoming appointments.</div>
                    ) : (
                        appts.filter((a) => a.status !== "COMPLETED").map((a) => (
                            <div key={a.id} className="card" style={{ marginBottom: 10, background: "var(--s3)", borderColor: a.status === "IN_PROGRESS" ? "var(--c2)55" : "var(--b1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                    <div style={{ width: 42, height: 42, background: "var(--c1)20", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "var(--c1)", fontSize: 16 }}>
                                        #{a.queueNumber}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 14 }}>{a.doctorName}</div>
                                        <div style={{ fontSize: 12, color: "var(--tx2)" }}>{a.date} • {a.time}</div>
                                    </div>
                                </div>
                                <Badge s={a.status} />
                            </div>
                        ))
                    )}
                </div>

                {/* Today's medicines */}
                <div>
                    <SectionTitle ch="Today's Medicines" />
                    {state.prescriptions.filter((p) => p.patientId === user.id).flatMap((p) => p.medicines).length === 0 ? (
                        <div className="card" style={{ color: "var(--tx2)", textAlign: "center", padding: "30px 0" }}>No active medicines.</div>
                    ) : (
                        <div className="card" style={{ background: "var(--s3)" }}>
                            {state.prescriptions
                                .filter((p) => p.patientId === user.id)
                                .map((p) =>
                                    p.medicines.map((m) => {
                                        const remainingDays = m.remainingDays ?? m.durationDays;
                                        const isDone = !remainingDays || remainingDays <= 0;
                                        return (
                                            <div
                                                key={m.id}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    padding: "10px 0",
                                                    borderBottom: "1px solid var(--b1)",
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                                                    <div style={{ fontSize: 11, color: "var(--tx2)" }}>
                                                        {m.dosagePerDay}×/day • {remainingDays}d left • {m.instructions}
                                                    </div>
                                                </div>
                                                <Btn
                                                    ch={isDone ? "Completed" : "✓ Taken"}
                                                    v={isDone ? "sec" : "gst"}
                                                    sz="sm"
                                                    dis={isDone}
                                                    onClick={() => {
                                                        if (isDone) return;
                                                        if (onMedicineTaken) {
                                                            onMedicineTaken(p.id, m.id);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        );
                                    })
                                )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
