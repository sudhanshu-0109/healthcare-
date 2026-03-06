// ─── QUEUE PAGE ──────────────────────────────────────────────
// Doctors use this to advance/complete each patient token.
// Patients use it to see their current position.

import Btn from "../../components/ui/Btn";
import Badge from "../../components/ui/Badge";
import { todayStr } from "../../utils/helpers";

const QueuePage = ({ state, setState, user, toast }) => {
    const isDoc = user.role === "doctor";

    const queue = isDoc
        ? state.appointments
            .filter((a) => a.doctorId === user.id && a.status !== "COMPLETED")
            .sort((a, b) => a.queueNumber - b.queueNumber)
        : state.appointments
            .filter((a) => a.patientId === user.id)
            .sort((a, b) => a.queueNumber - b.queueNumber);

    // Advance status: PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
    const advance = (a) => {
        const flow = { PENDING: "CONFIRMED", CONFIRMED: "IN_PROGRESS", IN_PROGRESS: "COMPLETED" };
        const nxt = flow[a.status];
        if (!nxt) return;

        setState((s) => ({ ...s, appointments: s.appointments.map((x) => x.id === a.id ? { ...x, status: nxt } : x) }));

        if (nxt === "IN_PROGRESS") {
            setState((s) => ({
                ...s,
                notifications: [...s.notifications, {
                    id: s.notifNextId, userId: a.patientId, readStatus: false, createdAt: todayStr(),
                    message: `🩺 Doctor is ready for you! Queue #${a.queueNumber} — proceed to room.`, type: "queue",
                }],
                notifNextId: s.notifNextId + 1,
            }));
            toast(`Queue #${a.queueNumber} called in.`);
        } else {
            toast(`Status → ${nxt}`);
        }
    };

    return (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{ fontWeight: 800, fontSize: 24 }}>{isDoc ? "Patient Queue" : "My Queue Status"}</h2>
                {isDoc && (
                    <div style={{ background: "var(--c1)18", border: "1px solid var(--c1)33", borderRadius: 10, padding: "7px 16px", fontSize: 13, color: "var(--c1)", fontWeight: 700 }}>
                        {queue.length} patient{queue.length !== 1 ? "s" : ""} today
                    </div>
                )}
            </div>

            {queue.length === 0 && (
                <div className="card" style={{ color: "var(--tx2)", textAlign: "center", padding: "40px 0" }}>
                    {isDoc ? "Queue empty. All done 🎉" : "No appointments in queue."}
                </div>
            )}

            {queue.map((a) => {
                const iip = a.status === "IN_PROGRESS";
                return (
                    <div key={a.id} className="card" style={{
                        background: iip ? "var(--c2)10" : "var(--s3)",
                        borderColor: iip ? "var(--c2)55" : "var(--b1)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        position: "relative", overflow: "hidden",
                    }}>
                        {iip && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "var(--c2)", borderRadius: "4px 0 0 4px" }} />}
                        <div style={{ display: "flex", gap: 16, alignItems: "center", paddingLeft: iip ? 8 : 0 }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: "50%",
                                background: iip ? "var(--c2)" : "var(--s2)",
                                border: `2px solid ${iip ? "var(--c2)" : "var(--b2)"}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontWeight: 800, fontSize: 20, color: iip ? "#060b14" : "var(--tx)",
                            }}>
                                {a.queueNumber}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15 }}>{isDoc ? a.patientName : a.doctorName}</div>
                                <div style={{ fontSize: 12, color: "var(--tx2)" }}>{a.date} • {a.time}</div>
                                {iip && <div style={{ fontSize: 11, color: "var(--c2)", fontWeight: 700, marginTop: 2 }}>🩺 IN CONSULTATION</div>}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <Badge s={a.status} />
                            {isDoc && a.status !== "COMPLETED" && (
                                <Btn ch={iip ? "Complete ✓" : "Advance →"} v={iip ? "blu" : "pri"} sz="sm" onClick={() => advance(a)} />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default QueuePage;
