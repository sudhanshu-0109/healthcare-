// ─── APPOINTMENTS PAGE ───────────────────────────────────────
// Lets patients book new appointments and view existing ones.

import { useState } from "react";
import Btn from "../../components/ui/Btn";
import Ic from "../../components/ui/Ic";
import Badge from "../../components/ui/Badge";
import SectionTitle from "../../components/ui/SectionTitle";
import { Inp, Sel } from "../../components/ui/FormFields";
import { P } from "../../constants/icons";
import { todayStr, isDatePast } from "../../utils/helpers";

const AppointmentsPage = ({ state, setState, user, toast }) => {
    const myAppts = state.appointments.filter((a) => a.patientId === user.id);
    const docs = state.users.filter((u) => u.role === "doctor");
    const leaves = state.leaveRequests || [];

    const [docId, setDocId] = useState(() => String(docs[0]?.id ?? ""));
    const [date, setDate] = useState("");
    const [dateErr, setDateErr] = useState("");

    const isDoctorOnLeave = (doctorId, d) => {
        if (!d) return false;
        return leaves.some(
            (l) =>
                l.role === "doctor" &&
                l.user === doctorId &&
                l.status === "APPROVED" &&
                l.start_date <= d &&
                l.end_date >= d,
        );
    };

    const book = () => {
        setDateErr("");
        if (!date) { toast("Select a date.", "err"); return; }
        if (isDatePast(date)) { setDateErr("Past date."); toast("Cannot book past date.", "err"); return; }

        const dup = state.appointments.some(
            (a) => a.patientId === user.id && a.doctorId === +docId && a.date === date && a.status !== "CANCELLED"
        );
        if (dup) { toast("Already booked with this doctor on this date.", "err"); return; }

        const doc = state.users.find((u) => u.id === +docId);
        if (isDoctorOnLeave(+docId, date)) {
            toast(`Dr. ${doc?.name || ""} is on leave for this date.`, "err");
            return;
        }
        const q = state.appointments.filter((a) => a.doctorId === +docId && a.date === date).length;
        const limit = state.sessionLimits[+docId] || 20;
        if (q >= limit) { toast(`Session full. Dr. ${doc.name} has reached the limit for this date.`, "err"); return; }

        const na = {
            id: state.apptNextId, patientId: user.id, doctorId: +docId, date,
            time: `${9 + q}:00 AM`, status: "CONFIRMED", queueNumber: q + 1,
            patientName: user.name, doctorName: doc.name,
        };
        const notif = {
            id: state.notifNextId, userId: user.id, readStatus: false, createdAt: date,
            message: `Appointment confirmed with ${doc.name} on ${date}. Queue #${na.queueNumber}`, type: "appointment",
        };
        const doctorNotif = {
            id: state.notifNextId + 1, userId: doc.id, readStatus: false, createdAt: date,
            message: `New patient: ${user.name} on ${date} at ${na.time}`, type: "appointment",
        };

        setState((s) => {
            const consultCharge = 500;
            let nextBillId = s.billNextId;
            let billing = s.billing;
            let bill = s.billing.find((b) => b.patientId === user.id && !b.paidStatus);

            if (!bill) {
                const id = nextBillId;
                bill = { id, patientId: user.id, consultationFee: consultCharge, labFee: 0, pharmacyFee: 0, totalAmount: consultCharge, paidStatus: false, createdAt: todayStr(), receiptId: `HP-RCP-${String(id).padStart(3, "0")}`, verifiedBadge: false };
                billing = [...billing, bill];
                nextBillId = nextBillId + 1;
            } else {
                const updated = { ...bill, consultationFee: bill.consultationFee + consultCharge };
                updated.totalAmount = updated.consultationFee + updated.labFee + updated.pharmacyFee;
                billing = s.billing.map((b) => (b.id === bill.id ? updated : b));
            }

            return { ...s, appointments: [...s.appointments, na], notifications: [...s.notifications, notif, doctorNotif], billing, billNextId: nextBillId, apptNextId: s.apptNextId + 1, notifNextId: s.notifNextId + 2 };
        });

        toast(`Booked! Queue #${na.queueNumber} with ${doc.name}.`);
        setDate("");
    };

    return (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <h2 style={{ fontWeight: 800, fontSize: 24 }}>Appointments</h2>

            <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24 }}>
                {/* Booking form */}
                <div className="card" style={{ alignSelf: "start" }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Book New Appointment</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <Sel
                            label="Doctor"
                            val={docId}
                            onChange={(v) => {
                                setDocId(v);
                                setDateErr("");
                            }}
                            opts={docs.map((d) => {
                                const label =
                                    date && isDoctorOnLeave(d.id, date)
                                        ? `${d.name} — ${d.specialty || ""} (On leave)`
                                        : `${d.name} — ${d.specialty || ""}`;
                                return { v: d.id, l: label };
                            })}
                        />
                        <Inp
                            label="Date"
                            val={date}
                            onChange={(v) => {
                                setDate(v);
                                setDateErr("");
                            }}
                            type="date"
                            err={dateErr}
                        />
                        {date && isDoctorOnLeave(+docId, date) && (
                            <div style={{ fontSize: 11, color: "var(--c4)" }}>
                                Selected doctor is on leave for this date.
                            </div>
                        )}
                        <div style={{ fontSize: 11, color: "var(--tx2)" }}>
                            Session limit: {state.sessionLimits[+docId] || 20} patients/day
                        </div>
                        <Btn ch={<><Ic d={P.plus} size={13} c="currentColor" /> Book</>} v="pri" onClick={book} style={{ width: "100%", justifyContent: "center" }} />
                    </div>
                </div>

                {/* Appointment list */}
                <div>
                    <SectionTitle ch="My Appointments" />
                    {myAppts.length === 0 ? (
                        <div className="card" style={{ color: "var(--tx2)", textAlign: "center", padding: "30px 0" }}>No appointments yet.</div>
                    ) : (
                        myAppts.map((a) => {
                            const onLeave = isDoctorOnLeave(a.doctorId, a.date);
                            return (
                                <div key={a.id} className="card" style={{ marginBottom: 10, background: "var(--s3)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                                        <div style={{ width: 44, height: 44, background: "var(--c1)20", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "var(--c1)" }}>
                                            #{a.queueNumber}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{a.doctorName}</div>
                                            <div style={{ fontSize: 12, color: "var(--tx2)" }}>{a.date} • {a.time}</div>
                                            {onLeave && (
                                                <div style={{
                                                    marginTop: 4,
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 4,
                                                    background: "var(--c4)18",
                                                    border: "1px solid var(--c4)55",
                                                    borderRadius: 999,
                                                    padding: "2px 9px",
                                                    fontSize: 11,
                                                    color: "var(--c4)",
                                                    fontWeight: 600,
                                                }}>
                                                    🏖 Doctor on Leave
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Badge s={a.status} />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentsPage;
