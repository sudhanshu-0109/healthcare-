// ─── DOCTOR DASHBOARD ────────────────────────────────────────
// Overview for doctors: active consultation, queue, prescriptions,
// and lab request stats.

import { useState } from "react";
import StatCard from "../../components/ui/StatCard";
import Btn from "../../components/ui/Btn";
import { Inp } from "../../components/ui/FormFields";
import { api } from "../../api";

const DoctorDashboard = ({ state, setState, user, toast }) => {
    const queue = state.appointments.filter((a) => a.doctorId === user.id && a.status !== "COMPLETED");
    const inProg = queue.find((a) => a.status === "IN_PROGRESS");
    const pxs = state.prescriptions.filter((p) => p.doctorId === user.id);
    const labs = state.labTests.filter((t) => t.doctorId === user.id);

    const myLeaves = (state.leaveRequests || []).filter((l) => l.user === user.id);

    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [reason, setReason] = useState("");
    const [saving, setSaving] = useState(false);

    const submitLeave = async () => {
        if (!start || !end) {
            toast && toast("Select start and end date.", "err");
            return;
        }
        if (end < start) {
            toast && toast("End date cannot be before start date.", "err");
            return;
        }
        setSaving(true);
        try {
            const created = await api.createLeaveRequest({
                user: user.id,
                role: user.role,
                start_date: start,
                end_date: end,
                reason,
            });
            setState((s) => ({
                ...s,
                leaveRequests: [...(s.leaveRequests || []), created],
            }));
            toast && toast("Leave request submitted to admin.", "ok");
            setStart("");
            setEnd("");
            setReason("");
        } catch (e) {
            toast && toast(e.message || "Failed to submit leave.", "err");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
                <h2 style={{ fontWeight: 800, fontSize: 24 }}>Good day, {user.name} 👋</h2>
                <p style={{ color: "var(--tx2)", fontSize: 14 }}>{user.specialty}</p>
            </div>

            {/* Active consultation banner */}
            {inProg && (
                <div style={{
                    background: "var(--c2)15", border: "1px solid var(--c2)44",
                    borderRadius: 12, padding: "14px 18px", display: "flex", gap: 14, alignItems: "center",
                }}>
                    <span style={{ fontSize: 26 }}>🩺</span>
                    <div>
                        <div style={{ fontWeight: 800, color: "var(--c2)" }}>Consulting: {inProg.patientName}</div>
                        <div style={{ fontSize: 12, color: "var(--tx2)" }}>Queue #{inProg.queueNumber} • {inProg.time}</div>
                    </div>
                </div>
            )}

            {/* KPI row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                <StatCard label="Queue Today" val={queue.length} icon="list" color="var(--c1)" sub={`${queue.filter((a) => a.status === "IN_PROGRESS").length} in consultation`} />
                <StatCard label="Prescriptions" val={pxs.length} icon="clip" color="var(--c2)" sub="total issued" />
                <StatCard label="Lab Requests" val={labs.length} icon="flask" color="var(--c3)" sub={`${labs.filter((l) => l.status === "PENDING").length} pending`} />
            </div>

            {/* Leave application */}
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }}>
                <div className="card">
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Apply for Leave</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <Inp label="Start date" type="date" val={start} onChange={setStart} />
                            <Inp label="End date" type="date" val={end} onChange={setEnd} />
                        </div>
                        <Inp label="Reason" val={reason} onChange={setReason} ph="e.g. Conference, personal emergency" />
                        <Btn
                            ch={saving ? "Submitting…" : "Submit to Admin"}
                            v="pri"
                            onClick={submitLeave}
                            dis={saving}
                            load={saving}
                            style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
                        />
                    </div>
                </div>

                {/* My leave status */}
                <div className="card" style={{ maxHeight: 220, overflowY: "auto" }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>My Leave Requests</div>
                    {myLeaves.length === 0 ? (
                        <div style={{ fontSize: 12, color: "var(--tx2)" }}>No leave requests yet.</div>
                    ) : (
                        myLeaves
                            .slice()
                            .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
                            .map((l) => (
                                <div
                                    key={l.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        fontSize: 12,
                                        padding: "6px 0",
                                        borderBottom: "1px solid var(--b1)",
                                    }}
                                >
                                    <div>
                                        <div>{l.start_date} → {l.end_date}</div>
                                        <div style={{ color: "var(--tx2)" }}>{l.reason}</div>
                                    </div>
                                    <span
                                        style={{
                                            fontFamily: "var(--m)",
                                            fontSize: 11,
                                            padding: "2px 8px",
                                            borderRadius: 999,
                                            border: "1px solid var(--b2)",
                                        }}
                                    >
                                        {l.status}
                                    </span>
                                </div>
                            ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
