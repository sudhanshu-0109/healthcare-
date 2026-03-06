// ─── LAB PAGE ────────────────────────────────────────────────
// Doctors request tests; lab technicians upload PDF reports;
// patients view completed reports.

import { useState } from "react";
import { api } from "../../api";
import Btn from "../../components/ui/Btn";
import Ic from "../../components/ui/Ic";
import Badge from "../../components/ui/Badge";
import { Inp, Sel } from "../../components/ui/FormFields";
import { P } from "../../constants/icons";
import { todayStr } from "../../utils/helpers";

const LabPage = ({ state, setState, user, toast }) => {
    const role = user.role;
    const patients = state.users.filter((u) => u.role === "patient");
    const [pid, setPid] = useState(() => String(patients[0]?.id ?? ""));
    const [tn, setTn] = useState("");
    const [showRpt, setShowRpt] = useState(null); // { url, name }
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [leaveStart, setLeaveStart] = useState("");
    const [leaveEnd, setLeaveEnd] = useState("");
    const [leaveReason, setLeaveReason] = useState("");
    const [leaveSaving, setLeaveSaving] = useState(false);


    // Doctor: request a new lab test
    const req = async () => {
        if (!tn) { toast("Select a test.", "err"); return; }
        const pr = state.labPricing.find((p) => p.testName === tn);
        const pat = state.users.find((u) => u.id === +pid);
        try {
            const created = await api.createLabTest({
                patientId: +pid, doctorId: user.id, testName: tn,
                fixedPrice: pr?.price || 0, patientName: pat.name, requestedAt: todayStr(),
            });
            setState((s) => {
                const add = created.fixedPrice || 0;
                let billing = s.billing;
                let nextBillId = s.billNextId;
                if (add > 0) {
                    let bill = s.billing.find((b) => b.patientId === created.patientId && !b.paidStatus);
                    if (!bill) {
                        const id = nextBillId;
                        bill = { id, patientId: created.patientId, consultationFee: 0, labFee: add, pharmacyFee: 0, totalAmount: add, paidStatus: false, createdAt: todayStr(), receiptId: `HP-RCP-${String(id).padStart(3, "0")}`, verifiedBadge: false };
                        billing = [...billing, bill];
                        nextBillId = nextBillId + 1;
                    } else {
                        const updated = { ...bill, labFee: bill.labFee + add };
                        updated.totalAmount = updated.consultationFee + updated.labFee + updated.pharmacyFee;
                        billing = s.billing.map((b) => (b.id === bill.id ? updated : b));
                    }
                }
                return { ...s, labTests: [...s.labTests, created], billing, billNextId: nextBillId };
            });
            toast(`Test "${tn}" requested at ₹${pr?.price || 0}`);
            setTn("");
        } catch (e) { toast(e.message || "Request failed.", "err"); }
    };

    // Lab: upload PDF report for a pending test
    const upload = async (id) => {
        if (!file) { toast("Choose a PDF first.", "err"); return; }
        setUploading(true);
        try {
            const updated = await api.uploadLabReportPdf(id, file);
            setState((s) => ({ ...s, labTests: s.labTests.map((x) => x.id === id ? updated : x) }));
            const notifs = await api.getNotifications();
            setState((s) => ({ ...s, notifications: notifs || s.notifications }));
            setFile(null);
            toast("PDF report uploaded!");
        } catch (e) { toast(e.message || "Upload failed.", "err"); }
        finally { setUploading(false); }
    };

    const tests = role === "lab"
        ? state.labTests
        : role === "doctor"
            ? state.labTests.filter((t) => t.doctorId === user.id)
            : state.labTests.filter((t) => t.patientId === user.id);

    const myLeaves = (state.leaveRequests || []).filter((l) => l.user === user.id);

    const submitLeave = async () => {
        if (!leaveStart || !leaveEnd) {
            toast && toast("Select start and end date.", "err");
            return;
        }
        if (leaveEnd < leaveStart) {
            toast && toast("End date cannot be before start date.", "err");
            return;
        }
        setLeaveSaving(true);
        try {
            const created = await api.createLeaveRequest({
                user: user.id,
                role: user.role,
                start_date: leaveStart,
                end_date: leaveEnd,
                reason: leaveReason,
            });
            setState((s) => ({
                ...s,
                leaveRequests: [...(s.leaveRequests || []), created],
            }));
            toast && toast("Leave request submitted to admin.", "ok");
            setLeaveStart("");
            setLeaveEnd("");
            setLeaveReason("");
        } catch (e) {
            toast && toast(e.message || "Failed to submit leave.", "err");
        } finally {
            setLeaveSaving(false);
        }
    };

    return (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <h2 style={{ fontWeight: 800, fontSize: 24 }}>
                {role === "lab" ? "Lab Requests" : role === "doctor" ? "Lab Tests" : "Lab Reports"}
            </h2>

            {/* Lab technician: leave form */}
            {role === "lab" && (
                <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }}>
                    <div className="card">
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Apply for Leave</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                <Inp label="Start date" type="date" val={leaveStart} onChange={setLeaveStart} />
                                <Inp label="End date" type="date" val={leaveEnd} onChange={setLeaveEnd} />
                            </div>
                            <Inp label="Reason" val={leaveReason} onChange={setLeaveReason} ph="e.g. Personal, medical" />
                            <Btn
                                ch={leaveSaving ? "Submitting…" : "Submit to Admin"}
                                v="pri"
                                onClick={submitLeave}
                                dis={leaveSaving}
                                load={leaveSaving}
                                style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
                            />
                        </div>
                    </div>

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
            )}

            {/* Doctor: request form */}
            {role === "doctor" && (
                <div className="card">
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Request Lab Test</div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                        <div style={{ width: 180 }}>
                            <Sel label="Patient" val={pid} onChange={setPid} opts={patients.map((p) => ({ v: p.id, l: p.name }))} />
                        </div>
                        <div style={{ flex: 1, minWidth: 220 }}>
                            <Sel label="Test (Fixed Price)" val={tn} onChange={setTn}
                                opts={[{ v: "", l: "Select test…" }, ...state.labPricing.map((p) => ({ v: p.testName, l: `${p.testName} — ₹${p.price}` }))]} />
                        </div>
                        <Btn ch={<><Ic d={P.flask} size={13} c="currentColor" /> Request</>} v="pri" onClick={req} />
                    </div>
                    <div style={{ marginTop: 10, fontSize: 12, color: "var(--c1)", background: "var(--c1)12", padding: "7px 12px", borderRadius: 8, display: "flex", gap: 8, alignItems: "center" }}>
                        <Ic d={P.lock} size={13} c="var(--c1)" /> All lab prices are system-fixed. Zero hidden charges.
                    </div>
                </div>
            )}

            {/* Test cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 12 }}>
                {tests.length === 0 ? (
                    <div className="card" style={{ color: "var(--tx2)", textAlign: "center", padding: "30px 0" }}>No tests found.</div>
                ) : (
                    tests.map((t) => (
                        <div key={t.id} className="card" style={{ background: "var(--s3)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.testName}</div>
                                    <div style={{ fontSize: 12, color: "var(--tx2)" }}>{t.patientName} • {t.requestedAt}</div>
                                    <div style={{ fontSize: 13, color: "var(--c3)", fontFamily: "var(--m)", marginTop: 4, display: "flex", gap: 4, alignItems: "center" }}>
                                        <Ic d={P.lock} size={11} c="var(--c3)" /> ₹{t.fixedPrice} (fixed)
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center", flexDirection: "column" }}>
                                    <Badge s={t.status} />
                                    {/* Lab: PDF upload */}
                                    {role === "lab" && t.status === "PENDING" && (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "stretch" }}>
                                            <input type="file" accept="application/pdf,.pdf"
                                                onChange={(e) => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                                                style={{ width: 220, background: "var(--s2)", border: "1px solid var(--b2)", borderRadius: 10, padding: "8px 10px", color: "var(--tx2)" }} />
                                            <Btn ch={uploading ? "Uploading…" : <><Ic d={P.up} size={13} c="currentColor" /> Upload PDF</>}
                                                v="blu" sz="sm" dis={uploading} load={uploading} onClick={() => upload(t.id)} />
                                        </div>
                                    )}
                                    {/* Patient/Doctor: view completed PDF */}
                                    {t.status === "COMPLETED" && t.reportFileUrl && (
                                        <Btn ch="View PDF" v="gst" sz="sm" onClick={() => setShowRpt({ url: t.reportFileUrl, name: t.testName })} />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* PDF viewer modal */}
            {showRpt && (
                <div className="modal-bg" onClick={() => setShowRpt(null)}>
                    <div className="modal-box" style={{ maxWidth: 720, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 12 }}>Lab Report (PDF) — {showRpt.name}</div>
                        <div style={{ border: "1px solid var(--b2)", borderRadius: 12, overflow: "hidden", background: "var(--s3)" }}>
                            <iframe title="Lab report PDF" src={showRpt.url} style={{ width: "100%", height: 520, border: "none" }} />
                        </div>
                        <a href={showRpt.url} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 10, color: "var(--c1)", textDecoration: "none", fontFamily: "var(--m)" }}>
                            Open in new tab
                        </a>
                        <Btn ch="Close" v="pri" onClick={() => setShowRpt(null)} style={{ width: "100%", justifyContent: "center", marginTop: 14 }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabPage;
