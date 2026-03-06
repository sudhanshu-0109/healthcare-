// ─── TIMELINE PAGE ───────────────────────────────────────────
// Chronological health timeline for a patient: appointments,
// prescriptions, lab tests, bills, and emergency events.

import Ic from "../../components/ui/Ic";
import { P } from "../../constants/icons";

const TimelinePage = ({ state, user }) => {
    // Merge all event types and sort newest-first
    const events = [
        ...state.appointments.filter((a) => a.patientId === user.id).map((a) => ({
            date: a.date, type: "appointment",
            title: `Appointment — ${a.doctorName}`,
            sub: `${a.time} • ${a.status}`,
            icon: "cal", color: "var(--c1)",
        })),
        ...state.prescriptions.filter((p) => p.patientId === user.id).map((p) => ({
            date: p.createdAt, type: "prescription",
            title: `Prescription — ${p.diagnosis}`,
            sub: `${p.doctorName} • ${p.medicines.length} medicines`,
            icon: "clip", color: "var(--c2)",
        })),
        ...state.labTests.filter((l) => l.patientId === user.id).map((l) => ({
            date: l.requestedAt, type: "lab",
            title: `Lab Test — ${l.testName}`,
            sub: `${l.status} • ₹${l.fixedPrice}`,
            icon: "flask", color: "var(--c3)",
        })),
        ...state.billing.filter((b) => b.patientId === user.id).map((b) => ({
            date: b.createdAt, type: "billing",
            title: `Bill #${b.id} — ₹${b.totalAmount}`,
            sub: b.paidStatus ? "PAID" : "UNPAID",
            icon: "dollar", color: b.paidStatus ? "var(--c1)" : "var(--c4)",
        })),
        ...state.emergencyRequests.filter((e) => e.patientId === user.id).map((e) => ({
            date: e.createdAt, type: "emergency",
            title: "Emergency Dispatch",
            sub: `${e.location} • ETA ${e.eta}`,
            icon: "amb", color: "var(--c4)",
        })),
    ].sort((a, b) => b.date.localeCompare(a.date));

    return (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <h2 style={{ fontWeight: 800, fontSize: 24 }}>My Health Timeline</h2>

            {events.length === 0 ? (
                <div className="card" style={{ color: "var(--tx2)", textAlign: "center", padding: "40px 0" }}>No history yet.</div>
            ) : (
                <div style={{ position: "relative" }}>
                    {/* Vertical line */}
                    <div style={{ position: "absolute", left: 22, top: 0, bottom: 0, width: 2, background: "var(--b2)" }} />

                    {events.map((ev, i) => (
                        <div key={i} style={{ display: "flex", gap: 20, marginBottom: 20, position: "relative" }}>
                            {/* Icon node */}
                            <div style={{
                                width: 44, height: 44, borderRadius: "50%",
                                background: `${ev.color}22`, border: `2px solid ${ev.color}44`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0, zIndex: 1,
                            }}>
                                <Ic d={P[ev.icon]} size={18} c={ev.color} />
                            </div>

                            {/* Event card */}
                            <div className="card" style={{ flex: 1, background: "var(--s3)", marginTop: 2 }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{ev.title}</div>
                                    <div style={{ fontSize: 11, color: "var(--tx2)", fontFamily: "var(--m)" }}>{ev.date}</div>
                                </div>
                                <div style={{ fontSize: 12, color: "var(--tx2)", marginTop: 3 }}>{ev.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TimelinePage;
