// ─── PRESCRIPTIONS PAGE ──────────────────────────────────────
// Doctors create prescriptions; patients view their own.

import { useState } from "react";
import Btn from "../../components/ui/Btn";
import Ic from "../../components/ui/Ic";
import { Inp, Sel } from "../../components/ui/FormFields";
import { P } from "../../constants/icons";
import { todayStr } from "../../utils/helpers";

const PrescriptionsPage = ({ state, setState, user, toast }) => {
    const isDoc = user.role === "doctor";
    const patients = state.users.filter((u) => u.role === "patient");
    const [diag, setDiag] = useState("");
    const [pid, setPid] = useState(() => String(patients[0]?.id ?? ""));
    const [meds, setMeds] = useState([{ name: "", dosePerDay: "1", days: 7, instr: "" }]);

    const pxs = isDoc
        ? state.prescriptions.filter((p) => p.doctorId === user.id)
        : state.prescriptions.filter((p) => p.patientId === user.id);

    // Medicine list helpers
    const addMed = () => setMeds((m) => [...m, { name: "", dosePerDay: "1", days: 7, instr: "" }]);
    const removeMed = (i) => setMeds((m) => m.filter((_, x) => x !== i));
    const updateMed = (i, field, val) => setMeds((m) => m.map((x, xi) => xi === i ? { ...x, [field]: val } : x));

    const save = () => {
        if (!diag.trim()) { toast("Enter diagnosis.", "err"); return; }
        const validMeds = meds.filter((m) => m.name.trim());
        if (!validMeds.length) { toast("Add at least one medicine.", "err"); return; }

        const pat = state.users.find((u) => u.id === +pid);
        const np = {
            id: state.presNextId, patientId: +pid, doctorId: user.id, diagnosis: diag.trim(),
            createdAt: todayStr(), patientName: pat.name, doctorName: user.name,
            medicines: validMeds.map((m, i) => ({ id: i + 1, name: m.name, dosagePerDay: m.dosePerDay, durationDays: m.days, instructions: m.instr })),
        };
        const notif = {
            id: state.notifNextId, userId: +pid, readStatus: false, createdAt: todayStr(),
            message: `💊 Prescription from ${user.name}: ${diag.trim()} (${validMeds.length} medicines)`, type: "medicine",
        };

        setState((s) => ({ ...s, prescriptions: [...s.prescriptions, np], notifications: [...s.notifications, notif], presNextId: s.presNextId + 1, notifNextId: s.notifNextId + 1 }));
        setDiag(""); setMeds([{ name: "", dosePerDay: "1", days: 7, instr: "" }]);
        toast("Prescription saved & patient notified!");
    };

    return (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <h2 style={{ fontWeight: 800, fontSize: 24 }}>Prescriptions</h2>

            <div style={{ display: "grid", gridTemplateColumns: isDoc ? "380px 1fr" : "1fr", gap: 24 }}>
                {/* Doctor-only: create form */}
                {isDoc && (
                    <div className="card" style={{ alignSelf: "start" }}>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>New Prescription</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <Sel label="Patient" val={pid} onChange={setPid} opts={patients.map((p) => ({ v: p.id, l: p.name }))} />
                            <Inp label="Diagnosis" val={diag} onChange={setDiag} ph="e.g. Hypertension Stage 1" />
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ fontSize: 11, color: "var(--tx2)", fontWeight: 600, textTransform: "uppercase" }}>Medicines</div>
                                <Btn ch={<><Ic d={P.plus} size={12} c="currentColor" /> Add</>} v="gst" sz="sm" onClick={addMed} />
                            </div>
                            {meds.map((m, i) => (
                                <div key={i} style={{ background: "var(--s3)", borderRadius: 10, padding: 12, position: "relative" }}>
                                    {meds.length > 1 && (
                                        <button onClick={() => removeMed(i)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", color: "var(--tx2)", fontSize: 16, cursor: "pointer" }}>×</button>
                                    )}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        <Inp ph="Medicine name *" val={m.name} onChange={(v) => updateMed(i, "name", v)} />
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                            <Inp ph="Doses/day" val={m.dosePerDay} onChange={(v) => updateMed(i, "dosePerDay", v)} />
                                            <Inp ph="Days" val={m.days} onChange={(v) => updateMed(i, "days", v)} />
                                        </div>
                                        <Inp ph="Instructions" val={m.instr} onChange={(v) => updateMed(i, "instr", v)} />
                                    </div>
                                </div>
                            ))}
                            <Btn ch="Save Prescription" v="pri" onClick={save} style={{ width: "100%", justifyContent: "center" }} />
                        </div>
                    </div>
                )}

                {/* Prescription list */}
                <div>
                    {pxs.length === 0 ? (
                        <div className="card" style={{ color: "var(--tx2)", textAlign: "center", padding: "30px 0" }}>No prescriptions yet.</div>
                    ) : (
                        pxs.map((p) => (
                            <div key={p.id} className="card" style={{ marginBottom: 12, background: "var(--s3)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 15 }}>{p.diagnosis}</div>
                                        <div style={{ fontSize: 12, color: "var(--tx2)" }}>{isDoc ? p.patientName : p.doctorName} • {p.createdAt}</div>
                                    </div>
                                    <div style={{ fontSize: 11, color: "var(--tx2)", fontFamily: "var(--m)" }}>{p.medicines.length} med{p.medicines.length !== 1 ? "s" : ""}</div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 8 }}>
                                    {p.medicines.map((m, i) => (
                                        <div key={i} style={{ background: "var(--s2)", borderRadius: 8, padding: 10 }}>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
                                            <div style={{ fontSize: 11, color: "var(--tx2)" }}>{m.dosagePerDay}×/day • {m.durationDays}d</div>
                                            <div style={{ fontSize: 11, color: "var(--tx3)" }}>{m.instructions}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrescriptionsPage;
